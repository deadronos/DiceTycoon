import { describe, it, expect, vi } from 'vitest';
import { performRoll } from '../src/utils/game-logic';
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
    
    const { creditsEarned } = performRoll(state);
    
    // Die 1: face(6) * multiplier(1) * die.id(1) = 6
    // Die 2: face(6) * multiplier(1) * die.id(2) = 12
    // Total: 6 + 12 = 18
    expect(creditsEarned.toNumber()).toBe(18);
    
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
    
    const { creditsEarned } = performRoll(state);
    
    // Die 1: face(5) * multiplier(2) * die.id(1) = 10
    // Die 2: face(5) * multiplier(2) * die.id(2) = 20
    // Die 3: face(5) * multiplier(2) * die.id(3) = 30
    // Total: 10 + 20 + 30 = 60
    expect(creditsEarned.toNumber()).toBe(60);
    
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
    
    const { creditsEarned } = performRoll(state);
    
    // Die 1: face(4) * multiplier(1) * die.id(1) = 4
    // Die 2: face(4) * multiplier(1) * die.id(2) = 8
    // Die 3: face(4) * multiplier(1) * die.id(3) = 12
    // Die 4: face(4) * multiplier(1) * die.id(4) = 16
    // Die 5: face(4) * multiplier(1) * die.id(5) = 20
    // Die 6: face(4) * multiplier(1) * die.id(6) = 24
    // Total: 4 + 8 + 12 + 16 + 20 + 24 = 84
    expect(creditsEarned.toNumber()).toBe(84);
    
    vi.restoreAllMocks();
  });
});
