import { useMemo } from 'react';

function rand(min, max) {
  return min + Math.random() * (max - min);
}

export default function WeatherEffect({ weather }) {
  const count = weather === 'snow' ? 46 : weather === 'rain' ? 70 : 0;

  const drops = useMemo(() => {
    if (!count) return [];
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: rand(0, 100),
      duration: weather === 'snow' ? rand(6, 12) : rand(0.5, 1.1),
      delay: rand(0, 6),
      size: weather === 'snow' ? rand(3, 7) : rand(1, 2),
      drift: weather === 'snow' ? rand(-30, 30) : rand(-8, -2),
      opacity: weather === 'snow' ? rand(0.4, 0.9) : rand(0.25, 0.55),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weather, count]);

  if (!count) return null;

  return (
    <div className={`weather-layer weather-${weather}`} aria-hidden="true">
      {drops.map((d) => (
        <span
          key={d.id}
          className={weather === 'snow' ? 'snow-flake' : 'rain-drop'}
          style={{
            left: `${d.left}%`,
            width: weather === 'snow' ? d.size : 2,
            height: weather === 'snow' ? d.size : rand(14, 24),
            animationDuration: `${d.duration}s`,
            animationDelay: `${d.delay}s`,
            opacity: d.opacity,
            '--drift-x': `${d.drift}px`,
          }}
        />
      ))}
    </div>
  );
}
