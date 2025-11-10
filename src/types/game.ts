import { type Decimal as DecimalType } from '@patashu/break_eternity.js';
import type { ComboResult } from './combo';

export interface DieState {
  id: number;
  unlocked: boolean;
  level: number;
  multiplier: DecimalType;
  animationLevel: number;
  currentFace: number;
  isRolling: boolean;
}

export interface AutorollState {
  enabled: boolean;
  level: number;
  cooldown: DecimalType;
  dynamicBatch: boolean;
  batchThresholdMs: number;
  maxRollsPerTick: number;
  animationBudget: number;
}

export interface GameSettings {
  sound: boolean;
  formatting: 'suffixed' | 'scientific' | 'engineering';
  theme: 'dark' | 'light';
}

export interface ComboHistoryEntry {
  timestamp: number;
  combo: ComboResult;
  chain: number;
}

export interface ComboChainStats {
  current: number;
  best: number;
  lastComboRoll: number | null;
  history: ComboHistoryEntry[];
}

export interface AutorollSessionStats {
  startedAt: number | null;
  creditsEarned: DecimalType;
  rolls: number;
}

export interface GameStats {
  bestRoll: DecimalType;
  bestRollFaces: number[];
  totalCreditsEarned: DecimalType;
  recentRolls: string[];
  lastRollCredits: DecimalType;
  comboChain: ComboChainStats;
  autoroll: AutorollSessionStats;
}

export interface AchievementState {
  unlocked: string[];
  newlyUnlocked: string[];
}

export interface SerializedComboChainStats {
  current: number;
  best: number;
  lastComboRoll: number | null;
  history: Array<ComboHistoryEntry>;
}

export interface SerializedAutorollStats {
  startedAt: number | null;
  creditsEarned: string;
  rolls: number;
}

export interface SerializedAutorollState {
  enabled: boolean;
  level: number;
  cooldown: string;
  dynamicBatch: boolean;
  batchThresholdMs: number;
  maxRollsPerTick: number;
  animationBudget: number;
}

export interface SerializedGameStats {
  bestRoll: string;
  bestRollFaces: number[];
  totalCreditsEarned: string;
  recentRolls: string[];
  lastRollCredits: string;
  comboChain: SerializedComboChainStats;
  autoroll: SerializedAutorollStats;
}

export interface GameState {
  credits: DecimalType;
  dice: DieState[];
  autoroll: AutorollState;
  settings: GameSettings;
  totalRolls: number;
  lastSaveTimestamp: number;
  stats: GameStats;
  achievements: AchievementState;
  // Prestige / ascension state
  prestige?: {
    luckPoints: DecimalType;
    luckTier: number;
    totalPrestiges: number;
    shop: Record<string, number>; // key -> purchaseLevel
    consumables: {
      rerollTokens: number;
    };
  };
}

export interface SerializedGameState {
  credits: string;
  dice: Array<Omit<DieState, 'multiplier' | 'cooldown'> & { multiplier: string }>;
  autoroll: SerializedAutorollState;
  settings: GameSettings;
  totalRolls: number;
  lastSaveTimestamp: number;
  stats?: SerializedGameStats;
  achievements?: AchievementState;
  prestige?: {
    luckPoints: string;
    luckTier: number;
    totalPrestiges: number;
    shop: Record<string, number>;
    consumables: {
      rerollTokens: number;
    };
  };
  version: string;
}

export interface GameConstants {
  MAX_DICE: number;
  DIE_FACES: number;
  BASE_UNLOCK_COST: DecimalType;
  UNLOCK_COST_MULTIPLIER: DecimalType;
  BASE_LEVEL_COST: DecimalType;
  LEVEL_COST_GROWTH: DecimalType;
  BASE_MULTIPLIER: DecimalType;
  MULTIPLIER_PER_LEVEL: DecimalType;
  BASE_AUTOROLL_COOLDOWN: DecimalType;
  AUTOROLL_COOLDOWN_REDUCTION: DecimalType;
  AUTOROLL_UNLOCK_COST: DecimalType;
  AUTOROLL_UPGRADE_COST: DecimalType;
  AUTOROLL_COST_GROWTH: DecimalType;
  ANIMATION_UNLOCK_COST: DecimalType;
  MAX_ANIMATION_LEVEL: number;
  MAX_DIE_LEVEL: number;
}
