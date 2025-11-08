import { describe, it, expect } from 'vitest';
import Decimal from '../src/utils/decimal';
import { calculateCost } from '../src/utils/decimal';

// Light coverage for core decimal helpers that game logic relies on.

describe('game-logic decimal helpers', () => {
  it('calculateCost grows with level', () => {
    const baseCost = new Decimal(10);
    const growth = new Decimal(1.5);

    const cost1 = calculateCost(baseCost, growth, 1);
    const cost3 = calculateCost(baseCost, growth, 3);

    expect(cost3.gt(cost1)).toBe(true);
  });
});
