import { newId } from './id.js';

// Trait/perk style pick-lists. Rooms started before this existed have exactly
// two, stored under the fixed `traits` and `perks` keys — that stays the
// fallback, so nothing needs migrating. A GM can now rename them and add more;
// the definitions then live in `gameConfig.traitGroups` and each group's
// entries under `gameConfig[groupId]` (players' picks likewise at
// `player[groupId]`).
export const DEFAULT_GROUPS = [
  { id: 'traits', name: 'Traitler' },
  { id: 'perks', name: 'Perkler' },
];

// Firebase can't store an empty array, so "the GM deleted every category" is
// written as this sentinel instead — otherwise it would read back as absent
// and silently resurrect the two defaults.
export const NO_GROUPS = 'none';

export function configGroups(gameConfig) {
  const groups = gameConfig?.traitGroups;
  if (groups === NO_GROUPS) return [];
  if (Array.isArray(groups) && groups.length > 0) {
    return groups
      .filter((g) => g && g.id)
      .map((g) => ({ id: g.id, name: (g.name || '').trim() || 'Kategori' }));
  }
  return DEFAULT_GROUPS;
}

export function groupEntries(gameConfig, groupId) {
  return gameConfig?.[groupId] || [];
}

export function newGroupId() {
  return `grp_${newId('grp')}`;
}

// An entry with no restriction is open to everyone; otherwise the character's
// class or subclass has to be on the list.
export function entryAvailableTo(entry, player) {
  const classes = entry?.classes || [];
  const subclasses = entry?.subclasses || [];
  if (classes.length === 0 && subclasses.length === 0) return true;
  if (player?.classId && classes.includes(player.classId)) return true;
  if (player?.subclassId && subclasses.includes(player.subclassId)) return true;
  return false;
}

// What the player may tick: everything open to them, plus anything they
// already have (so a class change can't strand a pick they can't remove).
export function selectableEntries(entries, player, selectedIds) {
  return entries.filter(
    (e) => entryAvailableTo(e, player) || (selectedIds || []).includes(e.id)
  );
}

// The group the level-up wizard hands out from: the original perks list when
// it's still there, otherwise the second group.
export function levelUpGroup(groups) {
  return groups.find((g) => g.id === 'perks') || groups[1] || null;
}

export function restrictionLabel(entry, classes, subclasses) {
  const names = [
    ...(entry?.classes || []).map((id) => classes.find((c) => c.id === id)?.name),
    ...(entry?.subclasses || []).map((id) => subclasses.find((s) => s.id === id)?.name),
  ].filter(Boolean);
  return names.length === 0 ? 'Herkese açık' : `Sadece: ${names.join(', ')}`;
}
