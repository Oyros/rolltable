import { ref, push } from 'firebase/database';
import { db } from '../firebase.js';
import { rollFormula } from './diceFormula.js';

export function statBonusFor(value, gameConfig) {
  if (value >= (gameConfig?.statThreshold3 ?? 8)) return 3;
  if (value >= (gameConfig?.statThreshold2 ?? 6)) return 2;
  if (value >= (gameConfig?.statThreshold1 ?? 4)) return 1;
  return 0;
}

export function rollStat({ roomCode, rollerName, statName, statValue, gameConfig }) {
  const bonus = statBonusFor(statValue, gameConfig);
  const { subRolls, result } = rollFormula({ count: 1, sides: 20, modifier: bonus });
  push(ref(db, `rooms/${roomCode}/rolls`), {
    roller: rollerName,
    kind: 'formula',
    formula: `${statName} (1d20${bonus >= 0 ? '+' : ''}${bonus})`,
    subRolls,
    modifier: bonus,
    dice: 20,
    result,
    at: Date.now(),
    hidden: false,
  });
}
