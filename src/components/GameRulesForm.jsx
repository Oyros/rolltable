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
  const [statMax, setStatMax] = useState(initial?.statMax ?? 10);
  const [statThreshold1, setStatThreshold1] = useState(initial?.statThreshold1 ?? 4);
  const [statThreshold2, setStatThreshold2] = useState(initial?.statThreshold2 ?? 6);
  const [statThreshold3, setStatThreshold3] = useState(initial?.statThreshold3 ?? 8);
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
      const t1 = Math.max(0, parseInt(statThreshold1, 10) || 4);
      const t2 = Math.max(t1, parseInt(statThreshold2, 10) || 6);
      const t3 = Math.max(t2, parseInt(statThreshold3, 10) || 8);
      await onSubmit({
        name: name.trim(),
        theme,
        maxLevel: Math.max(1, parseInt(maxLevel, 10) || 10),
        xpPerLevel: Math.max(1, parseInt(xpPerLevel, 10) || 100),
        statMax: Math.max(1, parseInt(statMax, 10) || 10),
        statThreshold1: t1,
        statThreshold2: t2,
        statThreshold3: t3,
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
            Maksimum Stat Puanı
            <input
              type="number"
              min="1"
              value={statMax}
              onChange={(e) => setStatMax(e.target.value)}
            />
          </label>
          <label className="level-system-input">
            +1 için gereken puan
            <input
              type="number"
              min="0"
              value={statThreshold1}
              onChange={(e) => setStatThreshold1(e.target.value)}
            />
          </label>
          <label className="level-system-input">
            +2 için gereken puan
            <input
              type="number"
              min="0"
              value={statThreshold2}
              onChange={(e) => setStatThreshold2(e.target.value)}
            />
          </label>
          <label className="level-system-input">
            +3 için gereken puan
            <input
              type="number"
              min="0"
              value={statThreshold3}
              onChange={(e) => setStatThreshold3(e.target.value)}
            />
          </label>
        </div>
        <p className="muted small-hint">
          Statlar 0 ile Maksimum Stat Puanı arasında tutulur. Oyuncular karakter kağıdında bir
          stata tıklayınca 1d20 + bu eşiklere göre hesaplanan bonus atılır (varsayılan eşikler
          4/6/8'dir).
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
