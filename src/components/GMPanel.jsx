import { useEffect, useRef, useState } from 'react';
import { ref, update, push, remove } from 'firebase/database';
import { db } from '../firebase.js';
import RulesEditor from './RulesEditor.jsx';

export default function GMPanel({
  roomCode,
  scene,
  players,
  settings,
  gameConfig,
  onDeleteRoom,
  isOwner,
}) {
  const [showRulesEditor, setShowRulesEditor] = useState(false);
  const [locationImageUrl, setLocationImageUrl] = useState('');
  const [focusImageUrl, setFocusImageUrl] = useState('');
  const [mapImageUrl, setMapImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [focusCaption, setFocusCaption] = useState('');
  const [musicUrl, setMusicUrl] = useState('');
  const synced = useRef(false);

  const [whisperTarget, setWhisperTarget] = useState('');
  const [whisperText, setWhisperText] = useState('');

  const [bannerDraft, setBannerDraft] = useState('');
  const bannerSynced = useRef(false);

  const [saveSceneName, setSaveSceneName] = useState('');

  useEffect(() => {
    if (!synced.current && scene) {
      setLocationImageUrl(scene.locationImageUrl || '');
      setFocusImageUrl(scene.focusImageUrl || '');
      setMapImageUrl(scene.mapImageUrl || '');
      setCaption(scene.caption || '');
      setFocusCaption(scene.focusCaption || '');
      setMusicUrl(scene.musicUrl || '');
      synced.current = true;
    }
  }, [scene]);

  useEffect(() => {
    if (!bannerSynced.current && settings) {
      setBannerDraft(settings.bannerUrl || '');
      bannerSynced.current = true;
    }
  }, [settings]);

  function commitBanner() {
    update(ref(db, `rooms/${roomCode}/settings`), { bannerUrl: bannerDraft.trim() });
  }

  function toggleLock() {
    update(ref(db, `rooms/${roomCode}/settings`), { locked: !settings?.locked });
  }

  function startOrResetSession() {
    if (settings?.sessionStartedAt && !window.confirm('Oturum zamanlayıcısını sıfırlamak istediğine emin misin?')) {
      return;
    }
    update(ref(db, `rooms/${roomCode}/settings`), { sessionStartedAt: Date.now() });
  }

  function publishSceneData(data) {
    const payload = { ...data, playing: true, updatedAt: Date.now() };
    if ('mapImageUrl' in data && data.mapImageUrl !== (scene?.mapImageUrl || '')) {
      payload.mapPins = null;
    }
    update(ref(db, `rooms/${roomCode}/scene`), payload);
  }

  function publishScene(e) {
    e.preventDefault();
    publishSceneData({
      locationImageUrl: locationImageUrl.trim(),
      focusImageUrl: focusImageUrl.trim(),
      mapImageUrl: mapImageUrl.trim(),
      caption: caption.trim(),
      focusCaption: focusCaption.trim(),
      musicUrl: musicUrl.trim(),
    });
  }

  function applySavedScene(s) {
    setLocationImageUrl(s.locationImageUrl || '');
    setFocusImageUrl(s.focusImageUrl || '');
    setMapImageUrl(s.mapImageUrl || '');
    setCaption(s.caption || '');
    setFocusCaption(s.focusCaption || '');
    setMusicUrl(s.musicUrl || '');
    publishSceneData({
      locationImageUrl: s.locationImageUrl || '',
      focusImageUrl: s.focusImageUrl || '',
      mapImageUrl: s.mapImageUrl || '',
      caption: s.caption || '',
      focusCaption: s.focusCaption || '',
      musicUrl: s.musicUrl || '',
    });
  }

  function saveCurrentScene() {
    if (!saveSceneName.trim()) return;
    push(ref(db, `rooms/${roomCode}/settings/savedScenes`), {
      name: saveSceneName.trim(),
      locationImageUrl: locationImageUrl.trim(),
      focusImageUrl: focusImageUrl.trim(),
      mapImageUrl: mapImageUrl.trim(),
      caption: caption.trim(),
      focusCaption: focusCaption.trim(),
      musicUrl: musicUrl.trim(),
    });
    setSaveSceneName('');
  }

  function removeSavedScene(id) {
    remove(ref(db, `rooms/${roomCode}/settings/savedScenes/${id}`));
  }

  function sendWhisper(e) {
    e.preventDefault();
    if (!whisperTarget || !whisperText.trim()) return;
    const text = whisperText.trim();
    const at = Date.now();
    if (whisperTarget === '__all__') {
      playerList.forEach(([id]) => {
        push(ref(db, `rooms/${roomCode}/players/${id}/whispers`), { text, at });
      });
    } else {
      push(ref(db, `rooms/${roomCode}/players/${whisperTarget}/whispers`), { text, at });
    }
    setWhisperText('');
  }

  const playerList = Object.entries(players || {}).filter(([, p]) => p.role !== 'gm');
  const savedScenes = Object.entries(settings?.savedScenes || {});

  const initiative = settings?.initiative || { queue: [], currentIndex: 0, previousPlayerId: null };
  const queue = initiative.queue || [];
  const notInQueue = playerList.filter(([id]) => !queue.includes(id));

  function addToQueue(id) {
    if (!id || queue.includes(id)) return;
    update(ref(db, `rooms/${roomCode}/settings/initiative`), { queue: [...queue, id] });
  }

  function removeFromQueue(id) {
    const idx = queue.indexOf(id);
    if (idx === -1) return;
    const newQueue = queue.filter((qid) => qid !== id);
    let newIndex = initiative.currentIndex;
    if (idx < newIndex) newIndex -= 1;
    if (newIndex >= newQueue.length) newIndex = Math.max(0, newQueue.length - 1);
    update(ref(db, `rooms/${roomCode}/settings/initiative`), { queue: newQueue, currentIndex: newIndex });
  }

  function moveInQueue(id, direction) {
    const idx = queue.indexOf(id);
    const swapIdx = idx + direction;
    if (idx === -1 || swapIdx < 0 || swapIdx >= queue.length) return;
    const newQueue = [...queue];
    [newQueue[idx], newQueue[swapIdx]] = [newQueue[swapIdx], newQueue[idx]];
    const currentId = queue[initiative.currentIndex];
    const newIndex = newQueue.indexOf(currentId);
    update(ref(db, `rooms/${roomCode}/settings/initiative`), { queue: newQueue, currentIndex: newIndex });
  }

  function advanceTurn(direction) {
    if (queue.length === 0) return;
    const prevId = queue[initiative.currentIndex] ?? null;
    const newIndex = (initiative.currentIndex + direction + queue.length) % queue.length;
    update(ref(db, `rooms/${roomCode}/settings/initiative`), {
      currentIndex: newIndex,
      previousPlayerId: prevId,
      at: Date.now(),
    });
  }

  function clearQueue() {
    update(ref(db, `rooms/${roomCode}/settings/initiative`), {
      queue: [],
      currentIndex: 0,
      previousPlayerId: null,
      at: Date.now(),
    });
  }

  return (
    <div className="panel">
      <h2 className="title-font">GM Kontrol Paneli</h2>

      <button
        type="button"
        className="btn-ghost sound-toggle"
        style={{ marginBottom: 18 }}
        onClick={() => setShowRulesEditor(true)}
      >
        ⚙️ Kuralları Düzenle
      </button>

      {showRulesEditor && (
        <RulesEditor
          roomCode={roomCode}
          gameConfig={gameConfig}
          onClose={() => setShowRulesEditor(false)}
        />
      )}

      <div className="gm-section" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
        <h3 className="title-font gm-section-title">Oda Yönetimi</h3>
        <div className="room-manage-buttons">
          <button type="button" className="btn-ghost sound-toggle" onClick={toggleLock}>
            {settings?.locked ? '🔓 Kilidi Aç' : '🔒 Odayı Kilitle'}
          </button>
          <button type="button" className="btn-ghost sound-toggle" onClick={startOrResetSession}>
            {settings?.sessionStartedAt ? '🔄 Zamanlayıcıyı Sıfırla' : '▶️ Oturumu Başlat'}
          </button>
          {isOwner && (
            <button type="button" className="btn-ghost small danger" onClick={onDeleteRoom}>
              🗑️ Odayı Sil
            </button>
          )}
        </div>
        {!isOwner && (
          <p className="muted">
            Bu odayı sadece kuran kişi (oda sahibi) silebilir.
          </p>
        )}
        {settings?.locked && (
          <p className="muted">Oda kilitli — yeni oyuncular katılamaz, mevcut oyuncular girebilir.</p>
        )}
      </div>

      <div className="banner-field">
        <label>
          Üst Menü Afişi (URL)
          <input
            value={bannerDraft}
            onChange={(e) => setBannerDraft(e.target.value)}
            onBlur={commitBanner}
            placeholder="https://..."
          />
        </label>
      </div>

      {savedScenes.length > 0 && (
        <div className="gm-section" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
          <h3 className="title-font gm-section-title">Kayıtlı Sahneler</h3>
          <div className="sfx-library">
            {savedScenes.map(([id, s]) => (
              <div key={id} className="saved-scene-item">
                <button type="button" className="btn-dice" onClick={() => applySavedScene(s)}>
                  🎬 {s.name}
                </button>
                <button
                  type="button"
                  className="btn-ghost small"
                  onClick={() => removeSavedScene(id)}
                >
                  Sil
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={publishScene} className="scene-form">
        <label>
          Mekan Görseli (URL, 16:9)
          <input
            value={locationImageUrl}
            onChange={(e) => setLocationImageUrl(e.target.value)}
            placeholder="https://..."
          />
        </label>
        <label>
          Sahne Adı
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Sahnenin açıklaması"
          />
        </label>
        <label>
          Odak Görseli — Konuşan Karakter / Eşya (URL, 16:9)
          <input
            value={focusImageUrl}
            onChange={(e) => setFocusImageUrl(e.target.value)}
            placeholder="https://..."
          />
        </label>
        <label>
          Karakter / Eşya Adı
          <input
            value={focusCaption}
            onChange={(e) => setFocusCaption(e.target.value)}
            placeholder="Örn. Yaşlı Rahip"
          />
        </label>
        <label>
          Harita Görseli (URL)
          <input
            value={mapImageUrl}
            onChange={(e) => setMapImageUrl(e.target.value)}
            placeholder="https://..."
          />
        </label>
        <label>
          Müzik (mp3 URL)
          <input
            value={musicUrl}
            onChange={(e) => setMusicUrl(e.target.value)}
            placeholder="https://.../muzik.mp3"
          />
        </label>
        <button type="submit" className="btn-primary">
          Sahneyi Yayınla
        </button>
      </form>

      <div className="inline-form save-scene-form">
        <input
          value={saveSceneName}
          onChange={(e) => setSaveSceneName(e.target.value)}
          placeholder="Bu sahneyi hangi isimle kaydedeyim?"
        />
        <button type="button" className="btn-primary small" onClick={saveCurrentScene}>
          💾 Sahne Olarak Kaydet
        </button>
      </div>

      <div className="gm-section">
        <h3 className="title-font gm-section-title">İnisiyatif Sırası</h3>
        {queue.length === 0 ? (
          <p className="muted">Kuyruk boş — aşağıdan oyuncu ekle.</p>
        ) : (
          <ul className="initiative-queue-list">
            {queue.map((id, idx) => (
              <li
                key={id}
                className={`initiative-queue-item${idx === initiative.currentIndex ? ' current' : ''}`}
              >
                <span className="initiative-queue-index">{idx + 1}</span>
                <span className="initiative-queue-name">{players?.[id]?.name || '?'}</span>
                <div className="initiative-queue-actions">
                  <button type="button" className="btn-ghost small" onClick={() => moveInQueue(id, -1)} disabled={idx === 0}>
                    ▲
                  </button>
                  <button
                    type="button"
                    className="btn-ghost small"
                    onClick={() => moveInQueue(id, 1)}
                    disabled={idx === queue.length - 1}
                  >
                    ▼
                  </button>
                  <button type="button" className="btn-ghost small danger" onClick={() => removeFromQueue(id)}>
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {notInQueue.length > 0 && (
          <div className="inline-form">
            <select value="" onChange={(e) => addToQueue(e.target.value)}>
              <option value="">Kuyruğa oyuncu ekle...</option>
              {notInQueue.map(([id, p]) => (
                <option key={id} value={id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {queue.length > 0 && (
          <div className="initiative-controls">
            <button type="button" className="btn-ghost small" onClick={() => advanceTurn(-1)}>
              ⏮ Önceki
            </button>
            <button type="button" className="btn-primary small" onClick={() => advanceTurn(1)}>
              ⏭ Sonraki
            </button>
            <button type="button" className="btn-ghost small danger" onClick={clearQueue}>
              🗑 Temizle
            </button>
          </div>
        )}
      </div>

      <div className="gm-section">
        <h3 className="title-font gm-section-title">Gizli Fısıltı</h3>
        <form onSubmit={sendWhisper} className="whisper-form">
          <select value={whisperTarget} onChange={(e) => setWhisperTarget(e.target.value)}>
            <option value="">Oyuncu seç...</option>
            <option value="__all__">📢 Herkese</option>
            {playerList.map(([id, p]) => (
              <option key={id} value={id}>
                {p.name}
              </option>
            ))}
          </select>
          <textarea
            value={whisperText}
            onChange={(e) => setWhisperText(e.target.value)}
            rows={2}
            placeholder="Sadece bu oyuncunun göreceği metin..."
          />
          <button type="submit" className="btn-primary small">
            Gönder
          </button>
        </form>
      </div>
    </div>
  );
}
