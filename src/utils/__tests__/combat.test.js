import { describe, it, expect } from 'vitest';
import {
  hpResource,
  playerHealth,
  npcHealth,
  healthTone,
  applyDelta,
  clampHp,
  activeConditions,
} from '../combat.js';

const config = {
  resources: [
    { id: 'hp', name: 'Can Puanı', max: 20 },
    { id: 'stres', name: 'Stres', max: 10 },
  ],
  hpResourceId: 'hp',
  conditions: [
    { id: 'c1', icon: '🩸', name: 'Kanama' },
    { id: 'c2', icon: '😵', name: 'Sersem' },
  ],
};

describe('hpResource', () => {
  it('finds the designated resource', () => {
    expect(hpResource(config).name).toBe('Can Puanı');
  });

  it('is null when none is designated', () => {
    expect(hpResource({ resources: config.resources })).toBeNull();
  });
});

describe('playerHealth', () => {
  it('reads the resource off the player', () => {
    expect(playerHealth({ resources: { hp: 12 } }, config)).toMatchObject({ current: 12, max: 20 });
  });

  it('treats a missing value as full', () => {
    expect(playerHealth({}, config).current).toBe(20);
  });

  it('clamps a stored value above the maximum', () => {
    expect(playerHealth({ resources: { hp: 99 } }, config).current).toBe(20);
  });

  it('is null without a health resource', () => {
    expect(playerHealth({}, { resources: [] })).toBeNull();
  });
});

describe('npcHealth', () => {
  it('uses the library maximum and scene current', () => {
    expect(npcHealth({ maxHp: 12 }, { hp: 5 })).toEqual({ current: 5, max: 12 });
  });

  it('starts full when the scene has no record', () => {
    expect(npcHealth({ maxHp: 12 }, undefined).current).toBe(12);
  });

  it('is null when the NPC has no health defined', () => {
    expect(npcHealth({}, {})).toBeNull();
  });

  it('clamps to a lowered maximum', () => {
    expect(npcHealth({ maxHp: 4 }, { hp: 30 }).current).toBe(4);
  });
});

describe('healthTone', () => {
  it.each([
    [20, 'ok'],
    [12, 'hurt'],
    [5, 'critical'],
    [0, 'down'],
  ])('%i of 20 is %s', (value, tone) => {
    expect(healthTone(value, 20)).toBe(tone);
  });
});

describe('applyDelta', () => {
  it('subtracts damage', () => {
    expect(applyDelta(20, 20, -7)).toBe(13);
  });

  it('never drops below zero', () => {
    expect(applyDelta(3, 20, -99)).toBe(0);
  });

  it('never heals past the maximum', () => {
    expect(applyDelta(18, 20, 99)).toBe(20);
  });
});

describe('clampHp', () => {
  it('rounds and floors junk input', () => {
    expect(clampHp('abc', 20)).toBe(0);
    expect(clampHp(7.6, 20)).toBe(8);
  });
});

describe('activeConditions', () => {
  it('returns only the flagged ones, in rule order', () => {
    expect(activeConditions({ c2: true, c1: true }, config).map((c) => c.id)).toEqual(['c1', 'c2']);
  });

  it('is empty when nothing is set', () => {
    expect(activeConditions(undefined, config)).toEqual([]);
  });
});
