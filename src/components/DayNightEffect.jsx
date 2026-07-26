export default function DayNightEffect({ nightIntensity }) {
  const dayOpacity = Math.max(0, 1 - nightIntensity * 1.3);
  const nightOpacity = nightIntensity;

  return (
    <div className="day-night-layer" aria-hidden="true">
      <div className="sun-rays" style={{ opacity: dayOpacity * 0.45 }} />
      <div className="night-dark" style={{ opacity: nightOpacity }} />
      <div className="candle-glow-wrap candle-glow-wrap-1" style={{ opacity: nightOpacity }}>
        <div className="candle-glow" />
      </div>
      <div className="candle-glow-wrap candle-glow-wrap-2" style={{ opacity: nightOpacity }}>
        <div className="candle-glow" />
      </div>
      <div className="candle-glow-wrap candle-glow-wrap-3" style={{ opacity: nightOpacity }}>
        <div className="candle-glow" />
      </div>
    </div>
  );
}
