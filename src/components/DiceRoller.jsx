import { useEffect, useRef, useState } from 'react';
import { ref, push, query, limitToLast, onValue } from 'firebase/database';
import { db } from '../firebase.js';
import { playDiceRattle } from '../utils/diceSound.js';

const DICE = [4, 6, 8, 10, 12, 20];
const SPIN_MS = 1100;
const REVEAL_GAP_MS = 550;
const DICE_VOLUME_KEY = 'rolltable_dice_volume';

function loadDiceVolume() {
  const raw = localStorage.getItem(DICE_VOLUME_KEY);
  const parsed = raw ? parseFloat(raw) : 0.35;
  return Number.isFinite(parsed) ? Math.min(1, Math.max(0, parsed)) : 0.35;
}

export default function DiceRoller({ roomCode, name, isGM }) {
  const [rolls, setRolls] = useState([]);
  const [rollState, setRollState] = useState(null);
  const [hiddenKey, setHiddenKey] = useState(null);
  const [secretMode, setSecretMode] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [allRolls, setAllRolls] = useState([]);
  const [diceVolume, setDiceVolume] = useState(loadDiceVolume);
  const [rollMode, setRollMode] = useState('normal');
  const lastKeyRef = useRef(null);
  const isFirstSnapshot = useRef(true);
  const diceVolumeRef = useRef(diceVolume);
  diceVolumeRef.current = diceVolume;

  useEffect(() => {
    const rollsRef = query(ref(db, `rooms/${roomCode}/rolls`), limitToLast(8));
    const unsub = onValue(rollsRef, (snap) => {
      const val = snap.val() || {};
      const entries = Object.entries(val).sort((a, b) => (a[1].at || 0) - (b[1].at || 0));
      setRolls(entries);

      const latest = entries[entries.length - 1];
      if (latest && latest[0] !== lastKeyRef.current) {
        const wasFirst = isFirstSnapshot.current;
        lastKeyRef.current = latest[0];
        isFirstSnapshot.current = false;
        const [key, data] = latest;

        if (!wasFirst) {
          setHiddenKey(key);
          playDiceRattle(SPIN_MS, diceVolumeRef.current);

          if (data.mode && data.subRolls) {
            setRollState({ key, ...data, stage: 'spinning' });
            setTimeout(() => {
              setRollState((prev) => (prev?.key === key ? { ...prev, stage: 'reveal1' } : prev));
            }, SPIN_MS);
            setTimeout(() => {
              setRollState((prev) => (prev?.key === key ? { ...prev, stage: 'reveal2' } : prev));
              setHiddenKey(null);
            }, SPIN_MS + REVEAL_GAP_MS);
          } else {
            setRollState({ key, ...data, stage: 'spinning' });
            setTimeout(() => {
              setRollState((prev) => (prev?.key === key ? { ...prev, stage: 'done' } : prev));
              setHiddenKey(null);
            }, SPIN_MS);
          }
        } else {
          setRollState({ key, ...data, stage: data.mode ? 'reveal2' : 'done' });
        }
      }
    });
    return () => unsub();
  }, [roomCode]);

  useEffect(() => {
    localStorage.setItem(DICE_VOLUME_KEY, String(diceVolume));
  }, [diceVolume]);

  useEffect(() => {
    if (!showStats) return;
    const statsRef = query(ref(db, `rooms/${roomCode}/rolls`), limitToLast(500));
    const unsub = onValue(statsRef, (snap) => {
      const val = snap.val() || {};
      setAllRolls(Object.values(val).filter((r) => !r.hidden));
    });
    return () => unsub();
  }, [roomCode, showStats]);

  function rollDice(sides) {
    let result;
    let extra = {};
    if (rollMode === 'normal') {
      result = Math.floor(Math.random() * sides) + 1;
    } else {
      const r1 = Math.floor(Math.random() * sides) + 1;
      const r2 = Math.floor(Math.random() * sides) + 1;
      result = rollMode === 'advantage' ? Math.max(r1, r2) : Math.min(r1, r2);
      extra = { mode: rollMode, subRolls: [r1, r2] };
    }
    push(ref(db, `rooms/${roomCode}/rolls`), {
      roller: name,
      dice: sides,
      result,
      at: Date.now(),
      hidden: isGM && secretMode,
      ...extra,
    });
  }

  function mask(value, hidden) {
    if (hidden && !isGM) return '??';
    return value;
  }

  function displayResult(r) {
    if (r.hidden && !isGM) return '??';
    if (r.hidden && isGM) return `🔒 ${r.result}`;
    return r.result;
  }

  const statsByRoller = {};
  allRolls.forEach((r) => {
    if (!statsByRoller[r.roller]) statsByRoller[r.roller] = { count: 0, sumPct: 0 };
    statsByRoller[r.roller].count += 1;
    statsByRoller[r.roller].sumPct += r.result / r.dice;
  });
  const statRows = Object.entries(statsByRoller)
    .map(([rollerName, s]) => ({ name: rollerName, count: s.count, avgPct: s.sumPct / s.count }))
    .sort((a, b) => b.count - a.count);
  const luckiest = statRows.length
    ? [...statRows].sort((a, b) => b.avgPct - a.avgPct)[0]
    : null;
  const unluckiest = statRows.length
    ? [...statRows].sort((a, b) => a.avgPct - b.avgPct)[0]
    : null;

  let winnerIndex = null;
  if (rollState?.mode && rollState.stage === 'reveal2') {
    const [r1, r2] = rollState.subRolls;
    winnerIndex =
      rollState.mode === 'advantage' ? (r1 >= r2 ? 0 : 1) : r1 <= r2 ? 0 : 1;
  }

  return (
    <div className="panel dice-panel">
      <h2 className="title-font">Zar</h2>

      <div className="roll-mode-toggle">
        <button
          type="button"
          className={`roll-mode-btn${rollMode === 'disadvantage' ? ' active' : ''}`}
          onClick={() => setRollMode('disadvantage')}
        >
          ⬇ Dezavantaj
        </button>
        <button
          type="button"
          className={`roll-mode-btn${rollMode === 'normal' ? ' active' : ''}`}
          onClick={() => setRollMode('normal')}
        >
          Normal
        </button>
        <button
          type="button"
          className={`roll-mode-btn${rollMode === 'advantage' ? ' active' : ''}`}
          onClick={() => setRollMode('advantage')}
        >
          ⬆ Avantaj
        </button>
      </div>

      {isGM && (
        <label className="toggle-field">
          <input
            type="checkbox"
            checked={secretMode}
            onChange={(e) => setSecretMode(e.target.checked)}
          />
          Gizli Zar (sadece GM görür)
        </label>
      )}

      <div className="dice-buttons">
        {DICE.map((sides) => (
          <button key={sides} type="button" className="btn-dice" onClick={() => rollDice(sides)}>
            d{sides}
          </button>
        ))}
      </div>

      <label className="volume-control dice-volume-control">
        🎲 Zar Sesi
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={diceVolume}
          onChange={(e) => setDiceVolume(parseFloat(e.target.value))}
        />
      </label>

      <div className="dice-stage">
        {!rollState && <p className="muted">Henüz zar atılmadı.</p>}

        {rollState && !rollState.mode && (
          <div className={rollState.stage === 'spinning' ? 'die-spin' : 'die-result'}>
            <span className={`die-face${rollState.stage === 'spinning' ? ' spinning' : ''}`}>
              {rollState.stage === 'spinning' ? `d${rollState.dice}` : mask(rollState.result, rollState.hidden)}
            </span>
            <span className="die-roller">
              {rollState.stage === 'spinning'
                ? `${rollState.roller} atıyor...`
                : `${rollState.roller} · d${rollState.dice}`}
            </span>
          </div>
        )}

        {rollState && rollState.mode && (
          <div className="die-dual">
            <div className="die-dual-pair">
              <span
                className={`die-face die-face-small${rollState.stage === 'spinning' ? ' spinning' : ''}${
                  winnerIndex === 0 ? ' die-face-winner' : winnerIndex === 1 ? ' die-face-loser' : ''
                }`}
              >
                {rollState.stage === 'spinning' ? `d${rollState.dice}` : mask(rollState.subRolls[0], rollState.hidden)}
              </span>
              <span
                className={`die-face die-face-small${rollState.stage !== 'reveal2' ? ' spinning' : ''}${
                  winnerIndex === 1 ? ' die-face-winner' : winnerIndex === 0 ? ' die-face-loser' : ''
                }`}
              >
                {rollState.stage === 'reveal2' ? mask(rollState.subRolls[1], rollState.hidden) : `d${rollState.dice}`}
              </span>
            </div>
            <span className="die-roller">
              {rollState.roller} · d{rollState.dice} ·{' '}
              {rollState.mode === 'advantage' ? '⬆ Avantaj' : '⬇ Dezavantaj'}
            </span>
          </div>
        )}
      </div>

      <ul className="roll-history">
        {[...rolls].reverse().map(([key, r]) => (
          <li key={key}>
            <span>{r.roller}</span>
            <span>
              d{r.dice}
              {r.mode === 'advantage' ? ' ⬆' : r.mode === 'disadvantage' ? ' ⬇' : ''}
            </span>
            <span className="roll-result">{key === hiddenKey ? '…' : displayResult(r)}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="btn-ghost sound-toggle dice-stats-toggle"
        onClick={() => setShowStats((v) => !v)}
      >
        📊 {showStats ? 'İstatistikleri Gizle' : 'İstatistikleri Göster'}
      </button>

      {showStats && (
        <div className="dice-stats">
          {statRows.length === 0 ? (
            <p className="muted">Henüz zar atılmadı.</p>
          ) : (
            <>
              <ul className="dice-stats-list">
                {statRows.map((r) => (
                  <li key={r.name}>
                    <span>{r.name}</span>
                    <span>{r.count} atış</span>
                    <span>%{Math.round(r.avgPct * 100)} ort.</span>
                  </li>
                ))}
              </ul>
              {luckiest && (
                <p className="dice-stats-highlight">
                  🍀 En şanslı: <strong>{luckiest.name}</strong>
                </p>
              )}
              {unluckiest && unluckiest.name !== luckiest?.name && (
                <p className="dice-stats-highlight">
                  💀 En şanssız: <strong>{unluckiest.name}</strong>
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
