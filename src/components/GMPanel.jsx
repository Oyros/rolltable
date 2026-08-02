import { useEffect, useRef, useState } from 'react';
import { ref, update, push, remove } from 'firebase/database';
import { db } from '../firebase.js';
import RulesEditor from './RulesEditor.jsx';
import FileUploadButton from './FileUploadButton.jsx';
import { resolveQueueEntity as resolveEntityShared } from '../utils/initiativeEntity.js';

export default function GMPanel({
  roomCode,
  playerId,
  name,
  scene,
  players,
  settings,
  gameConfig,
  onDeleteRoom,
  isOwner,
}) {
  const [showRulesEditor, setShowRulesEditor] = useState(false);
  const [mapImageUrl, setMapImageUrl] = useState('');
  const mapSynced = useRef(false);

  const [locationDraftUrl, setLocationDraftUrl] = useState('');
  const [locationDraftName, setLocationDraftName] = useState('');
  const [focusDraftUrl, setFocusDraftUrl] = useState('');
  const [focusDraftName, setFocusDraftName] = useState('');
  const [focusDraftCategory, setFocusDraftCategory] = useState('karakter');
  const [musicDraftUrl, setMusicDraftUrl] = useState('');
  const [musicDraftName, setMusicDraftName] = useState('');
  const [selectedMusicId, setSelectedMusicId] = useState('');

  const [whisperTarget, setWhisperTarget] = useState('');
  const [whisperText, setWhisperText] = useState('');

  const [bannerDraft, setBannerDraft] = useState('');
  const bannerSynced = useRef(false);

  const [passwordDraft, setPasswordDraft] = useState('');
  const passwordSynced = useRef(false);

  useEffect(() => {
    if (!mapSynced.current && scene) {
      setMapImageUrl(scene.mapImageUrl || '');
      mapSynced.current = true;
    }
  }, [scene]);

  useEffect(() => {
    if (!bannerSynced.current && settings) {
      setBannerDraft(settings.bannerUrl || '');
      bannerSynced.current = true;
    }
  }, [settings]);

  useEffect(() => {
    if (!passwordSynced.current && settings) {
      setPasswordDraft(settings.password || '');
      passwordSynced.current = true;
    }
  }, [settings]);

  function commitBanner() {
    update(ref(db, `rooms/${roomCode}/settings`), { bannerUrl: bannerDraft.trim() });
  }

  function commitPassword() {
    update(ref(db, `rooms/${roomCode}/settings`), { password: passwordDraft.trim() });
  }

  function toggleLock() {
    update(ref(db, `rooms/${roomCode}/settings`), { locked: !settings?.locked });
  }

  function startSession() {
    update(ref(db, `rooms/${roomCode}/settings`), { sessionActive: true, sessionStartedAt: Date.now() });
  }

  function endSession() {
    if (!window.confirm('Oturumu sonlandırmak istediğine emin misin? Oda ve verileri silinmez, sen tekrar başlatana kadar kapalı görünür.')) {
      return;
    }
    update(ref(db, `rooms/${roomCode}/settings`), { sessionActive: false });
  }

  function publishMap() {
    const trimmed = mapImageUrl.trim();
    const payload = { mapImageUrl: trimmed, updatedAt: Date.now() };
    if (trimmed !== (scene?.mapImageUrl || '')) {
      payload.mapPins = null;
      payload.mapTokens = null;
    }
    update(ref(db, `rooms/${roomCode}/scene`), payload);
  }

  function saveLocation() {
    if (!locationDraftUrl.trim() || !locationDraftName.trim()) return;
    push(ref(db, `rooms/${roomCode}/settings/savedLocations`), {
      name: locationDraftName.trim(),
      imageUrl: locationDraftUrl.trim(),
    });
    setLocationDraftUrl('');
    setLocationDraftName('');
  }

  function publishLocation(entry) {
    update(ref(db, `rooms/${roomCode}/scene`), {
      locationImageUrl: entry.imageUrl,
      caption: entry.name,
      playing: true,
      updatedAt: Date.now(),
    });
  }

  function removeLocation(id) {
    remove(ref(db, `rooms/${roomCode}/settings/savedLocations/${id}`));
  }

  function saveFocus() {
    if (!focusDraftUrl.trim() || !focusDraftName.trim()) return;
    push(ref(db, `rooms/${roomCode}/settings/savedFocuses`), {
      name: focusDraftName.trim(),
      imageUrl: focusDraftUrl.trim(),
      category: focusDraftCategory,
    });
    setFocusDraftUrl('');
    setFocusDraftName('');
  }

  function publishFocus(entry) {
    update(ref(db, `rooms/${roomCode}/scene`), {
      focusImageUrl: entry.imageUrl,
      focusCaption: entry.name,
      playing: true,
      updatedAt: Date.now(),
    });
  }

  function removeFocus(id) {
    remove(ref(db, `rooms/${roomCode}/settings/savedFocuses/${id}`));
  }

  function saveMusic() {
    if (!musicDraftUrl.trim() || !musicDraftName.trim()) return;
    push(ref(db, `rooms/${roomCode}/settings/savedMusic`), {
      name: musicDraftName.trim(),
      url: musicDraftUrl.trim(),
    });
    setMusicDraftUrl('');
    setMusicDraftName('');
  }

  function selectMusic(id, entry) {
    setSelectedMusicId(id);
    if (entry) {
      update(ref(db, `rooms/${roomCode}/scene`), { musicUrl: entry.url });
    }
  }

  function removeMusic(id) {
    remove(ref(db, `rooms/${roomCode}/settings/savedMusic/${id}`));
    if (selectedMusicId === id) setSelectedMusicId('');
  }

  function sendWhisper(e) {
    e.preventDefault();
    if (!whisperTarget || !whisperText.trim()) return;
    const text = whisperText.trim();
    const at = Date.now();
    const payload = { text, at, by: name, byId: playerId };
    if (whisperTarget === '__all__') {
      playerList.forEach(([id]) => {
        push(ref(db, `rooms/${roomCode}/players/${id}/whispers`), payload);
      });
    } else {
      push(ref(db, `rooms/${roomCode}/players/${whisperTarget}/whispers`), payload);
    }
    setWhisperText('');
  }

  const playerList = Object.entries(players || {}).filter(([, p]) => p.role === 'oyuncu');
  const savedLocations = Object.entries(settings?.savedLocations || {});
  const savedFocuses = Object.entries(settings?.savedFocuses || {});
  const savedMusicList = Object.entries(settings?.savedMusic || {});

  const initiative = settings?.initiative || {};
  const queue = initiative.queue || [];
  const currentIndex = initiative.currentIndex ?? 0;
  const notInQueue = playerList.filter(([id]) => !queue.includes(id));
  const npcFocusList = savedFocuses.filter(([, f]) => (f.category || 'karakter') === 'karakter');
  const notInQueueNpcs = npcFocusList.filter(([id]) => !queue.includes(id));

  function resolveQueueEntity(id) {
    return (
      resolveEntityShared(id, players, settings?.savedFocuses) || {
        name: '?',
        imageUrl: null,
        isNpc: false,
      }
    );
  }

  function addToQueue(id) {
    if (!id || queue.includes(id)) return;
    const wasEmpty = queue.length === 0;
    const newQueue = [...queue, id];
    const payload = { queue: newQueue, currentIndex: wasEmpty ? 0 : currentIndex };
    if (wasEmpty) payload.at = Date.now();
    update(ref(db, `rooms/${roomCode}/settings/initiative`), payload);
  }

  function removeFromQueue(id) {
    const idx = queue.indexOf(id);
    if (idx === -1) return;
    const newQueue = queue.filter((qid) => qid !== id);
    let newIndex = currentIndex;
    if (idx < newIndex) newIndex -= 1;
    if (newIndex >= newQueue.length) newIndex = Math.max(0, newQueue.length - 1);
    update(ref(db, `rooms/${roomCode}/settings/initiative`), { queue: newQueue, currentIndex: newIndex });
    remove(ref(db, `rooms/${roomCode}/scene/mapTokens/${id}`));
  }

  function moveInQueue(id, direction) {
    const idx = queue.indexOf(id);
    const swapIdx = idx + direction;
    if (idx === -1 || swapIdx < 0 || swapIdx >= queue.length) return;
    const newQueue = [...queue];
    [newQueue[idx], newQueue[swapIdx]] = [newQueue[swapIdx], newQueue[idx]];
    const currentId = queue[currentIndex];
    const newIndex = newQueue.indexOf(currentId);
    update(ref(db, `rooms/${roomCode}/settings/initiative`), { queue: newQueue, currentIndex: newIndex });
  }

  function advanceTurn(direction) {
    if (queue.length === 0) return;
    const prevId = queue[currentIndex] ?? null;
    const newIndex = (currentIndex + direction + queue.length) % queue.length;
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
          <button
            type="button"
            className="btn-ghost sound-toggle"
            onClick={settings?.sessionActive ? endSession : startSession}
          >
            {settings?.sessionActive ? '⏹️ Oturumu Sonlandır' : '▶️ Oturumu Başlat'}
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
        <label className="password-field">
          Oda Şifresi (opsiyonel)
          <input
            type="text"
            value={passwordDraft}
            onChange={(e) => setPasswordDraft(e.target.value)}
            onBlur={commitPassword}
            placeholder="Boş bırakırsan şifre istenmez"
          />
        </label>
        {settings?.password && (
          <p className="muted small-hint">
            Yeni oyuncular katılırken bu şifreyi girecek. Sen (GM) her zaman şifresiz girersin.
          </p>
        )}

        <label>
          Karakter Kağıdı Görünürlüğü (statlar, traitler, envanter vb. — diğer oyunculara)
          <select
            value={settings?.sheetVisibilityForce || ''}
            onChange={(e) =>
              update(ref(db, `rooms/${roomCode}/settings`), {
                sheetVisibilityForce: e.target.value,
              })
            }
          >
            <option value="">Oyuncunun kendi seçimine bırak</option>
            <option value="show">Herkese zorla göster</option>
            <option value="hide">Herkesten zorla gizle</option>
          </select>
        </label>
        <p className="muted small-hint">
          Sen (GM) her zaman herkesin karakter kağıdını tam görürsün. Bu ayar sadece
          oyuncuların birbirini görüp göremeyeceğini belirler.
        </p>
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
        <FileUploadButton
          roomCode={roomCode}
          folder="banner"
          accept="image/*"
          onUploaded={(url) => {
            setBannerDraft(url);
            update(ref(db, `rooms/${roomCode}/settings`), { bannerUrl: url });
          }}
        />
      </div>

      <div className="gm-section" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
        <h3 className="title-font gm-section-title">Mekan Kütüphanesi</h3>
        <p className="muted small-hint">Görsel + sahne adını kaydet, sonra listeden tıklayıp canlı sahneye uygula.</p>
        <div className="inline-form">
          <input
            value={locationDraftUrl}
            onChange={(e) => setLocationDraftUrl(e.target.value)}
            placeholder="Mekan görseli URL (16:9)"
          />
          <FileUploadButton
            roomCode={roomCode}
            folder="location"
            accept="image/*"
            onUploaded={setLocationDraftUrl}
          />
          <input
            value={locationDraftName}
            onChange={(e) => setLocationDraftName(e.target.value)}
            placeholder="Sahne adı"
          />
          <button type="button" className="btn-primary small" onClick={saveLocation}>
            💾 Kaydet
          </button>
        </div>
        {savedLocations.length > 0 && (
          <div className="sfx-library">
            {savedLocations.map(([id, l]) => (
              <div key={id} className="saved-scene-item">
                <button
                  type="button"
                  className={`btn-dice${scene?.locationImageUrl === l.imageUrl ? ' active' : ''}`}
                  onClick={() => publishLocation(l)}
                >
                  🖼️ {l.name}
                </button>
                <button type="button" className="btn-ghost small" onClick={() => removeLocation(id)}>
                  Sil
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="gm-section">
        <h3 className="title-font gm-section-title">Odak Kütüphanesi</h3>
        <p className="muted small-hint">
          Konuşan karakter/eşya görseli + adını kaydet, listeden seçince canlı sahneye uygular.
          "Karakter/NPC" olarak kaydettiklerin İnisiyatif Sırası'na düşman olarak eklenebilir.
        </p>
        <div className="inline-form">
          <input
            value={focusDraftUrl}
            onChange={(e) => setFocusDraftUrl(e.target.value)}
            placeholder="Odak görseli URL (16:9)"
          />
          <FileUploadButton
            roomCode={roomCode}
            folder="focus"
            accept="image/*"
            onUploaded={setFocusDraftUrl}
          />
          <input
            value={focusDraftName}
            onChange={(e) => setFocusDraftName(e.target.value)}
            placeholder="Karakter / eşya adı"
          />
          <select value={focusDraftCategory} onChange={(e) => setFocusDraftCategory(e.target.value)}>
            <option value="karakter">🎭 Karakter / NPC</option>
            <option value="obje">📦 Obje / Eşya</option>
          </select>
          <button type="button" className="btn-primary small" onClick={saveFocus}>
            💾 Kaydet
          </button>
        </div>
        {savedFocuses.length > 0 && (
          <div className="sfx-library">
            {savedFocuses.map(([id, f]) => (
              <div key={id} className="saved-scene-item">
                <button
                  type="button"
                  className={`btn-dice${scene?.focusImageUrl === f.imageUrl ? ' active' : ''}`}
                  onClick={() => publishFocus(f)}
                >
                  {(f.category || 'karakter') === 'karakter' ? '🎭' : '📦'} {f.name}
                </button>
                <button type="button" className="btn-ghost small" onClick={() => removeFocus(id)}>
                  Sil
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="gm-section">
        <h3 className="title-font gm-section-title">Müzik Kütüphanesi</h3>
        <p className="muted small-hint">Müzik linki + ismini kaydet, aşağıdaki menüden seçince canlı müzik değişir.</p>
        <div className="inline-form">
          <input
            value={musicDraftUrl}
            onChange={(e) => setMusicDraftUrl(e.target.value)}
            placeholder="Müzik URL (mp3)"
          />
          <FileUploadButton
            roomCode={roomCode}
            folder="music"
            accept="audio/*"
            onUploaded={setMusicDraftUrl}
          />
          <input
            value={musicDraftName}
            onChange={(e) => setMusicDraftName(e.target.value)}
            placeholder="Müzik ismi"
          />
          <button type="button" className="btn-primary small" onClick={saveMusic}>
            💾 Kaydet
          </button>
        </div>
        {savedMusicList.length > 0 && (
          <div className="inline-form">
            <select
              value={selectedMusicId}
              onChange={(e) => {
                const entry = savedMusicList.find(([id]) => id === e.target.value);
                selectMusic(e.target.value, entry?.[1]);
              }}
            >
              <option value="">Müzik seç...</option>
              {savedMusicList.map(([id, m]) => (
                <option key={id} value={id}>
                  {m.name}
                </option>
              ))}
            </select>
            {selectedMusicId && (
              <button type="button" className="btn-ghost small danger" onClick={() => removeMusic(selectedMusicId)}>
                Sil
              </button>
            )}
          </div>
        )}
      </div>

      <div className="gm-section">
        <h3 className="title-font gm-section-title">Harita</h3>
        <div className="inline-form">
          <input
            value={mapImageUrl}
            onChange={(e) => setMapImageUrl(e.target.value)}
            placeholder="Harita görseli URL"
          />
          <FileUploadButton
            roomCode={roomCode}
            folder="map"
            accept="image/*"
            onUploaded={setMapImageUrl}
          />
          <button type="button" className="btn-primary small" onClick={publishMap}>
            Yayınla
          </button>
        </div>
      </div>

      <div className="gm-section">
        <h3 className="title-font gm-section-title">İnisiyatif Sırası</h3>
        {queue.length === 0 ? (
          <p className="muted">Kuyruk boş — aşağıdan oyuncu ekle.</p>
        ) : (
          <ul className="initiative-queue-list">
            {queue.map((id, idx) => {
              const entity = resolveQueueEntity(id);
              return (
              <li
                key={id}
                className={`initiative-queue-item${idx === currentIndex ? ' current' : ''}${entity.isNpc ? ' enemy' : ''}`}
              >
                <span className="initiative-queue-index">{idx + 1}</span>
                {entity.isNpc && <span className="initiative-queue-enemy-tag">⚔️ DÜŞMAN</span>}
                <span className="initiative-queue-name">{entity.name}</span>
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
              );
            })}
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

        {notInQueueNpcs.length > 0 && (
          <div className="inline-form">
            <select value="" onChange={(e) => addToQueue(e.target.value)}>
              <option value="">⚔️ Kuyruğa NPC/düşman ekle...</option>
              {notInQueueNpcs.map(([id, f]) => (
                <option key={id} value={id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        )}
        {npcFocusList.length === 0 && (
          <p className="muted small-hint">
            Kuyruğa düşman eklemek için Odak Kütüphanesi'ne "🎭 Karakter/NPC" olarak bir görsel kaydet.
          </p>
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
