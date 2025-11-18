import Decimal from './decimal';
import {
  type GameState,
  type SerializedGameState,
  type DieState,
  type GameStats,
  type SerializedGameStats,
  type AchievementState,
  type AscensionState,
  type SerializedAscensionState,
} from '../types/game';
import {
  STORAGE_KEY,
  STORAGE_VERSION,
  GAME_CONSTANTS,
  DEFAULT_AUTOROLL_BATCH_THRESHOLD_MS,
  DEFAULT_AUTOROLL_MAX_ROLLS_PER_TICK,
  DEFAULT_AUTOROLL_ANIMATION_BUDGET,
  DEFAULT_AUTOROLL_DYNAMIC_BATCH,
} from './constants';
import { fromDecimalString } from './decimal';
import { createDefaultAscensionState } from './ascension';

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
      dynamicBatch: state.autoroll.dynamicBatch,
      batchThresholdMs: state.autoroll.batchThresholdMs,
      maxRollsPerTick: state.autoroll.maxRollsPerTick,
      animationBudget: state.autoroll.animationBudget,
    },
    settings: state.settings,
    totalRolls: state.totalRolls,
    lastSaveTimestamp: state.lastSaveTimestamp,
    stats: serializeStats(state.stats),
    achievements: state.achievements,
    prestige: state.prestige
      ? {
          luckPoints: state.prestige.luckPoints.toString(),
          luckTier: state.prestige.luckTier,
          totalPrestiges: state.prestige.totalPrestiges,
          shop: state.prestige.shop || {},
          consumables: state.prestige.consumables || { rerollTokens: 0 },
        }
      : undefined,
    ascension: serializeAscension(state.ascension),
  };
}

/**
 * Deserialize a saved game state
 */
export function deserializeGameState(data: SerializedGameState): GameState {
  const stats = data.stats ? deserializeStats(data.stats) : createDefaultStats();
  const ascension = data.ascension ? deserializeAscension(data.ascension) : createDefaultAscensionState();
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
      dynamicBatch: typeof data.autoroll.dynamicBatch === 'boolean'
        ? data.autoroll.dynamicBatch
        : DEFAULT_AUTOROLL_DYNAMIC_BATCH,
      batchThresholdMs: typeof data.autoroll.batchThresholdMs === 'number'
        ? data.autoroll.batchThresholdMs
        : DEFAULT_AUTOROLL_BATCH_THRESHOLD_MS,
      maxRollsPerTick: typeof data.autoroll.maxRollsPerTick === 'number'
        ? data.autoroll.maxRollsPerTick
        : DEFAULT_AUTOROLL_MAX_ROLLS_PER_TICK,
      animationBudget: typeof data.autoroll.animationBudget === 'number'
        ? data.autoroll.animationBudget
        : DEFAULT_AUTOROLL_ANIMATION_BUDGET,
    },
    settings: data.settings,
    totalRolls: data.totalRolls,
    lastSaveTimestamp: data.lastSaveTimestamp,
    stats,
    achievements: normalizeAchievements(data.achievements),
    prestige: data.prestige
      ? {
          luckPoints: fromDecimalString(data.prestige.luckPoints, new Decimal(0)),
          luckTier: typeof data.prestige.luckTier === 'number' ? data.prestige.luckTier : 0,
          totalPrestiges: typeof data.prestige.totalPrestiges === 'number' ? data.prestige.totalPrestiges : 0,
          shop: data.prestige.shop || {},
          consumables: {
            rerollTokens: (data.prestige.consumables?.rerollTokens ?? 0),
          },
        }
      : {
          luckPoints: new Decimal(0),
          luckTier: 0,
          totalPrestiges: 0,
          shop: {},
          consumables: { rerollTokens: 0 },
        },
    ascension,
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

function serializeStats(stats: GameStats): SerializedGameStats {
  return {
    bestRoll: stats.bestRoll.toString(),
    bestRollFaces: stats.bestRollFaces,
    totalCreditsEarned: stats.totalCreditsEarned.toString(),
    recentRolls: stats.recentRolls,
    lastRollCredits: stats.lastRollCredits.toString(),
    comboChain: {
      current: stats.comboChain.current,
      best: stats.comboChain.best,
      lastComboRoll: stats.comboChain.lastComboRoll,
      history: stats.comboChain.history.slice(0, 5),
    },
    autoroll: {
      startedAt: stats.autoroll.startedAt,
      creditsEarned: stats.autoroll.creditsEarned.toString(),
      rolls: stats.autoroll.rolls,
    },
  };
}

function deserializeStats(data: SerializedGameStats): GameStats {
  return {
    bestRoll: fromDecimalString(data.bestRoll, new Decimal(0)),
    bestRollFaces: data.bestRollFaces ?? [],
    totalCreditsEarned: fromDecimalString(data.totalCreditsEarned, new Decimal(0)),
    recentRolls: Array.isArray(data.recentRolls) ? data.recentRolls.slice(0, 25) : [],
    lastRollCredits: fromDecimalString(data.lastRollCredits, new Decimal(0)),
    comboChain: {
      current: data.comboChain?.current ?? 0,
      best: data.comboChain?.best ?? 0,
      lastComboRoll: data.comboChain?.lastComboRoll ?? null,
      history: data.comboChain?.history ? data.comboChain.history.slice(0, 5) : [],
    },
    autoroll: {
      startedAt: data.autoroll?.startedAt ?? null,
      creditsEarned: fromDecimalString(data.autoroll?.creditsEarned, new Decimal(0)),
      rolls: data.autoroll?.rolls ?? 0,
    },
  };
}

function normalizeAchievements(data?: AchievementState): AchievementState {
  if (!data) {
    return createDefaultAchievements();
  }

  return {
    unlocked: Array.from(new Set(data.unlocked ?? [])),
    newlyUnlocked: [],
  };
}

export function createDefaultStats(): GameStats {
  return {
    bestRoll: new Decimal(0),
    bestRollFaces: [],
    totalCreditsEarned: new Decimal(0),
    recentRolls: [],
    lastRollCredits: new Decimal(0),
    comboChain: {
      current: 0,
      best: 0,
      lastComboRoll: null,
      history: [],
    },
    autoroll: {
      startedAt: null,
      creditsEarned: new Decimal(0),
      rolls: 0,
    },
  };
}

export function createDefaultAchievements(): AchievementState {
  return {
    unlocked: [],
    newlyUnlocked: [],
  };
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
      dynamicBatch: DEFAULT_AUTOROLL_DYNAMIC_BATCH,
      batchThresholdMs: DEFAULT_AUTOROLL_BATCH_THRESHOLD_MS,
      maxRollsPerTick: DEFAULT_AUTOROLL_MAX_ROLLS_PER_TICK,
      animationBudget: DEFAULT_AUTOROLL_ANIMATION_BUDGET,
    },
    settings: {
      sound: false,
      formatting: 'suffixed',
      theme: 'dark',
    },
    totalRolls: 0,
    lastSaveTimestamp: Date.now(),
    stats: createDefaultStats(),
    achievements: createDefaultAchievements(),
    prestige: {
      luckPoints: new Decimal(0),
      luckTier: 0,
      totalPrestiges: 0,
      shop: {},
      consumables: { rerollTokens: 0 },
    },
    ascension: createDefaultAscensionState(),
  };
}

function serializeAscension(state: AscensionState): SerializedAscensionState {
  return {
    unlocked: state.unlocked,
    stardust: state.stardust.toString(),
    resonance: state.resonance.toString(),
    dice: state.dice.map(die => ({
      id: die.id,
      unlocked: die.unlocked,
      tier: die.tier,
      focus: die.focus,
    })),
    lastTick: state.lastTick,
    totalCycles: state.totalCycles,
  };
}

function deserializeAscension(data: SerializedAscensionState): AscensionState {
  return {
    unlocked: data.unlocked,
    stardust: fromDecimalString(data.stardust, new Decimal(0)),
    resonance: fromDecimalString(data.resonance, new Decimal(0)),
    dice: data.dice.map(die => ({
      id: die.id,
      unlocked: die.unlocked,
      tier: typeof die.tier === 'number' ? die.tier : 0,
      focus: die.focus,
    })),
    lastTick: typeof data.lastTick === 'number' ? data.lastTick : Date.now(),
    totalCycles: typeof data.totalCycles === 'number' ? data.totalCycles : 0,
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
