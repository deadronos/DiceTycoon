import Decimal from './decimal';
import { type Decimal as DecimalType } from '@patashu/break_eternity.js';
import type {
  GameState,
  AscensionState,
  AscensionDieState,
  AscensionDieFocus,
} from '../types/game';
import { ASCENSION_CONFIG } from './constants';

const DecimalMath = Decimal as unknown as {
  min(a: DecimalType, b: DecimalType): DecimalType;
};

export function createDefaultAscensionState(unlocked = false): AscensionState {
  const dice: AscensionDieState[] = [
    { id: 1, unlocked: true, tier: 0, focus: 'stardust' },
    { id: 2, unlocked: false, tier: 0, focus: 'stardust' },
    { id: 3, unlocked: false, tier: 0, focus: 'resonance' },
  ];

  return {
    unlocked,
    stardust: new Decimal(0),
    resonance: new Decimal(0),
    dice,
    lastTick: Date.now(),
    totalCycles: 0,
  };
}

export function canUnlockAscension(state: GameState): boolean {
  return (state.prestige?.totalPrestiges ?? 0) >= ASCENSION_CONFIG.unlockPrestiges;
}

export function unlockAscension(state: GameState): GameState {
  if (state.ascension.unlocked) return state;
  return {
    ...state,
    ascension: {
      ...state.ascension,
      unlocked: true,
      lastTick: Date.now(),
    },
  };
}

function getAscensionSynergyBoost(state: GameState): DecimalType {
  const luck = state.prestige?.luckPoints ?? new Decimal(0);
  const totalPrestiges = state.prestige?.totalPrestiges ?? 0;
  const luckBoost = luck.times(0.01);
  const prestigeBoost = new Decimal(totalPrestiges).times(0.02);
  return new Decimal(1).plus(luckBoost).plus(prestigeBoost);
}

export function getAscensionDieProduction(
  die: AscensionDieState,
  state: GameState
): { stardustPerSecond: DecimalType; resonancePerSecond: DecimalType } {
  if (!die.unlocked) {
    return { stardustPerSecond: new Decimal(0), resonancePerSecond: new Decimal(0) };
  }

  const tierBonus = new Decimal(1).plus(new Decimal(ASCENSION_CONFIG.tierGrowth).times(die.tier));
  const baseRate = new Decimal(ASCENSION_CONFIG.baseStardustRate).times(tierBonus);
  const boost = getAscensionSynergyBoost(state);
  const resonanceShare = new Decimal(ASCENSION_CONFIG.baseResonanceShare);
  const stardustShare = new Decimal(1).minus(resonanceShare);
  const scaled = baseRate.times(boost);

  if (die.focus === 'stardust') {
    return { stardustPerSecond: scaled, resonancePerSecond: new Decimal(0) };
  }

  return {
    stardustPerSecond: scaled.times(stardustShare),
    resonancePerSecond: scaled.times(resonanceShare),
  };
}

export function getAscensionProduction(state: GameState): {
  stardustPerSecond: DecimalType;
  resonancePerSecond: DecimalType;
} {
  if (!state.ascension.unlocked) {
    return { stardustPerSecond: new Decimal(0), resonancePerSecond: new Decimal(0) };
  }

  return state.ascension.dice.reduce(
    (totals, die) => {
      const production = getAscensionDieProduction(die, state);
      return {
        stardustPerSecond: totals.stardustPerSecond.plus(production.stardustPerSecond),
        resonancePerSecond: totals.resonancePerSecond.plus(production.resonancePerSecond),
      };
    },
    { stardustPerSecond: new Decimal(0), resonancePerSecond: new Decimal(0) }
  );
}

export function tickAscension(state: GameState, now = Date.now()): GameState {
  if (!state.ascension.unlocked) return state;

  const elapsedMs = Math.max(0, now - state.ascension.lastTick);
  if (elapsedMs < 250) return state;

  const elapsedSeconds = elapsedMs / 1000;
  const production = getAscensionProduction(state);
  const stardustGain = production.stardustPerSecond.times(elapsedSeconds);
  const resonanceGain = production.resonancePerSecond.times(elapsedSeconds);

  return {
    ...state,
    ascension: {
      ...state.ascension,
      stardust: state.ascension.stardust.plus(stardustGain),
      resonance: state.ascension.resonance.plus(resonanceGain),
      lastTick: now,
      totalCycles: state.ascension.totalCycles + elapsedSeconds,
    },
  };
}

export function getAscensionCreditBonus(state: GameState): DecimalType {
  const resonance = state.ascension?.resonance ?? new Decimal(0);
  const bonus = new Decimal(1).plus(resonance.times(0.02));
  return DecimalMath.min(bonus, new Decimal(10));
}

export function getAscensionUnlockCost(die: AscensionDieState): DecimalType {
  return new Decimal(ASCENSION_CONFIG.unlockCostMultiplier).times(die.id);
}

export function getAscensionUpgradeCost(die: AscensionDieState): DecimalType {
  return new Decimal(8).times(new Decimal(2).pow(die.tier));
}

export function unlockAscensionDie(state: GameState, dieId: number): GameState | null {
  const ascension = state.ascension;
  const die = ascension.dice.find(d => d.id === dieId);
  if (!die || die.unlocked) return null;

  const cost = getAscensionUnlockCost(die);
  if (ascension.stardust.lt(cost)) return null;

  return {
    ...state,
    ascension: {
      ...ascension,
      stardust: ascension.stardust.minus(cost),
      dice: ascension.dice.map(d => (d.id === dieId ? { ...d, unlocked: true } : d)),
    },
  };
}

export function upgradeAscensionDie(state: GameState, dieId: number): GameState | null {
  const ascension = state.ascension;
  const die = ascension.dice.find(d => d.id === dieId);
  if (!die || !die.unlocked) return null;

  const cost = getAscensionUpgradeCost(die);
  if (ascension.stardust.lt(cost)) return null;

  return {
    ...state,
    ascension: {
      ...ascension,
      stardust: ascension.stardust.minus(cost),
      dice: ascension.dice.map(d =>
        d.id === dieId
          ? { ...d, tier: d.tier + 1 }
          : d
      ),
    },
  };
}

export function updateAscensionFocus(
  state: GameState,
  dieId: number,
  focus: AscensionDieFocus
): GameState {
  const ascension = state.ascension;
  const die = ascension.dice.find(d => d.id === dieId);
  if (!die || !die.unlocked || die.focus === focus) return state;

  return {
    ...state,
    ascension: {
      ...ascension,
      dice: ascension.dice.map(d => (d.id === dieId ? { ...d, focus } : d)),
    },
  };
}
