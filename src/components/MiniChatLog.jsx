import { useEffect, useRef, useState } from 'react';
import { ref, query, limitToLast, onValue } from 'firebase/database';
import { db } from '../firebase.js';
import { buildFeed, feedEntryLabel } from '../utils/chatFeed.js';
import { playChatPing } from '../utils/diceSound.js';

const PREVIEW_COUNT = 3;
// Shares the dice-sound slider so there's a single place to turn effects down.
const VOLUME_KEY = 'rolltable_dice_volume';

function pingVolume() {
  const raw = localStorage.getItem(VOLUME_KEY);
  const parsed = raw ? parseFloat(raw) : 0.35;
  return Number.isFinite(parsed) ? Math.min(1, Math.max(0, parsed)) : 0.35;
}

// Always-visible peek at the tail of the room feed, shown in the header next
// to the toggle so nothing is missed while the chat window is closed. Uses the
// same merged feed as the chat window, so whispers and the automatic system
// log (inventory/stat changes) show up here too — subject to the same
// visibility rules.
export default function MiniChatLog({ roomCode, players, playerId, isGM, chatOpen, onOpen }) {
  const [chatMessages, setChatMessages] = useState([]);
  const [hasUnread, setHasUnread] = useState(false);
  const lastKeyRef = useRef(null);
  // Read inside the listener, which is bound once and would otherwise close
  // over a stale value.
  const chatOpenRef = useRef(chatOpen);
  chatOpenRef.current = chatOpen;
  // The first snapshot is the existing backlog, not new traffic — it must not
  // fire a burst of pings on join.
  const seenFirstSnapshotRef = useRef(false);

  useEffect(() => {
    const chatRef = query(ref(db, `rooms/${roomCode}/chat`), limitToLast(PREVIEW_COUNT));
    const unsub = onValue(chatRef, (snap) => {
      const val = snap.val() || {};
      const entries = Object.entries(val).sort((a, b) => (a[1].at || 0) - (b[1].at || 0));
      setChatMessages(entries);

      const latest = entries[entries.length - 1];
      if (!latest) return;
      if (!seenFirstSnapshotRef.current) {
        seenFirstSnapshotRef.current = true;
        lastKeyRef.current = latest[0];
        return;
      }
      if (latest[0] !== lastKeyRef.current) {
        lastKeyRef.current = latest[0];
        // No ping for your own message — you just sent it.
        if (latest[1].byId !== playerId) {
          playChatPing(pingVolume());
          if (!chatOpenRef.current) setHasUnread(true);
        }
      }
    });
    return () => unsub();
  }, [roomCode, playerId]);

  // Opening the chat window counts as reading it.
  useEffect(() => {
    if (chatOpen) setHasUnread(false);
  }, [chatOpen]);

  const recent = buildFeed(chatMessages, players, playerId, isGM).slice(-PREVIEW_COUNT);

  return (
    <button
      type="button"
      className={`mini-chat-log${hasUnread ? ' has-unread' : ''}`}
      onClick={() => {
        setHasUnread(false);
        onOpen();
      }}
      title="Sohbeti aç"
    >
      {hasUnread && <span className="mini-chat-dot" aria-hidden="true" />}
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
