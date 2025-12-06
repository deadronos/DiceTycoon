import Decimal from './decimal';
import { type Decimal as DecimalType } from '@patashu/break_eternity.js';
import type { GameState, GameStats } from '../types/game';
import { GAME_CONSTANTS } from './constants';
import { calculateCost } from './decimal';
import { getAutorollCooldownMultiplier } from './game-prestige';

const ensureStats = (stats?: GameStats): GameStats => stats as GameStats;

/**
 * Calculates the cost to upgrade the auto-roller.
 * @param currentLevel The current level of the auto-roller.
 * @returns The cost in credits.
 */
export function getAutorollUpgradeCost(currentLevel: number): DecimalType {
  if (currentLevel === 0) {
    return GAME_CONSTANTS.AUTOROLL_UNLOCK_COST;
  }
  return calculateCost(
    GAME_CONSTANTS.AUTOROLL_UPGRADE_COST,
    GAME_CONSTANTS.AUTOROLL_COST_GROWTH,
    currentLevel
  );
}

/**
 * Calculates the cooldown duration for the auto-roller.
 * @param level The current level of the auto-roller.
 * @returns The cooldown in seconds.
 */
export function getAutorollCooldown(level: number): DecimalType {
  if (level === 0) return GAME_CONSTANTS.BASE_AUTOROLL_COOLDOWN;
  return GAME_CONSTANTS.BASE_AUTOROLL_COOLDOWN.times(
    GAME_CONSTANTS.AUTOROLL_COOLDOWN_REDUCTION.pow(level)
  );
}

function startAutorollSession(stats: GameStats) {
  return {
    ...stats.autoroll,
    startedAt: Date.now(),
    creditsEarned: new Decimal(0),
    rolls: 0,
  };
}

function stopAutorollSession(stats: GameStats) {
  return {
    ...stats.autoroll,
    startedAt: null,
  };
}

/**
 * Attempts to upgrade the auto-roller.
 * @param state The current game state.
 * @returns The updated game state, or null if failed.
 */
export function upgradeAutoroll(state: GameState): GameState | null {
  const cost = getAutorollUpgradeCost(state.autoroll.level);
  if (state.credits.lt(cost)) return null;

  const newLevel = state.autoroll.level + 1;
  const newCooldown = getAutorollCooldown(newLevel).times(
    getAutorollCooldownMultiplier(state)
  );

  const stats = ensureStats(state.stats);
  const autorollStats = newLevel === 1
    ? startAutorollSession(stats)
    : stats.autoroll;

  return {
    ...state,
    credits: state.credits.minus(cost),
    autoroll: {
      ...state.autoroll,
      enabled: true,
      level: newLevel,
      cooldown: newCooldown,
    },
    stats: {
      ...stats,
      autoroll: autorollStats,
    },
  };
}

/**
 * Toggles the auto-roller on or off.
 * @param state The current game state.
 * @returns The updated game state.
 */
export function toggleAutoroll(state: GameState): GameState {
  if (state.autoroll.level === 0) return state;

  const stats = ensureStats(state.stats);
  const isEnabling = !state.autoroll.enabled;

  return {
    ...state,
    autoroll: {
      ...state.autoroll,
      enabled: isEnabling,
    },
    stats: {
      ...stats,
      autoroll: isEnabling ? startAutorollSession(stats) : stopAutorollSession(stats),
    },
  };
}
