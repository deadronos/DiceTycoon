import { type Decimal as DecimalType } from '@patashu/break_eternity.js';

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
}

export interface GameSettings {
  sound: boolean;
  formatting: 'suffixed' | 'scientific' | 'engineering';
  theme: 'dark' | 'light';
}

export interface GameState {
  credits: DecimalType;
  dice: DieState[];
  autoroll: AutorollState;
  settings: GameSettings;
  totalRolls: number;
  lastSaveTimestamp: number;
  // Prestige / ascension state
  prestige?: {
    luckPoints: DecimalType;
    luckTier: number;
    totalPrestiges: number;
  };
}

export interface SerializedGameState {
  credits: string;
  dice: Array<Omit<DieState, 'multiplier' | 'cooldown'> & { multiplier: string }>;
  autoroll: Omit<AutorollState, 'cooldown'> & { cooldown: string };
  settings: GameSettings;
  totalRolls: number;
  lastSaveTimestamp: number;
  prestige?: {
    luckPoints: string;
    luckTier: number;
    totalPrestiges: number;
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
}
