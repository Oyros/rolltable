import { configGroups, levelUpGroup } from './traitGroups.js';

// What a character gets when they reach a given level. Shape in gameConfig:
//   levelRewards: {
//     default: { statPoints: 1, picks: { <groupId>: 1 } },
//     byLevel: { lvl3: { statPoints: 2, picks: { grp_x: 1 } } }
//   }
// Level keys are prefixed so Firebase can't turn the map into a sparse array.
export function levelKey(level) {
  return `lvl${level}`;
}

function toCount(value, fallback = 0) {
  const n = parseInt(value, 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

function normalizeRule(rule) {
  const picks = {};
  Object.entries(rule?.picks || {}).forEach(([groupId, count]) => {
    const n = toCount(count);
    if (n > 0) picks[groupId] = n;
  });
  return { statPoints: toCount(rule?.statPoints, 0), picks };
}

// Rooms that never configured this keep the original behaviour: +1 to one
// stat and one entry from the perk-style category.
function legacyRule(gameConfig) {
  const perkGroup = levelUpGroup(configGroups(gameConfig));
  return {
    statPoints: 1,
    picks: perkGroup ? { [perkGroup.id]: 1 } : {},
  };
}

export function resolveLevelReward(gameConfig, level) {
  const cfg = gameConfig?.levelRewards;
  if (!cfg) return legacyRule(gameConfig);
  const specific = cfg.byLevel?.[levelKey(level)];
  return normalizeRule(specific || cfg.default || {});
}

export function defaultRule(gameConfig) {
  const cfg = gameConfig?.levelRewards;
  if (!cfg) return legacyRule(gameConfig);
  return normalizeRule(cfg.default || {});
}

// [{ level, rule }] sorted by level, for the rules editor.
export function levelOverrides(gameConfig) {
  const byLevel = gameConfig?.levelRewards?.byLevel || {};
  return Object.entries(byLevel)
    .map(([key, rule]) => ({ level: parseInt(String(key).replace('lvl', ''), 10), rule: normalizeRule(rule) }))
    .filter((o) => Number.isFinite(o.level))
    .sort((a, b) => a.level - b.level);
}

// A one-line human summary used in the level-up wizard and the rules editor.
export function describeReward(rule, groups) {
  const parts = [];
  if (rule.statPoints > 0) parts.push(`${rule.statPoints} stat puanı`);
  Object.entries(rule.picks).forEach(([groupId, count]) => {
    const name = groups.find((g) => g.id === groupId)?.name || groupId;
    parts.push(`${count} ${name.toLowerCase()} seçimi`);
  });
  return parts.length > 0 ? parts.join(' + ') : 'ödül yok';
}
