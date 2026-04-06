import Decimal from './decimal';
import { type Decimal as DecimalType } from '@patashu/break_eternity.js';
import type { GameState } from '../types/game';
import { getAscensionCreditBonus } from './ascension';
import { getAchievementGlobalMultiplier } from './achievements';

/**
 * Calculates the multiplier derived from Luck points.
 * @param state The current game state.
 * @returns The luck multiplier.
 */
export function getLuckMultiplier(state: GameState): DecimalType {
  if (!state.prestige || !state.prestige.luckPoints) return new Decimal(1);
  const points = state.prestige.luckPoints;
  const mult = new Decimal(1).plus(points.times(0.02));
  return Decimal.min(mult, new Decimal(10));
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
 * Applies all global multipliers (prestige, achievements, ascension, abilities) to a credit amount.
 * @param baseCredits The initial credit amount.
 * @param state The current game state.
 * @returns The final credit amount after multipliers.
 */
export function applyGlobalMultipliers(baseCredits: DecimalType, state: GameState): DecimalType {
  const achievementMultiplier = getAchievementGlobalMultiplier(state.achievements.unlocked);
  const abilityMultiplier = getAbilityGlobalMultiplier(state);

  return baseCredits
    .times(getLuckMultiplier(state))
    .times(getShopMultiplier(state))
    .times(getAscensionCreditBonus(state))
    .times(achievementMultiplier)
    .times(abilityMultiplier);
}
