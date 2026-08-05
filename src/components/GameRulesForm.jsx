import { useEffect, useRef, useState } from 'react';
import EntryListEditor from './EntryListEditor.jsx';
import ResourceListEditor from './ResourceListEditor.jsx';
import ConditionListEditor from './ConditionListEditor.jsx';
import ParticleEffect from './ParticleEffect.jsx';
import { THEMES, DEFAULT_THEME_ID } from '../utils/themes.js';
import { configGroups, newGroupId, NO_GROUPS } from '../utils/traitGroups.js';
import { defaultRule, levelOverrides, levelKey } from '../utils/levelRewards.js';
import { saveDraft, loadDraft, clearDraft, draftAgeLabel } from '../utils/formDraft.js';

// Only counts above zero are stored, and picks for deleted categories are
// dropped so they can't linger in the saved config.
function ruleForSave(rule, liveGroupIds) {
  const picks = {};
  liveGroupIds.forEach((id) => {
    const n = parseInt(rule.picks?.[id], 10);
    if (Number.isFinite(n) && n > 0) picks[id] = n;
  });
  const statPoints = parseInt(rule.statPoints, 10);
  return {
    statPoints: Number.isFinite(statPoints) && statPoints > 0 ? statPoints : 0,
    picks: Object.keys(picks).length > 0 ? picks : null,
  };
}

// Stat points + "how many picks from each category" — used for the general
// rule and for each level-specific override.
function RewardFields({ rule, groups, onChange }) {
  return (
    <div className="inline-form reward-fields">
      <label className="level-system-input">
        Stat puanı
        <input
          type="number"
          min="0"
          value={rule.statPoints}
          onChange={(e) => onChange({ ...rule, statPoints: e.target.value })}
        />
      </label>
      {groups.map((g, i) => (
        <label key={g.id} className="level-system-input">
          {g.name.trim() || `Kategori ${i + 1}`}
          <input
            type="number"
            min="0"
            value={rule.picks?.[g.id] ?? 0}
            onChange={(e) =>
              onChange({ ...rule, picks: { ...(rule.picks || {}), [g.id]: e.target.value } })
            }
          />
        </label>
      ))}
    </div>
  );
}

const EMPTY_LISTS = {
  stats: [],
  resources: [],
  conditions: [],
  races: [],
  classes: [],
  subclasses: [],
  items: [],
};

export default function GameRulesForm({
  initial,
  submitLabel,
  onSubmit,
  onThemeChange,
  draftScope,
  onDirtyChange,
  children,
}) {
  const [name, setName] = useState(initial?.name || '');
  const [theme, setTheme] = useState(initial?.theme || DEFAULT_THEME_ID);
  const [maxLevel, setMaxLevel] = useState(initial?.maxLevel || 10);
  const [xpPerLevel, setXpPerLevel] = useState(initial?.xpPerLevel || 100);
  const [statMin, setStatMin] = useState(initial?.statMin ?? 0);
  const [statMax, setStatMax] = useState(initial?.statMax ?? 10);
  const [statThreshold1, setStatThreshold1] = useState(initial?.statThreshold1 ?? 4);
  const [statThreshold2, setStatThreshold2] = useState(initial?.statThreshold2 ?? 6);
  const [statThreshold3, setStatThreshold3] = useState(initial?.statThreshold3 ?? 8);
  const [statThresholdNeg1, setStatThresholdNeg1] = useState(initial?.statThresholdNeg1 ?? 2);
  const [statThresholdNeg2, setStatThresholdNeg2] = useState(initial?.statThresholdNeg2 ?? 1);
  const [statThresholdNeg3, setStatThresholdNeg3] = useState(initial?.statThresholdNeg3 ?? 0);
  const [lists, setLists] = useState({
    stats: initial?.stats || EMPTY_LISTS.stats,
    resources: initial?.resources || EMPTY_LISTS.resources,
    conditions: initial?.conditions || EMPTY_LISTS.conditions,
    races: initial?.races || EMPTY_LISTS.races,
    classes: initial?.classes || EMPTY_LISTS.classes,
    subclasses: initial?.subclasses || EMPTY_LISTS.subclasses,
    items: initial?.items || EMPTY_LISTS.items,
  });
  // Trait/perk style categories: freely named, any number of them, each with
  // its own entry list keyed by the group id.
  const [groups, setGroups] = useState(() => configGroups(initial));
  const [groupLists, setGroupLists] = useState(() => {
    const start = {};
    configGroups(initial).forEach((g) => {
      start[g.id] = initial?.[g.id] || [];
    });
    return start;
  });
  // Level-up rewards: one general rule plus optional per-level overrides.
  const [rewardDefault, setRewardDefault] = useState(() => defaultRule(initial));
  const [rewardOverrides, setRewardOverrides] = useState(() => levelOverrides(initial));
  // Which resource counts as health on map tokens ('' = no health bars).
  const [hpResourceId, setHpResourceId] = useState(initial?.hpResourceId || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  // A draft found in this browser from a previous, unfinished edit.
  const [pendingDraft, setPendingDraft] = useState(() =>
    draftScope ? loadDraft(draftScope) : null
  );

  // Everything the form holds, as one serialisable object.
  const snapshot = {
    name,
    theme,
    maxLevel,
    xpPerLevel,
    statMin,
    statMax,
    statThreshold1,
    statThreshold2,
    statThreshold3,
    statThresholdNeg1,
    statThresholdNeg2,
    statThresholdNeg3,
    hpResourceId,
    lists,
    groups,
    groupLists,
    rewardDefault,
    rewardOverrides,
  };
  const serialized = JSON.stringify(snapshot);
  // What the form looked like when it opened — anything else counts as unsaved.
  const baselineRef = useRef(serialized);
  const savedRef = useRef(false);
  const dirty = !savedRef.current && serialized !== baselineRef.current;

  function applySnapshot(d) {
    if (!d) return;
    setName(d.name ?? '');
    setTheme(d.theme ?? DEFAULT_THEME_ID);
    setMaxLevel(d.maxLevel ?? 10);
    setXpPerLevel(d.xpPerLevel ?? 100);
    setStatMin(d.statMin ?? 0);
    setStatMax(d.statMax ?? 10);
    setStatThreshold1(d.statThreshold1 ?? 4);
    setStatThreshold2(d.statThreshold2 ?? 6);
    setStatThreshold3(d.statThreshold3 ?? 8);
    setStatThresholdNeg1(d.statThresholdNeg1 ?? 2);
    setStatThresholdNeg2(d.statThresholdNeg2 ?? 1);
    setStatThresholdNeg3(d.statThresholdNeg3 ?? 0);
    setHpResourceId(d.hpResourceId ?? '');
    if (d.lists) setLists(d.lists);
    if (d.groups) setGroups(d.groups);
    if (d.groupLists) setGroupLists(d.groupLists);
    if (d.rewardDefault) setRewardDefault(d.rewardDefault);
    if (d.rewardOverrides) setRewardOverrides(d.rewardOverrides);
  }

  // Autosave, debounced so typing doesn't hammer localStorage.
  useEffect(() => {
    if (!draftScope || !dirty) return undefined;
    const timer = setTimeout(() => saveDraft(draftScope, snapshot), 700);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serialized, draftScope, dirty]);

  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  // The browser's own "leave site?" prompt, for tab closes and refreshes.
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  useEffect(() => {
    onThemeChange?.(theme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  function updateList(key, newItems) {
    setLists((prev) => ({ ...prev, [key]: newItems }));
  }

  function updateGroupList(groupId, newItems) {
    setGroupLists((prev) => ({ ...prev, [groupId]: newItems }));
  }

  function renameGroup(groupId, name) {
    setGroups((prev) => prev.map((g) => (g.id === groupId ? { ...g, name } : g)));
  }

  function addGroup() {
    const id = newGroupId();
    setGroups((prev) => [...prev, { id, name: '' }]);
    setGroupLists((prev) => ({ ...prev, [id]: [] }));
  }

  function addOverride() {
    const used = rewardOverrides.map((o) => o.level);
    const top = Math.max(1, parseInt(maxLevel, 10) || 10);
    // First level from 2 up that doesn't have its own rule yet.
    let next = 2;
    while (used.includes(next) && next < top) next += 1;
    setRewardOverrides((prev) =>
      [...prev, { level: next, rule: { statPoints: rewardDefault.statPoints, picks: { ...rewardDefault.picks } } }].sort(
        (a, b) => a.level - b.level
      )
    );
  }

  function updateOverride(index, patch) {
    setRewardOverrides((prev) => prev.map((o, i) => (i === index ? { ...o, ...patch } : o)));
  }

  function removeOverride(index) {
    setRewardOverrides((prev) => prev.filter((_, i) => i !== index));
  }

  function removeGroup(groupId) {
    const group = groups.find((g) => g.id === groupId);
    const count = (groupLists[groupId] || []).length;
    const question = count
      ? `"${group?.name || 'Kategori'}" kategorisi ve içindeki ${count} kayıt silinsin mi? Oyuncuların bu kategorideki seçimleri de görünmez olur.`
      : `"${group?.name || 'Kategori'}" kategorisi silinsin mi?`;
    if (!window.confirm(question)) return;
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
    setGroupLists((prev) => {
      const next = { ...prev };
      delete next[groupId];
      return next;
    });
  }

  function toInt(value, fallback) {
    const n = parseInt(value, 10);
    return Number.isNaN(n) ? fallback : n;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Senaryo adı gerekli.');
      return;
    }
    if (lists.stats.length === 0) {
      setError('En az bir stat eklemelisin.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const min = toInt(statMin, 0);
      const max = Math.max(min, toInt(statMax, 10));
      const t1 = Math.max(min, toInt(statThreshold1, 4));
      const t2 = Math.max(t1, toInt(statThreshold2, 6));
      const t3 = Math.max(t2, toInt(statThreshold3, 8));
      const n1 = Math.min(max, toInt(statThresholdNeg1, 2));
      const n2 = Math.min(n1, toInt(statThresholdNeg2, 1));
      const n3 = Math.min(n2, toInt(statThresholdNeg3, 0));
      const cleanGroups = groups.map((g, i) => ({
        id: g.id,
        name: g.name.trim() || `Kategori ${i + 1}`,
      }));
      const groupPayload = {};
      cleanGroups.forEach((g) => {
        groupPayload[g.id] = groupLists[g.id] || [];
      });
      // Rules are saved with update(), so a dropped category's entries have to
      // be nulled out explicitly or they'd linger in the config.
      configGroups(initial).forEach((g) => {
        if (!cleanGroups.some((c) => c.id === g.id)) groupPayload[g.id] = null;
      });
      const liveGroupIds = cleanGroups.map((g) => g.id);
      const byLevel = {};
      rewardOverrides.forEach((o) => {
        byLevel[levelKey(o.level)] = ruleForSave(o.rule, liveGroupIds);
      });
      savedRef.current = true;
      if (draftScope) clearDraft(draftScope);
      await onSubmit({
        traitGroups: cleanGroups.length > 0 ? cleanGroups : NO_GROUPS,
        ...groupPayload,
        levelRewards: {
          default: ruleForSave(rewardDefault, liveGroupIds),
          byLevel: Object.keys(byLevel).length > 0 ? byLevel : null,
        },
        name: name.trim(),
        theme,
        maxLevel: Math.max(1, parseInt(maxLevel, 10) || 10),
        xpPerLevel: Math.max(1, parseInt(xpPerLevel, 10) || 100),
        statMin: min,
        statMax: max,
        statThreshold1: t1,
        statThreshold2: t2,
        statThreshold3: t3,
        statThresholdNeg1: n1,
        statThresholdNeg2: n2,
        statThresholdNeg3: n3,
        hpResourceId: lists.resources.some((r) => r.id === hpResourceId) ? hpResourceId : '',
        ...lists,
      });
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="scene-form">
      <ParticleEffect theme={theme} />

      {pendingDraft && (
        <div className="draft-banner">
          <span>
            💾 Kaydedilmemiş bir taslak bulundu ({draftAgeLabel(pendingDraft.at)}). Geri
            yüklensin mi?
          </span>
          <div className="draft-banner-actions">
            <button
              type="button"
              className="btn-primary small"
              onClick={() => {
                applySnapshot(pendingDraft.data);
                setPendingDraft(null);
              }}
            >
              Geri Yükle
            </button>
            <button
              type="button"
              className="btn-ghost small"
              onClick={() => {
                clearDraft(draftScope);
                setPendingDraft(null);
              }}
            >
              Yoksay
            </button>
          </div>
        </div>
      )}

      <label>
        Senaryo Adı
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Örn. Sessizlik"
        />
      </label>

      <div className="theme-field">
        <span className="entry-list-label">Tasarım Teması</span>
        <div className="theme-picker">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`theme-swatch${theme === t.id ? ' selected' : ''}`}
              onClick={() => setTheme(t.id)}
              style={{
                background: t.vars['--bg'],
                borderColor: theme === t.id ? t.vars['--amber'] : t.vars['--border'],
              }}
            >
              <span className="theme-swatch-dot" style={{ background: t.vars['--amber'] }} />
              <span
                className="theme-swatch-name"
                style={{ color: t.vars['--amber-light'], fontFamily: t.vars['--font-heading'] }}
              >
                {t.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="level-system-field">
        <span className="entry-list-label">Seviye Sistemi</span>
        <div className="inline-form">
          <label className="level-system-input">
            Maksimum Seviye
            <input
              type="number"
              min="1"
              value={maxLevel}
              onChange={(e) => setMaxLevel(e.target.value)}
            />
          </label>
          <label className="level-system-input">
            Seviye Başına Gereken XP
            <input
              type="number"
              min="1"
              value={xpPerLevel}
              onChange={(e) => setXpPerLevel(e.target.value)}
            />
          </label>
        </div>
        <p className="muted small-hint">
          Karakter, biriken toplam XP'si bu değerin katlarını geçtikçe seviye atlamaya hak
          kazanır (XP seviye atlarken sıfırlanmaz). Maksimum seviyeye ulaşınca daha fazla
          atlanamaz.
        </p>
      </div>

      <div className="level-system-field">
        <span className="entry-list-label">Stat Sistemi</span>
        <div className="inline-form">
          <label className="level-system-input">
            Minimum Stat Puanı
            <input
              type="number"
              value={statMin}
              onChange={(e) => setStatMin(e.target.value)}
            />
          </label>
          <label className="level-system-input">
            Maksimum Stat Puanı
            <input
              type="number"
              min="1"
              value={statMax}
              onChange={(e) => setStatMax(e.target.value)}
            />
          </label>
        </div>

        <p className="muted small-hint">Bonus eşikleri — bu puana ulaşınca 1d20'ye eklenir:</p>
        <div className="inline-form">
          <label className="level-system-input">
            +1 için gereken puan
            <input
              type="number"
              value={statThreshold1}
              onChange={(e) => setStatThreshold1(e.target.value)}
            />
          </label>
          <label className="level-system-input">
            +2 için gereken puan
            <input
              type="number"
              value={statThreshold2}
              onChange={(e) => setStatThreshold2(e.target.value)}
            />
          </label>
          <label className="level-system-input">
            +3 için gereken puan
            <input
              type="number"
              value={statThreshold3}
              onChange={(e) => setStatThreshold3(e.target.value)}
            />
          </label>
        </div>

        <p className="muted small-hint">Ceza eşikleri — bu puanın altında/eşitinde 1d20'den düşülür:</p>
        <div className="inline-form">
          <label className="level-system-input">
            -1 için gereken puan
            <input
              type="number"
              value={statThresholdNeg1}
              onChange={(e) => setStatThresholdNeg1(e.target.value)}
            />
          </label>
          <label className="level-system-input">
            -2 için gereken puan
            <input
              type="number"
              value={statThresholdNeg2}
              onChange={(e) => setStatThresholdNeg2(e.target.value)}
            />
          </label>
          <label className="level-system-input">
            -3 için gereken puan
            <input
              type="number"
              value={statThresholdNeg3}
              onChange={(e) => setStatThresholdNeg3(e.target.value)}
            />
          </label>
        </div>
        <p className="muted small-hint">
          Statlar Minimum ile Maksimum Stat Puanı arasında tutulur. Oyuncular karakter kağıdında
          bir stata tıklayınca bu eşiklere göre hesaplanan bonus/ceza ile 1d20 atılır (varsayılan
          bonus eşikleri 4/6/8, ceza eşikleri 2/1/0'dır).
        </p>
      </div>

      <EntryListEditor
        label="Statlar"
        items={lists.stats}
        onChange={(v) => updateList('stats', v)}
        hideDescription
      />
      <ResourceListEditor items={lists.resources} onChange={(v) => updateList('resources', v)} />

      <div className="level-system-field">
        <span className="entry-list-label">Savaş: Can Kaynağı</span>
        <p className="muted small-hint">
          Haritadaki token'ların üzerinde can barı olarak hangi kaynak gösterilsin? Seçtiğin
          kaynak karakter kağıdındakiyle aynı değerdir — haritadan verilen hasar kağıda da işler.
          "Yok" dersen can barı hiç çıkmaz.
        </p>
        <select value={hpResourceId} onChange={(e) => setHpResourceId(e.target.value)}>
          <option value="">Yok — can barı gösterme</option>
          {lists.resources.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      <ConditionListEditor
        items={lists.conditions}
        onChange={(v) => updateList('conditions', v)}
      />
      <EntryListEditor label="Irklar" items={lists.races} onChange={(v) => updateList('races', v)} />
      <EntryListEditor
        label="Sınıflar"
        items={lists.classes}
        onChange={(v) => updateList('classes', v)}
      />
      <EntryListEditor
        label="Alt Sınıflar"
        items={lists.subclasses}
        onChange={(v) => updateList('subclasses', v)}
      />
      <div className="trait-groups">
        <span className="entry-list-label">Trait / Perk Kategorileri</span>
        <p className="muted small-hint">
          Kategori adını dilediğin gibi değiştirebilir, istediğin kadar yeni kategori
          ekleyebilirsin. Her kaydı belirli sınıf/alt sınıflara sınırlarsan, o kaydı sadece o
          sınıftaki karakterler görür.
        </p>
        {groups.map((group, index) => (
          <div key={group.id} className="trait-group">
            <EntryListEditor
              label={group.name.trim() || `Kategori ${index + 1}`}
              labelSlot={
                <span className="trait-group-head">
                  <input
                    className="trait-group-name"
                    value={group.name}
                    onChange={(e) => renameGroup(group.id, e.target.value)}
                    placeholder={`Kategori ${index + 1} adı`}
                  />
                  <button
                    type="button"
                    className="btn-ghost small danger"
                    onClick={() => removeGroup(group.id)}
                  >
                    Kategoriyi Sil
                  </button>
                </span>
              }
              items={groupLists[group.id] || []}
              onChange={(v) => updateGroupList(group.id, v)}
              restrictClasses={lists.classes}
              restrictSubclasses={lists.subclasses}
            />
          </div>
        ))}
        <button type="button" className="btn-ghost small" onClick={addGroup}>
          ➕ Kategori Ekle
        </button>
      </div>

      <div className="level-system-field">
        <span className="entry-list-label">Seviye Atlama Ödülleri</span>
        <p className="muted small-hint">
          Seviye atlayan karakterin kaç stat puanı dağıtacağını ve hangi kategoriden kaçar seçim
          hakkı kazanacağını belirle. Aşağıdaki genel kural <strong>bütün seviyeler</strong> için
          geçerlidir; istersen tek tek seviyelere özel kural ekleyebilirsin.
        </p>
        <RewardFields rule={rewardDefault} groups={groups} onChange={setRewardDefault} />

        {rewardOverrides.map((o, index) => (
          <div key={`${o.level}-${index}`} className="level-reward-override">
            <div className="level-reward-head">
              <label className="level-system-input">
                Seviye
                <input
                  type="number"
                  min="2"
                  value={o.level}
                  onChange={(e) =>
                    updateOverride(index, { level: Math.max(2, parseInt(e.target.value, 10) || 2) })
                  }
                />
              </label>
              <button
                type="button"
                className="btn-ghost small danger"
                onClick={() => removeOverride(index)}
              >
                Kuralı Sil
              </button>
            </div>
            <RewardFields
              rule={o.rule}
              groups={groups}
              onChange={(rule) => updateOverride(index, { rule })}
            />
          </div>
        ))}

        <button type="button" className="btn-ghost small" onClick={addOverride}>
          ➕ Seviyeye Özel Kural Ekle
        </button>
      </div>
      <EntryListEditor
        label="Bulunabilecek Eşyalar"
        items={lists.items}
        onChange={(v) => updateList('items', v)}
      />

      {children}

      {error && <p className="sound-error">{error}</p>}

      <button type="submit" className="btn-primary" disabled={saving}>
        {saving ? 'Kaydediliyor...' : submitLabel}
      </button>
    </form>
  );
}
