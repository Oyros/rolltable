import { describe, it, expect } from 'vitest';
import { buildFeed, feedEntryLabel } from '../chatFeed.js';

const players = {
  p1: { name: 'Ali', whispers: { w1: { text: 'gizli', by: 'GM', byId: 'gm', at: 150 } } },
  p2: { name: 'Bekir' },
};
const chat = [['c1', { text: 'selam', by: 'Ali', at: 100 }]];
const sends = {
  s1: { title: 'Mektup', all: true, at: 120, by: 'GM' },
  s2: { title: 'Not', to: { p1: true }, at: 200, by: 'GM' },
};

describe('buildFeed', () => {
  it('merges the three streams in time order', () => {
    expect(buildFeed(chat, players, 'p1', false, sends).map((e) => e.kind)).toEqual([
      'chat',
      'handout',
      'whisper',
      'handout',
    ]);
  });

  it('hides a personal handout addressed to someone else', () => {
    const titles = buildFeed([], players, 'p2', false, sends).map((e) => e.title);
    expect(titles).toEqual(['Mektup']);
  });

  it('hides a whisper the viewer is not part of', () => {
    expect(buildFeed([], players, 'p2', false, {})).toHaveLength(0);
  });

  it('shows the GM everything', () => {
    expect(buildFeed(chat, players, 'gm', true, sends)).toHaveLength(4);
  });

  it('copes with empty inputs', () => {
    expect(buildFeed([], {}, 'p1', false, undefined)).toEqual([]);
  });
});

describe('feedEntryLabel', () => {
  it('labels each kind', () => {
    expect(feedEntryLabel({ kind: 'chat', author: 'Ali' })).toBe('Ali');
    expect(feedEntryLabel({ kind: 'handout' })).toBe('📜 Belge');
    expect(feedEntryLabel({ kind: 'system' })).toBe('📝');
    expect(feedEntryLabel({ kind: 'whisper', sentByMe: true, toName: 'Ali' })).toBe('🔒 → Ali');
    expect(feedEntryLabel({ kind: 'whisper', fromName: 'GM' })).toBe('🔒 GM');
  });
});
