import Decimal from './decimal';
import { type Decimal as DecimalType } from '@patashu/break_eternity.js';
import { GameConstants } from '../types/game';

/**
 * Categories for items in the Prestige Shop.
 */
export type PrestigeShopCategory = 'passive' | 'qol' | 'gameplay' | 'consumable' | 'prestige-exclusive';

/**
 * Defines the structure of a purchasable item in the Prestige Shop.
 */
export interface PrestigeShopItem {
  /** Display name of the item. */
  name: string;
  /** Description of what the item does. */
  description: string;
  /** Initial cost in Luck points. */
  baseCost: DecimalType;
  /** Multiplier for cost increase per level. */
  costGrowth: DecimalType;
  /** Maximum level attainable (-1 for unlimited). */
  maxLevel: number;
  /** Category the item belongs to. */
  category: PrestigeShopCategory;
  /** Emoji icon for the item. */
  icon: string;
  /** Text description of the effect formula. */
  formula: string;
  /** Function to get a description of the current effect based on level. */
  getCurrentEffect?: (level: number) => string;
  /** Function to get a description of the next level's effect. */
  getNextEffect?: (level: number) => string;
}

/**
 * Configuration for the Ascension system.
 */
export interface AscensionConfig {
  /** Number of prestiges required to unlock ascension. */
  unlockPrestiges: number;
  /** Base stardust production rate. */
  baseStardustRate: number;
  /** Fraction of production allocated to resonance by default. */
  baseResonanceShare: number;
  /** Growth factor for tier bonuses. */
  tierGrowth: number;
  /** Multiplier for unlock costs. */
  unlockCostMultiplier: number;
}

/**
 * Global game balance constants.
 */
export const GAME_CONSTANTS: GameConstants = {
  MAX_DICE: 6,
  DIE_FACES: 6,
  
  // Unlock costs scale exponentially
  BASE_UNLOCK_COST: new Decimal(10),
  UNLOCK_COST_MULTIPLIER: new Decimal(5),
  
  // Level costs
  BASE_LEVEL_COST: new Decimal(10),
  LEVEL_COST_GROWTH: new Decimal(1.75),
  
  // Multiplier growth
  BASE_MULTIPLIER: new Decimal(1),
  MULTIPLIER_PER_LEVEL: new Decimal(1.5),
  
  // Autoroll
  BASE_AUTOROLL_COOLDOWN: new Decimal(2.0), // 2 seconds
  AUTOROLL_COOLDOWN_REDUCTION: new Decimal(0.9), // 10% faster per level
  AUTOROLL_UNLOCK_COST: new Decimal(50),
  AUTOROLL_UPGRADE_COST: new Decimal(100),
  AUTOROLL_COST_GROWTH: new Decimal(2),
  
  // Animations
  ANIMATION_UNLOCK_COST: new Decimal(25),
  MAX_ANIMATION_LEVEL: 3,
  MAX_DIE_LEVEL: 100,

  // Milestones
  MILESTONE_LEVELS: [25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000],
  MILESTONE_MULTIPLIER: new Decimal(2),

  // Critical Hits
  BASE_CRIT_CHANCE: 0.01, // 1%
  BASE_CRIT_MULTIPLIER: new Decimal(5),
};

/**
 * Ascension system configuration values.
 */
export const ASCENSION_CONFIG: AscensionConfig = {
  unlockPrestiges: 2,
  baseStardustRate: 0.65,
  baseResonanceShare: 0.65,
  tierGrowth: 0.45,
  unlockCostMultiplier: 12,
};

/** Storage key for saving game state to local storage. */
export const STORAGE_KEY = 'dicetycoon.gamestate.v2';
/** Current storage version string. */
export const STORAGE_VERSION = 'v2';
/** Minimum time between ticks for batch autorolling. */
export const AUTOROLL_BATCH_MIN_TICK_MS = 32;
/** Default threshold in ms to switch to batch processing mode. */
export const DEFAULT_AUTOROLL_BATCH_THRESHOLD_MS = 100;
/** Default maximum rolls to process per tick in batch mode. */
export const DEFAULT_AUTOROLL_MAX_ROLLS_PER_TICK = 1000;
/** Default budget for animations in batch mode. */
export const DEFAULT_AUTOROLL_ANIMATION_BUDGET = 10;
/** Default setting for dynamic batching. */
export const DEFAULT_AUTOROLL_DYNAMIC_BATCH = true;

/**
 * Definitions for all items available in the Prestige Shop.
 */
export const PRESTIGE_SHOP_ITEMS = {
  multiplier: {
    name: 'Fortune Amplifier',
    description: 'Adds +5% flat credit multiplier per level (multiplicative with luck).',
    baseCost: new Decimal(5),
    costGrowth: new Decimal(3),
    maxLevel: 10,
    category: 'passive',
    icon: '📈',
    formula: 'Final Credits × (1 + 0.05 × level)',
    getCurrentEffect: level => `Currently +${(level * 5).toFixed(0)}% credits`,
    getNextEffect: level => `Next adds +5% (total +${((level + 1) * 5).toFixed(0)}%)`,
  },
  luckFabricator: {
    name: 'Luck Fabricator',
    description: 'Boosts prestige luck gains by +10% per level.',
    baseCost: new Decimal(8),
    costGrowth: new Decimal(2.6),
    maxLevel: 8,
    category: 'passive',
    icon: '🧪',
    formula: 'Luck Gain × (1 + 0.10 × level)',
    getCurrentEffect: level => `Luck gain is multiplied by ${(1 + level * 0.1).toFixed(2)}x`,
    getNextEffect: level => `Next adds +10% luck (×${(1 + (level + 1) * 0.1).toFixed(2)})`,
  },
  autobuyer: {
    name: 'Autobuyer: Upgrades',
    description: 'Automatically buy the cheapest die upgrade when affordable.',
    baseCost: new Decimal(4),
    costGrowth: new Decimal(2),
    maxLevel: 1,
    category: 'qol',
    icon: '🤖',
    formula: 'Unlocks automation toggle',
  },
  autorollCooldown: {
    name: 'Temporal Accelerator',
    description: 'Reduces autoroll cooldown by 5% per level (multiplicative).',
    baseCost: new Decimal(6),
    costGrowth: new Decimal(2.4),
    maxLevel: 5,
    category: 'qol',
    icon: '⏱️',
    formula: 'Autoroll Cooldown × 0.95^level',
    getCurrentEffect: level => `Cooldown multiplier ×${Math.pow(0.95, level).toFixed(2)}`,
    getNextEffect: level => `Next reduces to ×${Math.pow(0.95, level + 1).toFixed(2)}`,
  },
  guaranteedReroll: {
    name: 'Guaranteed Reroll Slot',
    description: 'Rerolls the lowest die face automatically each roll.',
    baseCost: new Decimal(10),
    costGrowth: new Decimal(4),
    maxLevel: 2,
    category: 'gameplay',
    icon: '🎯',
    formula: 'Reroll lowest die × level',
    getCurrentEffect: level => (level > 0 ? `${level} guaranteed reroll${level > 1 ? 's' : ''}` : 'No rerolls yet'),
    getNextEffect: level => `Next grants ${level + 1} reroll${level + 1 > 1 ? 's' : ''}`,
  },
  rerollTokens: {
    name: 'Reroll Token Pack',
    description: 'Buy 5 reroll tokens for manual die rerolls.',
    baseCost: new Decimal(2),
    costGrowth: new Decimal(1.8),
    maxLevel: -1, // unlimited, consumable
    category: 'consumable',
    icon: '🔁',
    formula: '+5 tokens per purchase',
  },
  extraDieSocket: {
    name: 'Lucky Die Socket',
    description: 'Unlock access to a 7th die (experimental high-multiplier die).',
    baseCost: new Decimal(50),
    costGrowth: new Decimal(1),
    maxLevel: 1,
    category: 'prestige-exclusive',
    icon: '💠',
    formula: 'Unlocks 7th die slot',
  },
} as const satisfies Record<string, PrestigeShopItem>;

/**
 * Valid keys for looking up prestige shop items.
 */
export type PrestigeShopKey = keyof typeof PRESTIGE_SHOP_ITEMS;

/** Duration of the dice roll animation in milliseconds. */
export const ROLL_ANIMATION_DURATION = 800;
/** Duration of the credit gain popup in milliseconds. */
export const CREDIT_POPUP_DURATION = 2000;
/** Interval for auto-saving the game in milliseconds. */
export const AUTO_SAVE_INTERVAL = 30000;
/** Maximum offline time to process for progress in milliseconds (1 hour). */
export const MAX_OFFLINE_TIME = 3600000;
