import { useState } from 'react';
import { LOCATION_CATEGORIES, generateLocationName, generateQuestHook } from '../utils/promptGenerators.js';

export default function PromptGenerator({ theme }) {
  const [categoryId, setCategoryId] = useState('location');
  const [langId, setLangId] = useState(LOCATION_CATEGORIES[0]?.id || 'turkce');
  const [results, setResults] = useState([]);

  function generate() {
    const value = categoryId === 'location' ? generateLocationName(langId, theme) : generateQuestHook(theme);
    setResults((prev) => [value, ...prev].slice(0, 6));
  }

  return (
    <div className="panel">
      <h2 className="title-font">🗺️ Mekan / Görev İpucu</h2>
      <div className="inline-form">
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="location">Mekan Adı</option>
          <option value="quest">Görev İpucu</option>
        </select>
        {categoryId === 'location' && (
          <select value={langId} onChange={(e) => setLangId(e.target.value)}>
            {LOCATION_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        )}
        <button type="button" className="btn-primary small" onClick={generate}>
          🎲 Üret
        </button>
      </div>

      {results.length > 0 && (
        <ul className="npc-name-list">
          {results.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
