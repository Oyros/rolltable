const FORMULA_RE = /^(\d{1,2})d(\d{1,3})([+-]\d{1,3})?$/i;

export function parseFormula(input) {
  const match = FORMULA_RE.exec(input.trim());
  if (!match) return null;
  const count = parseInt(match[1], 10);
  const sides = parseInt(match[2], 10);
  const modifier = match[3] ? parseInt(match[3], 10) : 0;
  if (count < 1 || count > 20 || sides < 2 || sides > 1000) return null;
  return { count, sides, modifier };
}

export function rollFormula({ count, sides, modifier }) {
  const subRolls = Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1);
  const result = subRolls.reduce((sum, r) => sum + r, 0) + modifier;
  return { subRolls, result };
}

export function rollFudge() {
  const faces = [-1, -1, 0, 0, 1, 1];
  const subRolls = Array.from({ length: 4 }, () => faces[Math.floor(Math.random() * faces.length)]);
  const result = subRolls.reduce((sum, r) => sum + r, 0);
  return { subRolls, result };
}
