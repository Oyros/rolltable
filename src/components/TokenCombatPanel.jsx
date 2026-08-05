import { useState } from 'react';
import { ref, update } from 'firebase/database';
import { db } from '../firebase.js';
import { applyDelta, conditionList } from '../utils/combat.js';

const QUICK = [1, 5, 10];

// GM-only popover for one token: apply damage/healing and toggle status
// effects. Player health writes straight to the character sheet's resource so
// the map and the sheet stay one value; NPC health lives on the scene.
export default function TokenCombatPanel({
  roomCode,
  entity,
  entityId,
  health,
  conditions,
  gameConfig,
  onClose,
}) {
  const [amount, setAmount] = useState('');

  const allConditions = conditionList(gameConfig);

  function writeHealth(next) {
    if (entity.isNpc) {
      update(ref(db, `rooms/${roomCode}/scene/npcState/${entityId}`), { hp: next });
    } else if (health?.resourceId) {
      update(ref(db, `rooms/${roomCode}/players/${entityId}/resources`), {
        [health.resourceId]: next,
      });
    }
  }

  function change(delta) {
    if (!health) return;
    writeHealth(applyDelta(health.current, health.max, delta));
  }

  function applyTyped(sign) {
    const n = parseInt(amount, 10);
    if (!Number.isFinite(n) || n <= 0) return;
    change(sign * n);
    setAmount('');
  }

  function toggleCondition(condId) {
    const on = !conditions?.[condId];
    const value = on ? true : null;
    if (entity.isNpc) {
      update(ref(db, `rooms/${roomCode}/scene/npcState/${entityId}/conditions`), {
        [condId]: value,
      });
    } else {
      update(ref(db, `rooms/${roomCode}/players/${entityId}/conditions`), { [condId]: value });
    }
  }

  return (
    <div className="token-combat-panel" onClick={(e) => e.stopPropagation()}>
      <div className="token-combat-head">
        <span className="token-combat-name">{entity.name}</span>
        <button type="button" className="btn-ghost small" onClick={onClose}>
          ✕
        </button>
      </div>

      {health ? (
        <>
          <div className="token-combat-hp">
            {health.current} / {health.max}
          </div>
          <div className="token-combat-quick">
            {QUICK.map((n) => (
              <button key={`d${n}`} type="button" className="btn-ghost small" onClick={() => change(-n)}>
                −{n}
              </button>
            ))}
            {QUICK.map((n) => (
              <button key={`h${n}`} type="button" className="btn-ghost small" onClick={() => change(n)}>
                +{n}
              </button>
            ))}
          </div>
          <div className="token-combat-custom">
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Miktar"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  applyTyped(-1);
                }
              }}
            />
            <button type="button" className="btn-ghost small danger" onClick={() => applyTyped(-1)}>
              ⚔️ Hasar
            </button>
            <button type="button" className="btn-ghost small" onClick={() => applyTyped(1)}>
              ✚ İyileş
            </button>
          </div>
          <div className="token-combat-fill">
            <button type="button" className="btn-ghost small" onClick={() => writeHealth(health.max)}>
              Tam doldur
            </button>
            <button type="button" className="btn-ghost small" onClick={() => writeHealth(0)}>
              Sıfırla
            </button>
          </div>
        </>
      ) : (
        <p className="muted small-hint">
          {entity.isNpc
            ? 'Bu NPC için kütüphanede can tanımlı değil.'
            : 'Kurallarda bir can kaynağı seçilmemiş.'}
        </p>
      )}

      {allConditions.length > 0 && (
        <div className="token-combat-conditions">
          {allConditions.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`condition-chip${conditions?.[c.id] ? ' active' : ''}`}
              onClick={() => toggleCondition(c.id)}
              title={c.name}
            >
              {c.icon} {c.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
