// A player's gallery entry used to be a bare URL string; it can now also be
// `{ url, label }` so the image carries a name the GM can recognise in the
// focus picker. Everything here tolerates both shapes.
export function portraitUrl(entry) {
  return typeof entry === 'string' ? entry : entry?.url || '';
}

export function portraitLabel(entry) {
  return typeof entry === 'string' ? '' : (entry?.label || '').trim();
}

export function makePortrait(url, label) {
  const trimmedLabel = (label || '').trim();
  return trimmedLabel ? { url, label: trimmedLabel } : url;
}

// Unnamed images still need something to click on, so they fall back to their
// position in the gallery.
export function portraitDisplayName(entry, index) {
  return portraitLabel(entry) || `Görsel ${index + 1}`;
}

// One group per player who has at least one image, in the shape the focus
// pickers render: the character name is the subfolder, the image names are the
// buttons inside it.
export function playerImageGroups(players) {
  return Object.entries(players || {})
    .filter(([, p]) => p.role === 'oyuncu')
    .map(([id, p]) => {
      const images = Object.entries(p.portraits || {})
        .map(([imgId, entry], index) => ({
          id: imgId,
          url: portraitUrl(entry),
          label: portraitLabel(entry),
          name: portraitDisplayName(entry, index),
        }))
        .filter((img) => img.url);
      return { playerId: id, playerName: p.name || 'İsimsiz', images };
    })
    .filter((group) => group.images.length > 0)
    .sort((a, b) => a.playerName.localeCompare(b.playerName, 'tr'));
}

// The scene caption for a player image: the name they gave it, or the
// character's own name when they didn't give one.
export function playerImageCaption(playerName, image) {
  return image.label || playerName;
}
