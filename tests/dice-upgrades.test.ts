import { describe, it, expect } from 'vitest';
import { getLevelUpCost } from '../src/utils/dice-upgrades';

// Sanity: level-up costs should strictly increase with level.

describe('dice-upgrades', () => {
  it('produces increasing level up costs', () => {
    const cost1 = getLevelUpCost(1);
    const cost5 = getLevelUpCost(5);

    expect(cost5.gt(cost1)).toBe(true);
  });
});
