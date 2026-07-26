import { ref, update } from 'firebase/database';
import { db } from '../firebase.js';
import { SFX_ASSETS } from '../utils/sfxAssets.js';
import { AMBIANCE_ASSETS } from '../utils/ambianceAssets.js';

export default function SoundEffectsPanel({ roomCode, scene, ambianceVolume, onAmbianceVolumeChange }) {
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

  return (
    <>
      <div className="side-accordion-group">
        <h3 className="side-accordion-group-title">Ses Efektleri (Tek Seferlik)</h3>

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

      <div className="side-accordion-group">
        <h3 className="side-accordion-group-title">Ambiyans (Çal / Durdur)</h3>

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
    </>
  );
}
