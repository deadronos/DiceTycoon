import type { GameState } from '../types/game';
import { stopRollingAnimation } from './roll-helpers';
import Decimal from './decimal';
import { GAME_CONSTANTS } from './constants';
import { applyGlobalMultipliers } from './multipliers';

/**
 * Calculates and applies offline progress based on time passed since last save.
 * Uses a mathematical approximation instead of iterative simulation for performance.
 * @param state The current game state.
 * @param currentTime The current timestamp.
 * @returns The updated game state with offline progress applied.
 */
export function calculateOfflineProgress(state: GameState, currentTime: number): GameState {
  if (!state.autoroll.enabled || state.autoroll.level === 0) {
    return state;
  }

  const timeDiff = currentTime - state.lastSaveTimestamp;
  const cooldownMs = Math.max(
    state.autoroll.cooldown.toNumber() * 1000,
    GAME_CONSTANTS.AUTOROLL_MIN_COOLDOWN.toNumber() * 1000
  );
  const rollsPerformed = Math.floor(timeDiff / cooldownMs);

  if (rollsPerformed <= 0) return { ...state, lastSaveTimestamp: currentTime };

  // Calculate Average Roll Value
  let averageBaseCredits = new Decimal(0);
  let unlockedDiceCount = 0;

  for (const die of state.dice) {
    if (die.unlocked) {


      // Average face value of d6 is 3.5
      const avgFace = 3.5;
      const dieCredits = die.multiplier.times(avgFace);
      averageBaseCredits = averageBaseCredits.plus(dieCredits);

      unlockedDiceCount++;
    }
  }

  // Estimate Average Combo Multiplier
  let averageComboMultiplier = new Decimal(1.0);
  if (unlockedDiceCount >= 6) averageComboMultiplier = new Decimal(1.20);
  else if (unlockedDiceCount >= 5) averageComboMultiplier = new Decimal(1.15);
  else if (unlockedDiceCount >= 4) averageComboMultiplier = new Decimal(1.10);
  else if (unlockedDiceCount >= 3) averageComboMultiplier = new Decimal(1.05);
  else if (unlockedDiceCount >= 2) averageComboMultiplier = new Decimal(1.01);

  // Apply multipliers to average
  let averageCreditsPerRoll = averageBaseCredits.times(averageComboMultiplier);
  averageCreditsPerRoll = applyGlobalMultipliers(averageCreditsPerRoll, state);

  const totalOfflineCredits = averageCreditsPerRoll.times(rollsPerformed);

  // Update stats
  const totalCreditsEarned = state.stats.totalCreditsEarned.plus(totalOfflineCredits);

  // Stop any rolling animations
  const workingState: GameState = stopRollingAnimation(state);

  return {
    ...workingState,
    credits: workingState.credits.plus(totalOfflineCredits),
    totalRolls: workingState.totalRolls + rollsPerformed,
    stats: {
      ...workingState.stats,
      totalCreditsEarned,
    },
    lastSaveTimestamp: currentTime,
  };
}
