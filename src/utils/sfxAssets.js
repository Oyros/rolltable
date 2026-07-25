const modules = import.meta.glob('../assets/sfx/*.mp3', { eager: true, query: '?url', import: 'default' });

function nameFromPath(path) {
  const fileName = path.split('/').pop().replace(/\.mp3$/i, '');
  return fileName.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export const SFX_ASSETS = Object.entries(modules)
  .map(([path, url]) => ({ id: path, name: nameFromPath(path), url }))
  .sort((a, b) => a.name.localeCompare(b.name, 'tr'));
