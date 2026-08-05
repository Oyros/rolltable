import { describe, it, expect } from 'vitest';
import { resolveLevelReward, levelOverrides, describeReward, levelKey } from '../levelRewards.js';
import { configGroups } from '../traitGroups.js';

const legacy = { traits: [], perks: [] };
const configured = {
  traitGroups: [
    { id: 'traits', name: 'Yetenekler' },
    { id: 'grp_x', name: 'Büyüler' },
  ],
  levelRewards: {
    default: { statPoints: 1, picks: { grp_x: 1 } },
    byLevel: { [levelKey(3)]: { statPoints: 2, picks: { traits: 1, grp_x: 2 } } },
  },
};

describe('resolveLevelReward', () => {
  it('keeps the old behaviour when nothing is configured', () => {
    expect(resolveLevelReward(legacy, 2)).toEqual({ statPoints: 1, picks: { perks: 1 } });
  });

  it('uses the general rule for ordinary levels', () => {
    expect(resolveLevelReward(configured, 2)).toEqual({ statPoints: 1, picks: { grp_x: 1 } });
  });

  it('prefers a level-specific rule', () => {
    expect(resolveLevelReward(configured, 3)).toEqual({
      statPoints: 2,
      picks: { traits: 1, grp_x: 2 },
    });
  });

  it('drops zero counts', () => {
    const cfg = { levelRewards: { default: { statPoints: 0, picks: { a: 0 } } } };
    expect(resolveLevelReward(cfg, 5)).toEqual({ statPoints: 0, picks: {} });
  });
});

describe('levelOverrides', () => {
  it('lists configured levels in order', () => {
    expect(levelOverrides(configured).map((o) => o.level)).toEqual([3]);
  });

  it('is empty without overrides', () => {
    expect(levelOverrides(legacy)).toEqual([]);
  });
});

describe('describeReward', () => {
  const groups = configGroups(configured);

  it('names each part', () => {
    expect(describeReward(resolveLevelReward(configured, 3), groups)).toBe(
      '2 stat puanı + 1 yetenekler seçimi + 2 büyüler seçimi'
    );
  });

  it('says so when there is nothing', () => {
    expect(describeReward({ statPoints: 0, picks: {} }, groups)).toBe('ödül yok');
  });
});
