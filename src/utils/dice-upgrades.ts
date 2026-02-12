import { type Decimal as DecimalType } from '@patashu/break_eternity.js';
import type { GameState } from '../types/game';
import { GAME_CONSTANTS } from './constants';
import Decimal, { calculateCost, calculateMultiplier } from './decimal';

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
 * Calculates the cost for a bulk level up.
 * @param currentLevel The current level.
 * @param amount The number of levels to buy.
 * @returns The total cost.
 */
export function getBulkLevelUpCost(currentLevel: number, amount: number): DecimalType {
  const base = GAME_CONSTANTS.BASE_LEVEL_COST;
  const growth = GAME_CONSTANTS.LEVEL_COST_GROWTH;

  // Sum of geometric series: a * (r^n - 1) / (r - 1)
  // First term a = cost(currentLevel) = base * growth^currentLevel
  const firstTerm = calculateCost(base, growth, currentLevel);

  if (growth.eq(1)) {
    return firstTerm.times(amount);
  }

  const numerator = growth.pow(amount).minus(1);
  const denominator = growth.minus(1);
  return firstTerm.times(numerator).div(denominator);
}

/**
 * Calculates the maximum number of levels affordable with the given credits.
 * @param currentLevel The current level.
 * @param credits The available credits.
 * @returns The number of levels affordable (capped at MAX_DIE_LEVEL - currentLevel).
 */
export function getMaxAffordableLevels(currentLevel: number, credits: DecimalType): number {
  if (currentLevel >= GAME_CONSTANTS.MAX_DIE_LEVEL) return 0;

  const base = GAME_CONSTANTS.BASE_LEVEL_COST;
  const growth = GAME_CONSTANTS.LEVEL_COST_GROWTH;
  const a = calculateCost(base, growth, currentLevel); // Cost of next level

  if (credits.lt(a)) return 0;

  // Formula derived from Sum = a * (r^n - 1) / (r - 1)
  // credits >= a * (r^n - 1) / (r - 1)
  // credits * (r - 1) / a >= r^n - 1
  // r^n <= 1 + credits * (r - 1) / a
  // n <= log_r(1 + credits * (r - 1) / a)

  const rMinus1 = growth.minus(1);
  const term = credits.times(rMinus1).div(a).plus(1);
  // Add small epsilon to handle precision issues where 2.0 might be 1.9999999999
  const n = Decimal.log10(term).div(Decimal.log10(growth)).plus(1e-9).floor().toNumber();

  const maxPossible = GAME_CONSTANTS.MAX_DIE_LEVEL - currentLevel;
  return Math.min(n, maxPossible);
}

/**
 * Calculates the cost to unlock the next animation level for a die.
 * @param currentLevel The current animation level.
 * @returns The cost in credits.
 */
export function getAnimationUnlockCost(currentLevel: number): DecimalType {
  return GAME_CONSTANTS.ANIMATION_UNLOCK_COST.times(currentLevel + 1);
}

/**
 * Gets the next milestone level for a given current level.
 * @param currentLevel The current level.
 * @returns The next milestone level, or undefined if no more milestones.
 */
export function getNextMilestone(currentLevel: number): number | undefined {
  return GAME_CONSTANTS.MILESTONE_LEVELS.find(l => l > currentLevel);
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
 * @param amount The number of levels to purchase (default 1).
 * @returns The updated game state, or null if failed.
 */
export function levelUpDie(state: GameState, dieId: number, amount: number = 1): GameState | null {
  const die = state.dice.find(d => d.id === dieId);
  if (!die || !die.unlocked) return null;
  if (die.level >= GAME_CONSTANTS.MAX_DIE_LEVEL) return null;

  const levelsToBuy = Math.min(amount, GAME_CONSTANTS.MAX_DIE_LEVEL - die.level);
  if (levelsToBuy <= 0) return null;

  const cost = getBulkLevelUpCost(die.level, levelsToBuy);

  if (state.credits.lt(cost)) return null;

  const newLevel = die.level + levelsToBuy;
  const newMultiplier = calculateMultiplier(
    GAME_CONSTANTS.BASE_MULTIPLIER,
    newLevel,
    GAME_CONSTANTS.MULTIPLIER_PER_LEVEL,
    {
      levels: GAME_CONSTANTS.MILESTONE_LEVELS,
      bonus: GAME_CONSTANTS.MILESTONE_MULTIPLIER
    }
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
