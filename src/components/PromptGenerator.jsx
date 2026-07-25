import { useState } from 'react';
import { PROMPT_CATEGORIES } from '../utils/promptGenerators.js';

export default function PromptGenerator() {
  const [categoryId, setCategoryId] = useState(PROMPT_CATEGORIES[0]?.id || 'location');
  const [results, setResults] = useState([]);

  function generate() {
    const category = PROMPT_CATEGORIES.find((c) => c.id === categoryId);
    if (!category) return;
    setResults((prev) => [category.generate(), ...prev].slice(0, 6));
  }

  return (
    <div className="panel">
      <h2 className="title-font">🗺️ Mekan / Görev İpucu</h2>
      <div className="inline-form">
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          {PROMPT_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
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
