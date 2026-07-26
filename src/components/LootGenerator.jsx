import { useState } from 'react';
import { ref, push } from 'firebase/database';
import { db } from '../firebase.js';
import { generateLoot } from '../utils/lootGenerators.js';

export default function LootGenerator({ roomCode, players, theme }) {
  const [items, setItems] = useState([]);

  function generate() {
    const loot = generateLoot(theme);
    setItems((prev) => [{ text: loot, announced: false, id: Date.now() }, ...prev].slice(0, 8));
  }

  function announce(item) {
    const playerList = Object.entries(players || {}).filter(([, p]) => p.role !== 'gm');
    const text = `🎁 Ganimet bulundu: ${item.text}`;
    const at = Date.now();
    playerList.forEach(([id]) => {
      push(ref(db, `rooms/${roomCode}/players/${id}/whispers`), { text, at });
    });
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, announced: true } : i)));
  }

  return (
    <div className="panel">
      <h2 className="title-font">🎁 Ganimet Üretici</h2>
      <button type="button" className="btn-primary small" onClick={generate}>
        🎲 Üret
      </button>

      {items.length > 0 && (
        <ul className="loot-list">
          {items.map((item) => (
            <li key={item.id} className="loot-item">
              <span>{item.text}</span>
              <button
                type="button"
                className="btn-ghost small"
                disabled={item.announced}
                onClick={() => announce(item)}
              >
                {item.announced ? '✓ Duyuruldu' : '📢 Partiye Duyur'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
