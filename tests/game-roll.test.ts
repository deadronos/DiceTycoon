import { describe, it, expect } from 'vitest';
import { rollDie } from '../src/utils/decimal';

// Smoke coverage: rollDie returns value in [1,6].

describe('game-roll helpers', () => {
  it('rollDie returns values between 1 and 6', () => {
    for (let i = 0; i < 10; i++) {
      const value = rollDie();
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(6);
    }
  });
});
