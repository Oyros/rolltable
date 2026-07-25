import { useEffect, useRef, useState } from 'react';
import { ref, update, push, remove } from 'firebase/database';
import { db } from '../firebase.js';
import TypewriterText from './TypewriterText.jsx';

const VOLUME_KEY = 'sessizlik_volume';

function loadVolume(key, fallback) {
  const raw = localStorage.getItem(key);
  const parsed = raw ? parseFloat(raw) : fallback;
  return Number.isFinite(parsed) ? Math.min(1, Math.max(0, parsed)) : fallback;
}

export default function SceneDisplay({
  scene,
  roomCode,
  isGM,
  name,
  playerId,
  pinColor,
  ambianceVolume,
  onAmbianceVolumeChange,
}) {
  const audioRef = useRef(null);
  const ambianceRef = useRef(null);
  const sfxRef = useRef(null);
  const pendingRef = useRef(false);
  const ambiancePendingRef = useRef(false);
  const sfxSeenRef = useRef(undefined);

  const [volume, setVolume] = useState(() => loadVolume(VOLUME_KEY, 0.6));
  const [soundError, setSoundError] = useState('');
  const [ambianceError, setAmbianceError] = useState('');
  const [mapOpen, setMapOpen] = useState(false);

  const isPlaying = scene?.playing !== false;
  const isAmbiancePlaying = scene?.ambiancePlaying !== false;

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
    localStorage.setItem(VOLUME_KEY, String(volume));
  }, [volume]);

  useEffect(() => {
    if (ambianceRef.current) ambianceRef.current.volume = ambianceVolume;
  }, [ambianceVolume]);

  // Music
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!scene?.musicUrl) {
      audio.pause();
      audio.removeAttribute('src');
      setSoundError('');
      return;
    }

    if (audio.src !== scene.musicUrl) {
      audio.src = scene.musicUrl;
      audio.volume = volume;
    }

    if (!isPlaying) {
      audio.pause();
      return;
    }

    audio
      .play()
      .then(() => setSoundError(''))
      .catch(() => {
        pendingRef.current = true;
        setSoundError('Sayfaya bir kere tıklayınca otomatik başlayacak');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene?.musicUrl, isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !scene?.restartAt) return;
    audio.currentTime = 0;
    if (isPlaying) {
      audio
        .play()
        .then(() => setSoundError(''))
        .catch(() => {
          pendingRef.current = true;
          setSoundError('Sayfaya bir kere tıklayınca otomatik başlayacak');
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene?.restartAt]);

  // Ambiance
  useEffect(() => {
    const audio = ambianceRef.current;
    if (!audio) return;

    if (!scene?.ambianceUrl) {
      audio.pause();
      audio.removeAttribute('src');
      setAmbianceError('');
      return;
    }

    if (audio.src !== scene.ambianceUrl) {
      audio.src = scene.ambianceUrl;
      audio.volume = ambianceVolume;
    }

    if (!isAmbiancePlaying) {
      audio.pause();
      return;
    }

    audio
      .play()
      .then(() => setAmbianceError(''))
      .catch(() => {
        ambiancePendingRef.current = true;
        setAmbianceError('Sayfaya bir kere tıklayınca otomatik başlayacak');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene?.ambianceUrl, isAmbiancePlaying]);

  // One-shot SFX
  useEffect(() => {
    const sfx = sfxRef.current;
    if (!sfx || !scene?.sfxUrl || !scene?.sfxAt) return;

    if (sfxSeenRef.current === undefined) {
      sfxSeenRef.current = scene.sfxAt;
      return;
    }

    if (scene.sfxAt !== sfxSeenRef.current) {
      sfxSeenRef.current = scene.sfxAt;
      sfx.src = scene.sfxUrl;
      sfx.volume = volume;
      sfx.currentTime = 0;
      sfx.play().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene?.sfxUrl, scene?.sfxAt]);

  // Unlock autoplay after first user interaction anywhere on the page
  useEffect(() => {
    function retry() {
      if (pendingRef.current && audioRef.current) {
        audioRef.current
          .play()
          .then(() => {
            pendingRef.current = false;
            setSoundError('');
          })
          .catch(() => {});
      }
      if (ambiancePendingRef.current && ambianceRef.current) {
        ambianceRef.current
          .play()
          .then(() => {
            ambiancePendingRef.current = false;
            setAmbianceError('');
          })
          .catch(() => {});
      }
    }
    document.addEventListener('click', retry);
    document.addEventListener('keydown', retry);
    document.addEventListener('touchstart', retry);
    return () => {
      document.removeEventListener('click', retry);
      document.removeEventListener('keydown', retry);
      document.removeEventListener('touchstart', retry);
    };
  }, []);

  function togglePlaying() {
    update(ref(db, `rooms/${roomCode}/scene`), { playing: !isPlaying });
  }

  function restartTrack() {
    update(ref(db, `rooms/${roomCode}/scene`), { playing: true, restartAt: Date.now() });
  }

  function toggleAmbiancePlaying() {
    update(ref(db, `rooms/${roomCode}/scene`), { ambiancePlaying: !isAmbiancePlaying });
  }

  function handleMapClick(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    push(ref(db, `rooms/${roomCode}/scene/mapPins`), {
      x,
      y,
      by: name || '',
      byId: playerId || '',
      color: pinColor || '',
      gm: !!isGM,
    });
  }

  function removePin(pinId, pin, e) {
    e.stopPropagation();
    if (!isGM && pin.byId !== playerId) return;
    remove(ref(db, `rooms/${roomCode}/scene/mapPins/${pinId}`));
  }

  if (!scene) {
    return (
      <div className="scene-display panel scene-empty">
        <p>GM henüz bir sahne yayınlamadı.</p>
      </div>
    );
  }

  return (
    <div className="scene-display panel">
      <div className="scene-images">
        <div className="scene-image-box scene-image-location">
          {scene.locationImageUrl ? (
            <img src={scene.locationImageUrl} alt="Mekan" />
          ) : (
            <span className="scene-placeholder">Mekan görseli yok</span>
          )}
          <TypewriterText className="scene-caption" text={scene.caption} />
        </div>
        <div className="scene-image-box scene-image-focus">
          {scene.focusImageUrl ? (
            <img src={scene.focusImageUrl} alt="Karakter / Eşya" />
          ) : (
            <span className="scene-placeholder">Odak görseli yok</span>
          )}
          <TypewriterText className="scene-caption" text={scene.focusCaption} />
        </div>
      </div>

      {(scene.mapImageUrl || scene.musicUrl || scene.ambianceUrl) && (
        <div className="scene-toolbar">
          {scene.mapImageUrl && (
            <button
              type="button"
              className="btn-ghost sound-toggle"
              onClick={() => setMapOpen((v) => !v)}
            >
              {mapOpen ? '🗺️ Haritayı Gizle' : '🗺️ Haritayı Göster'}
            </button>
          )}

          <div className="scene-audio-controls">
            {scene.musicUrl && (
              <div className="sound-controls">
                {isGM && (
                  <div className="gm-sound-buttons">
                    <button
                      type="button"
                      className="btn-ghost sound-toggle"
                      onClick={togglePlaying}
                    >
                      {isPlaying ? '⏸ Durdur' : '▶️ Devam Ettir'}
                    </button>
                    <button type="button" className="btn-ghost sound-toggle" onClick={restartTrack}>
                      ⏮ Baştan Başlat
                    </button>
                  </div>
                )}
                <label className="volume-control">
                  🔊
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                  />
                </label>
                {soundError && <span className="sound-error">{soundError}</span>}
              </div>
            )}

            {scene.ambianceUrl && (
              <div className="sound-controls">
                {isGM && (
                  <div className="gm-sound-buttons">
                    <button
                      type="button"
                      className="btn-ghost sound-toggle"
                      onClick={toggleAmbiancePlaying}
                    >
                      {isAmbiancePlaying ? '⏸ Ambiyans' : '▶️ Ambiyans'}
                    </button>
                  </div>
                )}
                <label className="volume-control">
                  🔉
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={ambianceVolume}
                    onChange={(e) => onAmbianceVolumeChange(parseFloat(e.target.value))}
                  />
                </label>
                {ambianceError && <span className="sound-error">{ambianceError}</span>}
              </div>
            )}
          </div>
        </div>
      )}

      {mapOpen && scene.mapImageUrl && (
        <div className="scene-image-box scene-image-map map-pin-area" onClick={handleMapClick}>
          <img src={scene.mapImageUrl} alt="Harita" />
          {Object.entries(scene.mapPins || {}).map(([id, pin]) => {
            const canRemove = isGM || pin.byId === playerId;
            const label = pin.by
              ? `${pin.by} bıraktı${canRemove ? ' — kaldırmak için tıkla' : ''}`
              : 'Kaldırmak için tıkla';

            if (pin.gm) {
              return (
                <button
                  key={id}
                  type="button"
                  className={`map-pin map-pin-emoji${canRemove ? '' : ' map-pin-locked'}`}
                  style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                  title={label}
                  onClick={(e) => removePin(id, pin, e)}
                >
                  📍
                </button>
              );
            }

            return (
              <button
                key={id}
                type="button"
                className={`map-pin map-pin-marker${canRemove ? '' : ' map-pin-locked'}`}
                style={{
                  left: `${pin.x}%`,
                  top: `${pin.y}%`,
                  background: pin.color || 'var(--amber)',
                }}
                title={label}
                onClick={(e) => removePin(id, pin, e)}
              />
            );
          })}
        </div>
      )}

      <audio
        ref={audioRef}
        loop
        onError={() =>
          setSoundError('Dosya oynatılamadı (link doğrudan mp3 dosyasına gitmiyor olabilir)')
        }
      />
      <audio
        ref={ambianceRef}
        loop
        onError={() =>
          setAmbianceError('Dosya oynatılamadı (link doğrudan mp3 dosyasına gitmiyor olabilir)')
        }
      />
      <audio ref={sfxRef} />
    </div>
  );
}
