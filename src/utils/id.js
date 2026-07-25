export function getOrCreatePlayerId() {
  const key = 'sessizlik_player_id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = newId('p');
    localStorage.setItem(key, id);
  }
  return id;
}

export function newId(prefix = 'id') {
  if (crypto.randomUUID) return crypto.randomUUID();
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
