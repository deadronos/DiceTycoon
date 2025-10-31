import Decimal from '@patashu/break_eternity.js';
import { GameState, SerializedGameState, DieState } from '../types/game';
import { STORAGE_KEY, STORAGE_VERSION, GAME_CONSTANTS } from './constants';
import { fromDecimalString } from './decimal';

/**
 * Serialize GameState to a JSON-safe format
 */
export function serializeGameState(state: GameState): SerializedGameState {
  return {
    version: STORAGE_VERSION,
    credits: state.credits.toString(),
    dice: state.dice.map(die => ({
      id: die.id,
      unlocked: die.unlocked,
      level: die.level,
      multiplier: die.multiplier.toString(),
      animationLevel: die.animationLevel,
      currentFace: die.currentFace,
      isRolling: die.isRolling,
    })),
    autoroll: {
      enabled: state.autoroll.enabled,
      level: state.autoroll.level,
      cooldown: state.autoroll.cooldown.toString(),
    },
    settings: state.settings,
    totalRolls: state.totalRolls,
    lastSaveTimestamp: state.lastSaveTimestamp,
    prestige: state.prestige
      ? {
          luckPoints: state.prestige.luckPoints.toString(),
          luckTier: state.prestige.luckTier,
          totalPrestiges: state.prestige.totalPrestiges,
        }
      : undefined,
  };
}

/**
 * Deserialize a saved game state
 */
export function deserializeGameState(data: SerializedGameState): GameState {
  return {
    credits: fromDecimalString(data.credits, new Decimal(0)),
    dice: data.dice.map(die => ({
      id: die.id,
      unlocked: die.unlocked,
      level: die.level,
      multiplier: fromDecimalString(die.multiplier, new Decimal(1)),
      animationLevel: die.animationLevel,
      currentFace: die.currentFace,
      isRolling: die.isRolling,
    })),
    autoroll: {
      enabled: data.autoroll.enabled,
      level: data.autoroll.level,
      cooldown: fromDecimalString(data.autoroll.cooldown, GAME_CONSTANTS.BASE_AUTOROLL_COOLDOWN),
    },
    settings: data.settings,
    totalRolls: data.totalRolls,
    lastSaveTimestamp: data.lastSaveTimestamp,
    prestige: data.prestige
      ? {
          luckPoints: fromDecimalString(data.prestige.luckPoints, new Decimal(0)),
          luckTier: typeof data.prestige.luckTier === 'number' ? data.prestige.luckTier : 0,
          totalPrestiges: typeof data.prestige.totalPrestiges === 'number' ? data.prestige.totalPrestiges : 0,
        }
      : {
          luckPoints: new Decimal(0),
          luckTier: 0,
          totalPrestiges: 0,
        },
  };
}

/**
 * Save game state to localStorage
 */
export function safeSave(key: string = STORAGE_KEY, state: unknown): boolean {
  try {
    // Handle both GameState and arbitrary objects for testing
    let serialized: unknown;

    // Narrow unknown to a record for property checks
    const s = state as Record<string, unknown>;

    // Check if it looks like a complete GameState
    if (
      s.dice &&
      Array.isArray(s.dice) &&
      (s.dice as Array<unknown>)[0] &&
      typeof ((s.dice as Array<Record<string, unknown>>)[0].id) !== 'undefined' &&
      s.credits &&
      s.autoroll &&
      typeof s.autoroll === 'object'
    ) {
      // It's a GameState, serialize properly
      serialized = serializeGameState(state as GameState);
    } else {
      // It's a test object or partial state, serialize as-is
      serialized = state;
    }
    
    localStorage.setItem(key, JSON.stringify(serialized));
    return true;
  } catch (err) {
    console.error('Failed to save game state:', err);
    return false;
  }
}

/**
 * Load game state from localStorage
 */
export function safeLoad(key: string = STORAGE_KEY, fallback: unknown = null): unknown {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    
    const parsedRaw: unknown = JSON.parse(raw);
    const p = parsedRaw as Record<string, unknown>;

    // Check if it's a full SerializedGameState by looking for version and expected structure
    if (
      p.version &&
      p.dice &&
      Array.isArray(p.dice) &&
      p.autoroll &&
      typeof p.autoroll === 'object' &&
      p.settings
    ) {
      // If legacy v1 save (no prestige), still deserialize and defaults will be applied
      return deserializeGameState(p as unknown as SerializedGameState);
    }

    // Otherwise it might be a simpler test object - only deserialize credits if present
    if (p.credits && typeof p.credits === 'string') {
      // mutate parsed object to convert credits string into Decimal
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (p as any).credits = fromDecimalString(p.credits as string);
    }

    return p;
  } catch (err) {
    console.error('Failed to load game state:', err);
    return fallback;
  }
}

/**
 * Create a default initial game state
 */
export function createDefaultGameState(): GameState {
  const dice: DieState[] = [];
  
  for (let i = 0; i < GAME_CONSTANTS.MAX_DICE; i++) {
    dice.push({
      id: i + 1,
      unlocked: i === 0, // First die starts unlocked
      level: i === 0 ? 1 : 0,
      multiplier: new Decimal(1),
      animationLevel: 0,
      currentFace: 1,
      isRolling: false,
    });
  }
  
  return {
    credits: new Decimal(0),
    dice,
    autoroll: {
      enabled: false,
      level: 0,
      cooldown: GAME_CONSTANTS.BASE_AUTOROLL_COOLDOWN,
    },
    settings: {
      sound: false,
      formatting: 'suffixed',
      theme: 'dark',
    },
    totalRolls: 0,
    lastSaveTimestamp: Date.now(),
    prestige: {
      luckPoints: new Decimal(0),
      luckTier: 0,
      totalPrestiges: 0,
    },
  };
}

/**
 * Export game state as a string
 */
export function exportGameState(state: GameState): string {
  const serialized = serializeGameState(state);
  return btoa(JSON.stringify(serialized));
}

/**
 * Import game state from a string
 */
export function importGameState(encoded: string): GameState | null {
  try {
    const decoded = atob(encoded);
    const parsed = JSON.parse(decoded) as SerializedGameState;
    return deserializeGameState(parsed);
  } catch (err) {
    console.error('Failed to import game state:', err);
    return null;
  }
}

/**
 * Reset game state
 */
export function resetGameState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to reset game state:', err);
  }
}
