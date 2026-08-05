// Combat state on the map. Pure helpers — no Firebase here, so the rules can
// be reasoned about and tested on their own.
//
// Player health is *the same value* as the resource on their character sheet
// (the GM designates which resource counts as health), so the map and the
// sheet can never drift apart. NPCs have no sheet, so their current health
// lives on the scene under npcState and their maximum comes from the focus
// library entry.

export function hpResource(gameConfig) {
  const resources = gameConfig?.resources || [];
  const id = gameConfig?.hpResourceId;
  if (!id) return null;
  return resources.find((r) => r.id === id) || null;
}

export function clampHp(value, max) {
  const n = Math.round(Number(value) || 0);
  return Math.min(Math.max(0, n), Math.max(0, max));
}

// { current, max } or null when this entity has no health to show.
export function playerHealth(player, gameConfig) {
  const res = hpResource(gameConfig);
  if (!res) return null;
  const max = Number(res.max) || 0;
  if (max <= 0) return null;
  const current = player?.resources?.[res.id];
  return { current: clampHp(current ?? max, max), max, resourceId: res.id, name: res.name };
}

export function npcHealth(npcEntry, npcState) {
  const max = Number(npcEntry?.maxHp) || 0;
  if (max <= 0) return null;
  const current = npcState?.hp;
  return { current: clampHp(current ?? max, max), max };
}

// Ratio drives the bar's colour: healthy → hurt → critical.
export function healthTone(current, max) {
  if (max <= 0) return 'ok';
  const ratio = current / max;
  if (ratio <= 0) return 'down';
  if (ratio <= 0.25) return 'critical';
  if (ratio <= 0.6) return 'hurt';
  return 'ok';
}

export function conditionList(gameConfig) {
  return (gameConfig?.conditions || []).filter((c) => c && c.id);
}

// The condition objects an entity currently carries, in the order the GM
// defined them.
export function activeConditions(conditionsMap, gameConfig) {
  const all = conditionList(gameConfig);
  return all.filter((c) => conditionsMap?.[c.id]);
}

export function conditionLabel(condition) {
  return `${condition.icon || '●'} ${condition.name}`;
}

// Positive amount heals, negative damages. Returns the new value, clamped.
export function applyDelta(current, max, delta) {
  return clampHp((Number(current) || 0) + delta, max);
}
