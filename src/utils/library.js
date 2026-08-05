// Library entries (locations / focuses / music) used to carry a single `name`
// that doubled as both the GM-facing label and the caption shown on the scene.
// They now carry `label` (what the GM sees in the library) and `caption` (what
// players see on the scene) separately, plus an optional `folder`. Entries
// saved before this change only have `name`, so both fall back to it.

export const UNFILED = 'Klasörsüz';

export function entryLabel(entry) {
  return entry?.label || entry?.name || '';
}

export function entryCaption(entry) {
  const caption = entry?.caption;
  return caption === undefined || caption === null ? entry?.name || '' : caption;
}

export function entryFolder(entry) {
  return (entry?.folder || '').trim();
}

// [[folderName, entries], ...] — named folders alphabetically, unfiled last.
export function groupByFolder(entries) {
  const groups = new Map();
  entries.forEach(([id, entry]) => {
    const folder = entryFolder(entry) || UNFILED;
    if (!groups.has(folder)) groups.set(folder, []);
    groups.get(folder).push([id, entry]);
  });
  return [...groups.entries()].sort((a, b) => {
    if (a[0] === UNFILED) return 1;
    if (b[0] === UNFILED) return -1;
    return a[0].localeCompare(b[0], 'tr');
  });
}

// Case- and accent-tolerant enough for Turkish: lowercases with the tr locale
// so "İ"/"I" behave, then matches on label, caption and folder together.
export function matchesQuery(entry, query) {
  const q = (query || '').trim().toLocaleLowerCase('tr');
  if (!q) return true;
  const haystack = [entryLabel(entry), entryCaption(entry), entryFolder(entry)]
    .join(' ')
    .toLocaleLowerCase('tr');
  return haystack.includes(q);
}

export function filterEntries(entries, query) {
  if (!(query || '').trim()) return entries;
  return entries.filter(([, entry]) => matchesQuery(entry, query));
}

// Existing folder names, for the "pick or type a new one" datalist.
export function folderNames(entries) {
  const names = new Set();
  entries.forEach(([, entry]) => {
    const folder = entryFolder(entry);
    if (folder) names.add(folder);
  });
  return [...names].sort((a, b) => a.localeCompare(b, 'tr'));
}
