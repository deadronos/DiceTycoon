import os

content = """import type { GameState } from '../types/game';
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
  let maxPossibleBaseCredits = new Decimal(0);
  let unlockedDiceCount = 0;

  for (const die of state.dice) {
    if (die.unlocked) {
      const posMult = new Decimal(1).plus(new Decimal(0.1).times(die.id - 1));

      // Average face value of d6 is 3.5
      const avgFace = 3.5;
      const dieCredits = die.multiplier.times(avgFace).times(posMult);
      averageBaseCredits = averageBaseCredits.plus(dieCredits);

      // Max face value is 6
      const maxDieCredits = die.multiplier.times(6).times(posMult);
      maxPossibleBaseCredits = maxPossibleBaseCredits.plus(maxDieCredits);

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
  averageCreditsPerRoll = applyPrestigeMultipliers(averageCreditsPerRoll, state);

  // Estimate a "Likely Best Roll" during this period
  // A "perfect" roll involves a Flush (2.0x) and all 6s.
  // Probability of Flush is ~1.5% with 6 dice. If rollsPerformed > 100, it's very likely.
  let likelyBestRoll = state.stats.bestRoll;
  if (rollsPerformed > 0) {
      let maxComboMult = new Decimal(1.0);
      if (unlockedDiceCount >= 6) maxComboMult = new Decimal(2.0); // Flush
      else if (unlockedDiceCount >= 3) maxComboMult = new Decimal(1.1); // Triple

      let potentialBest = maxPossibleBaseCredits.times(maxComboMult);
      potentialBest = applyPrestigeMultipliers(potentialBest, state);

      // If we performed enough rolls, we probably hit close to the max
      // Scale based on number of rolls (diminishing returns towards the potential max)
      const confidence = Math.min(rollsPerformed / 1000, 1.0);
      const estimatedBest = potentialBest.times(0.8 + 0.2 * confidence);

      if (estimatedBest.gt(likelyBestRoll)) {
          likelyBestRoll = estimatedBest;
      }
  }

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
      bestRoll: likelyBestRoll,
    },
    lastSaveTimestamp: currentTime,
  };
}
"""

with open('src/utils/offline-progress.ts', 'w') as f:
    f.write(content)
