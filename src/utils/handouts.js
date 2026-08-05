// Pure helpers only — the chat feed imports this, and it must stay free of
// Firebase (and therefore of Vite env) so it can be reasoned about and tested
// on its own. The writes live in HandoutLibrary, the only place that performs
// them.
//
// Handouts are prepared once in the GM's library (settings/handouts) and then
// *sent*: each send is its own record under handoutSends carrying a snapshot
// of the content, so editing or deleting the library entry later doesn't
// rewrite what players already received.

// The GM oversees everything; a player sees a send addressed to the table or
// to them personally.
export function sendVisibleTo(send, playerId, isGM) {
  if (isGM) return true;
  if (send?.all) return true;
  return !!send?.to?.[playerId];
}

// "Herkes" or the names of the individual recipients, for the GM's sent list.
export function recipientLabel(send, players) {
  if (send?.all) return 'Herkes';
  const names = Object.keys(send?.to || {}).map((id) => players?.[id]?.name || '?');
  return names.length > 0 ? names.join(', ') : '—';
}

// recipients: 'all' or an array of player ids. Returns null when there's
// nothing to send (empty selection), otherwise the record to push.
export function buildSendPayload(handoutId, handout, recipients, senderName) {
  const payload = {
    handoutId,
    title: handout?.title || '',
    text: handout?.text || '',
    imageUrl: handout?.imageUrl || '',
    by: senderName || 'GM',
    at: Date.now(),
  };
  if (recipients === 'all') {
    payload.all = true;
    return payload;
  }
  const to = {};
  (recipients || []).forEach((id) => {
    to[id] = true;
  });
  if (Object.keys(to).length === 0) return null;
  payload.to = to;
  return payload;
}
