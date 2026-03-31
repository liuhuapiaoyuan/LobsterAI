import { describe, it, expect } from 'vitest';
import { parseShortcut, matchesShortcut } from './shortcuts';

describe('parseShortcut', () => {
  it('parses CmdOrCtrl+comma', () => {
    const p = parseShortcut('CmdOrCtrl+,');
    expect(p).not.toBeNull();
    expect(p!.commandOrControl).toBe(true);
    expect(p!.key).toBe(',');
  });

  it('parses escape', () => {
    const p = parseShortcut('Escape');
    expect(p?.key).toBe('escape');
  });

  it('returns null for empty', () => {
    expect(parseShortcut('')).toBeNull();
    expect(parseShortcut(undefined)).toBeNull();
  });
});

describe('matchesShortcut', () => {
  it('matches Ctrl+, when commandOrControl', () => {
    const ev = {
      key: ',',
      altKey: false,
      shiftKey: false,
      ctrlKey: true,
      metaKey: false,
    } as KeyboardEvent;
    expect(matchesShortcut(ev, 'CmdOrCtrl+,')).toBe(true);
  });

  it('does not match when key differs', () => {
    const ev = {
      key: 'a',
      altKey: false,
      shiftKey: false,
      ctrlKey: true,
      metaKey: false,
    } as KeyboardEvent;
    expect(matchesShortcut(ev, 'CmdOrCtrl+,')).toBe(false);
  });
});
