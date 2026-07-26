import { useEffect, useRef, useState } from 'react';
import { ref, push, query, limitToLast, onValue } from 'firebase/database';
import { db } from '../firebase.js';

export default function ChatPanel({ roomCode, name, playerId, isGM }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const listRef = useRef(null);

  useEffect(() => {
    const chatRef = query(ref(db, `rooms/${roomCode}/chat`), limitToLast(50));
    const unsub = onValue(chatRef, (snap) => {
      const val = snap.val() || {};
      const entries = Object.entries(val).sort((a, b) => (a[1].at || 0) - (b[1].at || 0));
      setMessages(entries);
    });
    return () => unsub();
  }, [roomCode]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

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
        {messages.length === 0 && <p className="muted">Henüz mesaj yok.</p>}
        {messages.map(([key, m]) => (
          <li key={key} className={`chat-message${m.isGM ? ' gm' : ''}`}>
            <span className="chat-message-author">{m.by}{m.isGM ? ' (GM)' : ''}</span>
            <span className="chat-message-text">{m.text}</span>
          </li>
        ))}
      </ul>
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
    </>
  );
}
