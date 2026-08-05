import { useEffect, useState } from 'react';
import { ref, query, limitToLast, onValue } from 'firebase/database';
import { db } from '../firebase.js';

const PREVIEW_COUNT = 3;

// Always-visible peek at the tail of the room chat, shown in the header next
// to the toggle so conversation isn't missed while the chat window is closed.
export default function MiniChatLog({ roomCode, onOpen }) {
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    const chatRef = query(ref(db, `rooms/${roomCode}/chat`), limitToLast(PREVIEW_COUNT));
    const unsub = onValue(chatRef, (snap) => {
      const val = snap.val() || {};
      setRecent(Object.entries(val).sort((a, b) => (a[1].at || 0) - (b[1].at || 0)));
    });
    return () => unsub();
  }, [roomCode]);

  return (
    <button type="button" className="mini-chat-log" onClick={onOpen} title="Sohbeti aç">
      {recent.length === 0 ? (
        <span className="mini-chat-empty">Henüz mesaj yok</span>
      ) : (
        recent.map(([key, m]) => (
          <span key={key} className="mini-chat-line">
            <span className="mini-chat-author">{m.by}:</span> {m.text}
          </span>
        ))
      )}
    </button>
  );
}
