import { describe, it, expect } from 'vitest';
import {
  configGroups,
  groupEntries,
  entryAvailableTo,
  selectableEntries,
  levelUpGroup,
  NO_GROUPS,
} from '../traitGroups.js';

describe('configGroups', () => {
  it('falls back to the original two for old rooms', () => {
    expect(configGroups({}).map((g) => g.name)).toEqual(['Traitler', 'Perkler']);
  });

  it('uses configured groups when present', () => {
    const cfg = { traitGroups: [{ id: 'traits', name: 'Yetenekler' }] };
    expect(configGroups(cfg).map((g) => g.name)).toEqual(['Yetenekler']);
  });

  it('honours the deleted-everything sentinel', () => {
    expect(configGroups({ traitGroups: NO_GROUPS })).toEqual([]);
  });
});

describe('entryAvailableTo', () => {
  const restricted = { id: 'e1', classes: ['c_mage'] };
  const bySubclass = { id: 'e2', subclasses: ['sc_tank'] };
  const open = { id: 'e3' };

  it('offers unrestricted entries to everyone', () => {
    expect(entryAvailableTo(open, {})).toBe(true);
  });

  it('matches on class', () => {
    expect(entryAvailableTo(restricted, { classId: 'c_mage' })).toBe(true);
    expect(entryAvailableTo(restricted, { classId: 'c_rogue' })).toBe(false);
  });

  it('matches on subclass', () => {
    expect(entryAvailableTo(bySubclass, { subclassId: 'sc_tank' })).toBe(true);
    expect(entryAvailableTo(bySubclass, {})).toBe(false);
  });
});

describe('selectableEntries', () => {
  const entries = [{ id: 'a', classes: ['c_mage'] }, { id: 'b' }];

  it('filters by availability', () => {
    expect(selectableEntries(entries, {}, []).map((e) => e.id)).toEqual(['b']);
  });

  it('keeps an already-chosen entry so it can still be removed', () => {
    expect(selectableEntries(entries, {}, ['a']).map((e) => e.id)).toEqual(['a', 'b']);
  });
});

describe('levelUpGroup', () => {
  it('prefers the original perks group', () => {
    expect(levelUpGroup(configGroups({})).id).toBe('perks');
  });

  it('falls back to the second group when perks is gone', () => {
    const groups = configGroups({
      traitGroups: [
        { id: 'traits', name: 'A' },
        { id: 'grp_x', name: 'B' },
      ],
    });
    expect(levelUpGroup(groups).name).toBe('B');
  });
});

describe('groupEntries', () => {
  it('reads a group from the config', () => {
    expect(groupEntries({ traits: [{ id: 't1' }] }, 'traits')).toHaveLength(1);
    expect(groupEntries({}, 'traits')).toEqual([]);
  });
});
