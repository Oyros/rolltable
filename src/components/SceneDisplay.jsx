import { useEffect, useRef, useState } from 'react';
import { ref, update, push, remove } from 'firebase/database';
import { db } from '../firebase.js';
import TypewriterText from './TypewriterText.jsx';
import { entryLabel, entryCaption, groupByFolder } from '../utils/library.js';
import { playerImageGroups, playerImageCaption } from '../utils/portraits.js';

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
  ambianceVolume,
  onAmbianceVolumeChange,
  savedLocations,
  savedFocuses,
  savedMusic,
  players,
}) {
  const audioRef = useRef(null);
  const ambianceRef = useRef(null);
  const sfxRef = useRef(null);
  const pendingRef = useRef(false);
  const ambiancePendingRef = useRef(false);
  const sfxSeenRef = useRef(undefined);
  const loadedMusicUrlRef = useRef('');

  const [volume, setVolume] = useState(() => loadVolume(VOLUME_KEY, 0.6));
  const [soundError, setSoundError] = useState('');
  const [ambianceError, setAmbianceError] = useState('');
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const [focusPickerOpen, setFocusPickerOpen] = useState(false);

  const savedLocationList = Object.entries(savedLocations || {});
  const savedFocusList = Object.entries(savedFocuses || {});
  const savedMusicList = Object.entries(savedMusic || {});
  // Images the players uploaded on their own character sheets, offered to the
  // GM as a virtual "Oyuncular" folder — nothing is copied into the library.
  const playerGroups = playerImageGroups(players);

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
      loadedMusicUrlRef.current = '';
      setSoundError('');
      return;
    }

    // Track the loaded URL ourselves rather than comparing against audio.src:
    // the DOM normalises that value, so a mismatch could re-assign the very
    // same track and snap playback back to zero.
    if (loadedMusicUrlRef.current !== scene.musicUrl) {
      loadedMusicUrlRef.current = scene.musicUrl;
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

  // Changing the scene must leave the music alone — these used to also write
  // `playing: true`, which resumed/restarted the track on every scene change.
  function selectLocation(entry) {
    update(ref(db, `rooms/${roomCode}/scene`), {
      locationImageUrl: entry.imageUrl,
      caption: entryCaption(entry),
      updatedAt: Date.now(),
    });
    setLocationPickerOpen(false);
  }

  function selectFocus(entry) {
    update(ref(db, `rooms/${roomCode}/scene`), {
      focusImageUrl: entry.imageUrl,
      focusCaption: entryCaption(entry),
      updatedAt: Date.now(),
    });
    setFocusPickerOpen(false);
  }

  function selectPlayerImage(group, image) {
    update(ref(db, `rooms/${roomCode}/scene`), {
      focusImageUrl: image.url,
      focusCaption: playerImageCaption(group.playerName),
      updatedAt: Date.now(),
    });
    setFocusPickerOpen(false);
  }

  // Picking a different track is the one place music restarts from the top.
  function selectMusic(e) {
    const entry = savedMusicList.find(([id]) => id === e.target.value);
    if (entry) {
      update(ref(db, `rooms/${roomCode}/scene`), {
        musicUrl: entry[1].url,
        playing: true,
        restartAt: Date.now(),
      });
    }
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
                groupByFolder(savedLocationList).map(([folderName, entries]) => (
                  <div key={folderName} className="scene-picker-group">
                    <span className="scene-picker-folder">📁 {folderName}</span>
                    {entries.map(([id, l]) => (
                      <button
                        key={id}
                        type="button"
                        className={`btn-ghost small${scene.locationImageUrl === l.imageUrl ? ' active' : ''}`}
                        onClick={() => selectLocation(l)}
                      >
                        {entryLabel(l)}
                      </button>
                    ))}
                  </div>
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
              {savedFocusList.length === 0 && playerGroups.length === 0 ? (
                <p className="muted small-hint">Henüz kayıtlı odak yok — GM panelinden ekle.</p>
              ) : (
                <>
                  {groupByFolder(savedFocusList).map(([folderName, entries]) => (
                    <div key={folderName} className="scene-picker-group">
                      <span className="scene-picker-folder">📁 {folderName}</span>
                      {entries.map(([id, f]) => (
                        <button
                          key={id}
                          type="button"
                          className={`btn-ghost small${scene.focusImageUrl === f.imageUrl ? ' active' : ''}`}
                          onClick={() => selectFocus(f)}
                        >
                          {entryLabel(f)}
                        </button>
                      ))}
                    </div>
                  ))}
                  {playerGroups.length > 0 && (
                    <div className="scene-picker-group">
                      <span className="scene-picker-folder">👥 Oyuncular</span>
                      {playerGroups.map((group) => (
                        <div key={group.playerId} className="scene-picker-subgroup">
                          <span className="scene-picker-subfolder">📁 {group.playerName}</span>
                          {group.images.map((image) => (
                            <button
                              key={image.id}
                              type="button"
                              className={`btn-ghost small${scene.focusImageUrl === image.url ? ' active' : ''}`}
                              onClick={() => selectPlayerImage(group, image)}
                            >
                              {image.name}
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {(scene.musicUrl || scene.ambianceUrl || (isGM && savedMusicList.length > 0)) && (
        <div className="scene-toolbar">
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
                        {groupByFolder(savedMusicList).map(([folderName, entries]) => (
                          <optgroup key={folderName} label={folderName}>
                            {entries.map(([id, m]) => (
                              <option key={id} value={id}>
                                {entryLabel(m)}
                              </option>
                            ))}
                          </optgroup>
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
