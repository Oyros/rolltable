import { useEffect, useRef, useState } from 'react';
import { ref, update } from 'firebase/database';
import { db } from '../firebase.js';
import { SFX_ASSETS } from '../utils/sfxAssets.js';
import { AMBIANCE_ASSETS } from '../utils/ambianceAssets.js';

export default function GMAtmospherePanel({
  roomCode,
  scene,
  ambianceVolume,
  onAmbianceVolumeChange,
}) {
  const [vignette, setVignetteLocal] = useState(0);
  const vignetteTimer = useRef(null);
  const synced = useRef(false);

  useEffect(() => {
    if (!synced.current && scene) {
      setVignetteLocal(scene.vignette || 0);
      synced.current = true;
    }
  }, [scene]);

  function playSfx(asset) {
    update(ref(db, `rooms/${roomCode}/scene`), {
      sfxUrl: asset.url,
      sfxAt: Date.now(),
    });
  }

  function toggleAmbiance(asset) {
    const isActive = scene?.ambianceUrl === asset.url && scene?.ambiancePlaying !== false;
    if (isActive) {
      update(ref(db, `rooms/${roomCode}/scene`), { ambiancePlaying: false });
    } else {
      update(ref(db, `rooms/${roomCode}/scene`), {
        ambianceUrl: asset.url,
        ambiancePlaying: true,
      });
    }
  }

  function triggerFlash() {
    update(ref(db, `rooms/${roomCode}/scene`), { flashAt: Date.now() });
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
    <div className="panel">
      <h2 className="title-font">Atmosfer Kontrolleri</h2>

      <div className="gm-section" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
        <h3 className="title-font gm-section-title">Ses Efektleri (Tek Seferlik)</h3>

        {SFX_ASSETS.length > 0 ? (
          <div className="sfx-library">
            {SFX_ASSETS.map((asset) => (
              <button
                key={asset.id}
                type="button"
                className="btn-dice"
                onClick={() => playSfx(asset)}
              >
                🔊 {asset.name}
              </button>
            ))}
          </div>
        ) : (
          <p className="muted">
            <code>src/assets/sfx/</code> klasörüne mp3 dosyası ekle, burada otomatik buton olarak
            çıkar.
          </p>
        )}
      </div>

      <div className="gm-section">
        <h3 className="title-font gm-section-title">Ambiyans (Çal / Durdur)</h3>

        {AMBIANCE_ASSETS.length > 0 ? (
          <div className="sfx-library">
            {AMBIANCE_ASSETS.map((asset) => {
              const isActive = scene?.ambianceUrl === asset.url && scene?.ambiancePlaying !== false;
              return (
                <button
                  key={asset.id}
                  type="button"
                  className={`btn-dice${isActive ? ' active' : ''}`}
                  onClick={() => toggleAmbiance(asset)}
                >
                  {isActive ? '⏸' : '🔉'} {asset.name}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="muted">
            <code>src/assets/ambiance/</code> klasörüne mp3 dosyası ekle, burada otomatik buton
            olarak çıkar.
          </p>
        )}

        {AMBIANCE_ASSETS.length > 0 && (
          <label className="volume-control">
            🔉 Ses Düzeyi
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={ambianceVolume}
              onChange={(e) => onAmbianceVolumeChange(parseFloat(e.target.value))}
            />
          </label>
        )}
      </div>

      <div className="gm-section">
        <h3 className="title-font gm-section-title">Görsel Efektler</h3>

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
    </div>
  );
}
