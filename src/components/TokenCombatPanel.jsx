import { useState } from 'react';
import { applyDelta, conditionList } from '../utils/combat.js';
import { trackedUpdate } from '../utils/journal.js';

const QUICK = [1, 5, 10];

// GM-only popover for one token: apply damage/healing and toggle status
// effects. Player health writes straight to the character sheet's resource so
// the map and the sheet stay one value; NPC health lives on the scene.
export default function TokenCombatPanel({
  roomCode,
  actor,
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
    const label = `${entity.name}: can ${health?.current ?? '?'} → ${next}`;
    if (entity.isNpc) {
      trackedUpdate(roomCode, actor, {
        path: `scene/npcState/${entityId}`,
        patch: { hp: next },
        label,
      });
    } else if (health?.resourceId) {
      trackedUpdate(roomCode, actor, {
        path: `players/${entityId}/resources`,
        patch: { [health.resourceId]: next },
        label,
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
    const name = allConditions.find((c) => c.id === condId)?.name || 'durum';
    const label = `${entity.name}: ${name} ${on ? 'eklendi' : 'kaldırıldı'}`;
    const path = entity.isNpc
      ? `scene/npcState/${entityId}/conditions`
      : `players/${entityId}/conditions`;
    trackedUpdate(roomCode, actor, { path, patch: { [condId]: value }, label });
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
