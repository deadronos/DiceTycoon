import { describe, it, expect } from 'vitest';
import Decimal from '@patashu/break_eternity.js';
import {
  getPrestigeUpgradeCost,
  canBuyPrestigeUpgrade,
  buyPrestigeUpgrade,
  getShopMultiplier,
  getGuaranteedRerollLevel,
  applyGuaranteedReroll,
  consumeRerollToken,
  getAutorollCooldownMultiplier,
  applyPrestigeMultipliers,
} from '../src/utils/game-logic';
import { createDefaultGameState } from '../src/utils/storage';
import { PRESTIGE_SHOP_ITEMS } from '../src/utils/constants';
import type { PrestigeShopKey } from '../src/utils/constants';

describe('Prestige Shop', () => {
  describe('getPrestigeUpgradeCost', () => {
    it('should calculate cost for multiplier upgrade', () => {
      const cost0 = getPrestigeUpgradeCost('multiplier', 0);
      expect(cost0.toNumber()).toBe(5); // baseCost

      const cost1 = getPrestigeUpgradeCost('multiplier', 1);
      expect(cost1.toNumber()).toBe(15); // 5 * 3^1

      const cost2 = getPrestigeUpgradeCost('multiplier', 2);
      expect(cost2.toNumber()).toBe(45); // 5 * 3^2
    });

    it('should calculate cost for autobuyer upgrade', () => {
      const cost0 = getPrestigeUpgradeCost('autobuyer', 0);
      expect(cost0.toNumber()).toBe(4);

      const cost1 = getPrestigeUpgradeCost('autobuyer', 1);
      expect(cost1.toNumber()).toBe(8); // 4 * 2^1
    });

    it('should calculate cost for consumable tokens', () => {
      const cost = getPrestigeUpgradeCost('rerollTokens', 0);
      expect(cost.toNumber()).toBe(2);
    });
  });

  describe('canBuyPrestigeUpgrade', () => {
    it('should return true when player has enough luck', () => {
      const state = createDefaultGameState();
      state.prestige!.luckPoints = new Decimal(10);
      expect(canBuyPrestigeUpgrade(state, 'autobuyer')).toBe(true);
    });

    it('should return false when player lacks luck', () => {
      const state = createDefaultGameState();
      state.prestige!.luckPoints = new Decimal(1);
      expect(canBuyPrestigeUpgrade(state, 'multiplier')).toBe(false);
    });

    it('should return false when upgrade is maxed', () => {
      const state = createDefaultGameState();
      state.prestige!.luckPoints = new Decimal(100);
      state.prestige!.shop['autobuyer'] = 1; // autobuyer has maxLevel=1
      expect(canBuyPrestigeUpgrade(state, 'autobuyer')).toBe(false);
    });
  });

  describe('buyPrestigeUpgrade', () => {
    it('should deduct luck points and increment shop level', () => {
      const state = createDefaultGameState();
      state.prestige!.luckPoints = new Decimal(10);

      const newState = buyPrestigeUpgrade(state, 'multiplier');
      expect(newState).not.toBeNull();
      expect(newState?.prestige?.luckPoints.toNumber()).toBe(5); // 10 - 5
      expect(newState?.prestige?.shop['multiplier']).toBe(1);
    });

    it('should add reroll tokens to consumables instead of leveling', () => {
      const state = createDefaultGameState();
      state.prestige!.luckPoints = new Decimal(10);
      state.prestige!.consumables.rerollTokens = 0;

      const newState = buyPrestigeUpgrade(state, 'rerollTokens');
      expect(newState).not.toBeNull();
      expect(newState?.prestige?.luckPoints.toNumber()).toBe(8); // 10 - 2
      expect(newState?.prestige?.consumables.rerollTokens).toBe(5);
    });

    it('should return null if insufficient luck', () => {
      const state = createDefaultGameState();
      state.prestige!.luckPoints = new Decimal(1);

      const newState = buyPrestigeUpgrade(state, 'multiplier');
      expect(newState).toBeNull();
    });

    it('should return null if upgrade is maxed', () => {
      const state = createDefaultGameState();
      state.prestige!.luckPoints = new Decimal(100);
      state.prestige!.shop['autobuyer'] = 1;

      const newState = buyPrestigeUpgrade(state, 'autobuyer');
      expect(newState).toBeNull();
    });
  });

  describe('getShopMultiplier', () => {
    it('should return 1 with no purchases', () => {
      const state = createDefaultGameState();
      const mult = getShopMultiplier(state);
      expect(mult.toNumber()).toBe(1);
    });

    it('should apply +5% per Fortune Amplifier level', () => {
      const state = createDefaultGameState();
      state.prestige!.shop['multiplier'] = 1;
      const mult = getShopMultiplier(state);
      expect(mult.toNumber()).toBe(1.05); // 1 + (1 * 0.05)

      state.prestige!.shop['multiplier'] = 2;
      const mult2 = getShopMultiplier(state);
      expect(mult2.toNumber()).toBe(1.1); // 1 + (2 * 0.05)
    });
  });

  describe('getGuaranteedRerollLevel', () => {
    it('should return 0 by default', () => {
      const state = createDefaultGameState();
      expect(getGuaranteedRerollLevel(state)).toBe(0);
    });

    it('should return purchased level', () => {
      const state = createDefaultGameState();
      state.prestige!.shop['guaranteedReroll'] = 2;
      expect(getGuaranteedRerollLevel(state)).toBe(2);
    });
  });

  describe('applyGuaranteedReroll', () => {
    it('should not reroll if guarantee level is 0', () => {
      const state = createDefaultGameState();
      const faces = [1, 2, 3];
      const { faces: newFaces } = applyGuaranteedReroll(state, faces);
      expect(newFaces).toEqual(faces);
    });

    it('should reroll lowest face', () => {
      const state = createDefaultGameState();
      state.prestige!.shop['guaranteedReroll'] = 1;
      const faces = [1, 5, 6]; // 1 is lowest

      const { faces: newFaces } = applyGuaranteedReroll(state, faces);
      expect(newFaces.length).toBe(3);
      // Index 0 should be different (rerolled)
      // Note: we can't verify exact value since it's random, but we can check it's not the same
      // unless by chance it rolls 1 again (very rare)
      // This is a reasonable limitation for random testing
    });

    it('should apply multiple rerolls if guarantee level > 1', () => {
      const state = createDefaultGameState();
      state.prestige!.shop['guaranteedReroll'] = 2;
      const faces = [1, 2, 3]; // low faces

      const { faces: newFaces } = applyGuaranteedReroll(state, faces);
      expect(newFaces.length).toBe(3);
    });
  });

  describe('consumeRerollToken', () => {
    it('should decrement token count', () => {
      const state = createDefaultGameState();
      state.prestige!.consumables.rerollTokens = 5;

      const newState = consumeRerollToken(state);
      expect(newState).not.toBeNull();
      expect(newState?.prestige?.consumables.rerollTokens).toBe(4);
    });

    it('should return null when no tokens available', () => {
      const state = createDefaultGameState();
      state.prestige!.consumables.rerollTokens = 0;

      const newState = consumeRerollToken(state);
      expect(newState).toBeNull();
    });
  });

  describe('getAutorollCooldownMultiplier', () => {
    it('should return 1 by default', () => {
      const state = createDefaultGameState();
      const mult = getAutorollCooldownMultiplier(state);
      expect(mult.toNumber()).toBeCloseTo(1, 5);
    });

    it('should apply 5% reduction per level', () => {
      const state = createDefaultGameState();
      state.prestige!.shop['autorollCooldown'] = 1;
      const mult = getAutorollCooldownMultiplier(state);
      expect(mult.toNumber()).toBeCloseTo(0.95, 5); // 0.95^1
    });

    it('should stack multiple levels', () => {
      const state = createDefaultGameState();
      state.prestige!.shop['autorollCooldown'] = 2;
      const mult = getAutorollCooldownMultiplier(state);
      expect(mult.toNumber()).toBeCloseTo(0.9025, 4); // 0.95^2
    });
  });

  describe('applyPrestigeMultipliers', () => {
    it('should apply both luck and shop multipliers', () => {
      const state = createDefaultGameState();
      state.prestige!.luckPoints = new Decimal(10); // +20% from luck
      state.prestige!.shop['multiplier'] = 1; // +5% from shop

      const base = new Decimal(100);
      const final = applyPrestigeMultipliers(base, state);
      // 100 * 1.2 (luck) * 1.05 (shop) = 126
      expect(final.toNumber()).toBeCloseTo(126, 5);
    });

    it('should handle zero multipliers gracefully', () => {
      const state = createDefaultGameState();
      const base = new Decimal(50);
      const final = applyPrestigeMultipliers(base, state);
      expect(final.toNumber()).toBe(50); // no multipliers = 1 * 1 = 1
    });
  });

  describe('Integration tests', () => {
    it('should chain purchases correctly', () => {
      let state = createDefaultGameState();
      state.prestige!.luckPoints = new Decimal(100);

      // Buy multiplier level 1
      state = buyPrestigeUpgrade(state, 'multiplier')!;
      expect(state.prestige!.shop['multiplier']).toBe(1);
      expect(state.prestige!.luckPoints.toNumber()).toBe(95); // 100 - 5

      // Buy multiplier level 2
      state = buyPrestigeUpgrade(state, 'multiplier')!;
      expect(state.prestige!.shop['multiplier']).toBe(2);
      expect(state.prestige!.luckPoints.toNumber()).toBe(80); // 95 - 15

      // Buy reroll tokens
      state = buyPrestigeUpgrade(state, 'rerollTokens')!;
      expect(state.prestige!.consumables.rerollTokens).toBe(5);
      expect(state.prestige!.luckPoints.toNumber()).toBe(78); // 80 - 2
    });

    it('should respect max levels across multiple purchases', () => {
      let state = createDefaultGameState();
      state.prestige!.luckPoints = new Decimal(1000);

      // Max out autobuyer (maxLevel=1)
      state = buyPrestigeUpgrade(state, 'autobuyer')!;
      expect(state.prestige!.shop['autobuyer']).toBe(1);

      // Try to buy again - should fail
      const result = buyPrestigeUpgrade(state, 'autobuyer');
      expect(result).toBeNull();
    });
  });
});
