import { useEffect, useState } from 'react';
import { ref, query, limitToLast, onValue } from 'firebase/database';
import { db } from '../firebase.js';
import { buildFeed, feedEntryLabel } from '../utils/chatFeed.js';

const PREVIEW_COUNT = 3;

// Always-visible peek at the tail of the room feed, shown in the header next
// to the toggle so nothing is missed while the chat window is closed. Uses the
// same merged feed as the chat window, so whispers and the automatic system
// log (inventory/stat changes) show up here too — subject to the same
// visibility rules.
export default function MiniChatLog({ roomCode, players, playerId, isGM, onOpen }) {
  const [chatMessages, setChatMessages] = useState([]);

  useEffect(() => {
    const chatRef = query(ref(db, `rooms/${roomCode}/chat`), limitToLast(PREVIEW_COUNT));
    const unsub = onValue(chatRef, (snap) => {
      const val = snap.val() || {};
      setChatMessages(Object.entries(val).sort((a, b) => (a[1].at || 0) - (b[1].at || 0)));
    });
    return () => unsub();
  }, [roomCode]);

  const recent = buildFeed(chatMessages, players, playerId, isGM).slice(-PREVIEW_COUNT);

  return (
    <button type="button" className="mini-chat-log" onClick={onOpen} title="Sohbeti aç">
      {recent.length === 0 ? (
        <span className="mini-chat-empty">Henüz mesaj yok</span>
      ) : (
        recent.map((entry) => (
          <span key={entry.key} className={`mini-chat-line ${entry.kind}`}>
            <span className="mini-chat-author">{feedEntryLabel(entry)}:</span> {entry.text}
          </span>
        ))
      )}
    </button>
  );
}
