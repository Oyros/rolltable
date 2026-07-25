export const THEMES = [
  {
    id: 'post-apocalyptic',
    name: 'Post-Apokaliptik',
    vars: {
      '--bg': '#120d09',
      '--bg-panel': '#1c150e',
      '--bg-panel-alt': '#241a10',
      '--border': '#3c2c18',
      '--amber': '#cf9a3f',
      '--amber-light': '#e8bd6d',
      '--amber-dim': '#8a662f',
      '--text': '#ece2d0',
      '--text-muted': '#b0a086',
      '--danger': '#a5433a',
      '--ok': '#6b8f5c',
      '--tired': '#8a7a3f',
      '--font-heading': "'Cinzel', serif",
      '--radius': '10px',
    },
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    vars: {
      '--bg': '#07050d',
      '--bg-panel': '#0f0b1d',
      '--bg-panel-alt': '#171029',
      '--border': '#3a2a5c',
      '--amber': '#ff2fd4',
      '--amber-light': '#7df9ff',
      '--amber-dim': '#a3129e',
      '--text': '#e7e9ff',
      '--text-muted': '#8d87b5',
      '--danger': '#ff3860',
      '--ok': '#39ff9d',
      '--tired': '#ffd23f',
      '--font-heading': "'Orbitron', sans-serif",
      '--radius': '3px',
    },
  },
  {
    id: 'high-fantasy',
    name: 'Yüksek Fantazi',
    vars: {
      '--bg': '#160f24',
      '--bg-panel': '#20172f',
      '--bg-panel-alt': '#2a1f3b',
      '--border': '#4a3768',
      '--amber': '#d4af37',
      '--amber-light': '#f3d878',
      '--amber-dim': '#9c7f24',
      '--text': '#efe6ff',
      '--text-muted': '#b0a3cc',
      '--danger': '#c0455e',
      '--ok': '#6fae7a',
      '--tired': '#c99a4b',
      '--font-heading': "'Cinzel Decorative', serif",
      '--radius': '14px',
    },
  },
  {
    id: 'gothic-horror',
    name: 'Gotik Korku',
    vars: {
      '--bg': '#0a0505',
      '--bg-panel': '#150a0a',
      '--bg-panel-alt': '#1e0e0e',
      '--border': '#3f1414',
      '--amber': '#8f1d1d',
      '--amber-light': '#c94c4c',
      '--amber-dim': '#5c1010',
      '--text': '#e6d8d8',
      '--text-muted': '#a08787',
      '--danger': '#e34747',
      '--ok': '#5c8f6e',
      '--tired': '#8f6a3f',
      '--font-heading': "'UnifrakturMaguntia', cursive",
      '--radius': '4px',
    },
  },
  {
    id: 'sci-fi',
    name: 'Bilim Kurgu',
    vars: {
      '--bg': '#040810',
      '--bg-panel': '#0a1220',
      '--bg-panel-alt': '#101c30',
      '--border': '#1f3a5c',
      '--amber': '#3fd0ff',
      '--amber-light': '#a6ecff',
      '--amber-dim': '#1c86ad',
      '--text': '#e3f3ff',
      '--text-muted': '#7fa2c2',
      '--danger': '#ff5f5f',
      '--ok': '#4be6a0',
      '--tired': '#ffcf5c',
      '--font-heading': "'Rajdhani', sans-serif",
      '--radius': '6px',
    },
  },
];

export const DEFAULT_THEME_ID = 'post-apocalyptic';

export function getTheme(id) {
  return THEMES.find((t) => t.id === id) || THEMES[0];
}

export function applyTheme(id) {
  const theme = getTheme(id);
  Object.entries(theme.vars).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });
}
