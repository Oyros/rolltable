import { ref, get, set, update, remove, push } from 'firebase/database';
import { db } from '../firebase.js';

// Undo journal. Entries live in the room (not just this tab) because the GM
// is allowed to undo anyone's action, which is only possible if every client
// writes what it did somewhere shared.
//
// Each entry stores the *previous* value of exactly the keys that were
// touched, so undoing puts those keys back without clobbering unrelated
// changes other people made in the meantime.
const MAX_ENTRIES = 20;
// A single before-image bigger than this isn't worth journalling (deleting a
// whole room's worth of data, say) — the action still happens, it just can't
// be undone.
const MAX_SNAPSHOT_CHARS = 20000;

export function journalPath(roomCode) {
  return `rooms/${roomCode}/journal`;
}

function tooBig(value) {
  try {
    return JSON.stringify(value ?? null).length > MAX_SNAPSHOT_CHARS;
  } catch {
    return true;
  }
}

async function prune(roomCode) {
  const snap = await get(ref(db, journalPath(roomCode)));
  const all = snap.val() || {};
  const entries = Object.entries(all).sort((a, b) => (a[1].at || 0) - (b[1].at || 0));
  const excess = entries.length - MAX_ENTRIES;
  if (excess <= 0) return;
  const updates = {};
  entries.slice(0, excess).forEach(([key]) => {
    updates[key] = null;
  });
  await update(ref(db, journalPath(roomCode)), updates);
}

async function record(roomCode, entry) {
  if (tooBig(entry.before)) return;
  await push(ref(db, journalPath(roomCode)), entry);
  prune(roomCode).catch(() => {});
}

// Replaces a whole node (or deletes it). Undo restores the old node as-is.
export async function trackedSet(roomCode, actor, { path, value, label }) {
  const node = ref(db, `rooms/${roomCode}/${path}`);
  const before = (await get(node)).val() ?? null;
  if (value === null) await remove(node);
  else await set(node, value);
  await record(roomCode, {
    path,
    label,
    mode: 'set',
    before,
    byId: actor?.id || '',
    byName: actor?.name || '',
    at: Date.now(),
  });
}

export async function trackedRemove(roomCode, actor, { path, label }) {
  return trackedSet(roomCode, actor, { path, value: null, label });
}

// Patches some keys of a node. Only those keys are captured, and undo writes
// exactly them back (null where they didn't exist before).
export async function trackedUpdate(roomCode, actor, { path, patch, label }) {
  const node = ref(db, `rooms/${roomCode}/${path}`);
  const current = (await get(node)).val() || {};
  const before = {};
  Object.keys(patch).forEach((key) => {
    before[key] = current?.[key] ?? null;
  });
  await update(node, patch);
  await record(roomCode, {
    path,
    label,
    mode: 'update',
    before,
    byId: actor?.id || '',
    byName: actor?.name || '',
    at: Date.now(),
  });
}

export function canUndo(entry, playerId, isGM) {
  if (entry?.undone) return false;
  return isGM || entry?.byId === playerId;
}

export async function undoEntry(roomCode, entryId, entry) {
  const node = ref(db, `rooms/${roomCode}/${entry.path}`);
  if (entry.mode === 'update') {
    await update(node, entry.before || {});
  } else if (entry.before === null || entry.before === undefined) {
    await remove(node);
  } else {
    await set(node, entry.before);
  }
  // Kept (marked) rather than deleted so the window can show what happened.
  await update(ref(db, `${journalPath(roomCode)}/${entryId}`), { undone: true });
}

// Newest first, filtered to what this viewer is allowed to see.
export function journalList(journal, playerId, isGM) {
  return Object.entries(journal || {})
    .filter(([, e]) => isGM || e.byId === playerId)
    .sort((a, b) => (b[1].at || 0) - (a[1].at || 0));
}

// The entry Ctrl+Z should act on: the most recent one this viewer can undo.
export function nextUndoable(journal, playerId, isGM) {
  return journalList(journal, playerId, isGM).find(([, e]) => canUndo(e, playerId, isGM)) || null;
}
