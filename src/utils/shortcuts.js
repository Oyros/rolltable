// Single-key shortcuts for the room. Every binding is remappable and stored
// per browser, so two people at the same table can use different keys.
const STORAGE_KEY = 'rolltable_shortcuts';

export const SHORTCUT_ACTIONS = [
  { id: 'map', label: 'Haritayı aç/kapat', default: 'm' },
  { id: 'quests', label: 'Görev panosunu aç/kapat', default: 'g' },
  { id: 'chat', label: 'Sohbeti aç/kapat', default: 'c' },
  { id: 'panel', label: 'GM paneli / karakter kağıdı', default: 'p' },
  { id: 'history', label: 'İşlem geçmişini aç/kapat', default: 'z' },
  { id: 'focusChat', label: 'Sohbet yazma kutusuna geç', default: 'Enter' },
  { id: 'close', label: 'Açık pencereyi kapat', default: 'Escape' },
];

export function defaultBindings() {
  const out = {};
  SHORTCUT_ACTIONS.forEach((a) => {
    out[a.id] = a.default;
  });
  return out;
}

export function loadBindings() {
  const defaults = defaultBindings();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const saved = JSON.parse(raw);
    Object.keys(defaults).forEach((id) => {
      if (typeof saved?.[id] === 'string' && saved[id]) defaults[id] = saved[id];
    });
    return defaults;
  } catch {
    return defaults;
  }
}

export function saveBindings(bindings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bindings));
  } catch {
    // ignore
  }
}

// Typing in a field must never trigger a shortcut.
export function isTypingTarget(target) {
  if (!target) return false;
  const tag = (target.tagName || '').toLowerCase();
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
  return !!target.isContentEditable;
}

export function normalizeKey(key) {
  if (!key) return '';
  if (key.length === 1) return key.toLocaleLowerCase('tr');
  return key;
}

// Which action a keydown maps to, or null. Escape always closes regardless of
// where focus is; the rest stay out of the way while typing.
export function actionForEvent(e, bindings) {
  if (e.ctrlKey || e.metaKey || e.altKey) return null;
  const key = normalizeKey(e.key);
  const match = Object.entries(bindings).find(([, bound]) => normalizeKey(bound) === key);
  if (!match) return null;
  const [id] = match;
  if (id === 'close') return 'close';
  if (isTypingTarget(e.target)) return null;
  return id;
}

export function keyDisplay(key) {
  if (key === ' ') return 'Boşluk';
  if (key === 'Escape') return 'Esc';
  if (key === 'Enter') return 'Enter';
  return (key || '').toLocaleUpperCase('tr');
}
