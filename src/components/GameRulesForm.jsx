import { useEffect, useState } from 'react';
import EntryListEditor from './EntryListEditor.jsx';
import ParticleEffect from './ParticleEffect.jsx';
import { THEMES, DEFAULT_THEME_ID } from '../utils/themes.js';

const EMPTY_LISTS = {
  stats: [],
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
  const [lists, setLists] = useState({
    stats: initial?.stats || EMPTY_LISTS.stats,
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
      await onSubmit({ name: name.trim(), theme, ...lists });
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

      <EntryListEditor
        label="Statlar"
        items={lists.stats}
        onChange={(v) => updateList('stats', v)}
        hideDescription
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
