import { useEffect, useRef, useState } from 'react';
import { ref, update } from 'firebase/database';
import { db } from '../firebase.js';

export default function GMNotes({ roomCode, settings }) {
  const [notes, setNotes] = useState('');
  const synced = useRef(false);

  useEffect(() => {
    if (!synced.current && settings) {
      setNotes(settings.gmNotes || '');
      synced.current = true;
    }
  }, [settings]);

  function commit() {
    update(ref(db, `rooms/${roomCode}/settings`), { gmNotes: notes });
  }

  return (
    <>
      <p className="muted gm-notes-hint">Sadece sen görürsün.</p>
      <textarea
        className="gm-notes-textarea"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={commit}
        rows={10}
        placeholder="Senaryo notların, sırlar, planların..."
      />
    </>
  );
}
