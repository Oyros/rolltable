import { useState } from 'react';
import { ref, update } from 'firebase/database';
import { db } from '../firebase.js';
import { STATUS_LABEL } from '../utils/stats.js';
import WhisperLog from './WhisperLog.jsx';
import CharacterSheet from './CharacterSheet.jsx';

function nameOf(list, id) {
  return list.find((x) => x.id === id)?.name;
}

export default function PartyOverview({
  players,
  gameConfig,
  isGM,
  onKick,
  playerId,
  activeTurnPlayerId,
  roomCode,
  sessionStarted,
}) {
  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  function toggleSheetLock(id, locked) {
    update(ref(db, `rooms/${roomCode}/players/${id}`), { sheetLocked: !locked });
  }
  const list = Object.entries(players || {}).filter(([, p]) => p.role !== 'gm');
  const gmEntry = Object.entries(players || {}).find(([, p]) => p.role === 'gm');

  const stats = gameConfig?.stats || [];
  const races = gameConfig?.races || [];
  const classes = gameConfig?.classes || [];
  const subclasses = gameConfig?.subclasses || [];
  const traits = gameConfig?.traits || [];
  const perks = gameConfig?.perks || [];

  return (
    <>
      {gmEntry && (
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
      )}

      <div className="panel party-overview">
        <h2 className="title-font">Parti</h2>
      {list.length === 0 && <p className="muted">Henüz oyuncu yok.</p>}
      <ul className="party-list">
        {list.map(([id, p]) => {
          const expanded = expandedId === id;
          const raceName = nameOf(races, p.raceId);
          const className = nameOf(classes, p.classId);
          const subclassName = nameOf(subclasses, p.subclassId);
          const traitNames = (p.traits || []).map((tid) => nameOf(traits, tid)).filter(Boolean);
          const perkNames = (p.perks || []).map((pid) => nameOf(perks, pid)).filter(Boolean);

          const isActiveTurn = activeTurnPlayerId && activeTurnPlayerId === id;

          return (
            <li key={id} className={`party-row status-${p.status || 'iyi'}${isActiveTurn ? ' active-turn' : ''}`}>
              <button
                type="button"
                className="party-row-summary"
                onClick={() => setExpandedId(expanded ? null : id)}
              >
                <span className="party-avatar" style={p.color ? { borderColor: p.color } : undefined}>
                  {p.portraitUrl ? (
                    <img src={p.portraitUrl} alt={p.name} />
                  ) : (
                    <span className="party-avatar-fallback">
                      {(p.name || '?').charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span
                    className={`presence-dot ${p.online ? 'online' : 'offline'}`}
                    title={p.online ? 'Çevrimiçi' : 'Çevrimdışı'}
                  />
                </span>
                <span className="party-name" style={p.color ? { color: p.color } : undefined}>
                  {p.name}
                </span>
                {isActiveTurn && <span className="active-turn-badge" title="Sırası">🎙️</span>}
                <span className="party-status-badge">{STATUS_LABEL[p.status] || 'İyi'}</span>
              </button>

              {expanded && (
                <div className="party-detail">
                  {p.portraitUrl && (
                    <img className="party-detail-image" src={p.portraitUrl} alt={p.name} />
                  )}

                  {(raceName || className || subclassName) && (
                    <p className="party-detail-rcs">
                      {[raceName, className, subclassName].filter(Boolean).join(' · ')}
                    </p>
                  )}

                  {stats.length > 0 && (
                    <div className="party-detail-stats">
                      {stats.map((s) => (
                        <div className="stat-box" key={s.id}>
                          <span className="stat-label">{s.name}</span>
                          <span className="stat-value">{p.stats?.[s.id] ?? 2}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {traitNames.length > 0 && (
                    <div className="party-detail-section">
                      <span className="party-detail-heading">Traitler</span>
                      <p>{traitNames.join(', ')}</p>
                    </div>
                  )}

                  {perkNames.length > 0 && (
                    <div className="party-detail-section">
                      <span className="party-detail-heading">Perkler</span>
                      <p>{perkNames.join(', ')}</p>
                    </div>
                  )}

                  {p.skills && (
                    <div className="party-detail-section">
                      <span className="party-detail-heading">Yetenek / Dal</span>
                      <p>{p.skills}</p>
                    </div>
                  )}

                  <div className="party-detail-section">
                    <span className="party-detail-heading">Envanter</span>
                    {(p.inventory || []).length === 0 ? (
                      <p className="muted">Boş</p>
                    ) : (
                      <ul className="party-detail-inventory">
                        {(p.inventory || []).map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {isGM && (
                    <div className="party-detail-actions">
                      <button
                        type="button"
                        className="btn-ghost small"
                        onClick={() => setEditingId(id)}
                      >
                        ✏️ Karakteri Düzenle
                      </button>
                      <button
                        type="button"
                        className="btn-ghost small"
                        onClick={() => toggleSheetLock(id, p.sheetLocked)}
                      >
                        {p.sheetLocked ? '🔓 Kilidi Aç' : '🔒 Kilitle'}
                      </button>
                      <button
                        type="button"
                        className="btn-ghost small danger"
                        onClick={() => {
                          if (window.confirm(`${p.name} adlı oyuncuyu odadan atmak istediğine emin misin?`)) {
                            onKick(id);
                          }
                        }}
                      >
                        Odadan At
                      </button>
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <WhisperLog players={players} playerId={playerId} isGM={isGM} />
      </div>

      {isGM && editingId && players?.[editingId] && (
        <div className="whisper-overlay">
          <div className="game-setup-card panel rules-editor-card character-edit-card">
            <div className="rules-editor-header">
              <h1 className="title-font">✏️ {players[editingId].name} — Karakter Düzenle</h1>
              <button type="button" className="btn-ghost" onClick={() => setEditingId(null)}>
                ✕ Kapat
              </button>
            </div>
            <CharacterSheet
              roomCode={roomCode}
              playerId={editingId}
              player={players[editingId]}
              gameConfig={gameConfig}
              isGM
              sessionStarted={sessionStarted}
            />
          </div>
        </div>
      )}
    </>
  );
}
