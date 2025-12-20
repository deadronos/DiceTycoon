import type { GameState } from '../types/game';
import { stopRollingAnimation } from './roll-helpers';
import Decimal from './decimal';
import { applyPrestigeMultipliers } from './game-prestige';

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
  const cooldownMs = state.autoroll.cooldown.toNumber() * 1000;
  const rollsPerformed = Math.floor(timeDiff / cooldownMs);

  if (rollsPerformed <= 0) return { ...state, lastSaveTimestamp: currentTime };

  // Calculate Average Roll Value
  let averageBaseCredits = new Decimal(0);
  let unlockedDiceCount = 0;

  for (const die of state.dice) {
    if (die.unlocked) {
      // Average face value of d6 is 3.5
      const avgFace = 3.5;
      const dieCredits = die.multiplier.times(avgFace).times(die.id);
      averageBaseCredits = averageBaseCredits.plus(dieCredits);
      unlockedDiceCount++;
    }
  }

  // Estimate Average Combo Multiplier
  // Conservative estimates based on probability
  let averageComboMultiplier = new Decimal(1.0);
  if (unlockedDiceCount >= 6) averageComboMultiplier = new Decimal(1.20);
  else if (unlockedDiceCount >= 5) averageComboMultiplier = new Decimal(1.15);
  else if (unlockedDiceCount >= 4) averageComboMultiplier = new Decimal(1.10);
  else if (unlockedDiceCount >= 3) averageComboMultiplier = new Decimal(1.05);
  else if (unlockedDiceCount >= 2) averageComboMultiplier = new Decimal(1.01);

  // Apply multipliers
  let averageCreditsPerRoll = averageBaseCredits.times(averageComboMultiplier);
  averageCreditsPerRoll = applyPrestigeMultipliers(averageCreditsPerRoll, state);

  const totalOfflineCredits = averageCreditsPerRoll.times(rollsPerformed);

  // Update stats
  const totalCreditsEarned = state.stats.totalCreditsEarned.plus(totalOfflineCredits);

  // We do not simulate individual rolls for stats.bestRoll, achievements, etc. to keep it efficient.
  // We only give credits and update total rolls.

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
