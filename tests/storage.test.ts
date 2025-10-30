import { describe, it, expect, beforeEach } from 'vitest';
import { safeSave, safeLoad } from '../src/utils/storage';
import { toDecimal } from '../src/utils/decimal';

const KEY = 'test-storage-key';

beforeEach(() => {
  try { localStorage.removeItem(KEY); } catch (_error) { /* ignore */ }
});

describe('storage.safeSave / safeLoad', () => {
  it('roundtrips credits and dice multipliers', () => {
    const state = {
      credits: toDecimal('12345'),
      dice: [{ id: 0, multiplier: toDecimal(2).toString() }, { id: 1, multiplier: toDecimal(1.5).toString() }],
      autoroll: true,
      cooldownMs: 1500,
      autorollLevel: 2,
    };
    safeSave(KEY, state);
    const loaded = safeLoad(KEY, null);
    expect(loaded).toBeTruthy();
    expect(typeof loaded.credits.toString).toBe('function');
    expect(loaded.credits.toString()).toBe('12345');
    expect(Array.isArray(loaded.dice)).toBe(true);
    expect(loaded.dice[0].multiplier).toBe('2');
  });

  it('returns fallback for missing key', () => {
    const loaded = safeLoad('no-such-key', { ok: true });
    expect(loaded).toEqual({ ok: true });
  });

  it('handles malformed JSON gracefully', () => {
    localStorage.setItem(KEY, '{not: valid json');
    const loaded = safeLoad(KEY, { ok: false });
    expect(loaded).toEqual({ ok: false });
  });
});
