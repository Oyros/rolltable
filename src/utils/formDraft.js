// Unsaved-work protection for long forms. The draft lives in this browser
// only — it is never written to the room, so a half-finished rule set can't
// leak to players.
const PREFIX = 'rolltable_draft_';

export function saveDraft(scope, data) {
  try {
    localStorage.setItem(PREFIX + scope, JSON.stringify({ at: Date.now(), data }));
  } catch {
    // Storage full or blocked — losing the draft is better than breaking the form.
  }
}

export function loadDraft(scope) {
  try {
    const raw = localStorage.getItem(PREFIX + scope);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && parsed.data ? parsed : null;
  } catch {
    return null;
  }
}

export function clearDraft(scope) {
  try {
    localStorage.removeItem(PREFIX + scope);
  } catch {
    // ignore
  }
}

export function draftAgeLabel(at) {
  const minutes = Math.floor((Date.now() - (at || 0)) / 60000);
  if (minutes < 1) return 'az önce';
  if (minutes < 60) return `${minutes} dakika önce`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} saat önce`;
  return `${Math.floor(hours / 24)} gün önce`;
}
