import { useEffect, useRef, useState } from 'react';
import { ref, push, query, limitToLast, onValue } from 'firebase/database';
import { db } from '../firebase.js';

function buildWhisperEntries(players, playerId, isGM) {
  const entries = [];
  if (isGM) {
    Object.entries(players || {}).forEach(([pid, p]) => {
      if (p.role === 'gm') return;
      Object.entries(p.whispers || {}).forEach(([key, w]) => {
        entries.push({
          key: `w-${pid}-${key}`,
          at: w.at,
          kind: w.system ? 'system' : 'whisper',
          text: w.text,
          target: p.name,
        });
      });
    });
  } else {
    const me = players?.[playerId];
    Object.entries(me?.whispers || {}).forEach(([key, w]) => {
      entries.push({
        key: `w-${key}`,
        at: w.at,
        kind: w.system ? 'system' : 'whisper',
        text: w.text,
      });
    });
  }
  return entries;
}

export default function ChatPanel({ roomCode, name, playerId, isGM, players, readOnly = false }) {
  const [chatMessages, setChatMessages] = useState([]);
  const [text, setText] = useState('');
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

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [merged.length]);

  function sendMessage(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    push(ref(db, `rooms/${roomCode}/chat`), {
      text: trimmed,
      by: name,
      byId: playerId,
      isGM: !!isGM,
      at: Date.now(),
    });
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
            return (
              <li key={e.key} className="chat-message whisper">
                <span className="chat-message-author">🔒 {isGM ? `Fısıltı → ${e.target}` : 'GM fısıldadı'}</span>
                <span className="chat-message-text">{e.text}</span>
              </li>
            );
          }
          return (
            <li key={e.key} className="chat-message system">
              <span className="chat-message-author">{isGM ? e.target : 'Sistem Kaydı'}</span>
              <span className="chat-message-text">{e.text}</span>
            </li>
          );
        })}
      </ul>
      {readOnly ? (
        <p className="muted small-hint">👁️ İzleyici olarak sadece okuyabilirsin.</p>
      ) : (
        <form onSubmit={sendMessage} className="chat-form">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Mesaj yaz..."
            maxLength={1000}
          />
          <button type="submit" className="btn-primary small">
            Gönder
          </button>
        </form>
      )}
    </>
  );
}
