import { useState } from 'react';
import { ref, update, push } from 'firebase/database';
import { db } from '../firebase.js';
import { STATUS_LABEL } from '../utils/stats.js';
import { rollStat as rollStatShared } from '../utils/statRoll.js';
import { rollModeLabel } from '../utils/rollMode.js';
import { newId } from '../utils/id.js';
import { itemName, itemQty, itemLabel, makeItem } from '../utils/inventory.js';
import { portraitUrl, portraitLabel, portraitDisplayName, makePortrait } from '../utils/portraits.js';
import {
  configGroups,
  groupEntries,
  entryAvailableTo,
  selectableEntries,
} from '../utils/traitGroups.js';
import { resolveLevelReward, describeReward } from '../utils/levelRewards.js';
import Portal from './Portal.jsx';
import FileUploadButton from './FileUploadButton.jsx';

// Marks the pre-gallery portraitUrl when it's shown as a thumbnail; it has no
// entry under `portraits`, so it must never be treated as a deletable key.
const LEGACY_PORTRAIT_ID = '__current';

export default function CharacterSheet({
  roomCode,
  playerId,
  player,
  gameConfig,
  settings,
  isGM = false,
  sessionStarted = false,
}) {
  const path = `rooms/${roomCode}/players/${playerId}`;
  const [newItem, setNewItem] = useState('');
  const [newItemQty, setNewItemQty] = useState('');
  const [catalogItemId, setCatalogItemId] = useState('');
  const [catalogQty, setCatalogQty] = useState('');
  const [nameDraft, setNameDraft] = useState(player.name || '');
  const [skillsDraft, setSkillsDraft] = useState(player.skills || '');
  const [portraitDraft, setPortraitDraft] = useState(player.portraitUrl || '');
  const [portraitNameDraft, setPortraitNameDraft] = useState('');
  const [showLevelUp, setShowLevelUp] = useState(false);
  // { statId: pointsAdded } and { groupId: [entryId] } for the current wizard.
  const [levelUpStats, setLevelUpStats] = useState({});
  const [levelUpPicks, setLevelUpPicks] = useState({});

  const stats = gameConfig.stats || [];
  const resources = gameConfig.resources || [];
  const races = gameConfig.races || [];
  const classes = gameConfig.classes || [];
  const subclasses = gameConfig.subclasses || [];
  const items = gameConfig.items || [];
  const groups = configGroups(gameConfig);

  const locked = !!player.sheetLocked;
  const editable = isGM || !locked;
  const level = player.level || 1;
  const xp = player.xp || 0;
  const maxLevel = gameConfig.maxLevel || 10;
  const xpPerLevel = gameConfig.xpPerLevel || 100;
  const statMin = gameConfig.statMin ?? 0;
  const statMax = gameConfig.statMax || 10;
  const qualifiedLevel = Math.min(maxLevel, Math.floor(xp / xpPerLevel) + 1);
  const atMaxLevel = level >= maxLevel;
  const canLevelUp = !atMaxLevel && (isGM || qualifiedLevel > level);
  const xpIntoLevel = xp - (level - 1) * xpPerLevel;
  const xpBarPct = atMaxLevel ? 100 : Math.max(0, Math.min(100, (xpIntoLevel / xpPerLevel) * 100));
  // What reaching the next level hands out, and how much of it is still
  // unspent in the open wizard.
  const nextLevelReward = resolveLevelReward(gameConfig, level + 1);
  const statPointsUsed = Object.values(levelUpStats).reduce((sum, n) => sum + n, 0);
  const statPointsLeft = Math.max(0, nextLevelReward.statPoints - statPointsUsed);
  const rewardGroups = groups
    .map((group) => {
      const allowance = nextLevelReward.picks[group.id] || 0;
      if (allowance === 0) return null;
      const owned = player[group.id] || [];
      const available = groupEntries(gameConfig, group.id).filter(
        (e) => !owned.includes(e.id) && entryAvailableTo(e, player)
      );
      // Can't ask for three picks out of two remaining entries.
      return { group, allowance: Math.min(allowance, available.length), available };
    })
    .filter((r) => r && r.allowance > 0);
  const picksComplete = rewardGroups.every(
    (r) => (levelUpPicks[r.group.id] || []).length === r.allowance
  );
  const levelUpReady = statPointsLeft === 0 && picksComplete;

  const portraits = player.portraits || {};
  // Characters created before the gallery existed have a portraitUrl but no
  // map entry — surface it as a thumbnail too so it isn't stranded.
  const portraitEntries = Object.entries(portraits);
  const gallery =
    player.portraitUrl && !portraitEntries.some(([, e]) => portraitUrl(e) === player.portraitUrl)
      ? [[LEGACY_PORTRAIT_ID, player.portraitUrl], ...portraitEntries]
      : portraitEntries;

  function patch(data) {
    update(ref(db, path), data);
  }

  function logChange(text) {
    if (!sessionStarted) return;
    push(ref(db, `${path}/whispers`), { text: `📝 ${text}`, at: Date.now(), system: true });
  }

  // portraitUrl stays the *active* image (everything else — party panel,
  // initiative bar, map tokens — reads that single field), while `portraits`
  // holds the gallery the player picks from. The name given here is what the
  // GM sees in the focus picker, under Oyuncular › karakter adı.
  function addPortrait(url) {
    const trimmed = (url || '').trim();
    if (!trimmed) return;
    const existing = portraitEntries.find(([, e]) => portraitUrl(e) === trimmed);
    if (existing) {
      // Re-adding a URL just re-selects it, but a freshly typed name still
      // gets applied to it.
      const label = portraitNameDraft.trim();
      patch({
        portraitUrl: trimmed,
        ...(label ? { [`portraits/${existing[0]}`]: makePortrait(trimmed, label) } : {}),
      });
      setPortraitDraft('');
      setPortraitNameDraft('');
      return;
    }
    patch({
      [`portraits/${newId('img')}`]: makePortrait(trimmed, portraitNameDraft),
      portraitUrl: trimmed,
    });
    setPortraitDraft('');
    setPortraitNameDraft('');
  }

  function renamePortrait(id, entry) {
    if (id === LEGACY_PORTRAIT_ID) return;
    const next = window.prompt('Görsel adı (GM bu adla görür):', portraitLabel(entry));
    if (next === null) return;
    patch({ [`portraits/${id}`]: makePortrait(portraitUrl(entry), next) });
  }

  function removePortrait(id, url) {
    const updates = {};
    // A pre-gallery portrait isn't in the map — there's nothing to delete,
    // only the active field to clear.
    if (id !== LEGACY_PORTRAIT_ID) updates[`portraits/${id}`] = null;
    if (player.portraitUrl === url) {
      const fallback = gallery.find(([gid]) => gid !== id);
      updates.portraitUrl = fallback ? portraitUrl(fallback[1]) : '';
    }
    patch(updates);
  }

  function commitName() {
    const trimmed = nameDraft.trim();
    if (!trimmed) {
      setNameDraft(player.name || '');
      return;
    }
    if (trimmed !== player.name) {
      patch({ name: trimmed });
      logChange(`İsim "${player.name}" → "${trimmed}" oldu`);
    }
  }

  function changeStat(statId, delta) {
    const current = player.stats?.[statId] ?? 2;
    const next = Math.min(statMax, Math.max(statMin, current + delta));
    if (next === current) return;
    patch({ [`stats/${statId}`]: next });
    const statName = stats.find((s) => s.id === statId)?.name || statId;
    logChange(`${statName} statı ${current} → ${next} oldu`);
  }

  function rollStat(statId) {
    const statName = stats.find((s) => s.id === statId)?.name || statId;
    const statValue = player.stats?.[statId] ?? 2;
    rollStatShared({ roomCode, rollerName: player.name, statName, statValue, gameConfig });
  }

  function changeResource(resourceId, delta) {
    const max = resources.find((r) => r.id === resourceId)?.max ?? 10;
    const current = player.resources?.[resourceId] ?? max;
    const next = Math.min(max, Math.max(0, current + delta));
    if (next === current) return;
    patch({ [`resources/${resourceId}`]: next });
    const resName = resources.find((r) => r.id === resourceId)?.name || resourceId;
    logChange(`${resName} ${current} → ${next} oldu`);
  }

  function changeStatus(e) {
    const next = e.target.value;
    patch({ status: next });
    logChange(`Durum değişti: ${STATUS_LABEL[next] || next}`);
  }

  function commitSkills() {
    if (skillsDraft !== player.skills) patch({ skills: skillsDraft });
  }

  function addItem() {
    if (!newItem.trim()) return;
    const entry = makeItem(newItem.trim(), newItemQty);
    patch({ inventory: [...(player.inventory || []), entry] });
    logChange(`Envantere eklendi: ${itemLabel(entry)}`);
    setNewItem('');
    setNewItemQty('');
  }

  function addCatalogItem() {
    if (!catalogItemId) return;
    const item = items.find((i) => i.id === catalogItemId);
    if (!item) return;
    const entry = makeItem(item.name, catalogQty);
    patch({ inventory: [...(player.inventory || []), entry] });
    logChange(`Envantere eklendi: ${itemLabel(entry)}`);
    setCatalogItemId('');
    setCatalogQty('');
  }

  function changeItemQty(index, delta) {
    const list = [...(player.inventory || [])];
    const item = list[index];
    const qty = itemQty(item);
    if (qty === null) return;
    // Floor at 1 — clearing an item out is what the Sil button is for.
    const next = Math.max(1, qty + delta);
    if (next === qty) return;
    list[index] = { name: itemName(item), qty: next };
    patch({ inventory: list });
    logChange(`${itemName(item)} adedi ${qty} → ${next} oldu`);
  }

  function removeItem(index) {
    const removed = (player.inventory || [])[index];
    patch({ inventory: (player.inventory || []).filter((_, i) => i !== index) });
    if (removed) logChange(`Envanterden çıkarıldı: ${itemLabel(removed)}`);
  }

  function toggleInList(field, id, catalog, label) {
    const current = player[field] || [];
    const adding = !current.includes(id);
    const next = adding ? [...current, id] : current.filter((x) => x !== id);
    patch({ [field]: next });
    const itemName = catalog.find((c) => c.id === id)?.name || id;
    logChange(`${label} ${adding ? 'eklendi' : 'çıkarıldı'}: ${itemName}`);
  }

  function changeRaceClassSubclass(field, id, catalog, label) {
    patch({ [field]: id });
    if (id) {
      const name = catalog.find((c) => c.id === id)?.name || id;
      logChange(`${label} değişti: ${name}`);
    }
  }

  function openLevelUp() {
    setLevelUpStats({});
    setLevelUpPicks({});
    setShowLevelUp(true);
  }

  function addStatPoint(statId, delta) {
    setLevelUpStats((prev) => {
      const current = player.stats?.[statId] ?? 2;
      const added = prev[statId] || 0;
      const room = Math.max(0, statMax - current - added);
      if (delta > 0 && (statPointsLeft === 0 || room === 0)) return prev;
      if (delta < 0 && added === 0) return prev;
      const next = { ...prev, [statId]: added + delta };
      if (next[statId] === 0) delete next[statId];
      return next;
    });
  }

  function toggleLevelUpPick(groupId, entryId, allowance) {
    setLevelUpPicks((prev) => {
      const current = prev[groupId] || [];
      if (current.includes(entryId)) {
        return { ...prev, [groupId]: current.filter((x) => x !== entryId) };
      }
      if (current.length >= allowance) return prev;
      return { ...prev, [groupId]: [...current, entryId] };
    });
  }

  function confirmLevelUp() {
    const newLevel = level + 1;
    const updates = { level: newLevel };
    const logs = [`Seviye ${newLevel} oldu`];

    Object.entries(levelUpStats).forEach(([statId, added]) => {
      if (!added) return;
      const current = player.stats?.[statId] ?? 2;
      const next = Math.min(statMax, current + added);
      updates[`stats/${statId}`] = next;
      const statName = stats.find((s) => s.id === statId)?.name || statId;
      logs.push(`${statName} statı ${current} → ${next}`);
    });

    Object.entries(levelUpPicks).forEach(([groupId, picked]) => {
      if (!picked || picked.length === 0) return;
      const group = groups.find((g) => g.id === groupId);
      const catalog = groupEntries(gameConfig, groupId);
      updates[groupId] = [...(player[groupId] || []), ...picked];
      const names = picked.map((id) => catalog.find((e) => e.id === id)?.name || id);
      logs.push(`yeni ${(group?.name || groupId).toLowerCase()}: ${names.join(', ')}`);
    });

    if (resources.length > 0) {
      resources.forEach((res) => {
        updates[`resources/${res.id}`] = res.max;
      });
      logs.push('kaynaklar dolduruldu');
    }

    patch(updates);
    logChange(logs.join(' · '));
    setShowLevelUp(false);
  }

  const selectedRace = races.find((r) => r.id === player.raceId);
  const selectedClass = classes.find((c) => c.id === player.classId);
  const selectedSubclass = subclasses.find((s) => s.id === player.subclassId);

  const selectedCatalogItem = items.find((i) => i.id === catalogItemId);

  return (
    <div className="panel character-sheet">
      <div className="character-sheet-header">
        <div>
          <h2 className="title-font">{player.name}</h2>
          <span className="character-level">
            Seviye {level}{atMaxLevel ? ' (Maks)' : ` / ${maxLevel}`}
          </span>
          <div className="xp-bar-row">
            <div className="resource-bar xp-bar">
              <div className="resource-bar-fill" style={{ width: `${xpBarPct}%` }} />
            </div>
            <span className="xp-bar-label">
              {atMaxLevel ? `${xp} XP` : `${xpIntoLevel} / ${xpPerLevel} XP`}
            </span>
          </div>
        </div>
        <div className="character-sheet-header-actions">
          {locked && <span className="sheet-locked-badge">🔒 Kilitli</span>}
          {editable && !atMaxLevel && (
            <button
              type="button"
              className={`btn-primary small${canLevelUp ? ' xp-ready' : ''}`}
              onClick={openLevelUp}
              disabled={!canLevelUp}
              title={canLevelUp ? undefined : `Sonraki seviye için ${xpPerLevel - xpIntoLevel} XP daha gerekiyor`}
            >
              🎉 Seviye Atla
            </button>
          )}
          {editable && atMaxLevel && <span className="muted small-hint">Maksimum seviye</span>}
        </div>
      </div>

      {locked && !isGM && (
        <p className="muted sheet-locked-notice">
          🔒 Karakter kağıdın GM tarafından kilitlendi. Değişiklik yapamazsın.
        </p>
      )}

      {showLevelUp && (
        <Portal>
        <div className="whisper-overlay" onClick={() => setShowLevelUp(false)}>
          <div
            className="game-setup-card panel rules-editor-card level-up-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rules-editor-header">
              <h1 className="title-font">🎉 Seviye {level} → {level + 1}</h1>
              <button type="button" className="btn-ghost" onClick={() => setShowLevelUp(false)}>
                ✕ Kapat
              </button>
            </div>

            <p className="muted small-hint">
              Bu seviyenin ödülü: {describeReward(nextLevelReward, groups)}
            </p>

            {nextLevelReward.statPoints > 0 && stats.length > 0 && (
              <div className="level-up-section">
                <span className="pick-list-label">
                  Stat puanlarını dağıt — kalan: {statPointsLeft} / {nextLevelReward.statPoints}
                </span>
                <div className="levelup-stat-list">
                  {stats.map((s) => {
                    const current = player.stats?.[s.id] ?? 2;
                    const added = levelUpStats[s.id] || 0;
                    const atCap = current + added >= statMax;
                    return (
                      <div key={s.id} className="levelup-stat-row">
                        <span className="levelup-stat-name">{s.name}</span>
                        <span className="levelup-stat-value">
                          {current}
                          {added > 0 && ` → ${current + added}`}
                          {atCap && added === 0 && ' (maks)'}
                        </span>
                        <button
                          type="button"
                          className="btn-ghost small"
                          onClick={() => addStatPoint(s.id, -1)}
                          disabled={added === 0}
                        >
                          −
                        </button>
                        <button
                          type="button"
                          className="btn-ghost small"
                          onClick={() => addStatPoint(s.id, 1)}
                          disabled={statPointsLeft === 0 || atCap}
                        >
                          +
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {rewardGroups.map(({ group, allowance, available }) => {
              const picked = levelUpPicks[group.id] || [];
              return (
                <div key={group.id} className="level-up-section">
                  <span className="pick-list-label">
                    {group.name} — {picked.length} / {allowance} seçildi
                  </span>
                  <div className="pick-list-options">
                    {available.map((e) => (
                      <label key={e.id} className="pick-list-option">
                        <input
                          type="checkbox"
                          checked={picked.includes(e.id)}
                          disabled={!picked.includes(e.id) && picked.length >= allowance}
                          onChange={() => toggleLevelUpPick(group.id, e.id, allowance)}
                        />
                        {e.name}
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}

            {!levelUpReady && (
              <p className="muted small-hint">
                Onaylamak için tüm stat puanlarını dağıtıp seçimlerini tamamla.
              </p>
            )}

            <button
              type="button"
              className="btn-primary"
              onClick={confirmLevelUp}
              disabled={!levelUpReady}
            >
              Seviyeyi Onayla
            </button>
          </div>
        </div>
        </Portal>
      )}

      <fieldset disabled={!editable} className="character-sheet-fields">
      <label className="character-name-field">
        Karakter Adı
        <input
          value={nameDraft}
          onChange={(e) => setNameDraft(e.target.value)}
          onBlur={commitName}
          placeholder="Karakter adın"
        />
      </label>

      {settings?.sheetVisibilityForce ? (
        <p className="muted small-hint">
          {settings.sheetVisibilityForce === 'hide'
            ? '🔒 GM, herkesin karakter kağıdını diğer oyunculardan gizledi.'
            : '👁️ GM, herkesin karakter kağıdını diğer oyunculara zorla gösteriyor.'}
        </p>
      ) : (
        <label className="toggle-field">
          <input
            type="checkbox"
            checked={player.sheetVisible !== false}
            onChange={(e) => patch({ sheetVisible: e.target.checked })}
          />
          Karakter kağıdımı (statlar, traitler, envanter vb.) diğer oyunculara göster
        </label>
      )}

      <div className="portrait-field">
        {player.portraitUrl && (
          <img className="portrait-preview" src={player.portraitUrl} alt={player.name} />
        )}
        <label>
          Görsel Adı
          <input
            value={portraitNameDraft}
            onChange={(e) => setPortraitNameDraft(e.target.value)}
            placeholder="Örn. Zırhlı hali"
            title="GM bu adla görür — Oyuncular › karakter adın altında"
          />
        </label>
        <label>
          Görsel Ekle (URL)
          <input
            value={portraitDraft}
            onChange={(e) => setPortraitDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addPortrait(portraitDraft);
              }
            }}
            placeholder="https://..."
          />
        </label>
        <button type="button" className="btn-ghost small" onClick={() => addPortrait(portraitDraft)}>
          ➕ Ekle
        </button>
        <FileUploadButton
          roomCode={roomCode}
          folder="portrait"
          accept="image/*"
          onUploaded={(url) => addPortrait(url)}
        />
        <label className="color-field">
          Profil Rengi
          <input
            type="color"
            value={player.color || '#cf9a3f'}
            onChange={(e) => patch({ color: e.target.value })}
          />
        </label>
      </div>

      {gallery.length > 0 && (
        <div className="portrait-gallery">
          <span className="entry-list-label">
            Görsellerin — kullanmak istediğine tıkla, adını değiştirmek için alt yazısına tıkla
          </span>
          <div className="portrait-gallery-list">
            {gallery.map(([id, entry], index) => {
              const url = portraitUrl(entry);
              const displayName = portraitDisplayName(entry, index);
              return (
                <div
                  key={id}
                  className={`portrait-thumb${url === player.portraitUrl ? ' active' : ''}`}
                >
                  <button
                    type="button"
                    className="portrait-thumb-pick"
                    onClick={() => patch({ portraitUrl: url })}
                    title="Bu görseli kullan"
                  >
                    <img src={url} alt="" />
                  </button>
                  <button
                    type="button"
                    className="portrait-thumb-name"
                    onClick={() => renamePortrait(id, entry)}
                    title="Adını değiştir"
                  >
                    {displayName}
                  </button>
                  <button
                    type="button"
                    className="portrait-thumb-remove"
                    onClick={() => removePortrait(id, url)}
                    title="Sil"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {(races.length > 0 || classes.length > 0 || subclasses.length > 0) && (
        <div className="rcs-grid">
          {races.length > 0 && (
            <label>
              Irk
              <select
                value={player.raceId || ''}
                onChange={(e) => changeRaceClassSubclass('raceId', e.target.value, races, 'Irk')}
              >
                <option value="">Seç...</option>
                {races.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          {classes.length > 0 && (
            <label>
              Sınıf
              <select
                value={player.classId || ''}
                onChange={(e) => changeRaceClassSubclass('classId', e.target.value, classes, 'Sınıf')}
              >
                <option value="">Seç...</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          {subclasses.length > 0 && (
            <label>
              Alt Sınıf
              <select
                value={player.subclassId || ''}
                onChange={(e) => changeRaceClassSubclass('subclassId', e.target.value, subclasses, 'Alt sınıf')}
              >
                <option value="">Seç...</option>
                {subclasses.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      )}

      {(selectedRace?.description || selectedClass?.description || selectedSubclass?.description) && (
        <div className="rcs-descriptions">
          {selectedRace?.description && (
            <p>
              <strong>{selectedRace.name}:</strong> {selectedRace.description}
            </p>
          )}
          {selectedClass?.description && (
            <p>
              <strong>{selectedClass.name}:</strong> {selectedClass.description}
            </p>
          )}
          {selectedSubclass?.description && (
            <p>
              <strong>{selectedSubclass.name}:</strong> {selectedSubclass.description}
            </p>
          )}
        </div>
      )}

      {stats.length > 0 && (
        <div className="stats-grid">
          {stats.map((stat) => (
            <div className="stat-box" key={stat.id}>
              <button
                type="button"
                className="stat-roll-trigger"
                onClick={() => rollStat(stat.id)}
                title={rollModeLabel()}
              >
                <span className="stat-label">{stat.name}</span>
                <span className="stat-value">{player.stats?.[stat.id] ?? 2}</span>
              </button>
              <div className="stat-control">
                <button type="button" onClick={() => changeStat(stat.id, -1)}>
                  -
                </button>
                <button type="button" onClick={() => changeStat(stat.id, 1)}>
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {resources.length > 0 && (
        <div className="resources-grid">
          {resources.map((res) => {
            const current = player.resources?.[res.id] ?? res.max;
            const pct = Math.round((current / res.max) * 100);
            return (
              <div className="resource-box" key={res.id}>
                <div className="resource-box-header">
                  <span className="resource-label">{res.name}</span>
                  <span className="resource-value">{current} / {res.max}</span>
                </div>
                <div className="resource-bar">
                  <div className="resource-bar-fill" style={{ width: `${pct}%` }} />
                </div>
                <div className="resource-control">
                  <button type="button" onClick={() => changeResource(res.id, -1)}>
                    -
                  </button>
                  <button type="button" onClick={() => changeResource(res.id, 1)}>
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <label className="status-select">
        Durum
        <select value={player.status || 'iyi'} onChange={changeStatus}>
          <option value="iyi">İyi</option>
          <option value="yarali">Yaralı</option>
          <option value="bitkin">Bitkin</option>
          <option value="olu">Ölü</option>
        </select>
      </label>

      {groups.map((group) => {
        const entries = groupEntries(gameConfig, group.id);
        if (entries.length === 0) return null;
        const chosen = player[group.id] || [];
        // Entries locked to another class simply aren't offered here.
        const visible = selectableEntries(entries, player, chosen);
        if (visible.length === 0) return null;
        const selected = visible.filter((e) => chosen.includes(e.id));
        return (
          <div key={group.id} className="pick-list">
            <span className="pick-list-label">{group.name}</span>
            <div className="pick-list-options">
              {visible.map((e) => (
                <label key={e.id} className="pick-list-option">
                  <input
                    type="checkbox"
                    checked={chosen.includes(e.id)}
                    onChange={() => toggleInList(group.id, e.id, entries, group.name)}
                  />
                  {e.name}
                </label>
              ))}
            </div>
            {selected.some((e) => e.description) && (
              <div className="rcs-descriptions">
                {selected.map(
                  (e) =>
                    e.description && (
                      <p key={e.id}>
                        <strong>{e.name}:</strong> {e.description}
                      </p>
                    )
                )}
              </div>
            )}
          </div>
        );
      })}

      <label className="skills-field">
        Özgeçmiş
        <textarea
          value={skillsDraft}
          onChange={(e) => setSkillsDraft(e.target.value)}
          onBlur={commitSkills}
          rows={4}
          placeholder="Karakterinin özgeçmişini yaz..."
        />
      </label>

      <div className="inventory">
        <span>Envanter</span>
        <ul>
          {(player.inventory || []).map((item, i) => {
            const qty = itemQty(item);
            return (
              <li key={i}>
                <span>{itemName(item)}</span>
                {qty !== null && (
                  <span className="inventory-qty">
                    <button type="button" onClick={() => changeItemQty(i, -1)} title="Azalt">
                      −
                    </button>
                    <span className="inventory-qty-value">{qty}</span>
                    <button type="button" onClick={() => changeItemQty(i, 1)} title="Artır">
                      +
                    </button>
                  </span>
                )}
                <button type="button" className="btn-ghost small" onClick={() => removeItem(i)}>
                  Sil
                </button>
              </li>
            );
          })}
        </ul>

        {items.length > 0 && (
          <>
            <div className="inventory-add">
              <select value={catalogItemId} onChange={(e) => setCatalogItemId(e.target.value)}>
                <option value="">Eşya seç...</option>
                {items.map((it) => (
                  <option key={it.id} value={it.id}>
                    {it.name}
                  </option>
                ))}
              </select>
              <input
                className="inventory-qty-input"
                type="number"
                min="1"
                value={catalogQty}
                onChange={(e) => setCatalogQty(e.target.value)}
                placeholder="Adet"
              />
              <button type="button" className="btn-primary small" onClick={addCatalogItem}>
                Ekle
              </button>
            </div>
            {selectedCatalogItem?.description && (
              <div className="rcs-descriptions">
                <p>
                  <strong>{selectedCatalogItem.name}:</strong> {selectedCatalogItem.description}
                </p>
              </div>
            )}
          </>
        )}

        <div className="inventory-add">
          <input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Özel eşya..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addItem();
              }
            }}
          />
          <input
            className="inventory-qty-input"
            type="number"
            min="1"
            value={newItemQty}
            onChange={(e) => setNewItemQty(e.target.value)}
            placeholder="Adet"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addItem();
              }
            }}
          />
          <button type="button" className="btn-primary small" onClick={addItem}>
            Ekle
          </button>
        </div>
      </div>
      </fieldset>
    </div>
  );
}
