import { useMemo } from 'react';

const PRESETS = {
  'post-apocalyptic': {
    count: 22,
    colors: ['#cf9a3f', '#8a662f'],
    size: [2, 4],
    duration: [10, 18],
    direction: 'up',
    opacity: [0.15, 0.35],
  },
  cyberpunk: {
    count: 20,
    colors: ['#ff2fd4', '#7df9ff'],
    size: [1, 3],
    duration: [4, 9],
    direction: 'down',
    opacity: [0.25, 0.55],
    glow: true,
  },
  'high-fantasy': {
    count: 24,
    colors: ['#f3d878', '#d4af37'],
    size: [2, 4],
    duration: [9, 16],
    direction: 'float',
    opacity: [0.2, 0.5],
    glow: true,
  },
  'gothic-horror': {
    count: 10,
    colors: ['#5a5a5a'],
    size: [80, 160],
    duration: [20, 32],
    direction: 'drift',
    opacity: [0.05, 0.12],
    blur: 20,
  },
  'sci-fi': {
    count: 26,
    colors: ['#3fd0ff', '#a6ecff'],
    size: [1, 2],
    duration: [6, 13],
    direction: 'float',
    opacity: [0.25, 0.6],
    glow: true,
  },
  western: {
    count: 15,
    colors: ['#c17f3f', '#8a5a2a'],
    size: [2, 5],
    duration: [12, 20],
    direction: 'up',
    opacity: [0.1, 0.3],
  },
  steampunk: {
    count: 18,
    colors: ['#b87333', '#d99a4e'],
    size: [1, 3],
    duration: [5, 10],
    direction: 'float',
    opacity: [0.25, 0.5],
    glow: true,
  },
  pirate: {
    count: 12,
    colors: ['#9fd4d0'],
    size: [60, 140],
    duration: [20, 30],
    direction: 'drift',
    opacity: [0.05, 0.12],
    blur: 15,
  },
  mythology: {
    count: 20,
    colors: ['#d4af37', '#f3d878'],
    size: [2, 4],
    duration: [10, 16],
    direction: 'float',
    opacity: [0.2, 0.45],
    glow: true,
  },
  noir: {
    count: 14,
    colors: ['#888888'],
    size: [40, 100],
    duration: [18, 28],
    direction: 'drift',
    opacity: [0.05, 0.1],
    blur: 18,
  },
  wuxia: {
    count: 22,
    colors: ['#f4b6c2', '#ffe6ec'],
    size: [3, 6],
    duration: [8, 14],
    direction: 'down',
    opacity: [0.3, 0.6],
  },
  'space-opera': {
    count: 26,
    colors: ['#d63fd6', '#7df9ff', '#ff8ce0'],
    size: [1, 3],
    duration: [6, 12],
    direction: 'float',
    opacity: [0.25, 0.6],
    glow: true,
  },
  zombie: {
    count: 16,
    colors: ['#7a8f3f', '#a3c25c'],
    size: [2, 4],
    duration: [10, 18],
    direction: 'float',
    opacity: [0.2, 0.4],
  },
  vampire: {
    count: 14,
    colors: ['#8f1d4f', '#c94c7f'],
    size: [2, 4],
    duration: [8, 14],
    direction: 'up',
    opacity: [0.2, 0.45],
    glow: true,
  },
  viking: {
    count: 24,
    colors: ['#ffffff', '#9fcbe6'],
    size: [2, 4],
    duration: [10, 16],
    direction: 'down',
    opacity: [0.3, 0.6],
  },
  arabian: {
    count: 20,
    colors: ['#d4af37', '#e8c97a'],
    size: [1, 3],
    duration: [8, 14],
    direction: 'drift',
    opacity: [0.2, 0.4],
  },
  'cosmic-horror': {
    count: 14,
    colors: ['#7a3fae', '#3f8f6a'],
    size: [2, 5],
    duration: [12, 20],
    direction: 'float',
    opacity: [0.15, 0.35],
    blur: 2,
  },
  superhero: {
    count: 18,
    colors: ['#e63946', '#ffd23f', '#4be678'],
    size: [2, 4],
    duration: [5, 10],
    direction: 'float',
    opacity: [0.3, 0.55],
    glow: true,
  },
  heist: {
    count: 12,
    colors: ['#d4af37', '#f0d878'],
    size: [1, 2],
    duration: [6, 10],
    direction: 'float',
    opacity: [0.2, 0.4],
    glow: true,
  },
  kaiju: {
    count: 18,
    colors: ['#e8622e', '#8a8a8a'],
    size: [2, 5],
    duration: [8, 14],
    direction: 'up',
    opacity: [0.2, 0.45],
    glow: true,
  },
  carnival: {
    count: 20,
    colors: ['#c0182e', '#d4af37'],
    size: [2, 4],
    duration: [8, 14],
    direction: 'down',
    opacity: [0.3, 0.55],
  },
};

function rand(min, max) {
  return min + Math.random() * (max - min);
}

export default function ParticleEffect({ theme }) {
  const preset = PRESETS[theme] || PRESETS['post-apocalyptic'];

  const particles = useMemo(() => {
    return Array.from({ length: preset.count }, (_, i) => ({
      id: i,
      left: rand(0, 100),
      size: rand(preset.size[0], preset.size[1]),
      duration: rand(preset.duration[0], preset.duration[1]),
      delay: rand(0, preset.duration[1]),
      opacity: rand(preset.opacity[0], preset.opacity[1]),
      color: preset.colors[Math.floor(Math.random() * preset.colors.length)],
      driftX: rand(-40, 40),
      top: rand(0, 100),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  return (
    <div className="particle-layer" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className={`particle particle-${preset.direction}`}
          style={{
            left: `${p.left}%`,
            top: preset.direction === 'float' || preset.direction === 'drift' ? `${p.top}%` : undefined,
            width: p.size,
            height: p.size,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            opacity: p.opacity,
            '--drift-x': `${p.driftX}px`,
            background: p.color,
            boxShadow: preset.glow ? `0 0 ${p.size * 2}px ${p.color}` : 'none',
            filter: preset.blur ? `blur(${preset.blur}px)` : 'none',
          }}
        />
      ))}
    </div>
  );
}
