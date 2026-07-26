import { useState } from 'react';
import { newId } from '../utils/id.js';

export default function ResourceListEditor({ items, onChange }) {
  const [name, setName] = useState('');
  const [max, setMax] = useState('10');

  function add() {
    const maxNum = Math.max(1, parseInt(max, 10) || 10);
    if (!name.trim()) return;
    onChange([...items, { id: newId('r'), name: name.trim(), max: maxNum }]);
    setName('');
    setMax('10');
  }

  function remove(id) {
    onChange(items.filter((item) => item.id !== id));
  }

  return (
    <div className="entry-list-editor">
      <span className="entry-list-label">Kaynaklar (Can, Stres, Kaynak Puanı vb.)</span>
      <p className="muted small-hint">
        Her oyuncunun karakter kağıdında dolgu çubuğu olarak görünür — üst sınırdan başlar.
      </p>

      {items.length > 0 && (
        <ul className="entry-list">
          {items.map((item) => (
            <li key={item.id}>
              <div className="entry-list-text">
                <span className="entry-list-name">{item.name}</span>
                <span className="entry-list-desc">Üst sınır: {item.max}</span>
              </div>
              <button type="button" className="btn-ghost small" onClick={() => remove(item.id)}>
                Sil
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="entry-list-add">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Kaynak adı (örn. Can Puanı)"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
        />
        <input
          type="number"
          min="1"
          value={max}
          onChange={(e) => setMax(e.target.value)}
          placeholder="Üst sınır"
        />
        <button type="button" className="btn-primary small" onClick={add}>
          Ekle
        </button>
      </div>
    </div>
  );
}
