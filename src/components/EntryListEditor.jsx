import { useState } from 'react';
import { newId } from '../utils/id.js';

export default function EntryListEditor({ label, items, onChange, hideDescription }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  function add() {
    if (!name.trim()) return;
    onChange([...items, { id: newId('e'), name: name.trim(), description: description.trim() }]);
    setName('');
    setDescription('');
  }

  function remove(id) {
    onChange(items.filter((item) => item.id !== id));
  }

  return (
    <div className="entry-list-editor">
      <span className="entry-list-label">{label}</span>

      {items.length > 0 && (
        <ul className="entry-list">
          {items.map((item) => (
            <li key={item.id}>
              <div className="entry-list-text">
                <span className="entry-list-name">{item.name}</span>
                {item.description && <span className="entry-list-desc">{item.description}</span>}
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
          placeholder={`Yeni ${label.toLowerCase()}...`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (hideDescription || !description)) {
              e.preventDefault();
              add();
            }
          }}
        />
        {!hideDescription && (
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Açıklama (opsiyonel)"
          />
        )}
        <button type="button" className="btn-primary small" onClick={add}>
          Ekle
        </button>
      </div>
    </div>
  );
}
