import { ref, push } from 'firebase/database';
import { db } from '../firebase.js';
import { rollFormula } from './diceFormula.js';
import { getRollMode } from './rollMode.js';

export function statBonusFor(value, gameConfig) {
  if (value >= (gameConfig?.statThreshold3 ?? 8)) return 3;
  if (value >= (gameConfig?.statThreshold2 ?? 6)) return 2;
  if (value >= (gameConfig?.statThreshold1 ?? 4)) return 1;
  if (value <= (gameConfig?.statThresholdNeg3 ?? 0)) return -3;
  if (value <= (gameConfig?.statThresholdNeg2 ?? 1)) return -2;
  if (value <= (gameConfig?.statThresholdNeg1 ?? 2)) return -1;
  return 0;
}

export function rollStat({ roomCode, rollerName, statName, statValue, gameConfig }) {
  const bonus = statBonusFor(statValue, gameConfig);
  const mode = getRollMode();
  const formulaLabel = `${statName} (1d20${bonus >= 0 ? '+' : ''}${bonus})`;
  const payload = {
    roller: rollerName,
    kind: 'formula',
    formula: formulaLabel,
    modifier: bonus,
    dice: 20,
    at: Date.now(),
    hidden: false,
  };

  if (mode === 'advantage' || mode === 'disadvantage') {
    const r1 = Math.floor(Math.random() * 20) + 1;
    const r2 = Math.floor(Math.random() * 20) + 1;
    const chosen = mode === 'advantage' ? Math.max(r1, r2) : Math.min(r1, r2);
    payload.subRolls = [r1, r2];
    payload.result = chosen + bonus;
    payload.mode = mode;
  } else {
    const { subRolls, result } = rollFormula({ count: 1, sides: 20, modifier: bonus });
    payload.subRolls = subRolls;
    payload.result = result;
  }

  push(ref(db, `rooms/${roomCode}/rolls`), payload);
}
