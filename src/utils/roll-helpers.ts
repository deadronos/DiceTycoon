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
 * @param isExtraRoll Whether this is an extra roll triggered recursively (to prevent infinite loops).
 * @returns The result of the roll (new state, credits earned, combo).
 */
export function executeRoll(
  state: GameState,
  options: { animate?: boolean } = {},
  isExtraRoll = false
): { newState: GameState; creditsEarned: DecimalType; combo: ComboResult | null } {
  const { animate = true } = options;

  let totalCredits = new Decimal(0);
  const rolledFaces: number[] = [];
  let extraRollTriggered = false;

  const updatedDice = state.dice.map((die) => {
    if (!die.unlocked) return die;

    // Ability: Die 5 (Lucky) - +5% chance for higher face values
    let face = rollDie();
    if (die.id === 5 && Math.random() < 0.05) {
       const secondRoll = rollDie();
       if (secondRoll > face) face = secondRoll;
    }

    rolledFaces.push(face);

    // Calculate credits for this die
    let credits = die.multiplier.times(face).times(die.id);

    // Ability: Die 2 (Buffer) - +10% multiplier to adjacent dice
    const die2 = state.dice.find(d => d.id === 2);
    if (die2 && die2.unlocked) {
        if (die.id === 1 || die.id === 3) {
             credits = credits.times(1.10);
        }
    }

    // Ability: Die 3 (Rusher) - 5% chance to trigger an immediate extra roll
    // Prevent recursive loop: only trigger if not already an extra roll
    if (!isExtraRoll && die.id === 3 && Math.random() < 0.05) {
        extraRollTriggered = true;
    }

    totalCredits = totalCredits.plus(credits);

    return {
      ...die,
      currentFace: face,
      isRolling: animate ? true : false,
    };
  });

  const combo = detectCombo(rolledFaces);

  // Ability: Die 4 (Combo Master) - Triples the value of combos it participates in
  let comboBonusMultiplier = new Decimal(1);
  if (combo) {
      const die4 = updatedDice.find(d => d.id === 4);
      if (die4 && die4.unlocked) {
           if (combo.kind === 'flush' || die4.currentFace === combo.face || (combo.isMultiCombo && combo.multiCombo && die4.currentFace === combo.multiCombo.face)) {
               comboBonusMultiplier = new Decimal(3);
           }
      }
  }

  let result = applyRollOutcome(state, {
    rolledFaces,
    baseCredits: totalCredits,
    combo,
    updatedDice,
    comboBonusMultiplier
  });

  if (extraRollTriggered) {
      // Execute another roll without animation (immediate)
      // Pass isExtraRoll=true to prevent infinite loops if chance is mocked to 100%
      const extraResult = executeRoll(result.newState, { animate: false }, true);

      result = {
          newState: extraResult.newState,
          creditsEarned: result.creditsEarned.plus(extraResult.creditsEarned),
          combo: result.combo
      };
  }

  return result;
}
