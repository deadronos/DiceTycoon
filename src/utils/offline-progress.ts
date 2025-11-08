import type { GameState } from '../types/game';
import { stopRollingAnimation } from './roll-helpers';
import { executeRoll } from './roll-helpers';

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

  let workingState: GameState = stopRollingAnimation(state);

  for (let i = 0; i < rollsPerformed; i++) {
    const result = executeRoll(workingState, { animate: false });
    workingState = stopRollingAnimation(result.newState);
  }

  return {
    ...workingState,
    lastSaveTimestamp: currentTime,
  };
}
