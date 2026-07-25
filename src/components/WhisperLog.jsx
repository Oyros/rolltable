export default function WhisperLog({ players, playerId, isGM }) {
  let entries = [];

  if (isGM) {
    Object.entries(players || {}).forEach(([pid, p]) => {
      if (p.role === 'gm') return;
      Object.entries(p.whispers || {}).forEach(([key, w]) => {
        entries.push({ key: `${pid}-${key}`, to: p.name, text: w.text, at: w.at });
      });
    });
  } else {
    const me = players?.[playerId];
    entries = Object.entries(me?.whispers || {}).map(([key, w]) => ({
      key,
      text: w.text,
      at: w.at,
    }));
  }

  entries.sort((a, b) => (b.at || 0) - (a.at || 0));

  if (entries.length === 0) return null;

  return (
    <div className="whisper-log">
      <span className="party-detail-heading">Fısıltı Geçmişi</span>
      <ul>
        {entries.slice(0, 15).map((e) => (
          <li key={e.key}>
            {isGM && <span className="whisper-log-to">{e.to}:</span>} {e.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
