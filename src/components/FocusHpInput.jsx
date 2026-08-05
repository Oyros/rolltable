import { useEffect, useState } from 'react';
import { ref, update } from 'firebase/database';
import { db } from '../firebase.js';

// Editing an NPC's maximum health after it's already in the library. Kept as
// local state so typing doesn't write on every keystroke — it commits on blur
// or Enter.
export default function FocusHpInput({ roomCode, focusId, value }) {
  const [draft, setDraft] = useState(value ? String(value) : '');

  // Follow the stored value when it changes elsewhere (another GM device).
  useEffect(() => {
    setDraft(value ? String(value) : '');
  }, [value]);

  function commit() {
    const parsed = parseInt(draft, 10);
    const next = Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    if (next === (value || null)) return;
    update(ref(db, `rooms/${roomCode}/settings/savedFocuses/${focusId}`), { maxHp: next });
  }

  return (
    <input
      className="focus-hp-input"
      type="number"
      min="0"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
      placeholder="Can"
      title="Bu NPC'nin haritadaki maksimum canı — boş bırakırsan can barı çıkmaz"
    />
  );
}
