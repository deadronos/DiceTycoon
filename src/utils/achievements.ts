import Decimal from './decimal';
import { type Decimal as DecimalType } from '@patashu/break_eternity.js';
import type { GameState, AchievementState, GameStats } from '../types/game';
import type { ComboResult } from '../types/combo';

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  hidden?: boolean;
  check: (context: AchievementContext) => boolean;
}

export interface AchievementContext {
  state: GameState;
  stats: GameStats;
  finalCredits: DecimalType;
  combo: ComboResult | null;
}

const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'first-steps',
    name: 'First Steps',
    description: 'Perform 100 total rolls.',
    check: ({ state }) => state.totalRolls >= 100,
  },
  {
    id: 'hot-hand',
    name: 'Hot Hand',
    description: 'Reach a combo chain of 3 or higher.',
    check: ({ stats }) => stats.comboChain.best >= 3,
  },
  {
    id: 'high-roller',
    name: 'High Roller',
    description: 'Earn at least 1 million credits in a single roll.',
    check: ({ stats }) => stats.bestRoll.gte(new Decimal(1_000_000)),
  },
  {
    id: 'prestige-awakening',
    name: 'Prestige Awakening',
    description: 'Prestige at least once.',
    check: ({ state }) => (state.prestige?.totalPrestiges ?? 0) > 0,
  },
  {
    id: 'full-house',
    name: 'Full Collection',
    description: 'Unlock all dice slots.',
    check: ({ state }) => state.dice.every(die => die.unlocked),
  },
];

export function evaluateAchievements(
  current: AchievementState,
  context: AchievementContext
): AchievementState {
  const unlocked = new Set(current.unlocked);
  const newlyUnlocked: string[] = [];

  for (const achievement of ACHIEVEMENTS) {
    if (unlocked.has(achievement.id)) {
      continue;
    }

    try {
      if (achievement.check(context)) {
        unlocked.add(achievement.id);
        newlyUnlocked.push(achievement.id);
      }
    } catch (err) {
      console.error('Failed to evaluate achievement', achievement.id, err);
    }
  }

  return {
    unlocked: Array.from(unlocked),
    newlyUnlocked,
  };
}

export function getAchievementDefinitions(): AchievementDefinition[] {
  return ACHIEVEMENTS;
}
