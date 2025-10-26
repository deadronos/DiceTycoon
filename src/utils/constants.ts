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

export const STORAGE_KEY = 'dicetycoon.gamestate.v1';
export const STORAGE_VERSION = 'v1';

export const ROLL_ANIMATION_DURATION = 800; // milliseconds
export const CREDIT_POPUP_DURATION = 2000; // milliseconds
export const AUTO_SAVE_INTERVAL = 30000; // 30 seconds
export const MAX_OFFLINE_TIME = 3600000; // 1 hour in milliseconds
