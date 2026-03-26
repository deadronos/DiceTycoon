import { describe, it, expect, vi } from 'vitest';
import { performRoll } from '../src/utils/game-logic';
import { getComboMultiplier } from '../src/utils/combos';
import { createDefaultGameState } from '../src/utils/storage';
import Decimal from '@patashu/break_eternity.js';
import * as decimalUtils from '../src/utils/decimal';

describe('Die Position Multiplier', () => {
  it('does not multiply die roll by die position anymore (position multiplier removed)', () => {
    vi.spyOn(decimalUtils, 'rollDie').mockReturnValue(6);
    
    const state = createDefaultGameState();
    state.dice[0].unlocked = true;
    state.dice[0].multiplier = new Decimal(1);
    state.dice[1].unlocked = true;
    state.dice[1].multiplier = new Decimal(1);
    
    const { creditsEarned, combo } = performRoll(state, { suppressPerRollUI: true });
    
    // Die 1: face(6) * multiplier(1) = 6
    // Die 2 (Buffer): face(6) * multiplier(1) = 6
    // Buffer buffs Die 1 by 1.1x -> Die 1 = 6.6
    const baseTotal = 6.6 + 6; // 12.6

    let multiplier = 1;
    if (combo) {
       multiplier = getComboMultiplier(combo).toNumber();
    }
    expect(creditsEarned.toNumber()).toBeCloseTo(baseTotal * multiplier);
    
    vi.restoreAllMocks();
  });

  it('calculates third die correctly without position multiplier', () => {
    vi.spyOn(decimalUtils, 'rollDie').mockReturnValue(5);
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    
    const state = createDefaultGameState();
    state.dice[0].unlocked = true;
    state.dice[0].multiplier = new Decimal(2);
    state.dice[1].unlocked = true;
    state.dice[1].multiplier = new Decimal(2);
    state.dice[2].unlocked = true;
    state.dice[2].multiplier = new Decimal(2);
    
    const { creditsEarned: credits2, combo: combo2 } = performRoll(state, { suppressPerRollUI: true });

    // Die 1: face(5) * 2 = 10 -> Buffed by Die 2 (1.1x) -> 11
    // Die 2: face(5) * 2 = 10
    // Die 3: face(5) * 2 = 10 -> Buffed by Die 2 (1.1x) -> 11
    const baseTotal2 = 32;
    let multiplier2 = 1;
    if (combo2) multiplier2 = getComboMultiplier(combo2).toNumber();

    expect(credits2.toNumber()).toBeCloseTo(baseTotal2 * multiplier2);
    
    vi.restoreAllMocks();
  });

  it('evaluates all dice correctly', () => {
    vi.spyOn(decimalUtils, 'rollDie').mockReturnValue(4);
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    
    const state = createDefaultGameState();
    state.dice.forEach(die => {
      die.unlocked = true;
      die.multiplier = new Decimal(1);
    });
    
    // Face 4 on all. Multiplier 1 on all.
    // Die 1: 4 * 1.10 = 4.4
    // Die 2: 4
    // Die 3: 4 * 1.10 = 4.4
    // Die 4: 4
    // Die 5: 4
    // Die 6: 4
    // Base Sum = 24.8

    // Combo: 6 of a Kind (4s).
    // Combo Master triples combo value -> 1.6 * 3 = 4.8.
    // Tycoon: Global Multiplier +5% -> 1.05.

    // Total = 24.8 * 4.8 * 1.05 = 124.992

    const { creditsEarned: credits3 } = performRoll(state, { suppressPerRollUI: true });

    expect(credits3.toNumber()).toBeCloseTo(124.992);
    
    vi.restoreAllMocks();
  });
});
