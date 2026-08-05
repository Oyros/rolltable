import { useState } from 'react';
import { newId } from '../utils/id.js';
import { restrictionLabel } from '../utils/traitGroups.js';

export default function EntryListEditor({
  label,
  items,
  onChange,
  hideDescription,
  labelSlot,
  // When these are passed, each entry can be limited to certain classes /
  // subclasses — only those characters then see it on their sheet.
  restrictClasses,
  restrictSubclasses,
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const classes = restrictClasses || [];
  const subclasses = restrictSubclasses || [];
  const restrictable = classes.length > 0 || subclasses.length > 0;

  function add() {
    if (!name.trim()) return;
    onChange([...items, { id: newId('e'), name: name.trim(), description: description.trim() }]);
    setName('');
    setDescription('');
  }

  function remove(id) {
    onChange(items.filter((item) => item.id !== id));
  }

  function toggleRestriction(itemId, field, valueId) {
    onChange(
      items.map((item) => {
        if (item.id !== itemId) return item;
        const current = item[field] || [];
        const next = current.includes(valueId)
          ? current.filter((x) => x !== valueId)
          : [...current, valueId];
        // Firebase drops empty arrays anyway; keeping the key off means
        // "open to everyone" stays the default shape.
        const updated = { ...item, [field]: next };
        if (next.length === 0) delete updated[field];
        return updated;
      })
    );
  }

  return (
    <div className="entry-list-editor">
      <span className="entry-list-label">{labelSlot || label}</span>

      {items.length > 0 && (
        <ul className="entry-list">
          {items.map((item) => (
            <li key={item.id}>
              <div className="entry-list-text">
                <span className="entry-list-name">{item.name}</span>
                {item.description && <span className="entry-list-desc">{item.description}</span>}
                {restrictable && (
                  <details className="entry-restrict">
                    <summary>{restrictionLabel(item, classes, subclasses)}</summary>
                    <div className="entry-restrict-options">
                      {classes.length > 0 && (
                        <div className="entry-restrict-column">
                          <span className="entry-restrict-heading">Sınıflar</span>
                          {classes.map((c) => (
                            <label key={c.id} className="pick-list-option">
                              <input
                                type="checkbox"
                                checked={(item.classes || []).includes(c.id)}
                                onChange={() => toggleRestriction(item.id, 'classes', c.id)}
                              />
                              {c.name}
                            </label>
                          ))}
                        </div>
                      )}
                      {subclasses.length > 0 && (
                        <div className="entry-restrict-column">
                          <span className="entry-restrict-heading">Alt Sınıflar</span>
                          {subclasses.map((s) => (
                            <label key={s.id} className="pick-list-option">
                              <input
                                type="checkbox"
                                checked={(item.subclasses || []).includes(s.id)}
                                onChange={() => toggleRestriction(item.id, 'subclasses', s.id)}
                              />
                              {s.name}
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="muted small-hint">
                      Hiçbiri işaretli değilse herkes görür.
                    </p>
                  </details>
                )}
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
