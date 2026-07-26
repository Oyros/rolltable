import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase.js';

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
