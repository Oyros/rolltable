import { useEffect, useRef, useState } from 'react';
import { ref, query, limitToLast, onValue } from 'firebase/database';
import { db } from '../firebase.js';
import { buildFeed, feedEntryLabel } from '../utils/chatFeed.js';
import { playChatPing, effectVolume } from '../utils/diceSound.js';
import { sendVisibleTo } from '../utils/handouts.js';

const PREVIEW_COUNT = 3;

// Always-visible peek at the tail of the room feed, shown in the header next
// to the toggle so nothing is missed while the chat window is closed. Uses the
// same merged feed as the chat window, so whispers and the automatic system
// log (inventory/stat changes) show up here too — subject to the same
// visibility rules.
export default function MiniChatLog({ roomCode, players, playerId, isGM, handoutSends, chatOpen, onOpen }) {
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
  // null until the first handout snapshot, so joining mid-session doesn't
  // ping for everything already sent.
  const seenSendsRef = useRef(null);

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
          playChatPing(effectVolume());
          if (!chatOpenRef.current) setHasUnread(true);
        }
      }
    });
    return () => unsub();
  }, [roomCode, playerId]);

  // A handout arriving is worth the same nudge as a chat message. The GM sent
  // it, so only the recipients get pinged.
  useEffect(() => {
    const keys = Object.keys(handoutSends || {});
    if (!seenSendsRef.current) {
      seenSendsRef.current = new Set(keys);
      return;
    }
    const fresh = keys.filter(
      (k) => !seenSendsRef.current.has(k) && sendVisibleTo(handoutSends[k], playerId, isGM)
    );
    keys.forEach((k) => seenSendsRef.current.add(k));
    if (fresh.length === 0 || isGM) return;
    playChatPing(effectVolume());
    if (!chatOpenRef.current) setHasUnread(true);
  }, [handoutSends, playerId, isGM]);

  // Opening the chat window counts as reading it.
  useEffect(() => {
    if (chatOpen) setHasUnread(false);
  }, [chatOpen]);

  const recent = buildFeed(chatMessages, players, playerId, isGM, handoutSends).slice(-PREVIEW_COUNT);

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
            <span className="mini-chat-author">{feedEntryLabel(entry)}:</span>{' '}
            {entry.kind === 'handout' ? entry.title : entry.text}
          </span>
        ))
      )}
    </button>
  );
}
