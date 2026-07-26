// Fallback identity used only if Firebase Anonymous Auth isn't enabled yet
// for this project (Firebase console → Authentication → Sign-in method).
export function getOrCreateLocalId() {
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
