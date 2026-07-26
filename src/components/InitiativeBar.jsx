export default function InitiativeBar({ initiative, players, isGM, onAdvance }) {
  const queue = initiative?.queue || [];
  if (queue.length === 0) return null;

  const currentId = queue[initiative.currentIndex];
  const previousId = initiative.previousPlayerId;
  const currentName = players?.[currentId]?.name;
  const previousName = previousId && previousId !== currentId ? players?.[previousId]?.name : null;

  if (!currentName) return null;

  return (
    <div className="initiative-bar">
      {previousName && <span className="initiative-bar-prev">Önceki: {previousName}</span>}
      <span className="initiative-bar-current">🎙️ Şimdi: {currentName}</span>
      {isGM && (
        <div className="initiative-bar-controls">
          <button type="button" className="btn-ghost small" onClick={() => onAdvance(-1)}>
            ⏮
          </button>
          <button type="button" className="btn-ghost small" onClick={() => onAdvance(1)}>
            ⏭
          </button>
        </div>
      )}
    </div>
  );
}
