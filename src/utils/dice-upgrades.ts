import { type Decimal as DecimalType } from '@patashu/break_eternity.js';
import type { GameState } from '../types/game';
import { GAME_CONSTANTS } from './constants';
import { calculateCost, calculateMultiplier } from './decimal';

/** Cost helpers */

/**
 * Calculates the cost to unlock a specific die slot.
 * @param dieId The 1-based index of the die.
 * @returns The cost in credits.
 */
export function getUnlockCost(dieId: number): DecimalType {
  return GAME_CONSTANTS.BASE_UNLOCK_COST.times(
    GAME_CONSTANTS.UNLOCK_COST_MULTIPLIER.pow(dieId - 1)
  );
}

/**
 * Calculates the cost to level up a die.
 * @param currentLevel The current level of the die.
 * @returns The cost for the next level.
 */
export function getLevelUpCost(currentLevel: number): DecimalType {
  return calculateCost(
    GAME_CONSTANTS.BASE_LEVEL_COST,
    GAME_CONSTANTS.LEVEL_COST_GROWTH,
    currentLevel
  );
}

/**
 * Calculates the cost to unlock the next animation level for a die.
 * @param currentLevel The current animation level.
 * @returns The cost in credits.
 */
export function getAnimationUnlockCost(currentLevel: number): DecimalType {
  return GAME_CONSTANTS.ANIMATION_UNLOCK_COST.times(currentLevel + 1);
}

/** Dice upgrade operations */

/**
 * Unlocks a die slot if affordable.
 * @param state The current game state.
 * @param dieId The ID of the die to unlock.
 * @returns The updated game state, or null if failed.
 */
export function unlockDie(state: GameState, dieId: number): GameState | null {
  const die = state.dice.find(d => d.id === dieId);
  if (!die || die.unlocked) return null;
  const cost = getUnlockCost(dieId);
  if (state.credits.lt(cost)) return null;
  return {
    ...state,
    credits: state.credits.minus(cost),
    dice: state.dice.map(d =>
      d.id === dieId
        ? { ...d, unlocked: true, level: 1, multiplier: GAME_CONSTANTS.BASE_MULTIPLIER }
        : d
    ),
  };
}

/**
 * Levels up a die if affordable.
 * @param state The current game state.
 * @param dieId The ID of the die to upgrade.
 * @returns The updated game state, or null if failed.
 */
export function levelUpDie(state: GameState, dieId: number): GameState | null {
  const die = state.dice.find(d => d.id === dieId);
  if (!die || !die.unlocked) return null;
  if (die.level >= GAME_CONSTANTS.MAX_DIE_LEVEL) return null;
  const cost = getLevelUpCost(die.level);
  if (state.credits.lt(cost)) return null;
  const newLevel = die.level + 1;
  const newMultiplier = calculateMultiplier(
    GAME_CONSTANTS.BASE_MULTIPLIER,
    newLevel,
    GAME_CONSTANTS.MULTIPLIER_PER_LEVEL
  );
  return {
    ...state,
    credits: state.credits.minus(cost),
    dice: state.dice.map(d =>
      d.id === dieId
        ? { ...d, level: newLevel, multiplier: newMultiplier }
        : d
    ),
  };
}

/**
 * Unlocks the next animation level for a die if affordable.
 * @param state The current game state.
 * @param dieId The ID of the die.
 * @returns The updated game state, or null if failed.
 */
export function unlockAnimation(state: GameState, dieId: number): GameState | null {
  const die = state.dice.find(d => d.id === dieId);
  if (!die || !die.unlocked || die.animationLevel >= GAME_CONSTANTS.MAX_ANIMATION_LEVEL) {
    return null;
  }
  const cost = getAnimationUnlockCost(die.animationLevel);
  if (state.credits.lt(cost)) return null;
  return {
    ...state,
    credits: state.credits.minus(cost),
    dice: state.dice.map(d =>
      d.id === dieId
        ? { ...d, animationLevel: d.animationLevel + 1 }
        : d
    ),
  };
}
