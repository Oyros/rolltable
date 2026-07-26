import { useEffect, useRef, useState } from 'react';
import { ref, update } from 'firebase/database';
import { db } from '../firebase.js';

export default function VisualEffectsPanel({ roomCode, scene }) {
  const [vignette, setVignetteLocal] = useState(0);
  const vignetteTimer = useRef(null);
  const synced = useRef(false);

  useEffect(() => {
    if (!synced.current && scene) {
      setVignetteLocal(scene.vignette || 0);
      synced.current = true;
    }
  }, [scene]);

  function triggerFlash() {
    update(ref(db, `rooms/${roomCode}/scene`), { flashAt: Date.now() });
  }

  function setWeather(value) {
    update(ref(db, `rooms/${roomCode}/scene`), { weather: value });
  }

  function handleVignetteChange(e) {
    const value = Number(e.target.value);
    setVignetteLocal(value);
    clearTimeout(vignetteTimer.current);
    vignetteTimer.current = setTimeout(() => {
      update(ref(db, `rooms/${roomCode}/scene`), { vignette: value });
    }, 120);
  }

  return (
    <div className="weather-toggle-wrap">
      <div className="weather-toggle">
        <button
          type="button"
          className={`roll-mode-btn${(scene?.weather || 'none') === 'none' ? ' active' : ''}`}
          onClick={() => setWeather('none')}
        >
          Yok
        </button>
        <button
          type="button"
          className={`roll-mode-btn${scene?.weather === 'rain' ? ' active' : ''}`}
          onClick={() => setWeather('rain')}
        >
          🌧️ Yağmur
        </button>
        <button
          type="button"
          className={`roll-mode-btn${scene?.weather === 'snow' ? ' active' : ''}`}
          onClick={() => setWeather('snow')}
        >
          ❄️ Kar
        </button>
      </div>

      <label className="vignette-field">
        Vinyet Yoğunluğu ({vignette}%)
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={vignette}
          onChange={handleVignetteChange}
        />
      </label>

      <button type="button" className="btn-ghost sound-toggle" onClick={triggerFlash}>
        ⚡ Flaş / Sarsıntı Tetikle
      </button>
    </div>
  );
}
