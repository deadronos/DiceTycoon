import { describe, it, expect, vi } from 'vitest';
import Decimal from '../src/utils/decimal';
import { getBulkLevelUpCost, getMaxAffordableLevels } from '../src/utils/dice-upgrades';
import { calculateMultiplier } from '../src/utils/decimal';
import { executeRoll } from '../src/utils/roll-helpers';
import { GAME_CONSTANTS } from '../src/utils/constants';
import { createDefaultGameState } from '../src/utils/storage';
import { GameState } from '../src/types/game';

describe('Feature: Bulk Level Up', () => {
  it('calculates bulk cost correctly for amount=1', () => {
    // cost = base * growth^level
    const cost1 = getBulkLevelUpCost(1, 1);
    const expected = GAME_CONSTANTS.BASE_LEVEL_COST.times(GAME_CONSTANTS.LEVEL_COST_GROWTH.pow(1));
    expect(cost1.eq(expected)).toBe(true);
  });

  it('calculates bulk cost for amount > 1', () => {
    // manual sum
    const base = GAME_CONSTANTS.BASE_LEVEL_COST;
    const growth = GAME_CONSTANTS.LEVEL_COST_GROWTH;
    const level = 1;

    // cost for level 1: base * growth^1
    // cost for level 2: base * growth^2
    const cost1 = base.times(growth.pow(1));
    const cost2 = base.times(growth.pow(2));
    const expected = cost1.plus(cost2);

    const bulkCost = getBulkLevelUpCost(1, 2);
    // Allow small floating point diffs if any, but Decimal should be precise enough
    expect(bulkCost.toNumber()).toBeCloseTo(expected.toNumber());
  });

  it('calculates max affordable levels', () => {
    const cost1 = getBulkLevelUpCost(1, 1);
    const cost2 = getBulkLevelUpCost(1, 2); // total cost for 2 levels

    // Exact cost for 1 level
    expect(getMaxAffordableLevels(1, cost1)).toBe(1);

    // Exact cost for 2 levels
    expect(getMaxAffordableLevels(1, cost2)).toBe(2);

    // Slightly less than cost for 2 levels
    expect(getMaxAffordableLevels(1, cost2.minus(0.1))).toBe(1);

    // Zero credits
    expect(getMaxAffordableLevels(1, new Decimal(0))).toBe(0);
  });
});

describe('Feature: Milestones', () => {
  it('applies milestone multiplier', () => {
    const base = new Decimal(1);
    const growth = new Decimal(2); // easy numbers
    const milestones = { levels: [10], bonus: new Decimal(10) };

    // Level 9: base * growth^8
    const m9 = calculateMultiplier(base, 9, growth, milestones);
    expect(m9.toNumber()).toBe(1 * Math.pow(2, 8));

    // Level 10: base * growth^9 * bonus^1
    const m10 = calculateMultiplier(base, 10, growth, milestones);
    expect(m10.toNumber()).toBeCloseTo(1 * Math.pow(2, 9) * 10);

    // Level 11: base * growth^10 * bonus^1
    const m11 = calculateMultiplier(base, 11, growth, milestones);
    expect(m11.toNumber()).toBeCloseTo(1 * Math.pow(2, 10) * 10);
  });
});

describe('Feature: Critical Roll', () => {
  it('triggers critical roll based on random chance', () => {
    // Mock Math.random to return 0 (force crit)
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);

    const state = createDefaultGameState();
    state.dice[0].unlocked = true;

    const result = executeRoll(state, { animate: false });

    expect(result.isCritical).toBe(true);
    // Should be multiplied by BASE_CRIT_MULTIPLIER
    // But calculate exact credits is hard because of random faces.
    // We can assume creditsEarned > base calculation.

    randomSpy.mockRestore();
  });

  it('does not trigger critical roll if random > chance', () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.99);

    const state = createDefaultGameState();
    state.dice[0].unlocked = true;

    const result = executeRoll(state, { animate: false });

    expect(result.isCritical).toBe(false);

    randomSpy.mockRestore();
  });
});
