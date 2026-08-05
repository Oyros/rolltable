import { useState } from 'react';
import {
  SHORTCUT_ACTIONS,
  loadBindings,
  saveBindings,
  defaultBindings,
  normalizeKey,
  keyDisplay,
} from '../utils/shortcuts.js';

// Remapping UI, shown inside the help guide. Press the button, then the key
// you want — no typing key names by hand.
export default function ShortcutSettings() {
  const [bindings, setBindings] = useState(loadBindings);
  const [listeningFor, setListeningFor] = useState(null);
  const [conflict, setConflict] = useState('');

  function capture(e, actionId) {
    e.preventDefault();
    e.stopPropagation();
    if (e.key === 'Tab') return;
    const key = normalizeKey(e.key);
    const taken = Object.entries(bindings).find(
      ([id, bound]) => id !== actionId && normalizeKey(bound) === key
    );
    if (taken) {
      const label = SHORTCUT_ACTIONS.find((a) => a.id === taken[0])?.label || taken[0];
      setConflict(`"${keyDisplay(key)}" zaten "${label}" için kullanılıyor.`);
      return;
    }
    const next = { ...bindings, [actionId]: key };
    setBindings(next);
    saveBindings(next);
    setListeningFor(null);
    setConflict('');
  }

  function reset() {
    const next = defaultBindings();
    setBindings(next);
    saveBindings(next);
    setListeningFor(null);
    setConflict('');
  }

  return (
    <div className="shortcut-settings">
      <p className="muted small-hint">
        Bir tuşu değiştirmek için yanındaki kutuya tıkla, sonra istediğin tuşa bas. Ayarlar bu
        tarayıcıda saklanır — masadaki herkes kendi tuşlarını seçebilir.
      </p>
      <ul className="shortcut-list">
        {SHORTCUT_ACTIONS.map((a) => (
          <li key={a.id}>
            <span className="shortcut-label">{a.label}</span>
            <button
              type="button"
              className={`shortcut-key${listeningFor === a.id ? ' listening' : ''}`}
              onClick={() => {
                setListeningFor(a.id);
                setConflict('');
              }}
              onKeyDown={listeningFor === a.id ? (e) => capture(e, a.id) : undefined}
            >
              {listeningFor === a.id ? 'Bir tuşa bas...' : keyDisplay(bindings[a.id])}
            </button>
          </li>
        ))}
      </ul>
      {conflict && <p className="sound-error">{conflict}</p>}
      <button type="button" className="btn-ghost small" onClick={reset}>
        Varsayılanlara dön
      </button>
    </div>
  );
}
