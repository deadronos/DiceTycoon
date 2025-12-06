import type { GameState } from '../types/game';
import { rollDie } from './decimal';

/**
 * Gets the number of guaranteed rerolls from the prestige shop.
 * @param state The current game state.
 * @returns The number of guaranteed rerolls.
 */
export function getGuaranteedRerollLevel(state: GameState): number {
  return state.prestige?.shop?.guaranteedReroll ?? 0;
}

/**
 * Applies guaranteed rerolls to the lowest dice faces.
 * @param state The current game state.
 * @param rolledFaces The original faces rolled.
 * @returns Object with the new state (updated die faces) and the new face values.
 */
export function applyGuaranteedReroll(
  state: GameState,
  rolledFaces: number[]
): { newState: GameState; faces: number[] } {
  const guaranteedLevel = getGuaranteedRerollLevel(state);
  if (guaranteedLevel <= 0 || rolledFaces.length === 0) {
    return { newState: state, faces: rolledFaces };
  }
  let newFaces = [...rolledFaces];
  const newDice = [...state.dice];
  for (let i = 0; i < guaranteedLevel; i++) {
    const lowestIdx = newFaces.indexOf(Math.min(...newFaces));
    if (lowestIdx >= 0) {
      const newFace = rollDie();
      newFaces[lowestIdx] = newFace;
      newDice[lowestIdx] = { ...newDice[lowestIdx], currentFace: newFace };
    }
  }
  return { newState: { ...state, dice: newDice }, faces: newFaces };
}

/**
 * Consumes a reroll token if available.
 * @param state The current game state.
 * @returns The updated game state, or null if no tokens available.
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
