import { describe, it, expect, beforeEach } from 'vitest';
import {
  defaultBindings,
  loadBindings,
  saveBindings,
  actionForEvent,
  keyDisplay,
  isTypingTarget,
} from '../shortcuts.js';

function press(key, tagName = 'BODY', extra = {}) {
  return { key, target: { tagName }, preventDefault() {}, ...extra };
}

beforeEach(() => {
  localStorage.clear();
});

describe('bindings', () => {
  it('starts from the defaults', () => {
    expect(loadBindings().map).toBe('m');
  });

  it('round-trips a custom binding', () => {
    saveBindings({ ...defaultBindings(), map: 'h' });
    expect(loadBindings().map).toBe('h');
  });

  it('ignores a corrupt store', () => {
    localStorage.setItem('rolltable_shortcuts', '{not json');
    expect(loadBindings()).toEqual(defaultBindings());
  });
});

describe('actionForEvent', () => {
  const bindings = defaultBindings();

  it('matches a bound key', () => {
    expect(actionForEvent(press('m'), bindings)).toBe('map');
  });

  it('is case-insensitive', () => {
    expect(actionForEvent(press('M'), bindings)).toBe('map');
  });

  it('stays out of the way while typing', () => {
    expect(actionForEvent(press('m', 'INPUT'), bindings)).toBeNull();
    expect(actionForEvent(press('Enter', 'TEXTAREA'), bindings)).toBeNull();
  });

  it('still closes on Escape while typing', () => {
    expect(actionForEvent(press('Escape', 'INPUT'), bindings)).toBe('close');
  });

  it('ignores modifier combinations', () => {
    expect(actionForEvent(press('m', 'BODY', { ctrlKey: true }), bindings)).toBeNull();
  });

  it('returns null for unbound keys', () => {
    expect(actionForEvent(press('q'), bindings)).toBeNull();
  });

  it('follows a remapped key', () => {
    const custom = { ...bindings, map: 'h' };
    expect(actionForEvent(press('h'), custom)).toBe('map');
    expect(actionForEvent(press('m'), custom)).toBeNull();
  });
});

describe('helpers', () => {
  it('formats keys for display', () => {
    expect(keyDisplay('m')).toBe('M');
    expect(keyDisplay('Escape')).toBe('Esc');
  });

  it('detects editable targets', () => {
    expect(isTypingTarget({ tagName: 'INPUT' })).toBe(true);
    expect(isTypingTarget({ tagName: 'DIV', isContentEditable: true })).toBe(true);
    expect(isTypingTarget({ tagName: 'DIV' })).toBe(false);
  });
});
