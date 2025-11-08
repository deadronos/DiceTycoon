import Decimal from './decimal';
import { type Decimal as DecimalType } from '@patashu/break_eternity.js';
import type { GameState } from '../types/game';
import type { ComboResult } from '../types/combo';
import { detectCombo } from './combos';
import { rollDie } from './decimal';
import { applyRollOutcome } from './game-roll';

/**
 * Internal: clear rolling flag for all dice
 */
export function stopRollingAnimation(state: GameState): GameState {
  return {
    ...state,
    dice: state.dice.map(d => ({ ...d, isRolling: false })),
  };
}

/**
 * Core single-roll pipeline used by both manual rolls and offline autoroll.
 * Exposed for reuse by offline progress.
 */
export function executeRoll(
  state: GameState,
  options: { animate?: boolean } = {}
): { newState: GameState; creditsEarned: DecimalType; combo: ComboResult | null } {
  const { animate = true } = options;

  let totalCredits = new Decimal(0);
  const rolledFaces: number[] = [];

  const updatedDice = state.dice.map(die => {
    if (!die.unlocked) return die;

    const face = rollDie();
    rolledFaces.push(face);
    const credits = die.multiplier.times(face).times(die.id);
    totalCredits = totalCredits.plus(credits);

    return {
      ...die,
      currentFace: face,
      isRolling: animate ? true : false,
    };
  });

  const combo = detectCombo(rolledFaces);

  return applyRollOutcome(state, {
    rolledFaces,
    baseCredits: totalCredits,
    combo,
    updatedDice,
  });
}
