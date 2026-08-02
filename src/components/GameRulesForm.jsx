import { useEffect, useState } from 'react';
import EntryListEditor from './EntryListEditor.jsx';
import ResourceListEditor from './ResourceListEditor.jsx';
import ParticleEffect from './ParticleEffect.jsx';
import { THEMES, DEFAULT_THEME_ID } from '../utils/themes.js';

const EMPTY_LISTS = {
  stats: [],
  resources: [],
  races: [],
  classes: [],
  subclasses: [],
  traits: [],
  perks: [],
  items: [],
};

export default function GameRulesForm({ initial, submitLabel, onSubmit, onThemeChange, children }) {
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
    races: initial?.races || EMPTY_LISTS.races,
    classes: initial?.classes || EMPTY_LISTS.classes,
    subclasses: initial?.subclasses || EMPTY_LISTS.subclasses,
    traits: initial?.traits || EMPTY_LISTS.traits,
    perks: initial?.perks || EMPTY_LISTS.perks,
    items: initial?.items || EMPTY_LISTS.items,
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    onThemeChange?.(theme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  function updateList(key, newItems) {
    setLists((prev) => ({ ...prev, [key]: newItems }));
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
      await onSubmit({
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
      <EntryListEditor
        label="Traitler"
        items={lists.traits}
        onChange={(v) => updateList('traits', v)}
      />
      <EntryListEditor label="Perkler" items={lists.perks} onChange={(v) => updateList('perks', v)} />
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
