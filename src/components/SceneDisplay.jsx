import { useEffect, useRef, useState } from 'react';
import { ref, update, push, remove } from 'firebase/database';
import { db } from '../firebase.js';
import TypewriterText from './TypewriterText.jsx';
import { resolveQueueEntity } from '../utils/initiativeEntity.js';

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
  savedLocations,
  savedFocuses,
  savedMusic,
  players,
  initiativeQueue,
  canPin = true,
}) {
  const audioRef = useRef(null);
  const ambianceRef = useRef(null);
  const sfxRef = useRef(null);
  const pendingRef = useRef(false);
  const ambiancePendingRef = useRef(false);
  const sfxSeenRef = useRef(undefined);
  const mapAreaRef = useRef(null);

  const [volume, setVolume] = useState(() => loadVolume(VOLUME_KEY, 0.6));
  const [soundError, setSoundError] = useState('');
  const [ambianceError, setAmbianceError] = useState('');
  const [mapOpen, setMapOpen] = useState(false);
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const [focusPickerOpen, setFocusPickerOpen] = useState(false);
  const [dragToken, setDragToken] = useState(null); // { id, x, y } while dragging

  const savedLocationList = Object.entries(savedLocations || {});
  const savedFocusList = Object.entries(savedFocuses || {});
  const savedMusicList = Object.entries(savedMusic || {});

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

  function selectLocation(entry) {
    update(ref(db, `rooms/${roomCode}/scene`), {
      locationImageUrl: entry.imageUrl,
      caption: entry.name,
      playing: true,
      updatedAt: Date.now(),
    });
    setLocationPickerOpen(false);
  }

  function selectFocus(entry) {
    update(ref(db, `rooms/${roomCode}/scene`), {
      focusImageUrl: entry.imageUrl,
      focusCaption: entry.name,
      playing: true,
      updatedAt: Date.now(),
    });
    setFocusPickerOpen(false);
  }

  function selectMusic(e) {
    const entry = savedMusicList.find(([id]) => id === e.target.value);
    if (entry) {
      update(ref(db, `rooms/${roomCode}/scene`), { musicUrl: entry[1].url });
    }
  }

  function handleMapClick(e) {
    if (!canPin) return;
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

  // GM auto-places a token for anyone in the initiative queue who doesn't
  // have one yet, scattered along the bottom edge — GM drags from there.
  useEffect(() => {
    if (!isGM || !mapOpen) return;
    const queue = initiativeQueue || [];
    const existing = scene?.mapTokens || {};
    const payload = {};
    queue.forEach((id, i) => {
      if (existing[id]) return;
      payload[id] = { x: 8 + i * (84 / Math.max(queue.length - 1, 1)), y: 88 };
    });
    if (Object.keys(payload).length > 0) {
      update(ref(db, `rooms/${roomCode}/scene/mapTokens`), payload);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGM, mapOpen, roomCode, initiativeQueue, scene?.mapTokens]);

  function handleTokenPointerDown(id, e) {
    e.stopPropagation();
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const token = scene?.mapTokens?.[id];
    setDragToken({ id, x: token?.x ?? 50, y: token?.y ?? 50 });
  }

  function handleTokenPointerMove(e) {
    if (!dragToken) return;
    const rect = mapAreaRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));
    setDragToken((d) => (d ? { ...d, x, y } : d));
  }

  function handleTokenPointerUp() {
    if (!dragToken) return;
    update(ref(db, `rooms/${roomCode}/scene/mapTokens/${dragToken.id}`), {
      x: dragToken.x,
      y: dragToken.y,
    });
    setDragToken(null);
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
        <div
          className={`scene-image-box scene-image-location${isGM ? ' scene-image-pickable' : ''}`}
          onClick={isGM ? () => setLocationPickerOpen((v) => !v) : undefined}
        >
          {scene.locationImageUrl ? (
            <img src={scene.locationImageUrl} alt="Mekan" />
          ) : (
            <span className="scene-placeholder">Mekan görseli yok</span>
          )}
          <TypewriterText className="scene-caption" text={scene.caption} />
          {isGM && <span className="scene-image-edit-hint">🖼️ Kütüphaneden seç</span>}
          {locationPickerOpen && (
            <div className="scene-image-picker" onClick={(e) => e.stopPropagation()}>
              {savedLocationList.length === 0 ? (
                <p className="muted small-hint">Henüz kayıtlı mekan yok — GM panelinden ekle.</p>
              ) : (
                savedLocationList.map(([id, l]) => (
                  <button
                    key={id}
                    type="button"
                    className={`btn-ghost small${scene.locationImageUrl === l.imageUrl ? ' active' : ''}`}
                    onClick={() => selectLocation(l)}
                  >
                    {l.name}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        <div
          className={`scene-image-box scene-image-focus${isGM ? ' scene-image-pickable' : ''}`}
          onClick={isGM ? () => setFocusPickerOpen((v) => !v) : undefined}
        >
          {scene.focusImageUrl ? (
            <img src={scene.focusImageUrl} alt="Karakter / Eşya" />
          ) : (
            <span className="scene-placeholder">Odak görseli yok</span>
          )}
          <TypewriterText className="scene-caption" text={scene.focusCaption} />
          {isGM && <span className="scene-image-edit-hint">🎭 Kütüphaneden seç</span>}
          {focusPickerOpen && (
            <div className="scene-image-picker" onClick={(e) => e.stopPropagation()}>
              {savedFocusList.length === 0 ? (
                <p className="muted small-hint">Henüz kayıtlı odak yok — GM panelinden ekle.</p>
              ) : (
                savedFocusList.map(([id, f]) => (
                  <button
                    key={id}
                    type="button"
                    className={`btn-ghost small${scene.focusImageUrl === f.imageUrl ? ' active' : ''}`}
                    onClick={() => selectFocus(f)}
                  >
                    {f.name}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {(scene.mapImageUrl || scene.musicUrl || scene.ambianceUrl || (isGM && savedMusicList.length > 0)) && (
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
            {(scene.musicUrl || (isGM && savedMusicList.length > 0)) && (
              <div className="sound-controls">
                {isGM && (
                  <div className="gm-sound-buttons">
                    {savedMusicList.length > 0 && (
                      <select
                        className="music-quick-select"
                        value={savedMusicList.find(([, m]) => m.url === scene.musicUrl)?.[0] || ''}
                        onChange={selectMusic}
                      >
                        <option value="">Müzik seç...</option>
                        {savedMusicList.map(([id, m]) => (
                          <option key={id} value={id}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                    )}
                    {scene.musicUrl && (
                      <>
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
                      </>
                    )}
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
        <div
          className={`scene-image-box scene-image-map${canPin ? ' map-pin-area' : ''}`}
          ref={mapAreaRef}
          onClick={handleMapClick}
        >
          <img src={scene.mapImageUrl} alt="Harita" />
          {(initiativeQueue || []).map((id) => {
            const entity = resolveQueueEntity(id, players, savedFocuses);
            if (!entity) return null;
            const stored = scene.mapTokens?.[id];
            const dragging = dragToken?.id === id;
            if (!dragging && !stored) return null;
            const x = dragging ? dragToken.x : stored.x;
            const y = dragging ? dragToken.y : stored.y;
            return (
              <div
                key={`token-${id}`}
                className={`map-token${entity.isNpc ? ' enemy' : ''}${isGM ? ' draggable' : ''}${dragging ? ' dragging' : ''}`}
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  borderColor: entity.isNpc ? undefined : entity.color || 'var(--amber)',
                }}
                title={entity.name}
                onClick={(e) => e.stopPropagation()}
                onPointerDown={isGM ? (e) => handleTokenPointerDown(id, e) : undefined}
                onPointerMove={isGM ? handleTokenPointerMove : undefined}
                onPointerUp={isGM ? handleTokenPointerUp : undefined}
              >
                {entity.imageUrl ? (
                  <img src={entity.imageUrl} alt={entity.name} />
                ) : (
                  <span className="map-token-fallback">
                    {entity.isNpc ? '⚔️' : (entity.name || '?').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            );
          })}
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
