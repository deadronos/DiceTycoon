import { describe, it, expect } from 'vitest';
import { toDecimal } from '../src/utils/decimal';

// Import the functions under test by simulating small snippets of the app logic
// We won't import the whole App component; instead test arithmetic helpers and formulas used by App.

describe('Decimal cost arithmetic', () => {
  it('level up cost subtracts correctly', () => {
    const starting = toDecimal(1000);
    const level = 0;
    // cost = 50 * (1.5 ^ level) => 50
    const cost = toDecimal(50).times(toDecimal(1.5).pow(toDecimal(level)));
    const remaining = starting.sub(cost);
    expect(remaining.toString()).toBe(toDecimal(950).toString());
  });

  it('exact afford leaves zero', () => {
    const starting = toDecimal(50);
    const cost = toDecimal(50);
    const canAfford = starting.gte(cost);
    expect(canAfford).toBe(true);
    const remaining = starting.sub(cost);
    expect(remaining.toString()).toBe(toDecimal(0).toString());
  });

  it('large numbers handle pow', () => {
    const big = toDecimal('1e50');
    const mult = toDecimal(2).pow(toDecimal(10)); // 1024
    const result = big.times(mult);
    // result should equal 1.024e53
    expect(result.toString().startsWith('1.024')).toBe(true);
  });
});
