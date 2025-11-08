import Decimal, { type Decimal as DecimalType } from '@patashu/break_eternity.js';
import type { ComboChainStats, GameState, GameStats } from '../types/game';
import {
  GAME_CONSTANTS,
  PRESTIGE_SHOP_ITEMS,
  type PrestigeShopKey,
} from './constants';
import { detectCombo, getComboMultiplier } from './combos';
import type { ComboResult } from '../types/combo';
import { rollDie, calculateCost, calculateMultiplier } from './decimal';
import { createDefaultGameState, createDefaultStats } from './storage';
import { evaluateAchievements } from './achievements';

const DecimalMath = Decimal as unknown as {
  log10(value: DecimalType): DecimalType;
  max(a: DecimalType, b: DecimalType): DecimalType;
  min(a: DecimalType, b: DecimalType): DecimalType;
};

const CHAIN_BONUS_STEP = new Decimal(0.1);

const ensureStats = (stats?: GameStats): GameStats => stats ?? createDefaultStats();

function prepareComboChain(state: GameState, combo: ComboResult | null): {
  multiplier: DecimalType;
  chain: ComboChainStats;
} {
  const stats = ensureStats(state.stats);
  const previous = stats.comboChain;

  if (!combo) {
    return {
      multiplier: new Decimal(1),
      chain: {
        current: 0,
        best: previous.best,
        lastComboRoll: null,
        history: previous.history,
      },
    };
  }

  const isConsecutive = previous.lastComboRoll === state.totalRolls;
  const currentChain = isConsecutive ? previous.current + 1 : 1;
  const bestChain = Math.max(previous.best, currentChain);
  const chainBonus = new Decimal(1).plus(CHAIN_BONUS_STEP.times(Math.max(currentChain - 1, 0)));
  const historyEntry = {
    timestamp: Date.now(),
    combo,
    chain: currentChain,
  };

  return {
    multiplier: chainBonus,
    chain: {
      current: currentChain,
      best: bestChain,
      lastComboRoll: state.totalRolls + 1,
      history: [historyEntry, ...previous.history].slice(0, 5),
    },
  };
}

function updateStatsAfterRoll(
  state: GameState,
  finalCredits: DecimalType,
  combo: ComboResult | null,
  rolledFaces: number[],
  comboChain: ComboChainStats
): GameStats {
  const stats = ensureStats(state.stats);
  const isNewBest = finalCredits.gt(stats.bestRoll);
  const bestRoll = isNewBest ? finalCredits : stats.bestRoll;
  const bestRollFaces = isNewBest ? rolledFaces : stats.bestRollFaces;
  const totalCreditsEarned = stats.totalCreditsEarned.plus(finalCredits);
  const recentRolls = [finalCredits.toString(), ...stats.recentRolls].slice(0, 25);
  const autorollStats = state.autoroll.enabled && state.autoroll.level > 0
    ? {
        startedAt: stats.autoroll.startedAt ?? Date.now(),
        creditsEarned: stats.autoroll.creditsEarned.plus(finalCredits),
        rolls: stats.autoroll.rolls + 1,
      }
    : {
        ...stats.autoroll,
        startedAt: state.autoroll.enabled ? stats.autoroll.startedAt : null,
      };

  return {
    bestRoll,
    bestRollFaces,
    totalCreditsEarned,
    recentRolls,
    lastRollCredits: finalCredits,
    comboChain,
    autoroll: autorollStats,
  };
}

function applyRollOutcome(
  state: GameState,
  params: {
    rolledFaces: number[];
    baseCredits: DecimalType;
    combo: ComboResult | null;
    updatedDice?: GameState['dice'];
  }
): { newState: GameState; creditsEarned: DecimalType; combo: ComboResult | null } {
  const { rolledFaces, baseCredits, combo, updatedDice } = params;
  const { multiplier: chainMultiplier, chain } = prepareComboChain(state, combo);
  let finalCredits = baseCredits;
  if (combo) {
    finalCredits = finalCredits.times(getComboMultiplier(combo));
  }
  finalCredits = finalCredits.times(chainMultiplier);
  finalCredits = applyPrestigeMultipliers(finalCredits, state);

  const updatedStats = updateStatsAfterRoll(state, finalCredits, combo, rolledFaces, chain);
  const baseState: GameState = {
    ...state,
    credits: state.credits.plus(finalCredits),
    totalRolls: state.totalRolls + 1,
    dice: updatedDice ?? state.dice,
    stats: updatedStats,
  };

  const achievementContextState: GameState = { ...baseState, achievements: state.achievements };
  const achievements = evaluateAchievements(state.achievements, {
    state: achievementContextState,
    stats: updatedStats,
    finalCredits,
    combo,
  });

  return {
    newState: {
      ...baseState,
      achievements,
    },
    creditsEarned: finalCredits,
    combo,
  };
}

/**
 * Calculate the cost to unlock a specific die
 */
export function getUnlockCost(dieId: number): DecimalType {
  return GAME_CONSTANTS.BASE_UNLOCK_COST.times(
    GAME_CONSTANTS.UNLOCK_COST_MULTIPLIER.pow(dieId - 1)
  );
}

/**
 * Calculate the cost to level up a die
 */
export function getLevelUpCost(currentLevel: number): DecimalType {
  return calculateCost(
    GAME_CONSTANTS.BASE_LEVEL_COST,
    GAME_CONSTANTS.LEVEL_COST_GROWTH,
    currentLevel
  );
}

/**
 * Calculate the cost to upgrade autoroll
 */
export function getAutorollUpgradeCost(currentLevel: number): DecimalType {
  if (currentLevel === 0) {
    return GAME_CONSTANTS.AUTOROLL_UNLOCK_COST;
  }
  return calculateCost(
    GAME_CONSTANTS.AUTOROLL_UPGRADE_COST,
    GAME_CONSTANTS.AUTOROLL_COST_GROWTH,
    currentLevel
  );
}

/**
 * Calculate the cost to unlock animation for a die
 */
export function getAnimationUnlockCost(currentLevel: number): DecimalType {
  return GAME_CONSTANTS.ANIMATION_UNLOCK_COST.times(currentLevel + 1);
}

/**
 * Calculate the autoroll cooldown based on level
 */
export function getAutorollCooldown(level: number): DecimalType {
  if (level === 0) return GAME_CONSTANTS.BASE_AUTOROLL_COOLDOWN;
  return GAME_CONSTANTS.BASE_AUTOROLL_COOLDOWN.times(
    GAME_CONSTANTS.AUTOROLL_COOLDOWN_REDUCTION.pow(level)
  );
}

export function getLuckGainMultiplier(state: GameState): DecimalType {
  const level = state.prestige?.shop?.luckFabricator ?? 0;
  if (level <= 0) return new Decimal(1);
  return new Decimal(1).plus(new Decimal(0.1).times(level));
}

/**
 * Core single-roll pipeline used by both manual rolls and offline autoroll.
 */
function executeRoll(
  state: GameState,
  options: { animate?: boolean } = {}
): { newState: GameState; creditsEarned: DecimalType; combo: ComboResult | null } {
  const { animate = true } = options;

  let totalCredits = new Decimal(0);
  const rolledFaces: number[] = [];

  const updatedDice = state.dice.map(die => {
    if (!die.unlocked) return die;

    const face = rollDie();
    rolledFaces.push(face);
    const credits = die.multiplier.times(face).times(die.id);
    totalCredits = totalCredits.plus(credits);

    return {
      ...die,
      currentFace: face,
      isRolling: animate ? true : false,
    };
  });

  const combo = detectCombo(rolledFaces);

  return applyRollOutcome(state, {
    rolledFaces,
    baseCredits: totalCredits,
    combo,
    updatedDice,
  });
}

/**
 * Perform a roll for all unlocked dice (manual roll entrypoint).
 */
export function performRoll(
  state: GameState
): { newState: GameState; creditsEarned: DecimalType; combo: ComboResult | null } {
  return executeRoll(state, { animate: true });
}

/**
 * Compute the prestige/luck multiplier applied to roll earnings.
 * Default: 1 + luckPoints * 0.02, capped at 10x
 */
export function getLuckMultiplier(state: GameState): DecimalType {
  if (!state.prestige || !state.prestige.luckPoints) return new Decimal(1);
  const points = state.prestige.luckPoints;
  try {
    const mult = new Decimal(1).plus(points.times(0.02));
    // cap at 10
    return DecimalMath.min(mult, new Decimal(10));
  } catch (err) {
    return new Decimal(1);
  }
}

function getRawLuckGain(state: GameState): DecimalType {
  const credits = state.credits || new Decimal(0);
  if (credits.lte(0)) return new Decimal(0);

  const log10 = DecimalMath.log10(credits);
  const base = DecimalMath.max(log10.minus(2), new Decimal(0));
  const luckBoost = getLuckGainMultiplier(state);
  // Tuned formula: scales slightly faster; shared by calculateLuckGain + getLuckProgress
  return base.times(0.6).times(luckBoost);
}

/**
 * Calculate how many luck points the player would gain on a prestige reset.
 */
export function calculateLuckGain(state: GameState): DecimalType {
  try {
    const rawGain = getRawLuckGain(state);
    const flooredGain = (rawGain as DecimalType & { floor: () => DecimalType }).floor();
    return DecimalMath.max(flooredGain, new Decimal(0));
  } catch (err) {
    return new Decimal(0);
  }
}

export function getLuckProgress(state: GameState): { progressPercent: number; rawGain: DecimalType; fractional: DecimalType } {
  try {
    const rawGain = getRawLuckGain(state);
    if (rawGain.lte(0)) {
      return { progressPercent: 0, rawGain: new Decimal(0), fractional: new Decimal(0) };
    }

    const floored = (rawGain as DecimalType & { floor: () => DecimalType }).floor();
    const fractional = rawGain.minus(floored);
    const percent = Math.max(0, Math.min(1, fractional.toNumber())) * 100;

    return {
      progressPercent: percent,
      rawGain,
      fractional,
    };
  } catch (err) {
    return { progressPercent: 0, rawGain: new Decimal(0), fractional: new Decimal(0) };
  }
}

/**
 * Prepare preview information for prestige UI
 */
export function preparePrestigePreview(state: GameState) {
  const luckGain = calculateLuckGain(state);
  return {
    luckGain,
    // short description of what will persist
    retained: ['prestige', 'settings'],
  };
}

/**
 * Perform prestige reset: award luck points and reset core progression.
 * Returns a new GameState reflecting the reset.
 */
export function performPrestigeReset(state: GameState): GameState {
  const gain = calculateLuckGain(state);

  // Build new base state (soft reset: keep prestige accumulative)
  const defaultState = createDefaultGameState();
  const previousStats = ensureStats(state.stats);
  const baseStats = createDefaultStats();
  const resetStats = {
    ...baseStats,
    bestRoll: previousStats.bestRoll,
    bestRollFaces: previousStats.bestRollFaces,
    totalCreditsEarned: previousStats.totalCreditsEarned,
    comboChain: {
      ...baseStats.comboChain,
      best: previousStats.comboChain.best,
    },
  };

  // merge prestige
  const prevPrestige = state.prestige ?? { luckPoints: new Decimal(0), luckTier: 0, totalPrestiges: 0, shop: {}, consumables: { rerollTokens: 0 } };
  const newPrestige = {
    luckPoints: prevPrestige.luckPoints.plus(gain),
    luckTier: prevPrestige.luckTier,
    totalPrestiges: prevPrestige.totalPrestiges + (gain.gt(0) ? 1 : 0),
    shop: prevPrestige.shop || {},
    consumables: prevPrestige.consumables || { rerollTokens: 0 },
  };

  return {
    ...defaultState,
    // carry over settings
    settings: state.settings,
    // carry accumulated prestige
    prestige: newPrestige,
    stats: resetStats,
    achievements: state.achievements,
    lastSaveTimestamp: Date.now(),
  };
}

/**
 * Unlock a die
 */
export function unlockDie(state: GameState, dieId: number): GameState | null {
  const die = state.dice.find(d => d.id === dieId);
  if (!die || die.unlocked) return null;
  
  const cost = getUnlockCost(dieId);
  if (state.credits.lt(cost)) return null;
  
  return {
    ...state,
    credits: state.credits.minus(cost),
    dice: state.dice.map(d => 
      d.id === dieId
        ? { ...d, unlocked: true, level: 1, multiplier: GAME_CONSTANTS.BASE_MULTIPLIER }
        : d
    ),
  };
}

/**
 * Level up a die
 */
export function levelUpDie(state: GameState, dieId: number): GameState | null {
  const die = state.dice.find(d => d.id === dieId);
  if (!die || !die.unlocked) return null;
  if (die.level >= GAME_CONSTANTS.MAX_DIE_LEVEL) return null;

  const cost = getLevelUpCost(die.level);
  if (state.credits.lt(cost)) return null;
  
  const newLevel = die.level + 1;
  const newMultiplier = calculateMultiplier(
    GAME_CONSTANTS.BASE_MULTIPLIER,
    newLevel,
    GAME_CONSTANTS.MULTIPLIER_PER_LEVEL
  );
  
  return {
    ...state,
    credits: state.credits.minus(cost),
    dice: state.dice.map(d =>
      d.id === dieId
        ? { ...d, level: newLevel, multiplier: newMultiplier }
        : d
    ),
  };
}

/**
 * Internal helpers for autoroll session/stat management
 */
function startAutorollSession(stats: GameStats) {
  return {
    ...stats.autoroll,
    startedAt: Date.now(),
    creditsEarned: new Decimal(0),
    rolls: 0,
  };
}

function stopAutorollSession(stats: GameStats) {
  return {
    ...stats.autoroll,
    startedAt: null,
  };
}

/**
 * Upgrade autoroll
 */
export function upgradeAutoroll(state: GameState): GameState | null {
  const cost = getAutorollUpgradeCost(state.autoroll.level);
  if (state.credits.lt(cost)) return null;

  const newLevel = state.autoroll.level + 1;
  const newCooldown = getAutorollCooldown(newLevel).times(
    getAutorollCooldownMultiplier(state)
  );

  const stats = ensureStats(state.stats);
  const autorollStats = newLevel === 1
    ? startAutorollSession(stats)
    : stats.autoroll;

  return {
    ...state,
    credits: state.credits.minus(cost),
    autoroll: {
      ...state.autoroll,
      enabled: true,
      level: newLevel,
      cooldown: newCooldown,
    },
    stats: {
      ...stats,
      autoroll: autorollStats,
    },
  };
}

/**
 * Toggle autoroll on/off
 */
export function toggleAutoroll(state: GameState): GameState {
  if (state.autoroll.level === 0) return state; // Can't toggle if not unlocked

  const stats = ensureStats(state.stats);
  const isEnabling = !state.autoroll.enabled;

  return {
    ...state,
    autoroll: {
      ...state.autoroll,
      enabled: isEnabling,
    },
    stats: {
      ...stats,
      autoroll: isEnabling ? startAutorollSession(stats) : stopAutorollSession(stats),
    },
  };
}

/**
 * Unlock animation level for a die
 */
export function unlockAnimation(state: GameState, dieId: number): GameState | null {
  const die = state.dice.find(d => d.id === dieId);
  if (!die || !die.unlocked || die.animationLevel >= GAME_CONSTANTS.MAX_ANIMATION_LEVEL) {
    return null;
  }
  
  const cost = getAnimationUnlockCost(die.animationLevel);
  if (state.credits.lt(cost)) return null;
  
  return {
    ...state,
    credits: state.credits.minus(cost),
    dice: state.dice.map(d =>
      d.id === dieId
        ? { ...d, animationLevel: d.animationLevel + 1 }
        : d
    ),
  };
}

/**
 * Stop rolling animation for all dice
 */
export function stopRollingAnimation(state: GameState): GameState {
  return {
    ...state,
    dice: state.dice.map(d => ({ ...d, isRolling: false })),
  };
}

/**
 * Calculate offline progress using the same roll pipeline as manual rolls.
 */
export function calculateOfflineProgress(state: GameState, currentTime: number): GameState {
  if (!state.autoroll.enabled || state.autoroll.level === 0) {
    return state;
  }

  const timeDiff = currentTime - state.lastSaveTimestamp;
  const cooldownMs = state.autoroll.cooldown.toNumber() * 1000;
  const rollsPerformed = Math.floor(timeDiff / cooldownMs);

  if (rollsPerformed <= 0) return { ...state, lastSaveTimestamp: currentTime };

  let workingState: GameState = {
    ...state,
    dice: state.dice.map(d => ({ ...d, isRolling: false })),
  };

  for (let i = 0; i < rollsPerformed; i++) {
    const result = executeRoll(workingState, { animate: false });
    workingState = {
      ...result.newState,
      dice: result.newState.dice.map(d => ({ ...d, isRolling: false })),
    };
  }

  return {
    ...workingState,
    dice: workingState.dice.map(d => ({ ...d, isRolling: false })),
    lastSaveTimestamp: currentTime,
  };
}

/**
 * Get the cost to purchase a prestige shop item at a given level
 */
export function getPrestigeUpgradeCost(key: PrestigeShopKey, currentLevel: number): DecimalType {
  const item = PRESTIGE_SHOP_ITEMS[key];
  if (!item) return new Decimal(0);
  return item.baseCost.times(item.costGrowth.pow(currentLevel));
}

/**
 * Check if player can afford a prestige upgrade
 */
export function canBuyPrestigeUpgrade(state: GameState, key: PrestigeShopKey): boolean {
  const item = PRESTIGE_SHOP_ITEMS[key];
  if (!item || !state.prestige) return false;
  
  const currentLevel = state.prestige.shop[key] ?? 0;
  if (item.maxLevel >= 0 && currentLevel >= item.maxLevel) return false;
  
  const cost = getPrestigeUpgradeCost(key, currentLevel);
  return state.prestige.luckPoints.gte(cost);
}

/**
 * Buy a prestige upgrade, returning new state or null if purchase fails
 */
export function buyPrestigeUpgrade(state: GameState, key: PrestigeShopKey): GameState | null {
  const item = PRESTIGE_SHOP_ITEMS[key];
  if (!item || !state.prestige) return null;
  
  const currentLevel = state.prestige.shop[key] ?? 0;
  if (item.maxLevel >= 0 && currentLevel >= item.maxLevel) return null;
  
  const cost = getPrestigeUpgradeCost(key, currentLevel);
  if (state.prestige.luckPoints.lt(cost)) return null;

  // Consumable items (reroll tokens) don't increment level, add tokens instead
  if (key === 'rerollTokens') {
    return {
      ...state,
      prestige: {
        ...state.prestige,
        luckPoints: state.prestige.luckPoints.minus(cost),
        consumables: {
          ...state.prestige.consumables,
          rerollTokens: state.prestige.consumables.rerollTokens + 5,
        },
      },
    };
  }

  // Regular shop items: increment level
  const newShopLevel = currentLevel + 1;
  let autorollState = state.autoroll;

  if (key === 'autorollCooldown' && state.autoroll.level > 0) {
    const effectiveCooldown = getAutorollCooldown(state.autoroll.level).times(
      getAutorollCooldownMultiplier({
        ...state,
        prestige: {
          ...state.prestige,
          shop: {
            ...state.prestige.shop,
            [key]: newShopLevel,
          },
        },
      })
    );
    autorollState = {
      ...state.autoroll,
      cooldown: effectiveCooldown,
    };
  }

  return {
    ...state,
    prestige: {
      ...state.prestige,
      luckPoints: state.prestige.luckPoints.minus(cost),
      shop: {
        ...state.prestige.shop,
        [key]: newShopLevel,
      },
    },
    autoroll: autorollState,
  };
}

/**
 * Get the total multiplier from all prestige shop sources
 */
export function getShopMultiplier(state: GameState): DecimalType {
  if (!state.prestige || !state.prestige.shop) return new Decimal(1);
  
  const fortuneAmplifierLevel = state.prestige.shop.multiplier ?? 0;
  if (fortuneAmplifierLevel <= 0) return new Decimal(1);
  
  // +5% per level = 0.05 per level
  const bonus = new Decimal(fortuneAmplifierLevel).times(0.05);
  return new Decimal(1).plus(bonus);
}

/**
 * Check if guaranteed reroll should be applied
 */
export function getGuaranteedRerollLevel(state: GameState): number {
  return state.prestige?.shop?.guaranteedReroll ?? 0;
}

/**
 * Apply prestige effects to a roll (guaranteed reroll on lowest die)
 * Returns the new state after applying guaranteed rerolls if applicable
 */
export function applyGuaranteedReroll(
  state: GameState,
  rolledFaces: number[]
): { newState: GameState; faces: number[] } {
  const guaranteedLevel = getGuaranteedRerollLevel(state);
  if (guaranteedLevel <= 0 || rolledFaces.length === 0) {
    return { newState: state, faces: rolledFaces };
  }
  
  // Apply up to guaranteedLevel rerolls to the lowest face
  let newFaces = [...rolledFaces];
  const newDice = [...state.dice];
  
  for (let i = 0; i < guaranteedLevel; i++) {
    const lowestIdx = newFaces.indexOf(Math.min(...newFaces));
    if (lowestIdx >= 0) {
      const newFace = rollDie();
      newFaces[lowestIdx] = newFace;
      // update die visual
      newDice[lowestIdx] = {
        ...newDice[lowestIdx],
        currentFace: newFace,
      };
    }
  }
  
  return { newState: { ...state, dice: newDice }, faces: newFaces };
}

/**
 * Consume a reroll token if available (for manual reroll mechanic)
 */
export function consumeRerollToken(state: GameState): GameState | null {
  if (!state.prestige || state.prestige.consumables.rerollTokens <= 0) return null;
  
  return {
    ...state,
    prestige: {
      ...state.prestige,
      consumables: {
        ...state.prestige.consumables,
        rerollTokens: state.prestige.consumables.rerollTokens - 1,
      },
    },
  };
}

/**
 * Get autoroll cooldown reduction from prestige shop
 */
export function getAutorollCooldownMultiplier(state: GameState): DecimalType {
  const autorollLevel = state.prestige?.shop?.autorollCooldown ?? 0;
  if (autorollLevel <= 0) return new Decimal(1);
  
  // 5% reduction per level = multiply by (0.95)^level
  return new Decimal(0.95).pow(autorollLevel);
}

/**
 * Apply all prestige effects to modify final credits
 */
export function applyPrestigeMultipliers(baseCredits: DecimalType, state: GameState): DecimalType {
  const luckMult = getLuckMultiplier(state);
  const shopMult = getShopMultiplier(state);
  return baseCredits.times(luckMult).times(shopMult);
}
