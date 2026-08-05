import FloatingWindow from './FloatingWindow.jsx';
import { journalList, canUndo, undoEntry } from '../utils/journal.js';

function timeLabel(at) {
  const seconds = Math.floor((Date.now() - (at || 0)) / 1000);
  if (seconds < 60) return 'az önce';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} dk önce`;
  return `${Math.floor(minutes / 60)} sa önce`;
}

// The room's recent actions, newest first, each with an undo button when the
// viewer is allowed to take it back.
export default function UndoHistory({ roomCode, journal, playerId, isGM, onClose }) {
  const list = journalList(journal, playerId, isGM);

  return (
    <FloatingWindow
      title="↩️ İşlem Geçmişi"
      storageKey="rolltable_history_window_box"
      defaultBox={{ x: 90, y: 160, w: 360, h: 380 }}
      onClose={onClose}
    >
      {list.length === 0 ? (
        <p className="muted small-hint">
          Henüz geri alınabilir bir işlem yok. Son {isGM ? 'masadaki' : 'kendi'} işlemlerin burada
          birikir.
        </p>
      ) : (
        <ul className="undo-list">
          {list.map(([id, entry]) => (
            <li key={id} className={`undo-item${entry.undone ? ' undone' : ''}`}>
              <div className="undo-item-text">
                <span className="undo-item-label">{entry.label}</span>
                <span className="undo-item-meta">
                  {entry.byName || 'Bilinmeyen'} · {timeLabel(entry.at)}
                  {entry.undone ? ' · geri alındı' : ''}
                </span>
              </div>
              {canUndo(entry, playerId, isGM) && (
                <button
                  type="button"
                  className="btn-ghost small"
                  onClick={() => undoEntry(roomCode, id, entry)}
                >
                  Geri Al
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </FloatingWindow>
  );
}
