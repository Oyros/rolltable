import { useEffect, useRef, useState } from 'react';
import { ref, update } from 'firebase/database';
import { db } from '../firebase.js';

export default function PlayerNotes({ roomCode, playerId, player }) {
  const [notes, setNotes] = useState('');
  const synced = useRef(false);

  useEffect(() => {
    if (!synced.current && player) {
      setNotes(player.privateNotes || '');
      synced.current = true;
    }
  }, [player]);

  function commit() {
    update(ref(db, `rooms/${roomCode}/players/${playerId}`), { privateNotes: notes });
  }

  return (
    <div className="panel">
      <h2 className="title-font">📓 Not Defterim</h2>
      <p className="muted gm-notes-hint">Sadece sen görürsün.</p>
      <textarea
        className="gm-notes-textarea"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={commit}
        rows={8}
        placeholder="Kendi notların..."
      />
    </div>
  );
}
