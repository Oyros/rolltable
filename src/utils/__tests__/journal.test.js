import { describe, it, expect } from 'vitest';
import { canUndo, journalList, nextUndoable } from '../journal.js';

const journal = {
  a: { label: 'Mekan silindi', byId: 'p1', at: 100 },
  b: { label: 'Hasar', byId: 'gm', at: 200 },
  c: { label: 'Görev silindi', byId: 'p1', at: 300, undone: true },
};

describe('journalList', () => {
  it('shows a player only their own actions, newest first', () => {
    expect(journalList(journal, 'p1', false).map(([id]) => id)).toEqual(['c', 'a']);
  });

  it('shows the GM everything', () => {
    expect(journalList(journal, 'gm', true).map(([id]) => id)).toEqual(['c', 'b', 'a']);
  });
});

describe('canUndo', () => {
  it('lets a player undo their own', () => {
    expect(canUndo(journal.a, 'p1', false)).toBe(true);
  });

  it("refuses someone else's for a player", () => {
    expect(canUndo(journal.b, 'p1', false)).toBe(false);
  });

  it('lets the GM undo anyone', () => {
    expect(canUndo(journal.a, 'gm', true)).toBe(true);
  });

  it('refuses an already-undone entry', () => {
    expect(canUndo(journal.c, 'gm', true)).toBe(false);
  });
});

describe('nextUndoable', () => {
  it('skips entries that were already undone', () => {
    expect(nextUndoable(journal, 'p1', false)[0]).toBe('a');
  });

  it('takes the newest the GM may undo', () => {
    expect(nextUndoable(journal, 'gm', true)[0]).toBe('b');
  });

  it('is null when there is nothing left', () => {
    expect(nextUndoable({ c: journal.c }, 'p1', false)).toBeNull();
  });
});
