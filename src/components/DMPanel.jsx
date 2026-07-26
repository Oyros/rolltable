import { useEffect, useRef, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase.js';
import { DEFAULT_THEME_ID } from '../utils/themes.js';
import ParticleEffect from './ParticleEffect.jsx';
import { threadIdFor, listenToThread, sendDM } from '../utils/dm.js';

export default function DMPanel({ myUid, otherUid, onBack }) {
  const [otherNickname, setOtherNickname] = useState('');
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const listRef = useRef(null);
  const threadId = threadIdFor(myUid, otherUid);

  useEffect(() => {
    const unsub = onValue(ref(db, `users/${otherUid}/nickname`), (snap) =>
      setOtherNickname(snap.val() || '')
    );
    return () => unsub();
  }, [otherUid]);

  useEffect(() => {
    const unsub = listenToThread(threadId, setMessages);
    return () => unsub();
  }, [threadId]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages.length]);

  function handleSend(e) {
    e.preventDefault();
    if (!text.trim()) return;
    sendDM(threadId, myUid, text);
    setText('');
  }

  return (
    <div className="profile-screen">
      <ParticleEffect theme={DEFAULT_THEME_ID} />
      <div className="profile-shell">
        <button type="button" className="btn-ghost" onClick={onBack}>
          ← Geri
        </button>

        <div className="panel profile-section dm-panel">
          <h2 className="title-font">💬 {otherNickname || '...'}</h2>
          <ul className="chat-message-list dm-message-list" ref={listRef}>
            {messages.length === 0 && <p className="muted">Henüz mesaj yok.</p>}
            {messages.map(([key, m]) => (
              <li
                key={key}
                className={`chat-message${m.from === myUid ? ' mine' : ''}`}
              >
                <span className="chat-message-text">{m.text}</span>
              </li>
            ))}
          </ul>
          <form onSubmit={handleSend} className="chat-form">
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
        </div>
      </div>
    </div>
  );
}
