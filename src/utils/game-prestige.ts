import Decimal from './decimal';
import { type Decimal as DecimalType } from '@patashu/break_eternity.js';
import type { GameState } from '../types/game';
import { PRESTIGE_SHOP_ITEMS, type PrestigeShopKey } from './constants';
import { createDefaultGameState, createDefaultStats } from './storage';
import { getAutorollCooldown } from './game-autoroll';
import { getAscensionCreditBonus } from './ascension';

const DecimalMath = Decimal as unknown as {
  log10(value: DecimalType): DecimalType;
  max(a: DecimalType, b: DecimalType): DecimalType;
  min(a: DecimalType, b: DecimalType): DecimalType;
};

export function getLuckMultiplier(state: GameState): DecimalType {
  if (!state.prestige || !state.prestige.luckPoints) return new Decimal(1);
  const points = state.prestige.luckPoints;
  const mult = new Decimal(1).plus(points.times(0.02));
  return DecimalMath.min(mult, new Decimal(10));
}

export function getLuckGainMultiplier(state: GameState): DecimalType {
  const level = state.prestige?.shop?.luckFabricator ?? 0;
  if (level <= 0) return new Decimal(1);
  return new Decimal(1).plus(new Decimal(0.1).times(level));
}

export function getShopMultiplier(state: GameState): DecimalType {
  if (!state.prestige || !state.prestige.shop) return new Decimal(1);
  const fortuneAmplifierLevel = state.prestige.shop.multiplier ?? 0;
  if (fortuneAmplifierLevel <= 0) return new Decimal(1);
  const bonus = new Decimal(fortuneAmplifierLevel).times(0.05);
  return new Decimal(1).plus(bonus);
}

export function applyPrestigeMultipliers(baseCredits: DecimalType, state: GameState): DecimalType {
  return baseCredits
    .times(getLuckMultiplier(state))
    .times(getShopMultiplier(state))
    .times(getAscensionCreditBonus(state));
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

export function calculateLuckGain(state: GameState): DecimalType {
  try {
    const rawGain = getRawLuckGain(state);
    const flooredGain = (rawGain as DecimalType & { floor: () => DecimalType }).floor();
    return DecimalMath.max(flooredGain, new Decimal(0));
  } catch {
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
    return { progressPercent: percent, rawGain, fractional };
  } catch {
    return { progressPercent: 0, rawGain: new Decimal(0), fractional: new Decimal(0) };
  }
}

export function preparePrestigePreview(state: GameState) {
  const luckGain = calculateLuckGain(state);
  return { luckGain, retained: ['prestige', 'settings'] };
}

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

export function getPrestigeUpgradeCost(key: PrestigeShopKey, currentLevel: number): DecimalType {
  const item = PRESTIGE_SHOP_ITEMS[key];
  if (!item) return new Decimal(0);
  return item.baseCost.times(item.costGrowth.pow(currentLevel));
}

export function canBuyPrestigeUpgrade(state: GameState, key: PrestigeShopKey): boolean {
  const item = PRESTIGE_SHOP_ITEMS[key];
  if (!item || !state.prestige) return false;
  const currentLevel = state.prestige.shop[key] ?? 0;
  if (item.maxLevel >= 0 && currentLevel >= item.maxLevel) return false;
  const cost = getPrestigeUpgradeCost(key, currentLevel);
  return state.prestige.luckPoints.gte(cost);
}

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

export function getAutorollCooldownMultiplier(state: GameState): DecimalType {
  const autorollLevel = state.prestige?.shop?.autorollCooldown ?? 0;
  if (autorollLevel <= 0) return new Decimal(1);
  return new Decimal(0.95).pow(autorollLevel);
}
