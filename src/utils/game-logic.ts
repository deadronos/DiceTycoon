import Decimal, { type Decimal as DecimalType } from '@patashu/break_eternity.js';
import { GameState } from '../types/game';
import { GAME_CONSTANTS, PRESTIGE_SHOP_ITEMS, type PrestigeShopKey } from './constants';
import { detectCombo, getComboMultiplier } from './combos';
import type { ComboResult } from '../types/combo';
import { rollDie, calculateCost, calculateMultiplier } from './decimal';
import { createDefaultGameState } from './storage';

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

/**
 * Perform a roll for all unlocked dice
 */
export function performRoll(
  state: GameState
): { newState: GameState; creditsEarned: DecimalType; combo: ComboResult | null } {
  let totalCredits = new Decimal(0);
  const rolledFaces: number[] = [];
  const newDice = state.dice.map(die => {
    if (!die.unlocked) return die;

    const face = rollDie();
    const credits = die.multiplier.times(face).times(die.id);
    totalCredits = totalCredits.plus(credits);
    rolledFaces.push(face);

    return {
      ...die,
      currentFace: face,
      isRolling: true,
    };
  });
  const combo = detectCombo(rolledFaces);
  let finalCredits = totalCredits;
  if (combo) {
    const multiplier = getComboMultiplier(combo);
    finalCredits = totalCredits.times(multiplier);
  }

  // Apply prestige multipliers (luck + shop)
  finalCredits = applyPrestigeMultipliers(finalCredits, state);

  return {
    newState: {
      ...state,
      credits: state.credits.plus(finalCredits),
      dice: newDice,
      totalRolls: state.totalRolls + 1,
    },
    creditsEarned: finalCredits,
    combo,
  };
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
    return Decimal.min(mult, new Decimal(10));
  } catch (err) {
    return new Decimal(1);
  }
}

/**
 * Calculate how many luck points the player would gain on a prestige reset.
 * Formula (MVP): floor( max(log10(totalCredits) - 3, 0) * 0.25 )
 */
export function calculateLuckGain(state: GameState): DecimalType {
  try {
    const credits = state.credits || new Decimal(0);
    // guard: if credits <= 0, return 0
    if (credits.lte(0)) return new Decimal(0);

    const log10 = Decimal.log10(credits);
    const base = Decimal.max(log10.minus(3), new Decimal(0));
    const gain = base.times(0.25).floor();
    return gain.max(0);
  } catch (err) {
    return new Decimal(0);
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
 * Upgrade autoroll
 */
export function upgradeAutoroll(state: GameState): GameState | null {
  const cost = getAutorollUpgradeCost(state.autoroll.level);
  if (state.credits.lt(cost)) return null;
  
  const newLevel = state.autoroll.level + 1;
  const newCooldown = getAutorollCooldown(newLevel);
  
  return {
    ...state,
    credits: state.credits.minus(cost),
    autoroll: {
      ...state.autoroll,
      enabled: true,
      level: newLevel,
      cooldown: newCooldown,
    },
  };
}

/**
 * Toggle autoroll on/off
 */
export function toggleAutoroll(state: GameState): GameState {
  if (state.autoroll.level === 0) return state; // Can't toggle if not unlocked
  
  return {
    ...state,
    autoroll: {
      ...state.autoroll,
      enabled: !state.autoroll.enabled,
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
 * Calculate offline progress
 */
export function calculateOfflineProgress(state: GameState, currentTime: number): GameState {
  if (!state.autoroll.enabled || state.autoroll.level === 0) {
    return state;
  }
  
  const timeDiff = currentTime - state.lastSaveTimestamp;
  const cooldownMs = state.autoroll.cooldown.toNumber() * 1000;
  const rollsPerformed = Math.floor(timeDiff / cooldownMs);
  
  if (rollsPerformed <= 0) return state;
  
  // Calculate total credits earned
  let totalCreditsEarned = new Decimal(0);
  const unlockedDice = state.dice.filter(d => d.unlocked);
  
  for (let i = 0; i < rollsPerformed; i++) {
    const rolledFaces: number[] = [];
    // sum this roll's base credits
    let rollBase = new Decimal(0);
    unlockedDice.forEach(die => {
      const face = rollDie();
      rolledFaces.push(face);
      rollBase = rollBase.plus(die.multiplier.times(face).times(die.id));
    });

    const combo = detectCombo(rolledFaces);
    if (combo) {
      const multiplier = getComboMultiplier(combo);
      totalCreditsEarned = totalCreditsEarned.plus(rollBase.times(multiplier));
    } else {
      totalCreditsEarned = totalCreditsEarned.plus(rollBase);
    }
  }
  
  return {
    ...state,
    credits: state.credits.plus(totalCreditsEarned),
    totalRolls: state.totalRolls + rollsPerformed,
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
  return {
    ...state,
    prestige: {
      ...state.prestige,
      luckPoints: state.prestige.luckPoints.minus(cost),
      shop: {
        ...state.prestige.shop,
        [key]: currentLevel + 1,
      },
    },
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

