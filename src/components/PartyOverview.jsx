import { useState } from 'react';
import { ref, update } from 'firebase/database';
import { db } from '../firebase.js';
import { STATUS_LABEL } from '../utils/stats.js';
import { rollStat } from '../utils/statRoll.js';
import { isSheetVisibleTo } from '../utils/sheetVisibility.js';
import CharacterSheet from './CharacterSheet.jsx';
import Portal from './Portal.jsx';

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
  settings,
}) {
  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  function toggleSheetLock(id, locked) {
    update(ref(db, `rooms/${roomCode}/players/${id}`), { sheetLocked: !locked });
  }

  function changeXp(id, currentXp, delta) {
    const next = Math.max(0, (currentXp || 0) + delta);
    update(ref(db, `rooms/${roomCode}/players/${id}`), { xp: next });
  }
  const list = Object.entries(players || {}).filter(([, p]) => p.role === 'oyuncu');
  const spectators = Object.entries(players || {}).filter(([, p]) => p.role === 'spectator');

  const stats = gameConfig?.stats || [];
  const resources = gameConfig?.resources || [];
  const races = gameConfig?.races || [];
  const classes = gameConfig?.classes || [];
  const subclasses = gameConfig?.subclasses || [];
  const traits = gameConfig?.traits || [];
  const perks = gameConfig?.perks || [];

  return (
    <>
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
          const sheetVisible = isSheetVisibleTo({
            viewerIsGM: isGM,
            viewerId: playerId,
            ownerId: id,
            ownerSheetVisible: p.sheetVisible,
            forceMode: settings?.sheetVisibilityForce,
          });

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
                  {!sheetVisible ? (
                    <p className="muted">🔒 Bu oyuncu karakter kağıdını gizledi.</p>
                  ) : (
                    <>
                  {p.portraitUrl && (
                    <img className="party-detail-image" src={p.portraitUrl} alt={p.name} />
                  )}

                  <p className="party-detail-rcs">
                    {['Seviye ' + (p.level || 1), raceName, className, subclassName]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>

                  {stats.length > 0 && (
                    <div className="party-detail-stats">
                      {stats.map((s) => {
                        const statValue = p.stats?.[s.id] ?? 2;
                        return (
                          <div className="stat-box" key={s.id}>
                            <button
                              type="button"
                              className="stat-roll-trigger"
                              title="1d20 + bonus at"
                              onClick={() =>
                                rollStat({
                                  roomCode,
                                  rollerName: p.name,
                                  statName: s.name,
                                  statValue,
                                  gameConfig,
                                })
                              }
                            >
                              <span className="stat-label">{s.name}</span>
                              <span className="stat-value">{statValue}</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {resources.length > 0 && (
                    <div className="party-detail-section">
                      <span className="party-detail-heading">Kaynaklar</span>
                      {resources.map((r) => {
                        const current = p.resources?.[r.id] ?? r.max;
                        const pct = Math.round((current / r.max) * 100);
                        return (
                          <div className="resource-mini" key={r.id}>
                            <span>{r.name}</span>
                            <div className="resource-bar">
                              <div className="resource-bar-fill" style={{ width: `${pct}%` }} />
                            </div>
                            <span>{current}/{r.max}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {isGM && (
                    <div className="party-detail-section">
                      <span className="party-detail-heading">XP</span>
                      <div className="xp-control">
                        <button type="button" className="btn-ghost small" onClick={() => changeXp(id, p.xp, -10)}>
                          -10
                        </button>
                        <span className="stat-value">{p.xp || 0}</span>
                        <button type="button" className="btn-ghost small" onClick={() => changeXp(id, p.xp, 10)}>
                          +10
                        </button>
                      </div>
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
                    </>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {spectators.length > 0 && (
        <div className="spectator-section">
          <span className="party-detail-heading">👁️ İzleyiciler</span>
          <ul className="spectator-list">
            {spectators.map(([id, p]) => (
              <li key={id} className="spectator-row">
                <span
                  className={`presence-dot ${p.online ? 'online' : 'offline'}`}
                  title={p.online ? 'Çevrimiçi' : 'Çevrimdışı'}
                />
                <span className="spectator-name">{p.name}</span>
                {isGM && (
                  <button
                    type="button"
                    className="btn-ghost small danger"
                    onClick={() => {
                      if (window.confirm(`${p.name} adlı izleyiciyi odadan atmak istediğine emin misin?`)) {
                        onKick(id);
                      }
                    }}
                  >
                    Odadan At
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {isGM && editingId && players?.[editingId] && (
        <Portal>
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
                settings={settings}
                isGM
                sessionStarted={sessionStarted}
              />
            </div>
          </div>
        </Portal>
      )}
    </>
  );
}
