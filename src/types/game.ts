import { type Decimal as DecimalType } from '@patashu/break_eternity.js';
import type { ComboResult } from './combo';

/**
 * Represents the state of a single die in the game.
 */
export interface DieState {
  /** Unique identifier for the die. */
  id: number;
  /** Whether the die has been purchased/unlocked by the player. */
  unlocked: boolean;
  /** Current upgrade level of the die. */
  level: number;
  /** Current multiplier value applied to the die's roll. */
  multiplier: DecimalType;
  /** Animation level for the die (visual effect intensity). */
  animationLevel: number;
  /** The current face value showing on the die (e.g., 1-6). */
  currentFace: number;
  /** Whether the die is currently in a rolling animation state. */
  isRolling: boolean;
}

/**
 * The type of resource a die can focus on generating during ascension.
 */
export type AscensionDieFocus = 'stardust' | 'resonance';

/**
 * Represents the state of a die within the Ascension system.
 */
export interface AscensionDieState {
  /** Unique identifier for the die. */
  id: number;
  /** Whether the ascension die is unlocked. */
  unlocked: boolean;
  /** The tier or rank of the ascension die. */
  tier: number;
  /** The resource focus for this die (stardust or resonance). */
  focus: AscensionDieFocus;
}

/**
 * Represents the global state for the Ascension system.
 */
export interface AscensionState {
  /** Whether the Ascension system has been unlocked. */
  unlocked: boolean;
  /** Amount of stardust currency accumulated. */
  stardust: DecimalType;
  /** Amount of resonance currency accumulated. */
  resonance: DecimalType;
  /** List of states for individual ascension dice. */
  dice: AscensionDieState[];
  /** Timestamp of the last processed tick for ascension logic. */
  lastTick: number;
  /** Total number of ascension cycles completed. */
  totalCycles: number;
}

/**
 * Configuration and state for the auto-rolling mechanic.
 */
export interface AutorollState {
  /** Whether auto-rolling is currently active. */
  enabled: boolean;
  /** Upgrade level of the auto-roll feature. */
  level: number;
  /** Current cooldown duration between auto-rolls. */
  cooldown: DecimalType;
  /** Whether dynamic batching of rolls is enabled for performance. */
  dynamicBatch: boolean;
  /** Threshold in milliseconds to trigger batch processing. */
  batchThresholdMs: number;
  /** Maximum number of rolls processed per game tick. */
  maxRollsPerTick: number;
  /** Budget for animations to prevent performance degradation. */
  animationBudget: number;
}

/**
 * User-configurable game settings.
 */
export interface GameSettings {
  /** Whether game sounds are enabled. */
  sound: boolean;
  /** Number formatting style: 'suffixed' (e.g., 1K), 'scientific' (e.g., 1e3), or 'engineering'. */
  formatting: 'suffixed' | 'scientific' | 'engineering';
  /** UI theme preference: 'dark' or 'light'. */
  theme: 'dark' | 'light';
}

/**
 * Represents a single entry in the history of combos achieved.
 */
export interface ComboHistoryEntry {
  /** Timestamp when the combo occurred. */
  timestamp: number;
  /** The details of the combo achieved. */
  combo: ComboResult;
  /** The chain count at the time of this combo. */
  chain: number;
}

/**
 * Statistics related to combo chains.
 */
export interface ComboChainStats {
  /** Current length of the active combo chain. */
  current: number;
  /** Best (longest) combo chain achieved. */
  best: number;
  /** Timestamp or roll index of the last combo contribution. */
  lastComboRoll: number | null;
  /** History of recent combos. */
  history: ComboHistoryEntry[];
}

/**
 * Statistics for the current auto-roll session.
 */
export interface AutorollSessionStats {
  /** Timestamp when the current auto-roll session started. */
  startedAt: number | null;
  /** Total credits earned during this auto-roll session. */
  creditsEarned: DecimalType;
  /** Total number of rolls performed during this auto-roll session. */
  rolls: number;
}

/**
 * General gameplay statistics.
 */
export interface GameStats {
  /** The highest value roll achieved. */
  bestRoll: DecimalType;
  /** The face values of the dice involved in the best roll. */
  bestRollFaces: number[];
  /** Total credits earned throughout the entire game. */
  totalCreditsEarned: DecimalType;
  /** List of strings representing recent rolls (for display/debugging). */
  recentRolls: string[];
  /** Credits earned from the very last roll. */
  lastRollCredits: DecimalType;
  /** Statistics for combo chains. */
  comboChain: ComboChainStats;
  /** Statistics for the auto-roll session. */
  autoroll: AutorollSessionStats;
}

/**
 * State tracking for achievements.
 */
export interface AchievementState {
  /** List of IDs of unlocked achievements. */
  unlocked: string[];
  /** List of IDs of achievements that were recently unlocked and need notification. */
  newlyUnlocked: string[];
}

/**
 * Serialized version of {@link ComboChainStats} for saving/loading.
 */
export interface SerializedComboChainStats {
  /** Current length of the active combo chain. */
  current: number;
  /** Best (longest) combo chain achieved. */
  best: number;
  /** Timestamp or roll index of the last combo contribution. */
  lastComboRoll: number | null;
  /** History of recent combos. */
  history: Array<ComboHistoryEntry>;
}

/**
 * Serialized version of {@link AutorollSessionStats} for saving/loading.
 */
export interface SerializedAutorollStats {
  /** Timestamp when the current auto-roll session started. */
  startedAt: number | null;
  /** Total credits earned as a string. */
  creditsEarned: string;
  /** Total number of rolls performed. */
  rolls: number;
}

/**
 * Serialized version of {@link AutorollState} for saving/loading.
 */
export interface SerializedAutorollState {
  /** Whether auto-rolling is currently active. */
  enabled: boolean;
  /** Upgrade level of the auto-roll feature. */
  level: number;
  /** Current cooldown duration as a string. */
  cooldown: string;
  /** Whether dynamic batching is enabled. */
  dynamicBatch: boolean;
  /** Threshold in milliseconds to trigger batch processing. */
  batchThresholdMs: number;
  /** Maximum number of rolls processed per game tick. */
  maxRollsPerTick: number;
  /** Budget for animations. */
  animationBudget: number;
}

/**
 * Serialized version of {@link GameStats} for saving/loading.
 */
export interface SerializedGameStats {
  /** The highest value roll achieved as a string. */
  bestRoll: string;
  /** The face values of the dice involved in the best roll. */
  bestRollFaces: number[];
  /** Total credits earned as a string. */
  totalCreditsEarned: string;
  /** List of strings representing recent rolls. */
  recentRolls: string[];
  /** Credits earned from the last roll as a string. */
  lastRollCredits: string;
  /** Serialized statistics for combo chains. */
  comboChain: SerializedComboChainStats;
  /** Serialized statistics for the auto-roll session. */
  autoroll: SerializedAutorollStats;
}

/**
 * The main game state object containing all dynamic data.
 */
export interface GameState {
  /** Current amount of credits (primary currency). */
  credits: DecimalType;
  /** State of all dice in the game. */
  dice: DieState[];
  /** State of the auto-roll system. */
  autoroll: AutorollState;
  /** User settings. */
  settings: GameSettings;
  /** Total number of rolls performed in the game. */
  totalRolls: number;
  /** Timestamp when the game was last saved. */
  lastSaveTimestamp: number;
  /** Gameplay statistics. */
  stats: GameStats;
  /** Achievement progress state. */
  achievements: AchievementState;
  /** Prestige and ascension state (optional if not yet unlocked). */
  prestige?: {
    /** Current Luck points (prestige currency). */
    luckPoints: DecimalType;
    /** Current Luck tier/level. */
    luckTier: number;
    /** Total number of times the player has prestiged. */
    totalPrestiges: number;
    /** Record of purchased shop upgrades (key -> purchaseLevel). */
    shop: Record<string, number>;
    /** Inventory of consumable items. */
    consumables: {
      /** Number of reroll tokens available. */
      rerollTokens: number;
    };
  };
  /** State of the Ascension system. */
  ascension: AscensionState;
}

/**
 * Serialized version of {@link GameState} for storage (JSON).
 * Decimal types are converted to strings.
 */
export interface SerializedGameState {
  /** Current credits as a string. */
  credits: string;
  /** Serialized dice states. */
  dice: Array<Omit<DieState, 'multiplier' | 'cooldown'> & { multiplier: string }>;
  /** Serialized auto-roll state. */
  autoroll: SerializedAutorollState;
  /** User settings. */
  settings: GameSettings;
  /** Total number of rolls performed. */
  totalRolls: number;
  /** Timestamp when the game was last saved. */
  lastSaveTimestamp: number;
  /** Serialized gameplay statistics. */
  stats?: SerializedGameStats;
  /** Achievement progress state. */
  achievements?: AchievementState;
  /** Serialized prestige state. */
  prestige?: {
    luckPoints: string;
    luckTier: number;
    totalPrestiges: number;
    shop: Record<string, number>;
    consumables: {
      rerollTokens: number;
    };
  };
  /** Serialized ascension state. */
  ascension?: SerializedAscensionState;
  /** Game version string. */
  version: string;
}

/**
 * Serialized version of {@link AscensionState} for storage.
 */
export interface SerializedAscensionState {
  /** Whether the Ascension system is unlocked. */
  unlocked: boolean;
  /** Stardust currency as a string. */
  stardust: string;
  /** Resonance currency as a string. */
  resonance: string;
  /** Serialized ascension dice states. */
  dice: Array<Omit<AscensionDieState, 'tier'> & { tier: number }>;
  /** Timestamp of the last processed tick. */
  lastTick: number;
  /** Total number of ascension cycles completed. */
  totalCycles: number;
}

/**
 * Global game constants and configuration values.
 */
export interface GameConstants {
  /** Maximum number of dice allowed in the game. */
  MAX_DICE: number;
  /** Number of faces on each die. */
  DIE_FACES: number;
  /** Base cost to unlock a new die. */
  BASE_UNLOCK_COST: DecimalType;
  /** Multiplier for the cost of unlocking subsequent dice. */
  UNLOCK_COST_MULTIPLIER: DecimalType;
  /** Base cost to level up a die. */
  BASE_LEVEL_COST: DecimalType;
  /** Growth factor for the level-up cost. */
  LEVEL_COST_GROWTH: DecimalType;
  /** Base multiplier value for a die. */
  BASE_MULTIPLIER: DecimalType;
  /** Increase in multiplier per die level. */
  MULTIPLIER_PER_LEVEL: DecimalType;
  /** Base cooldown in seconds/units for auto-roll. */
  BASE_AUTOROLL_COOLDOWN: DecimalType;
  /** Amount to reduce auto-roll cooldown per upgrade level. */
  AUTOROLL_COOLDOWN_REDUCTION: DecimalType;
  /** Cost to unlock the auto-roll feature. */
  AUTOROLL_UNLOCK_COST: DecimalType;
  /** Base cost to upgrade the auto-roll feature. */
  AUTOROLL_UPGRADE_COST: DecimalType;
  /** Growth factor for auto-roll upgrade costs. */
  AUTOROLL_COST_GROWTH: DecimalType;
  /** Cost to unlock animations. */
  ANIMATION_UNLOCK_COST: DecimalType;
  /** Maximum level for die animations. */
  MAX_ANIMATION_LEVEL: number;
  /** Maximum level a die can reach. */
  MAX_DIE_LEVEL: number;
  /** Levels at which a die receives a milestone bonus. */
  MILESTONE_LEVELS: number[];
  /** Multiplier bonus applied at each milestone. */
  MILESTONE_MULTIPLIER: DecimalType;
  /** Base probability of a critical roll (0-1). */
  BASE_CRIT_CHANCE: number;
  /** Multiplier applied on a critical roll. */
  BASE_CRIT_MULTIPLIER: DecimalType;
}
