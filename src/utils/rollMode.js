const ROLL_MODE_KEY = 'rolltable_roll_mode';
const VALID_MODES = ['normal', 'advantage', 'disadvantage'];

export function getRollMode() {
  const raw = localStorage.getItem(ROLL_MODE_KEY);
  return VALID_MODES.includes(raw) ? raw : 'normal';
}

export function setRollMode(mode) {
  if (VALID_MODES.includes(mode)) {
    localStorage.setItem(ROLL_MODE_KEY, mode);
  }
}

export function rollModeLabel(mode = getRollMode()) {
  if (mode === 'advantage') return '1d20 (Avantaj) + bonus at';
  if (mode === 'disadvantage') return '1d20 (Dezavantaj) + bonus at';
  return '1d20 + bonus at';
}
