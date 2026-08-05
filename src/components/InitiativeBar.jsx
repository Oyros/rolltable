import { resolveQueueEntity } from '../utils/initiativeEntity.js';

function buildSlots(queue, currentIndex) {
  const n = queue.length;
  const slots = [];
  for (let offset = -2; offset <= 2; offset += 1) {
    const idx = ((currentIndex + offset) % n + n) % n;
    slots.push({ offset, entityId: queue[idx] });
  }
  return slots;
}

export default function InitiativeBar({ initiative, players, npcs, isGM, onAdvance, flashing }) {
  const queue = initiative?.queue || [];
  if (queue.length === 0) return null;

  const currentIndex = initiative.currentIndex ?? 0;
  const currentId = queue[currentIndex];
  if (!resolveQueueEntity(currentId, players, npcs)) return null;

  const slots = buildSlots(queue, currentIndex);

  return (
    <div className={`initiative-bar${flashing ? ' turn-changed' : ''}`}>
      <div className="initiative-strip">
        {isGM && (
          <button type="button" className="initiative-nav" onClick={() => onAdvance(-1)}>
            ⏮
          </button>
        )}
        {slots.map(({ offset, entityId }) => {
          const entity = resolveQueueEntity(entityId, players, npcs);
          if (!entity) return null;
          return (
            <div
              key={`${offset}-${entityId}`}
              className={`initiative-slot${entity.isNpc ? ' enemy' : ''}`}
              data-offset={offset}
            >
              <span
                className={`initiative-avatar${entity.isNpc ? ' enemy' : ''}`}
                style={entity.color ? { borderColor: entity.color } : undefined}
              >
                {entity.imageUrl ? (
                  <img src={entity.imageUrl} alt={entity.name} />
                ) : (
                  <span className="initiative-avatar-fallback">
                    {entity.isNpc ? '⚔️' : (entity.name || '?').charAt(0).toUpperCase()}
                  </span>
                )}
                {offset === 0 && <span className={`initiative-avatar-ring${entity.isNpc ? ' enemy' : ''}`} />}
              </span>
              <span className={`initiative-slot-name${entity.isNpc ? ' enemy' : ''}`}>{entity.name}</span>
            </div>
          );
        })}
        {isGM && (
          <button type="button" className="initiative-nav" onClick={() => onAdvance(1)}>
            ⏭
          </button>
        )}
      </div>
    </div>
  );
}
