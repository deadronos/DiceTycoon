import Decimal from './decimal';
import { type Decimal as DecimalType } from '@patashu/break_eternity.js';
import type { GameState, AchievementState, GameStats } from '../types/game';
import type { ComboResult } from '../types/combo';

export interface AchievementReward {
  type: 'global_multiplier' | 'luck_points';
  value: DecimalType;
}

/**
 * Defines the structure for a single achievement in the game.
 */
export interface AchievementDefinition {
  /** Unique identifier for the achievement. */
  id: string;
  /** Display name of the achievement. */
  name: string;
  /** Description of the requirement to unlock the achievement. */
  description: string;
  /** Reward for unlocking the achievement. */
  reward?: AchievementReward;
  /** If true, the achievement details are hidden until unlocked. */
  hidden?: boolean;
  /**
   * Function to check if the achievement should be unlocked.
   * @param context The current game context.
   * @returns True if the achievement conditions are met.
   */
  check: (context: AchievementContext) => boolean;
}

/**
 * Context data passed to achievement checks.
 */
export interface AchievementContext {
  /** The full game state. */
  state: GameState;
  /** Current game statistics. */
  stats: GameStats;
  /** Credits earned in the current/last action. */
  finalCredits: DecimalType;
  /** The combo result from the current/last roll, if any. */
  combo: ComboResult | null;
}

const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'first-steps',
    name: 'First Steps',
    description: 'Perform 100 total rolls.',
    reward: { type: 'global_multiplier', value: new Decimal(0.01) }, // +1%
    check: ({ state }) => state.totalRolls >= 100,
  },
  {
    id: 'hot-hand',
    name: 'Hot Hand',
    description: 'Reach a combo chain of 3 or higher.',
    reward: { type: 'global_multiplier', value: new Decimal(0.02) }, // +2%
    check: ({ stats }) => stats.comboChain.best >= 3,
  },
  {
    id: 'high-roller',
    name: 'High Roller',
    description: 'Earn at least 1 million credits in a single roll.',
    reward: { type: 'luck_points', value: new Decimal(1) }, // 1 Luck Point
    check: ({ stats }) => stats.bestRoll.gte(new Decimal(1_000_000)),
  },
  {
    id: 'prestige-awakening',
    name: 'Prestige Awakening',
    description: 'Prestige at least once.',
    reward: { type: 'global_multiplier', value: new Decimal(0.05) }, // +5%
    check: ({ state }) => (state.prestige?.totalPrestiges ?? 0) > 0,
  },
  {
    id: 'full-house',
    name: 'Full Collection',
    description: 'Unlock all dice slots.',
    reward: { type: 'luck_points', value: new Decimal(5) }, // 5 Luck Points
    check: ({ state }) => state.dice.every(die => die.unlocked),
  },
];

/**
 * Evaluates all achievements against the current game state and unlocks any new ones.
 * @param current The current achievement state.
 * @param context The context data for evaluation.
 * @returns An object containing the new AchievementState and any one-time rewards to apply.
 */
export function evaluateAchievements(
  current: AchievementState,
  context: AchievementContext
): {
  achievements: AchievementState;
  luckPointsGained: DecimalType;
} {
  const unlocked = new Set(current.unlocked);
  const newlyUnlocked: string[] = [];
  let luckPointsGained = new Decimal(0);

  for (const achievement of ACHIEVEMENTS) {
    if (unlocked.has(achievement.id)) {
      continue;
    }

    try {
      if (achievement.check(context)) {
        unlocked.add(achievement.id);
        newlyUnlocked.push(achievement.id);

        if (achievement.reward?.type === 'luck_points') {
            luckPointsGained = luckPointsGained.plus(achievement.reward.value);
        }
      }
    } catch (err) {
      console.error('Failed to evaluate achievement', achievement.id, err);
    }
  }

  return {
    achievements: {
      unlocked: Array.from(unlocked),
      newlyUnlocked,
    },
    luckPointsGained,
  };
}

/**
 * Calculates the total global multiplier from unlocked achievements.
 * @param unlockedIds List of unlocked achievement IDs.
 * @returns The total multiplier (e.g., 1.05 for +5%).
 */
export function getAchievementGlobalMultiplier(unlockedIds: string[]): DecimalType {
  let multiplier = new Decimal(1);
  const unlockedSet = new Set(unlockedIds);

  for (const achievement of ACHIEVEMENTS) {
    if (unlockedSet.has(achievement.id) && achievement.reward?.type === 'global_multiplier') {
      multiplier = multiplier.plus(achievement.reward.value);
    }
  }
  return multiplier;
}

/**
 * Retrieves the list of all defined achievements.
 * @returns An array of AchievementDefinition objects.
 */
export function getAchievementDefinitions(): AchievementDefinition[] {
  return ACHIEVEMENTS;
}
