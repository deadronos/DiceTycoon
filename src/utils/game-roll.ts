import Decimal, { type Decimal as DecimalType } from '@patashu/break_eternity.js';
import type { GameState, ComboChainStats, GameStats } from '../types/game';
import type { ComboResult } from '../types/combo';
import { getComboMultiplier } from './combos';
import { applyPrestigeMultipliers } from './game-logic';
import { evaluateAchievements } from './achievements';
import { createDefaultStats } from './storage';

const CHAIN_BONUS_STEP = new Decimal(0.1);

const ensureStats = (stats?: GameStats): GameStats => stats ?? createDefaultStats();

export function prepareComboChain(state: GameState, combo: ComboResult | null): {
  multiplier: DecimalType;
  chain: ComboChainStats;
} {
  // ...existing logic moved from game-logic.ts
  const stats = ensureStats(state.stats);
  const previous = stats.comboChain;

  if (!combo) {
    return {
      multiplier: new Decimal(1),
      chain: {
        current: 0,
        best: previous.best,
        lastComboRoll: null,
        history: previous.history,
      },
    };
  }

  const isConsecutive = previous.lastComboRoll === state.totalRolls;
  const currentChain = isConsecutive ? previous.current + 1 : 1;
  const bestChain = Math.max(previous.best, currentChain);
  const chainBonus = new Decimal(1).plus(CHAIN_BONUS_STEP.times(Math.max(currentChain - 1, 0)));
  const historyEntry = {
    timestamp: Date.now(),
    combo,
    chain: currentChain,
  };

  return {
    multiplier: chainBonus,
    chain: {
      current: currentChain,
      best: bestChain,
      lastComboRoll: state.totalRolls + 1,
      history: [historyEntry, ...previous.history].slice(0, 5),
    },
  };
}

export function updateStatsAfterRoll(
  state: GameState,
  finalCredits: DecimalType,
  rolledFaces: number[],
  comboChain: ComboChainStats
): GameStats {
  const stats = ensureStats(state.stats);
  const isNewBest = finalCredits.gt(stats.bestRoll);
  const bestRoll = isNewBest ? finalCredits : stats.bestRoll;
  const bestRollFaces = isNewBest ? rolledFaces : stats.bestRollFaces;
  const totalCreditsEarned = stats.totalCreditsEarned.plus(finalCredits);
  const recentRolls = [finalCredits.toString(), ...stats.recentRolls].slice(0, 25);

  return {
    ...stats,
    bestRoll,
    bestRollFaces,
    totalCreditsEarned,
    recentRolls,
    lastRollCredits: finalCredits,
    comboChain,
  };
}

export function applyRollOutcome(
  state: GameState,
  params: {
    rolledFaces: number[];
    baseCredits: DecimalType;
    combo: ComboResult | null;
    updatedDice?: GameState['dice'];
  }
): { newState: GameState; creditsEarned: DecimalType; combo: ComboResult | null } {
  const { rolledFaces, baseCredits, combo, updatedDice } = params;
  const { multiplier: chainMultiplier, chain } = prepareComboChain(state, combo);

  let finalCredits = baseCredits;
  if (combo) finalCredits = finalCredits.times(getComboMultiplier(combo));
  finalCredits = finalCredits.times(chainMultiplier);
  finalCredits = applyPrestigeMultipliers(finalCredits, state);

  const updatedStats = updateStatsAfterRoll(state, finalCredits, rolledFaces, chain);
  const baseState: GameState = {
    ...state,
    credits: state.credits.plus(finalCredits),
    totalRolls: state.totalRolls + 1,
    dice: updatedDice ?? state.dice,
    stats: updatedStats,
  };

  const achievementContextState: GameState = { ...baseState, achievements: state.achievements };
  const achievements = evaluateAchievements(state.achievements, {
    state: achievementContextState,
    stats: updatedStats,
    finalCredits,
    combo,
  });

  return {
    newState: {
      ...baseState,
      achievements,
    },
    creditsEarned: finalCredits,
    combo,
  };
}
