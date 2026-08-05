import { ref, update } from 'firebase/database';
import { db } from '../firebase.js';

// Pin/token coordinates belong to the map they were placed on, so switching to
// a different image clears them. Shared by the GM panel's library list and the
// map window's own switcher.
//
// Lives apart from library.js on purpose: that module is pure so the feed and
// filtering logic can be reasoned about (and tested) without Firebase.
export function publishMapEntry(roomCode, entry, currentUrl) {
  const url = entry.imageUrl;
  const payload = { mapImageUrl: url, updatedAt: Date.now() };
  if (url !== (currentUrl || '')) {
    payload.mapPins = null;
    payload.mapTokens = null;
    payload.npcState = null;
  }
  update(ref(db, `rooms/${roomCode}/scene`), payload);
}
