import { useState } from 'react';
import { newId } from '../utils/id.js';

const SUGGESTED = ['🩸', '☠️', '😵', '🔥', '❄️', '🛡️', '⚡', '🕸️', '😨', '💤', '🤢', '✨'];

// Status effects the GM can hang on a token during combat: an icon plus a
// name, both free-form so any genre works.
export default function ConditionListEditor({ items, onChange }) {
  const [icon, setIcon] = useState('🩸');
  const [name, setName] = useState('');

  function add() {
    if (!name.trim()) return;
    onChange([...(items || []), { id: newId('cond'), icon: icon || '●', name: name.trim() }]);
    setName('');
  }

  function remove(id) {
    onChange((items || []).filter((c) => c.id !== id));
  }

  return (
    <div className="entry-list-editor">
      <span className="entry-list-label">Durum Etkileri</span>
      <p className="muted small-hint">
        Savaşta GM'in token'lara takabileceği durumlar (kanama, sersemleme, koruma...). Token'ın
        köşesinde ikon olarak görünür.
      </p>

      {(items || []).length > 0 && (
        <ul className="entry-list">
          {items.map((c) => (
            <li key={c.id}>
              <div className="entry-list-text">
                <span className="entry-list-name">
                  {c.icon} {c.name}
                </span>
              </div>
              <button type="button" className="btn-ghost small" onClick={() => remove(c.id)}>
                Sil
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="entry-list-add">
        <select className="condition-icon-select" value={icon} onChange={(e) => setIcon(e.target.value)}>
          {SUGGESTED.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Durum adı (örn. Kanama)"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
        />
        <button type="button" className="btn-primary small" onClick={add}>
          Ekle
        </button>
      </div>
    </div>
  );
}
