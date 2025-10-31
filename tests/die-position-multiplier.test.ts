import { describe, it, expect, vi } from 'vitest';
import { performRoll } from '../src/utils/game-logic';
import { getComboMultiplier } from '../src/utils/combos';
import { createDefaultGameState } from '../src/utils/storage';
import Decimal from '@patashu/break_eternity.js';
import * as decimalUtils from '../src/utils/decimal';

describe('Die Position Multiplier', () => {
  it('multiplies die roll by die position (die.id)', () => {
    // Mock rollDie to return a fixed value for testing
    vi.spyOn(decimalUtils, 'rollDie').mockReturnValue(6);
    
    const state = createDefaultGameState();
    // Unlock first two dice
    state.dice[0].unlocked = true;
    state.dice[0].multiplier = new Decimal(1);
    state.dice[1].unlocked = true;
    state.dice[1].multiplier = new Decimal(1);
    
    const { creditsEarned, combo } = performRoll(state);
    
    // Die 1: face(6) * multiplier(1) * die.id(1) = 6
    // Die 2: face(6) * multiplier(1) * die.id(2) = 12
    // Total base: 18, may be multiplied by combo multiplier
    const baseTotal = 18;
    const multiplier = combo ? getComboMultiplier(combo).toNumber() : 1;
    expect(creditsEarned.toNumber()).toBeCloseTo(baseTotal * multiplier);
    
    vi.restoreAllMocks();
  });

  it('applies position multiplier to third die', () => {
    vi.spyOn(decimalUtils, 'rollDie').mockReturnValue(5);
    
    const state = createDefaultGameState();
    // Unlock first three dice
    state.dice[0].unlocked = true;
    state.dice[0].multiplier = new Decimal(2);
    state.dice[1].unlocked = true;
    state.dice[1].multiplier = new Decimal(2);
    state.dice[2].unlocked = true;
    state.dice[2].multiplier = new Decimal(2);
    
    const { creditsEarned: credits2, combo: combo2 } = performRoll(state);

    const baseTotal2 = 60;
    const multiplier2 = combo2 ? getComboMultiplier(combo2).toNumber() : 1;
    expect(credits2.toNumber()).toBeCloseTo(baseTotal2 * multiplier2);
    
    vi.restoreAllMocks();
  });

  it('higher-numbered dice earn more credits', () => {
    vi.spyOn(decimalUtils, 'rollDie').mockReturnValue(4);
    
    const state = createDefaultGameState();
    // Unlock all six dice with same multiplier
    state.dice.forEach(die => {
      die.unlocked = true;
      die.multiplier = new Decimal(1);
    });
    
    const { creditsEarned: credits3, combo: combo3 } = performRoll(state);

    const baseTotal3 = 84;
    const multiplier3 = combo3 ? getComboMultiplier(combo3).toNumber() : 1;
    expect(credits3.toNumber()).toBeCloseTo(baseTotal3 * multiplier3);
    
    vi.restoreAllMocks();
  });
});
