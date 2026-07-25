import { useState } from 'react';
import { NPC_CATEGORIES, generateNpcName } from '../utils/npcNames.js';

export default function NpcNameGenerator() {
  const [category, setCategory] = useState(NPC_CATEGORIES[0]?.id || 'turkce');
  const [names, setNames] = useState([]);

  function generate() {
    const generatedName = generateNpcName(category);
    setNames((prev) => [generatedName, ...prev].slice(0, 8));
  }

  return (
    <div className="panel">
      <h2 className="title-font">🎭 NPC İsim Üretici</h2>
      <div className="inline-form">
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {NPC_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <button type="button" className="btn-primary small" onClick={generate}>
          🎲 Üret
        </button>
      </div>

      {names.length > 0 && (
        <ul className="npc-name-list">
          {names.map((n, i) => (
            <li key={i}>{n}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
