import { ref as storageRef, uploadBytes, getDownloadURL, listAll, deleteObject } from 'firebase/storage';
import { ref as dbRef, get } from 'firebase/database';
import { storage, db } from '../firebase.js';

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_AUDIO_BYTES = 15 * 1024 * 1024;

export async function uploadFile(file, roomCode, folder) {
  const isImage = file.type.startsWith('image/');
  const isAudio = file.type.startsWith('audio/');
  if (!isImage && !isAudio) {
    throw new Error('Sadece resim veya ses dosyası yükleyebilirsin.');
  }
  const maxBytes = isImage ? MAX_IMAGE_BYTES : MAX_AUDIO_BYTES;
  if (file.size > maxBytes) {
    throw new Error(`Dosya çok büyük (üst sınır ${Math.round(maxBytes / 1024 / 1024)}MB).`);
  }
  const path = `rooms/${roomCode}/uploads/${folder}/${Date.now()}-${file.name}`;
  const fileRef = storageRef(storage, path);

  const timeout = new Promise((_, reject) =>
    setTimeout(
      () => reject(new Error('Yükleme zaman aşımına uğradı — Firebase Storage etkin mi kontrol et.')),
      15000
    )
  );
  await Promise.race([uploadBytes(fileRef, file), timeout]);
  return getDownloadURL(fileRef);
}

export async function deleteRoomUploads(roomCode) {
  const rootRef = storageRef(storage, `rooms/${roomCode}/uploads`);
  const { prefixes, items } = await listAll(rootRef);
  const subLists = await Promise.all(prefixes.map((prefix) => listAll(prefix)));
  const allItems = [...items, ...subLists.flatMap((l) => l.items)];
  await Promise.all(allItems.map((item) => deleteObject(item)));
}

// Scans every room folder under Storage and deletes uploads left behind by
// rooms whose database entry no longer exists (e.g. deleted before the
// room-delete cleanup above existed, or removed directly from the DB).
export async function sweepOrphanedRoomUploads() {
  const { prefixes } = await listAll(storageRef(storage, 'rooms'));
  let cleaned = 0;
  for (const roomPrefix of prefixes) {
    const roomCode = roomPrefix.name;
    const snap = await get(dbRef(db, `rooms/${roomCode}`));
    if (!snap.exists()) {
      await deleteRoomUploads(roomCode);
      cleaned += 1;
    }
  }
  return cleaned;
}
