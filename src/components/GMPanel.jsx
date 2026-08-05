import { useEffect, useRef, useState } from 'react';
import { ref, update, push, remove } from 'firebase/database';
import { db } from '../firebase.js';
import RulesEditor from './RulesEditor.jsx';
import FileUploadButton from './FileUploadButton.jsx';
import HandoutLibrary from './HandoutLibrary.jsx';
import FocusHpInput from './FocusHpInput.jsx';
import LibraryFilter from './LibraryFilter.jsx';
import { publishMapEntry } from '../utils/mapPublish.js';
import { resolveQueueEntity as resolveEntityShared } from '../utils/initiativeEntity.js';
import { playerImageGroups, playerImageCaption } from '../utils/portraits.js';
import {
  entryLabel,
  entryCaption,
  groupByFolder,
  folderNames,
  filterEntries,
} from '../utils/library.js';

const GM_TABS = [
  { id: 'oda', label: '🏠 Oda' },
  { id: 'kutuphane', label: '📚 Kütüphaneler' },
  { id: 'insiyatif', label: '⚔️ İnisiyatif' },
  { id: 'araclar', label: '🔧 Araçlar' },
];
const TAB_KEY = 'rolltable_gm_tab';

export default function GMPanel({
  roomCode,
  playerId,
  name,
  scene,
  players,
  settings,
  gameConfig,
  handoutSends,
  onDeleteRoom,
  isOwner,
}) {
  const [showRulesEditor, setShowRulesEditor] = useState(false);
  // Which section of the panel is showing; remembered between sessions.
  const [tab, setTab] = useState(() => {
    const saved = localStorage.getItem(TAB_KEY);
    return GM_TABS.some((t) => t.id === saved) ? saved : 'oda';
  });

  function selectTab(id) {
    setTab(id);
    localStorage.setItem(TAB_KEY, id);
  }

  // One search box per library, shown once the list gets long.
  const [queries, setQueries] = useState({});
  const [mapDraftUrl, setMapDraftUrl] = useState('');
  const [mapDraftLabel, setMapDraftLabel] = useState('');
  const [mapDraftFolder, setMapDraftFolder] = useState('');

  const [locationDraftUrl, setLocationDraftUrl] = useState('');
  const [locationDraftLabel, setLocationDraftLabel] = useState('');
  const [locationDraftCaption, setLocationDraftCaption] = useState('');
  const [locationDraftFolder, setLocationDraftFolder] = useState('');
  const [focusDraftUrl, setFocusDraftUrl] = useState('');
  const [focusDraftLabel, setFocusDraftLabel] = useState('');
  const [focusDraftCaption, setFocusDraftCaption] = useState('');
  const [focusDraftFolder, setFocusDraftFolder] = useState('');
  const [focusDraftCategory, setFocusDraftCategory] = useState('karakter');
  const [focusDraftHp, setFocusDraftHp] = useState('');
  const [musicDraftUrl, setMusicDraftUrl] = useState('');
  const [musicDraftName, setMusicDraftName] = useState('');
  const [musicDraftFolder, setMusicDraftFolder] = useState('');
  const [selectedMusicId, setSelectedMusicId] = useState('');

  const [whisperTarget, setWhisperTarget] = useState('');
  const [whisperText, setWhisperText] = useState('');

  const [bannerDraft, setBannerDraft] = useState('');
  const bannerSynced = useRef(false);

  const [passwordDraft, setPasswordDraft] = useState('');
  const passwordSynced = useRef(false);

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

  function saveMap() {
    if (!mapDraftUrl.trim() || !mapDraftLabel.trim()) return;
    push(ref(db, `rooms/${roomCode}/settings/savedMaps`), {
      label: mapDraftLabel.trim(),
      folder: mapDraftFolder.trim(),
      imageUrl: mapDraftUrl.trim(),
    });
    setMapDraftUrl('');
    setMapDraftLabel('');
  }

  function publishMap(entry) {
    publishMapEntry(roomCode, entry, scene?.mapImageUrl);
  }

  function removeMap(id) {
    remove(ref(db, `rooms/${roomCode}/settings/savedMaps/${id}`));
  }

  function clearMap() {
    update(ref(db, `rooms/${roomCode}/scene`), {
      mapImageUrl: '',
      mapPins: null,
      mapTokens: null,
      updatedAt: Date.now(),
    });
  }

  function saveLocation() {
    if (!locationDraftUrl.trim() || !locationDraftLabel.trim()) return;
    push(ref(db, `rooms/${roomCode}/settings/savedLocations`), {
      label: locationDraftLabel.trim(),
      caption: locationDraftCaption.trim(),
      folder: locationDraftFolder.trim(),
      imageUrl: locationDraftUrl.trim(),
    });
    setLocationDraftUrl('');
    setLocationDraftLabel('');
    setLocationDraftCaption('');
  }

  // Publishing a scene must not touch the music — it used to also write
  // `playing: true`, which restarted/resumed the track on every scene change.
  function publishLocation(entry) {
    update(ref(db, `rooms/${roomCode}/scene`), {
      locationImageUrl: entry.imageUrl,
      caption: entryCaption(entry),
      updatedAt: Date.now(),
    });
  }

  function removeLocation(id) {
    remove(ref(db, `rooms/${roomCode}/settings/savedLocations/${id}`));
  }

  function saveFocus() {
    if (!focusDraftUrl.trim() || !focusDraftLabel.trim()) return;
    push(ref(db, `rooms/${roomCode}/settings/savedFocuses`), {
      label: focusDraftLabel.trim(),
      caption: focusDraftCaption.trim(),
      folder: focusDraftFolder.trim(),
      imageUrl: focusDraftUrl.trim(),
      category: focusDraftCategory,
      // Only characters/NPCs fight, so only they carry health.
      maxHp:
        focusDraftCategory === 'karakter' && parseInt(focusDraftHp, 10) > 0
          ? parseInt(focusDraftHp, 10)
          : null,
    });
    setFocusDraftUrl('');
    setFocusDraftLabel('');
    setFocusDraftCaption('');
    setFocusDraftHp('');
  }

  function publishFocus(entry) {
    update(ref(db, `rooms/${roomCode}/scene`), {
      focusImageUrl: entry.imageUrl,
      focusCaption: entryCaption(entry),
      updatedAt: Date.now(),
    });
  }

  // Player-uploaded images aren't library entries — they live on the character
  // sheet and are only borrowed for the scene.
  function publishPlayerImage(group, image) {
    update(ref(db, `rooms/${roomCode}/scene`), {
      focusImageUrl: image.url,
      focusCaption: playerImageCaption(group.playerName),
      updatedAt: Date.now(),
    });
  }

  function removeFocus(id) {
    remove(ref(db, `rooms/${roomCode}/settings/savedFocuses/${id}`));
  }

  function saveMusic() {
    if (!musicDraftUrl.trim() || !musicDraftName.trim()) return;
    push(ref(db, `rooms/${roomCode}/settings/savedMusic`), {
      label: musicDraftName.trim(),
      folder: musicDraftFolder.trim(),
      url: musicDraftUrl.trim(),
    });
    setMusicDraftUrl('');
    setMusicDraftName('');
  }

  // Picking a different track is the one place music restarts from the top.
  function selectMusic(id, entry) {
    setSelectedMusicId(id);
    if (entry) {
      update(ref(db, `rooms/${roomCode}/scene`), {
        musicUrl: entry.url,
        playing: true,
        restartAt: Date.now(),
      });
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
  const savedMaps = Object.entries(settings?.savedMaps || {});

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

      <div className="gm-tabs" role="tablist">
        {GM_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`gm-tab${tab === t.id ? ' active' : ''}`}
            onClick={() => selectTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'oda' && <div className="gm-tab-body">
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

      </div>}

      {tab === 'kutuphane' && <div className="gm-tab-body">
      <div className="gm-section" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
        <h3 className="title-font gm-section-title">Mekan Kütüphanesi</h3>
        <p className="muted small-hint">
          Kütüphane adı sadece sana görünür (kolay bulman için); sahnede yazacak metni ayrı
          girersin. Klasör vererek kütüphaneyi gruplayabilirsin.
        </p>
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
            value={locationDraftLabel}
            onChange={(e) => setLocationDraftLabel(e.target.value)}
            placeholder="Kütüphane adı (sadece sen görürsün)"
          />
          <input
            value={locationDraftCaption}
            onChange={(e) => setLocationDraftCaption(e.target.value)}
            placeholder="Sahnede yazacak metin"
          />
          <input
            value={locationDraftFolder}
            onChange={(e) => setLocationDraftFolder(e.target.value)}
            placeholder="Klasör (opsiyonel)"
            list="location-folders"
          />
          <datalist id="location-folders">
            {folderNames(savedLocations).map((f) => (
              <option key={f} value={f} />
            ))}
          </datalist>
          <button type="button" className="btn-primary small" onClick={saveLocation}>
            💾 Kaydet
          </button>
        </div>
        <LibraryFilter
          value={queries.location || ''}
          onChange={(v) => setQueries((q) => ({ ...q, location: v }))}
          count={savedLocations.length}
          placeholder="Mekan ara..."
        />
        {savedLocations.length > 0 &&
          groupByFolder(filterEntries(savedLocations, queries.location)).map(([folderName, entries]) => (
            <details key={folderName} className="library-folder" open>
              <summary>
                📁 {folderName} <span className="muted">({entries.length})</span>
              </summary>
              <div className="sfx-library">
                {entries.map(([id, l]) => (
                  <div key={id} className="saved-scene-item">
                    <button
                      type="button"
                      className={`btn-dice${scene?.locationImageUrl === l.imageUrl ? ' active' : ''}`}
                      onClick={() => publishLocation(l)}
                      title={entryCaption(l) ? `Sahnede: ${entryCaption(l)}` : 'Sahnede metin yok'}
                    >
                      🖼️ {entryLabel(l)}
                    </button>
                    <button type="button" className="btn-ghost small" onClick={() => removeLocation(id)}>
                      Sil
                    </button>
                  </div>
                ))}
              </div>
            </details>
          ))}
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
            value={focusDraftLabel}
            onChange={(e) => setFocusDraftLabel(e.target.value)}
            placeholder="Kütüphane adı (sadece sen görürsün)"
          />
          <input
            value={focusDraftCaption}
            onChange={(e) => setFocusDraftCaption(e.target.value)}
            placeholder="Sahnede yazacak metin"
          />
          <input
            value={focusDraftFolder}
            onChange={(e) => setFocusDraftFolder(e.target.value)}
            placeholder="Klasör (opsiyonel)"
            list="focus-folders"
          />
          <datalist id="focus-folders">
            {folderNames(savedFocuses).map((f) => (
              <option key={f} value={f} />
            ))}
          </datalist>
          <select value={focusDraftCategory} onChange={(e) => setFocusDraftCategory(e.target.value)}>
            <option value="karakter">🎭 Karakter / NPC</option>
            <option value="obje">📦 Obje / Eşya</option>
          </select>
          {focusDraftCategory === 'karakter' && (
            <input
              type="number"
              min="0"
              value={focusDraftHp}
              onChange={(e) => setFocusDraftHp(e.target.value)}
              placeholder="Can (opsiyonel)"
              title="Haritada bu NPC'nin can barı bu değerle başlar"
            />
          )}
          <button type="button" className="btn-primary small" onClick={saveFocus}>
            💾 Kaydet
          </button>
        </div>
        {playerImageGroups(players).map((group) => (
          <details key={group.playerId} className="library-folder">
            <summary>
              👤 Oyuncular › {group.playerName} <span className="muted">({group.images.length})</span>
            </summary>
            <div className="sfx-library">
              {group.images.map((image) => (
                <div key={image.id} className="saved-scene-item">
                  <button
                    type="button"
                    className={`btn-dice${scene?.focusImageUrl === image.url ? ' active' : ''}`}
                    onClick={() => publishPlayerImage(group, image)}
                    title={`Sahnede: ${playerImageCaption(group.playerName)}`}
                  >
                    🖼️ {image.name}
                  </button>
                </div>
              ))}
            </div>
          </details>
        ))}
        <LibraryFilter
          value={queries.focus || ''}
          onChange={(v) => setQueries((q) => ({ ...q, focus: v }))}
          count={savedFocuses.length}
          placeholder="Odak ara..."
        />
        {savedFocuses.length > 0 &&
          groupByFolder(filterEntries(savedFocuses, queries.focus)).map(([folderName, entries]) => (
            <details key={folderName} className="library-folder" open>
              <summary>
                📁 {folderName} <span className="muted">({entries.length})</span>
              </summary>
              <div className="sfx-library">
                {entries.map(([id, f]) => (
                  <div key={id} className="saved-scene-item">
                    <button
                      type="button"
                      className={`btn-dice${scene?.focusImageUrl === f.imageUrl ? ' active' : ''}`}
                      onClick={() => publishFocus(f)}
                      title={entryCaption(f) ? `Sahnede: ${entryCaption(f)}` : 'Sahnede metin yok'}
                    >
                      {(f.category || 'karakter') === 'karakter' ? '🎭' : '📦'} {entryLabel(f)}
                    </button>
                    {(f.category || 'karakter') === 'karakter' && (
                      <FocusHpInput roomCode={roomCode} focusId={id} value={f.maxHp} />
                    )}
                    <button type="button" className="btn-ghost small" onClick={() => removeFocus(id)}>
                      Sil
                    </button>
                  </div>
                ))}
              </div>
            </details>
          ))}
      </div>

      <HandoutLibrary
        roomCode={roomCode}
        handouts={settings?.handouts}
        sends={handoutSends}
        players={players}
        gmName={name}
      />

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
          <input
            value={musicDraftFolder}
            onChange={(e) => setMusicDraftFolder(e.target.value)}
            placeholder="Klasör (opsiyonel)"
            list="music-folders"
          />
          <datalist id="music-folders">
            {folderNames(savedMusicList).map((f) => (
              <option key={f} value={f} />
            ))}
          </datalist>
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
            {selectedMusicId && (
              <button type="button" className="btn-ghost small danger" onClick={() => removeMusic(selectedMusicId)}>
                Sil
              </button>
            )}
          </div>
        )}
      </div>

      <div className="gm-section">
        <h3 className="title-font gm-section-title">Harita Kütüphanesi</h3>
        <p className="muted small-hint">
          İstediğin kadar harita kaydedip listeden tıklayarak canlı haritayı değiştirebilirsin.
          Farklı bir harita yayınlandığında o haritaya ait pinler ve token'lar temizlenir.
        </p>
        <div className="inline-form">
          <input
            value={mapDraftUrl}
            onChange={(e) => setMapDraftUrl(e.target.value)}
            placeholder="Harita görseli URL"
          />
          <FileUploadButton
            roomCode={roomCode}
            folder="map"
            accept="image/*"
            onUploaded={setMapDraftUrl}
          />
          <input
            value={mapDraftLabel}
            onChange={(e) => setMapDraftLabel(e.target.value)}
            placeholder="Harita adı"
          />
          <input
            value={mapDraftFolder}
            onChange={(e) => setMapDraftFolder(e.target.value)}
            placeholder="Klasör (opsiyonel)"
            list="map-folders"
          />
          <datalist id="map-folders">
            {folderNames(savedMaps).map((f) => (
              <option key={f} value={f} />
            ))}
          </datalist>
          <button type="button" className="btn-primary small" onClick={saveMap}>
            💾 Kaydet
          </button>
        </div>
        <LibraryFilter
          value={queries.map || ''}
          onChange={(v) => setQueries((q) => ({ ...q, map: v }))}
          count={savedMaps.length}
          placeholder="Harita ara..."
        />
        {savedMaps.length > 0 &&
          groupByFolder(filterEntries(savedMaps, queries.map)).map(([folderName, entries]) => (
            <details key={folderName} className="library-folder" open>
              <summary>
                📁 {folderName} <span className="muted">({entries.length})</span>
              </summary>
              <div className="sfx-library">
                {entries.map(([id, m]) => (
                  <div key={id} className="saved-scene-item">
                    <button
                      type="button"
                      className={`btn-dice${scene?.mapImageUrl === m.imageUrl ? ' active' : ''}`}
                      onClick={() => publishMap(m)}
                    >
                      🗺️ {entryLabel(m)}
                    </button>
                    <button type="button" className="btn-ghost small" onClick={() => removeMap(id)}>
                      Sil
                    </button>
                  </div>
                ))}
              </div>
            </details>
          ))}
        {scene?.mapImageUrl && (
          <button type="button" className="btn-ghost small danger" onClick={clearMap}>
            🚫 Haritayı Kaldır
          </button>
        )}
      </div>

      </div>}

      {tab === 'insiyatif' && <div className="gm-tab-body">
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

      </div>}

      {tab === 'araclar' && <div className="gm-tab-body">
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
      </div>}

    </div>
  );
}
