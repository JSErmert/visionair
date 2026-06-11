// lib/theme/settings.test.ts
// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { parseSettings, serialize, applyToDocument, DEFAULTS } from './settings';

describe('parseSettings', () => {
  it('returns defaults for null', () => {
    expect(parseSettings(null)).toEqual(DEFAULTS);
  });
  it('returns defaults for non-JSON', () => {
    expect(parseSettings('{not json')).toEqual(DEFAULTS);
  });
  it('round-trips a valid object', () => {
    const v = { theme: 'light' as const, aurora: false, primary: '#112233', secondary: '#445566' };
    expect(parseSettings(serialize(v))).toEqual(v);
  });
  it('falls back per-field on invalid values', () => {
    const raw = JSON.stringify({ theme: 'purple', aurora: 'yes', primary: 'blue', secondary: '#zzzzzz' });
    expect(parseSettings(raw)).toEqual(DEFAULTS);
  });
});

describe('applyToDocument', () => {
  it('sets data attributes and aurora vars on the element', () => {
    const html = document.documentElement;
    applyToDocument({ theme: 'light', aurora: false, primary: '#112233', secondary: '#445566' }, html);
    expect(html.dataset.theme).toBe('light');
    expect(html.dataset.aurora).toBe('off');
    expect(html.style.getPropertyValue('--aurora-1')).toBe('#112233');
    expect(html.style.getPropertyValue('--aurora-2')).toBe('#445566');
  });
});
