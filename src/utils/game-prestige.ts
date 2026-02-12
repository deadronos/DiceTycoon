import Decimal, { calculateCost } from './decimal';
import { type Decimal as DecimalType } from '@patashu/break_eternity.js';
import type { GameState } from '../types/game';
import { PRESTIGE_SHOP_ITEMS, type PrestigeShopKey } from './constants';
import { createDefaultGameState, createDefaultStats } from './storage';
import { getAutorollCooldown } from './game-autoroll';
import { getAscensionCreditBonus } from './ascension';
import { getAchievementGlobalMultiplier } from './achievements';

const DecimalMath = Decimal as unknown as {
  log10(value: DecimalType): DecimalType;
  max(a: DecimalType, b: DecimalType): DecimalType;
  min(a: DecimalType, b: DecimalType): DecimalType;
};

/**
 * Calculates the multiplier derived from Luck points.
 * @param state The current game state.
 * @returns The luck multiplier.
 */
export function getLuckMultiplier(state: GameState): DecimalType {
  if (!state.prestige || !state.prestige.luckPoints) return new Decimal(1);
  const points = state.prestige.luckPoints;
  const mult = new Decimal(1).plus(points.times(0.02));
  return DecimalMath.min(mult, new Decimal(10));
}

/**
 * Calculates the multiplier for luck gain based on shop upgrades.
 * @param state The current game state.
 * @returns The luck gain multiplier.
 */
export function getLuckGainMultiplier(state: GameState): DecimalType {
  const level = state.prestige?.shop?.luckFabricator ?? 0;
  if (level <= 0) return new Decimal(1);
  return new Decimal(1).plus(new Decimal(0.1).times(level));
}

/**
 * Calculates the global multiplier from purchased shop upgrades.
 * @param state The current game state.
 * @returns The shop multiplier.
 */
export function getShopMultiplier(state: GameState): DecimalType {
  if (!state.prestige || !state.prestige.shop) return new Decimal(1);
  const fortuneAmplifierLevel = state.prestige.shop.multiplier ?? 0;
  if (fortuneAmplifierLevel <= 0) return new Decimal(1);
  const bonus = new Decimal(fortuneAmplifierLevel).times(0.05);
  return new Decimal(1).plus(bonus);
}

/**
 * Calculates the multiplier from special die abilities (e.g. Die 6 "Tycoon").
 * @param state The current game state.
 * @returns The ability multiplier.
 */
export function getAbilityGlobalMultiplier(state: GameState): DecimalType {
    // Die 6 (Tycoon): +5% Global Multiplier
    const die6 = state.dice.find(d => d.id === 6);
    if (die6 && die6.unlocked) {
        return new Decimal(1.05);
    }
    return new Decimal(1);
}

/**
 * Applies all prestige-related multipliers to a credit amount.
 * @param baseCredits The initial credit amount.
 * @param state The current game state.
 * @returns The final credit amount after multipliers.
 */
export function applyPrestigeMultipliers(baseCredits: DecimalType, state: GameState): DecimalType {
  const achievementMultiplier = getAchievementGlobalMultiplier(state.achievements.unlocked);
  const abilityMultiplier = getAbilityGlobalMultiplier(state);

  return baseCredits
    .times(getLuckMultiplier(state))
    .times(getShopMultiplier(state))
    .times(getAscensionCreditBonus(state))
    .times(achievementMultiplier)
    .times(abilityMultiplier);
}

function getRawLuckGain(state: GameState): DecimalType {
  const credits = state.credits || new Decimal(0);
  if (credits.lte(0)) return new Decimal(0);

  const log10 = DecimalMath.log10(credits);
  // Updated formula: floor(max(log10(credits) - 2, 0) * 0.5 * (1 + 0.10 * LuckFabricatorLevel))
  // Changed from -3 to -2 threshold (first prestige at 1,000 instead of 10,000,000)
  // Increased gain rate from 0.25 to 0.5 for more rewarding prestige cycles
  const base = DecimalMath.max(log10.minus(2), new Decimal(0));
  const luckBoost = getLuckGainMultiplier(state);
  return base.times(0.5).times(luckBoost);
}

/**
 * Calculates the potential Luck points gained upon prestige.
 * @param state The current game state.
 * @returns The amount of luck points to gain.
 */
export function calculateLuckGain(state: GameState): DecimalType {
  try {
    const rawGain = getRawLuckGain(state);
    const flooredGain = (rawGain as DecimalType & { floor: () => DecimalType }).floor();
    return DecimalMath.max(flooredGain, new Decimal(0));
  } catch {
    return new Decimal(0);
  }
}

/**
 * Calculates progress towards the next Luck point.
 * @param state The current game state.
 * @returns Object containing progress percentage and raw values.
 */
export function getLuckProgress(state: GameState): { progressPercent: number; rawGain: DecimalType; fractional: DecimalType } {
  try {
    const rawGain = getRawLuckGain(state);
    if (rawGain.lte(0)) {
      return { progressPercent: 0, rawGain: new Decimal(0), fractional: new Decimal(0) };
    }
    const floored = (rawGain as DecimalType & { floor: () => DecimalType }).floor();
    const fractional = rawGain.minus(floored);
    const percent = Math.max(0, Math.min(1, fractional.toNumber())) * 100;
    return { progressPercent: percent, rawGain, fractional };
  } catch {
    return { progressPercent: 0, rawGain: new Decimal(0), fractional: new Decimal(0) };
  }
}

/**
 * Generates a preview of the prestige reset effects.
 * @param state The current game state.
 * @returns Object with projected luck gain and retained keys.
 */
export function preparePrestigePreview(state: GameState) {
  const luckGain = calculateLuckGain(state);
  return { luckGain, retained: ['prestige', 'settings'] };
}

/**
 * Performs the prestige reset operation.
 * @param state The current game state.
 * @returns The new game state after reset.
 */
export function performPrestigeReset(state: GameState): GameState {
  const gain = calculateLuckGain(state);
  const defaultState = createDefaultGameState();
  const previousStats = state.stats ?? createDefaultStats();
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

  const prevPrestige = state.prestige ?? { luckPoints: new Decimal(0), luckTier: 0, totalPrestiges: 0, shop: {}, consumables: { rerollTokens: 0 } };
  const newPrestige = {
    luckPoints: prevPrestige.luckPoints.plus(gain),
    luckTier: prevPrestige.luckTier,
    totalPrestiges: prevPrestige.totalPrestiges + (gain.gt(0) ? 1 : 0),
    shop: prevPrestige.shop || {},
    consumables: prevPrestige.consumables || { rerollTokens: 0 },
  };
  const nextAscension = state.ascension ?? createDefaultGameState().ascension;

  return {
    ...defaultState,
    settings: state.settings,
    prestige: newPrestige,
    ascension: { ...nextAscension, lastTick: Date.now() },
    stats: resetStats,
    achievements: state.achievements,
    lastSaveTimestamp: Date.now(),
  };
}

/**
 * Calculates the cost of a prestige shop upgrade.
 * @param key The item key.
 * @param currentLevel The current item level.
 * @returns The cost in Luck points.
 */
export function getPrestigeUpgradeCost(key: PrestigeShopKey, currentLevel: number): DecimalType {
  const item = PRESTIGE_SHOP_ITEMS[key];
  if (!item) return new Decimal(0);
  return calculateCost(item.baseCost, item.costGrowth, currentLevel);
}

/**
 * Checks if a prestige shop upgrade can be purchased.
 * @param state The current game state.
 * @param key The item key.
 * @returns True if affordable and not maxed.
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
 * Purchases a prestige shop upgrade.
 * @param state The current game state.
 * @param key The item key.
 * @returns The updated game state, or null if purchase failed.
 */
export function buyPrestigeUpgrade(state: GameState, key: PrestigeShopKey): GameState | null {
  const item = PRESTIGE_SHOP_ITEMS[key];
  if (!item || !state.prestige) return null;

  const currentLevel = state.prestige.shop[key] ?? 0;
  if (item.maxLevel >= 0 && currentLevel >= item.maxLevel) return null;

  const cost = getPrestigeUpgradeCost(key, currentLevel);
  if (state.prestige.luckPoints.lt(cost)) return null;

  // Consumable items (reroll tokens) grant tokens instead of leveling
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

  // For non-consumables, increment level and also adjust autoroll cooldown if relevant
  const newLevel = currentLevel + 1;
  let autorollState = state.autoroll;
  if (key === 'autorollCooldown' && state.autoroll.level > 0) {
    const effectiveCooldown = getAutorollCooldown(state.autoroll.level).times(
      getAutorollCooldownMultiplier({
        ...state,
        prestige: {
          ...state.prestige,
          shop: {
            ...state.prestige.shop,
            [key]: newLevel,
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
        [key]: newLevel,
      },
    },
    autoroll: autorollState,
  };
}

/**
 * Calculates the autoroll cooldown multiplier from shop upgrades.
 * @param state The current game state.
 * @returns The multiplier (e.g., 0.95 for 5% reduction).
 */
export function getAutorollCooldownMultiplier(state: GameState): DecimalType {
  const autorollLevel = state.prestige?.shop?.autorollCooldown ?? 0;
  if (autorollLevel <= 0) return new Decimal(1);
  return new Decimal(0.95).pow(autorollLevel);
}
