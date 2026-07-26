import { useState } from 'react';
import { ref, push, update, remove } from 'firebase/database';
import { db } from '../firebase.js';

export default function QuestBoard({ roomCode, quests, isGM }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  const list = Object.entries(quests || {}).sort((a, b) => (a[1].createdAt || 0) - (b[1].createdAt || 0));
  const active = list.filter(([, q]) => q.status !== 'done');
  const done = list.filter(([, q]) => q.status === 'done');

  function addQuest(e) {
    e.preventDefault();
    if (!title.trim()) return;
    push(ref(db, `rooms/${roomCode}/quests`), {
      title: title.trim(),
      description: desc.trim(),
      status: 'active',
      createdAt: Date.now(),
    });
    setTitle('');
    setDesc('');
  }

  function toggleStatus(id, status) {
    update(ref(db, `rooms/${roomCode}/quests/${id}`), {
      status: status === 'done' ? 'active' : 'done',
    });
  }

  function removeQuest(id) {
    remove(ref(db, `rooms/${roomCode}/quests/${id}`));
  }

  return (
    <div className="panel">
      <h2 className="title-font">📜 Görev Panosu</h2>

      {list.length === 0 && <p className="muted">Henüz görev yok.</p>}

      {active.length > 0 && (
        <ul className="quest-list">
          {active.map(([id, q]) => (
            <li key={id} className="quest-item">
              <div className="quest-item-main">
                <span className="quest-title">{q.title}</span>
                {q.description && <p className="quest-desc">{q.description}</p>}
              </div>
              {isGM && (
                <div className="quest-item-actions">
                  <button type="button" className="btn-ghost small" onClick={() => toggleStatus(id, q.status)}>
                    ✅ Tamamla
                  </button>
                  <button type="button" className="btn-ghost small danger" onClick={() => removeQuest(id)}>
                    Sil
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {done.length > 0 && (
        <details className="quest-done-details">
          <summary>Tamamlananlar ({done.length})</summary>
          <ul className="quest-list">
            {done.map(([id, q]) => (
              <li key={id} className="quest-item done">
                <div className="quest-item-main">
                  <span className="quest-title">{q.title}</span>
                  {q.description && <p className="quest-desc">{q.description}</p>}
                </div>
                {isGM && (
                  <div className="quest-item-actions">
                    <button type="button" className="btn-ghost small" onClick={() => toggleStatus(id, q.status)}>
                      ↩️ Geri Al
                    </button>
                    <button type="button" className="btn-ghost small danger" onClick={() => removeQuest(id)}>
                      Sil
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </details>
      )}

      {isGM && (
        <form onSubmit={addQuest} className="quest-form">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Görev başlığı"
          />
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={2}
            placeholder="Açıklama (opsiyonel)"
          />
          <button type="submit" className="btn-primary small">
            ➕ Görev Ekle
          </button>
        </form>
      )}
    </div>
  );
}
