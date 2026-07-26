import { ref, push, query, limitToLast, onValue } from 'firebase/database';
import { db } from '../firebase.js';

export function threadIdFor(uidA, uidB) {
  return [uidA, uidB].sort().join('~');
}

export function listenToThread(threadId, callback) {
  const q = query(ref(db, `dmThreads/${threadId}/messages`), limitToLast(100));
  return onValue(q, (snap) => {
    const val = snap.val() || {};
    const entries = Object.entries(val).sort((a, b) => (a[1].at || 0) - (b[1].at || 0));
    callback(entries);
  });
}

export function sendDM(threadId, fromUid, text) {
  const trimmed = text.trim();
  if (!trimmed) return;
  push(ref(db, `dmThreads/${threadId}/messages`), {
    from: fromUid,
    text: trimmed,
    at: Date.now(),
  });
}
