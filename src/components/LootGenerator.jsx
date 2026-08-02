import { useState } from 'react';
import { ref, push, update } from 'firebase/database';
import { db } from '../firebase.js';
import { generateLoot } from '../utils/lootGenerators.js';

export default function LootGenerator({ roomCode, players, theme }) {
  const [items, setItems] = useState([]);
  const [targetId, setTargetId] = useState('');

  const playerList = Object.entries(players || {}).filter(([, p]) => p.role === 'oyuncu');

  function generate() {
    const loot = generateLoot(theme);
    setItems((prev) => [{ text: loot, announced: false, added: false, id: Date.now() }, ...prev].slice(0, 8));
  }

  function announce(item) {
    const text = `🎁 Ganimet bulundu: ${item.text}`;
    const at = Date.now();
    playerList.forEach(([id]) => {
      push(ref(db, `rooms/${roomCode}/players/${id}/whispers`), { text, at });
    });
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, announced: true } : i)));
  }

  function addToInventory(item) {
    if (!targetId) return;
    const current = players?.[targetId]?.inventory || [];
    update(ref(db, `rooms/${roomCode}/players/${targetId}`), { inventory: [...current, item.text] });
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, added: true } : i)));
  }

  return (
    <div className="side-accordion-group">
      <h3 className="side-accordion-group-title">🎁 Ganimet Üretici</h3>
      <button type="button" className="btn-primary small" onClick={generate}>
        🎲 Üret
      </button>

      {items.length > 0 && (
        <>
          <select
            className="loot-target-select"
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
          >
            <option value="">Envanter hedefi seç...</option>
            {playerList.map(([id, p]) => (
              <option key={id} value={id}>
                {p.name}
              </option>
            ))}
          </select>
          <ul className="loot-list">
            {items.map((item) => (
              <li key={item.id} className="loot-item">
                <span>{item.text}</span>
                <div className="loot-item-actions">
                  <button
                    type="button"
                    className="btn-ghost small"
                    disabled={!targetId || item.added}
                    onClick={() => addToInventory(item)}
                  >
                    {item.added ? '✓ Eklendi' : '🎒 Envantere Ekle'}
                  </button>
                  <button
                    type="button"
                    className="btn-ghost small"
                    disabled={item.announced}
                    onClick={() => announce(item)}
                  >
                    {item.announced ? '✓ Duyuruldu' : '📢 Partiye Duyur'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
