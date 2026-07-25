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
