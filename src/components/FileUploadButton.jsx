import { useRef, useState } from 'react';
import { uploadFile } from '../utils/upload.js';

export default function FileUploadButton({ roomCode, folder, accept, onUploaded }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleChange(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const url = await uploadFile(file, roomCode, folder);
      onUploaded(url);
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  }

  return (
    <div className="file-upload-field">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        style={{ display: 'none' }}
      />
      <button
        type="button"
        className="btn-ghost small"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
      >
        {busy ? 'Yükleniyor...' : '📤 Yükle'}
      </button>
      {error && <span className="sound-error">{error}</span>}
    </div>
  );
}
