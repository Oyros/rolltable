export default function GmSlotCard({ players }) {
  const gmEntry = Object.entries(players || {}).find(([, p]) => p.role === 'gm');
  if (!gmEntry) return null;

  return (
    <div className="panel gm-slot-panel">
      <span className="gm-slot-label">Oyun Yöneticisi</span>
      <div className="gm-slot">
        <span
          className="party-avatar"
          style={gmEntry[1].color ? { borderColor: gmEntry[1].color } : undefined}
        >
          {gmEntry[1].portraitUrl ? (
            <img src={gmEntry[1].portraitUrl} alt={gmEntry[1].name} />
          ) : (
            <span className="party-avatar-fallback">
              {(gmEntry[1].name || '?').charAt(0).toUpperCase()}
            </span>
          )}
          <span
            className={`presence-dot ${gmEntry[1].online ? 'online' : 'offline'}`}
            title={gmEntry[1].online ? 'Çevrimiçi' : 'Çevrimdışı'}
          />
        </span>
        <span
          className="gm-slot-name"
          style={gmEntry[1].color ? { color: gmEntry[1].color } : undefined}
        >
          {gmEntry[1].name}
        </span>
      </div>
    </div>
  );
}
