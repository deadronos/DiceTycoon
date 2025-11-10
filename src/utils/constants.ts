import Decimal from './decimal';
import { type Decimal as DecimalType } from '@patashu/break_eternity.js';
import { GameConstants } from '../types/game';

export type PrestigeShopCategory = 'passive' | 'qol' | 'gameplay' | 'consumable' | 'prestige-exclusive';

export interface PrestigeShopItem {
  name: string;
  description: string;
  baseCost: DecimalType;
  costGrowth: DecimalType;
  maxLevel: number;
  category: PrestigeShopCategory;
  icon: string;
  formula: string;
  getCurrentEffect?: (level: number) => string;
  getNextEffect?: (level: number) => string;
}

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
};

export const STORAGE_KEY = 'dicetycoon.gamestate.v2';
export const STORAGE_VERSION = 'v2';
export const AUTOROLL_BATCH_MIN_TICK_MS = 32;
export const DEFAULT_AUTOROLL_BATCH_THRESHOLD_MS = 100;
export const DEFAULT_AUTOROLL_MAX_ROLLS_PER_TICK = 1000;
export const DEFAULT_AUTOROLL_ANIMATION_BUDGET = 10;
export const DEFAULT_AUTOROLL_DYNAMIC_BATCH = true;

// Prestige shop item definitions
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

export type PrestigeShopKey = keyof typeof PRESTIGE_SHOP_ITEMS;

export const ROLL_ANIMATION_DURATION = 800; // milliseconds
export const CREDIT_POPUP_DURATION = 2000; // milliseconds
export const AUTO_SAVE_INTERVAL = 30000; // 30 seconds
export const MAX_OFFLINE_TIME = 3600000; // 1 hour in milliseconds
