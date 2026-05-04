import { describe, it, expect } from 'vitest';
import { performPrestigeReset } from '../src/utils/game-prestige';
import { createDefaultGameState } from '../src/utils/storage';
import Decimal from '../src/utils/decimal';

describe('performPrestigeReset', () => {
  it('should reset credits and dice but preserve prestige points', () => {
    const state = createDefaultGameState();
    state.credits = new Decimal(10000);
    state.dice[0].level = 50;
    state.totalRolls = 1000;
    state.prestige = {
      luckPoints: new Decimal(25),
      luckTier: 1,
      totalPrestiges: 1,
      shop: { multiplier: 3 },
      consumables: { rerollTokens: 10 },
    };

    const result = performPrestigeReset(state);

    // Credits should be reset
    expect(result.credits.toString()).toBe('0');
    // First die should still be unlocked but reset to level 1
    expect(result.dice[0].unlocked).toBe(true);
    expect(result.dice[0].level).toBe(1);
    // Prestige points should be preserved and increased by luck gain
    // With 10000 credits, luck gain = floor(max(log10(10000)-2, 0) * 0.5) = floor(1) = 1
    // So 25 + 1 = 26
    expect(result.prestige!.luckPoints.toString()).toBe('26');
    expect(result.prestige!.totalPrestiges).toBe(2); // 1 original + 1 new prestige
    expect(result.prestige!.shop.multiplier).toBe(3);
    expect(result.prestige!.consumables.rerollTokens).toBe(10);
    // Stats should be reset
    expect(result.totalRolls).toBe(0);
  });

  it('should increment totalPrestiges when gaining luck', () => {
    const state = createDefaultGameState();
    state.credits = new Decimal(1000000); // Enough for significant luck gain
    state.prestige = {
      luckPoints: new Decimal(10),
      luckTier: 0,
      totalPrestiges: 0,
      shop: {},
      consumables: { rerollTokens: 0 },
    };

    const result = performPrestigeReset(state);

    expect(result.prestige!.totalPrestiges).toBeGreaterThan(0);
    expect(result.prestige!.luckPoints.gt(new Decimal(10))).toBe(true);
  });

  it('should preserve best roll stats across prestige', () => {
    const state = createDefaultGameState();
    state.stats.bestRoll = new Decimal(999);
    state.stats.bestRollFaces = [6, 6, 6, 6, 6, 6];
    state.prestige = {
      luckPoints: new Decimal(5),
      luckTier: 0,
      totalPrestiges: 0,
      shop: {},
      consumables: { rerollTokens: 0 },
    };

    const result = performPrestigeReset(state);

    expect(result.stats.bestRoll.toString()).toBe('999');
    expect(result.stats.bestRollFaces).toEqual([6, 6, 6, 6, 6, 6]);
  });

  it('should handle state with no previous prestige', () => {
    const state = createDefaultGameState();
    state.credits = new Decimal(5000);
    // No prestige field set

    const result = performPrestigeReset(state);

    expect(result.prestige).toBeDefined();
    expect(result.prestige!.luckPoints.gte(new Decimal(0))).toBe(true);
  });
});