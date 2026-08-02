import { useEffect, useRef, useState } from 'react';
import { ref, push, query, limitToLast, onValue } from 'firebase/database';
import { db } from '../firebase.js';

function buildWhisperEntries(players, playerId, isGM) {
  const entries = [];
  Object.entries(players || {}).forEach(([pid, p]) => {
    Object.entries(p.whispers || {}).forEach(([key, w]) => {
      const sentByMe = !!w.byId && w.byId === playerId;
      const sentToMe = pid === playerId;
      if (!isGM && !sentByMe && !sentToMe) return;

      entries.push({
        key: `w-${pid}-${key}`,
        at: w.at,
        kind: w.system ? 'system' : 'whisper',
        text: w.text,
        sentByMe,
        sentToMe,
        fromName: w.by || 'GM',
        toName: p.name,
      });
    });
  });
  return entries;
}

export default function ChatPanel({ roomCode, name, playerId, isGM, players, readOnly = false }) {
  const [chatMessages, setChatMessages] = useState([]);
  const [text, setText] = useState('');
  const [whisperTarget, setWhisperTarget] = useState('');
  const listRef = useRef(null);

  useEffect(() => {
    const chatRef = query(ref(db, `rooms/${roomCode}/chat`), limitToLast(50));
    const unsub = onValue(chatRef, (snap) => {
      const val = snap.val() || {};
      const entries = Object.entries(val).sort((a, b) => (a[1].at || 0) - (b[1].at || 0));
      setChatMessages(entries);
    });
    return () => unsub();
  }, [roomCode]);

  const chatEntries = chatMessages.map(([key, m]) => ({
    key: `c-${key}`,
    at: m.at,
    kind: 'chat',
    text: m.text,
    author: m.by,
    isGM: m.isGM,
  }));
  const whisperEntries = buildWhisperEntries(players, playerId, isGM);
  const merged = [...chatEntries, ...whisperEntries].sort((a, b) => (a.at || 0) - (b.at || 0));

  const whisperTargets = Object.entries(players || {}).filter(
    ([id, p]) => id !== playerId && p.role !== 'spectator'
  );

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [merged.length]);

  function sendMessage(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    if (whisperTarget) {
      push(ref(db, `rooms/${roomCode}/players/${whisperTarget}/whispers`), {
        text: trimmed,
        by: name,
        byId: playerId,
        at: Date.now(),
      });
      setWhisperTarget('');
    } else {
      push(ref(db, `rooms/${roomCode}/chat`), {
        text: trimmed,
        by: name,
        byId: playerId,
        isGM: !!isGM,
        at: Date.now(),
      });
    }
    setText('');
  }

  return (
    <>
      <ul className="chat-message-list" ref={listRef}>
        {merged.length === 0 && <p className="muted">Henüz mesaj yok.</p>}
        {merged.map((e) => {
          if (e.kind === 'chat') {
            return (
              <li key={e.key} className={`chat-message${e.isGM ? ' gm' : ''}`}>
                <span className="chat-message-author">
                  {e.author}
                  {e.isGM ? ' (GM)' : ''}
                </span>
                <span className="chat-message-text">{e.text}</span>
              </li>
            );
          }
          if (e.kind === 'whisper') {
            const label = e.sentByMe
              ? `Fısıltı → ${e.toName}`
              : e.sentToMe
                ? `${e.fromName} fısıldadı`
                : `${e.fromName} → ${e.toName}`;
            return (
              <li key={e.key} className="chat-message whisper">
                <span className="chat-message-author">🔒 {label}</span>
                <span className="chat-message-text">{e.text}</span>
              </li>
            );
          }
          return (
            <li key={e.key} className="chat-message system">
              <span className="chat-message-author">{isGM ? e.toName : 'Sistem Kaydı'}</span>
              <span className="chat-message-text">{e.text}</span>
            </li>
          );
        })}
      </ul>
      {readOnly ? (
        <p className="muted small-hint">👁️ İzleyici olarak sadece okuyabilirsin.</p>
      ) : (
        <form onSubmit={sendMessage} className="chat-form">
          {whisperTargets.length > 0 && (
            <select
              className="chat-target-select"
              value={whisperTarget}
              onChange={(e) => setWhisperTarget(e.target.value)}
              title="Kime göndereceğini seç"
            >
              <option value="">📢 Herkese</option>
              {whisperTargets.map(([id, p]) => (
                <option key={id} value={id}>
                  🔒 {p.role === 'gm' ? 'GM' : p.name}
                </option>
              ))}
            </select>
          )}
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={whisperTarget ? 'Fısıltı yaz...' : 'Mesaj yaz...'}
            maxLength={1000}
          />
          <button type="submit" className="btn-primary small">
            {whisperTarget ? '🔒 Fısılda' : 'Gönder'}
          </button>
        </form>
      )}
    </>
  );
}
