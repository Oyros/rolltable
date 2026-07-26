import { ref, get, runTransaction } from 'firebase/database';
import { db } from '../firebase.js';

const NICKNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

export function validateNickname(nickname) {
  if (!NICKNAME_RE.test(nickname)) {
    return 'Kullanıcı adı 3-20 karakter, sadece harf/rakam/alt çizgi (_) içerebilir.';
  }
  return '';
}

export async function isNicknameAvailable(nickname) {
  const lower = nickname.toLowerCase();
  const snap = await get(ref(db, `nicknames/${lower}`));
  return !snap.exists();
}

// Race-safe claim via a transaction on the reservation node — only the
// first caller to hit an empty node wins, everyone else's write aborts.
// Idempotent for the same uid, so a retry after a failed follow-up write
// (e.g. the profile update below dropping mid-signup) doesn't falsely
// report the name as taken.
export async function claimNickname(uid, nickname) {
  const lower = nickname.toLowerCase();
  const result = await runTransaction(ref(db, `nicknames/${lower}`), (current) => {
    if (current === null || current === uid) return uid;
    return undefined; // abort — already taken by someone else
  });
  if (!result.committed || result.snapshot.val() !== uid) {
    throw new Error('Bu kullanıcı adı az önce başkası tarafından alındı, farklı bir tane dene.');
  }
  return lower;
}
