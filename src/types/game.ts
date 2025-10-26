import Decimal from '@patashu/break_eternity.js';

export interface DieState {
  id: number;
  unlocked: boolean;
  level: number;
  multiplier: Decimal;
  animationLevel: number;
  currentFace: number;
  isRolling: boolean;
}

export interface AutorollState {
  enabled: boolean;
  level: number;
  cooldown: Decimal;
}

export interface GameSettings {
  sound: boolean;
  formatting: 'suffixed' | 'scientific' | 'engineering';
  theme: 'dark' | 'light';
}

export interface GameState {
  credits: Decimal;
  dice: DieState[];
  autoroll: AutorollState;
  settings: GameSettings;
  totalRolls: number;
  lastSaveTimestamp: number;
}

export interface SerializedGameState {
  credits: string;
  dice: Array<Omit<DieState, 'multiplier' | 'cooldown'> & { multiplier: string }>;
  autoroll: Omit<AutorollState, 'cooldown'> & { cooldown: string };
  settings: GameSettings;
  totalRolls: number;
  lastSaveTimestamp: number;
  version: string;
}

export interface GameConstants {
  MAX_DICE: number;
  DIE_FACES: number;
  BASE_UNLOCK_COST: Decimal;
  UNLOCK_COST_MULTIPLIER: Decimal;
  BASE_LEVEL_COST: Decimal;
  LEVEL_COST_GROWTH: Decimal;
  BASE_MULTIPLIER: Decimal;
  MULTIPLIER_PER_LEVEL: Decimal;
  BASE_AUTOROLL_COOLDOWN: Decimal;
  AUTOROLL_COOLDOWN_REDUCTION: Decimal;
  AUTOROLL_UNLOCK_COST: Decimal;
  AUTOROLL_UPGRADE_COST: Decimal;
  AUTOROLL_COST_GROWTH: Decimal;
  ANIMATION_UNLOCK_COST: Decimal;
  MAX_ANIMATION_LEVEL: number;
}
