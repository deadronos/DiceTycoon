import Decimal from './decimal';
import { type Decimal as DecimalType } from '@patashu/break_eternity.js';
import type { GameState } from '../types/game';
import type { ComboResult } from '../types/combo';
import { detectCombo } from './combos';
import { rollDie } from './decimal';
import { applyRollOutcome } from './game-roll';

/**
 * Stops rolling animations for all dice in the state.
 * @param state The current game state.
 * @returns The game state with rolling flags cleared.
 */
export function stopRollingAnimation(state: GameState): GameState {
  return {
    ...state,
    dice: state.dice.map(d => ({ ...d, isRolling: false })),
  };
}

/**
 * Executes a single roll operation, including die rolling, combo detection, and applying outcomes.
 * @param state The current game state.
 * @param options Configuration options for the roll (e.g., whether to animate).
 * @returns The result of the roll (new state, credits earned, combo).
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
