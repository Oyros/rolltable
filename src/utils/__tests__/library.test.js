import { describe, it, expect } from 'vitest';
import {
  entryLabel,
  entryCaption,
  groupByFolder,
  folderNames,
  filterEntries,
  UNFILED,
} from '../library.js';

const entries = [
  ['a', { label: "Ali'nin Atölyesi", caption: 'Demirci', folder: 'Şehir' }],
  ['b', { label: 'İskele', caption: 'Liman' }],
  ['c', { name: 'Eski Han' }],
];

describe('entryLabel / entryCaption', () => {
  it('prefers the newer fields', () => {
    expect(entryLabel(entries[0][1])).toBe("Ali'nin Atölyesi");
    expect(entryCaption(entries[0][1])).toBe('Demirci');
  });

  it('falls back to the legacy name for both', () => {
    expect(entryLabel({ name: 'Eski' })).toBe('Eski');
    expect(entryCaption({ name: 'Eski' })).toBe('Eski');
  });

  it('treats an explicitly empty caption as empty', () => {
    expect(entryCaption({ name: 'Eski', caption: '' })).toBe('');
  });
});

describe('groupByFolder', () => {
  it('puts unfiled entries last', () => {
    expect(groupByFolder(entries).map(([folder]) => folder)).toEqual(['Şehir', UNFILED]);
  });
});

describe('folderNames', () => {
  it('lists only real folders', () => {
    expect(folderNames(entries)).toEqual(['Şehir']);
  });
});

describe('filterEntries', () => {
  it('returns everything for an empty query', () => {
    expect(filterEntries(entries, '  ')).toHaveLength(3);
  });

  it('matches the label case-insensitively in Turkish', () => {
    expect(filterEntries(entries, 'ALİ').map(([id]) => id)).toEqual(['a']);
  });

  it('matches the caption and the folder too', () => {
    expect(filterEntries(entries, 'liman').map(([id]) => id)).toEqual(['b']);
    expect(filterEntries(entries, 'şehir').map(([id]) => id)).toEqual(['a']);
  });

  it('matches a legacy name', () => {
    expect(filterEntries(entries, 'han').map(([id]) => id)).toEqual(['c']);
  });

  it('returns nothing when there is no match', () => {
    expect(filterEntries(entries, 'zzz')).toHaveLength(0);
  });
});
