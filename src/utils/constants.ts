import Decimal from '@patashu/break_eternity.js';
import { GameConstants } from '../types/game';

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
};

export const STORAGE_KEY = 'dicetycoon.gamestate.v2';
export const STORAGE_VERSION = 'v2';

// Prestige shop item definitions
export const PRESTIGE_SHOP_ITEMS = {
  multiplier: {
    name: 'Fortune Amplifier',
    description: '+5% flat credit multiplier per level',
    baseCost: new Decimal(5),
    costGrowth: new Decimal(3),
    maxLevel: 10,
    category: 'passive',
  },
  autobuyer: {
    name: 'Autobuyer: Upgrades',
    description: 'Automatically buy cheapest die upgrade when affordable',
    baseCost: new Decimal(4),
    costGrowth: new Decimal(2),
    maxLevel: 1,
    category: 'qol',
  },
  guaranteedReroll: {
    name: 'Guaranteed Reroll Slot',
    description: 'Grants one guaranteed reroll per roll (applies to lowest die)',
    baseCost: new Decimal(10),
    costGrowth: new Decimal(4),
    maxLevel: 2,
    category: 'gameplay',
  },
  rerollTokens: {
    name: 'Reroll Token Pack',
    description: 'Buy 5 reroll tokens for manual die rerolls',
    baseCost: new Decimal(2),
    costGrowth: new Decimal(1.8),
    maxLevel: -1, // unlimited, consumable
    category: 'consumable',
  },
  extraDieSocket: {
    name: 'Lucky Die Socket',
    description: 'Unlock access to a 7th die (experimental high-multiplier die)',
    baseCost: new Decimal(50),
    costGrowth: new Decimal(1),
    maxLevel: 1,
    category: 'prestige-exclusive',
  },
} as const;

export type PrestigeShopKey = keyof typeof PRESTIGE_SHOP_ITEMS;

export const ROLL_ANIMATION_DURATION = 800; // milliseconds
export const CREDIT_POPUP_DURATION = 2000; // milliseconds
export const AUTO_SAVE_INTERVAL = 30000; // 30 seconds
export const MAX_OFFLINE_TIME = 3600000; // 1 hour in milliseconds
