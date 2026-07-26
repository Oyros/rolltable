import { useEffect, useState } from 'react';
import Portal from './Portal.jsx';

function seenKeyFor(roomCode, playerId) {
  return `rolltable_whisper_seen_${roomCode}_${playerId}`;
}

export default function WhisperOverlay({ whispers, roomCode, playerId }) {
  const [popup, setPopup] = useState(null);

  useEffect(() => {
    const entries = Object.entries(whispers || {})
      .filter(([, w]) => !w.system)
      .sort((a, b) => (a[1].at || 0) - (b[1].at || 0));
    const latest = entries[entries.length - 1];
    if (!latest) return;

    const seenKey = localStorage.getItem(seenKeyFor(roomCode, playerId));
    if (latest[0] !== seenKey) {
      setPopup({ key: latest[0], text: latest[1].text });
    }
  }, [whispers, roomCode, playerId]);

  function dismiss() {
    if (popup) localStorage.setItem(seenKeyFor(roomCode, playerId), popup.key);
    setPopup(null);
  }

  if (!popup) return null;

  return (
    <Portal>
      <div className="whisper-overlay">
        <div className="whisper-box panel">
          <span className="whisper-label">Fısıltı</span>
          <p>{popup.text}</p>
          <button type="button" className="btn-primary small" onClick={dismiss}>
            Kapat
          </button>
        </div>
      </div>
    </Portal>
  );
}
