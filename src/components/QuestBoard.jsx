import { useEffect, useState } from 'react';
import { ref, push, update, remove } from 'firebase/database';
import { db } from '../firebase.js';

function totalHours(day, hour, minute = 0) {
  return (day ?? 1) * 24 + (hour ?? 0) + (minute ?? 0) / 60;
}

function formatRemaining(quest, calendar) {
  if (!quest.deadline) return null;
  const remaining = totalHours(quest.deadline.day, quest.deadline.hour) - totalHours(calendar?.day, calendar?.hour, calendar?.minute);
  if (remaining <= 0) return 'Süresi doldu';
  const days = Math.floor(remaining / 24);
  const hours = Math.floor(remaining % 24);
  if (days > 0) return `${days} gün ${hours} saat kaldı`;
  return `${hours} saat kaldı`;
}

export default function QuestBoard({ roomCode, quests, isGM, players, calendar }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [priority, setPriority] = useState('normal');
  const [assignedPlayerId, setAssignedPlayerId] = useState('');
  const [deadlineDay, setDeadlineDay] = useState('');
  const [deadlineHour, setDeadlineHour] = useState('');

  const playerList = Object.entries(players || {}).filter(([, p]) => p.role !== 'gm');
  const list = Object.entries(quests || {}).sort((a, b) => (a[1].createdAt || 0) - (b[1].createdAt || 0));
  const active = list
    .filter(([, q]) => q.status !== 'done' && q.status !== 'failed')
    .sort((a, b) => (a[1].priority === 'acil' ? -1 : 0) - (b[1].priority === 'acil' ? -1 : 0));
  const done = list.filter(([, q]) => q.status === 'done');
  const failed = list.filter(([, q]) => q.status === 'failed');

  useEffect(() => {
    if (!isGM || !calendar) return;
    active.forEach(([id, q]) => {
      if (!q.deadline) return;
      const remaining = totalHours(q.deadline.day, q.deadline.hour) - totalHours(calendar.day, calendar.hour, calendar.minute);
      if (remaining <= 0) {
        update(ref(db, `rooms/${roomCode}/quests/${id}`), { status: 'failed' });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calendar?.day, calendar?.hour, calendar?.minute, isGM]);

  function addQuest(e) {
    e.preventDefault();
    if (!title.trim()) return;
    const deadline = deadlineDay.trim() !== '' ? { day: Number(deadlineDay) || 1, hour: Number(deadlineHour) || 0 } : null;
    push(ref(db, `rooms/${roomCode}/quests`), {
      title: title.trim(),
      description: desc.trim(),
      status: 'active',
      priority,
      assignedPlayerId: assignedPlayerId || null,
      deadline,
      createdAt: Date.now(),
    });
    setTitle('');
    setDesc('');
    setPriority('normal');
    setAssignedPlayerId('');
    setDeadlineDay('');
    setDeadlineHour('');
  }

  function toggleStatus(id, status) {
    update(ref(db, `rooms/${roomCode}/quests/${id}`), {
      status: status === 'done' ? 'active' : 'done',
    });
  }

  function removeQuest(id) {
    remove(ref(db, `rooms/${roomCode}/quests/${id}`));
  }

  function renderQuest(id, q) {
    const assignedName = q.assignedPlayerId ? players?.[q.assignedPlayerId]?.name : null;
    const remaining = q.status === 'active' ? formatRemaining(q, calendar) : null;
    return (
      <li key={id} className={`quest-item ${q.status}${q.priority === 'acil' ? ' urgent' : ''}`}>
        <div className="quest-item-main">
          <div className="quest-title-row">
            {q.priority === 'acil' && <span className="quest-priority-badge">🔴 Acil</span>}
            <span className="quest-title">{q.title}</span>
          </div>
          {q.description && <p className="quest-desc">{q.description}</p>}
          <div className="quest-meta">
            {assignedName && <span className="quest-assigned">👤 {assignedName}</span>}
            {remaining && <span className="quest-deadline">⏳ {remaining}</span>}
            {q.status === 'failed' && <span className="quest-deadline failed">✗ Süresi doldu</span>}
          </div>
        </div>
        {isGM && (
          <div className="quest-item-actions">
            {q.status !== 'failed' && (
              <button type="button" className="btn-ghost small" onClick={() => toggleStatus(id, q.status)}>
                {q.status === 'done' ? '↩️ Geri Al' : '✅ Tamamla'}
              </button>
            )}
            <button type="button" className="btn-ghost small danger" onClick={() => removeQuest(id)}>
              Sil
            </button>
          </div>
        )}
      </li>
    );
  }

  return (
    <>
      {list.length === 0 && <p className="muted">Henüz görev yok.</p>}

      {active.length > 0 && <ul className="quest-list">{active.map(([id, q]) => renderQuest(id, q))}</ul>}

      {(done.length > 0 || failed.length > 0) && (
        <details className="quest-done-details">
          <summary>Kapanan Görevler ({done.length + failed.length})</summary>
          <ul className="quest-list">
            {failed.map(([id, q]) => renderQuest(id, q))}
            {done.map(([id, q]) => renderQuest(id, q))}
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
          <div className="quest-form-row">
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="normal">Normal Öncelik</option>
              <option value="acil">🔴 Acil</option>
            </select>
            <select value={assignedPlayerId} onChange={(e) => setAssignedPlayerId(e.target.value)}>
              <option value="">Genel (herkes)</option>
              {playerList.map(([id, p]) => (
                <option key={id} value={id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="quest-form-row">
            <label className="quest-deadline-field">
              Son Gün
              <input
                type="number"
                min={1}
                value={deadlineDay}
                onChange={(e) => setDeadlineDay(e.target.value)}
                placeholder="opsiyonel"
              />
            </label>
            <label className="quest-deadline-field">
              Son Saat
              <input
                type="number"
                min={0}
                max={23}
                value={deadlineHour}
                onChange={(e) => setDeadlineHour(e.target.value)}
                placeholder="0-23"
              />
            </label>
          </div>
          <button type="submit" className="btn-primary small">
            ➕ Görev Ekle
          </button>
        </form>
      )}
    </>
  );
}
