// The room feed is three streams merged into one timeline: public chat,
// whispers, and the automatic system log (character-sheet changes). Whispers
// and system entries live under each player's own node, so they have to be
// gathered per player and filtered by who's allowed to see them.
//
// Shared by the chat window and the header's mini log so the two can never
// disagree about what a given viewer should see.

import { sendVisibleTo } from './handouts.js';

export function buildWhisperEntries(players, playerId, isGM) {
  const entries = [];
  Object.entries(players || {}).forEach(([pid, p]) => {
    Object.entries(p.whispers || {}).forEach(([key, w]) => {
      const sentByMe = !!w.byId && w.byId === playerId;
      const sentToMe = pid === playerId;
      // GM oversees the whole table; everyone else sees only their own.
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

export function buildChatEntries(chatMessages) {
  return chatMessages.map(([key, m]) => ({
    key: `c-${key}`,
    at: m.at,
    kind: 'chat',
    text: m.text,
    author: m.by,
    isGM: m.isGM,
  }));
}

// Handouts the GM sent, as cards in the same timeline.
export function buildHandoutEntries(handoutSends, playerId, isGM) {
  return Object.entries(handoutSends || {})
    .filter(([, send]) => sendVisibleTo(send, playerId, isGM))
    .map(([key, send]) => ({
      key: `h-${key}`,
      at: send.at,
      kind: 'handout',
      title: send.title,
      text: send.text,
      imageUrl: send.imageUrl,
      fromName: send.by || 'GM',
      toAll: !!send.all,
    }));
}

export function buildFeed(chatMessages, players, playerId, isGM, handoutSends) {
  return [
    ...buildChatEntries(chatMessages),
    ...buildWhisperEntries(players, playerId, isGM),
    ...buildHandoutEntries(handoutSends, playerId, isGM),
  ].sort((a, b) => (a.at || 0) - (b.at || 0));
}

// Short "who" label for an entry, used by the compact header log.
export function feedEntryLabel(entry) {
  if (entry.kind === 'chat') return entry.author;
  if (entry.kind === 'handout') return '📜 Belge';
  if (entry.kind === 'system') return '📝';
  if (entry.sentByMe) return `🔒 → ${entry.toName}`;
  return `🔒 ${entry.fromName}`;
}
