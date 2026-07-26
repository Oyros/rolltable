function buildSlots(queue, currentIndex) {
  const n = queue.length;
  const slots = [];
  for (let offset = -2; offset <= 2; offset += 1) {
    const idx = ((currentIndex + offset) % n + n) % n;
    slots.push({ offset, playerId: queue[idx] });
  }
  return slots;
}

export default function InitiativeBar({ initiative, players, isGM, onAdvance }) {
  const queue = initiative?.queue || [];
  if (queue.length === 0) return null;

  const currentIndex = initiative.currentIndex ?? 0;
  const currentId = queue[currentIndex];
  if (!players?.[currentId]) return null;

  const slots = buildSlots(queue, currentIndex);

  return (
    <div className="initiative-bar">
      <div className="initiative-strip">
        {isGM && (
          <button type="button" className="initiative-nav" onClick={() => onAdvance(-1)}>
            ⏮
          </button>
        )}
        {slots.map(({ offset, playerId }) => {
          const p = players?.[playerId];
          if (!p) return null;
          return (
            <div key={`${offset}-${playerId}`} className="initiative-slot" data-offset={offset}>
              <span className="initiative-avatar" style={p.color ? { borderColor: p.color } : undefined}>
                {p.portraitUrl ? (
                  <img src={p.portraitUrl} alt={p.name} />
                ) : (
                  <span className="initiative-avatar-fallback">{(p.name || '?').charAt(0).toUpperCase()}</span>
                )}
                {offset === 0 && <span className="initiative-avatar-ring" />}
              </span>
              <span className="initiative-slot-name">{p.name}</span>
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
