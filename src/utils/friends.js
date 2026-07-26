import { ref, get, update } from 'firebase/database';
import { db } from '../firebase.js';

export async function findUserByNickname(nickname) {
  const lower = nickname.trim().toLowerCase();
  if (!lower) return null;
  const nickSnap = await get(ref(db, `nicknames/${lower}`));
  if (!nickSnap.exists()) return null;
  const uid = nickSnap.val();
  const userSnap = await get(ref(db, `users/${uid}`));
  if (!userSnap.exists()) return null;
  return { uid, ...userSnap.val() };
}

export async function sendFriendRequest(fromUid, fromNickname, toUid, toNickname) {
  if (fromUid === toUid) throw new Error('Kendine arkadaşlık isteği gönderemezsin.');
  const at = Date.now();
  await update(ref(db), {
    [`users/${toUid}/friendRequestsIncoming/${fromUid}`]: { at, nickname: fromNickname },
    [`users/${fromUid}/friendRequestsOutgoing/${toUid}`]: { at, nickname: toNickname },
  });
}

export async function acceptFriendRequest(myUid, fromUid) {
  await update(ref(db), {
    [`users/${myUid}/friends/${fromUid}`]: true,
    [`users/${fromUid}/friends/${myUid}`]: true,
    [`users/${myUid}/friendRequestsIncoming/${fromUid}`]: null,
    [`users/${fromUid}/friendRequestsOutgoing/${myUid}`]: null,
  });
}

export async function declineFriendRequest(myUid, fromUid) {
  await update(ref(db), {
    [`users/${myUid}/friendRequestsIncoming/${fromUid}`]: null,
    [`users/${fromUid}/friendRequestsOutgoing/${myUid}`]: null,
  });
}

export async function cancelFriendRequest(myUid, toUid) {
  await update(ref(db), {
    [`users/${myUid}/friendRequestsOutgoing/${toUid}`]: null,
    [`users/${toUid}/friendRequestsIncoming/${myUid}`]: null,
  });
}

export async function removeFriend(myUid, friendUid) {
  await update(ref(db), {
    [`users/${myUid}/friends/${friendUid}`]: null,
    [`users/${friendUid}/friends/${myUid}`]: null,
  });
}
