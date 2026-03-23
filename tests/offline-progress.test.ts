import { describe, it, expect } from 'vitest';
import { calculateOfflineProgress } from '../src/utils/offline-progress';
import Decimal from '../src/utils/decimal';
import type { GameState } from '../src/types/game';
import { createDefaultGameState } from '../src/utils/storage';

const makeState = (): GameState => {
  const state = createDefaultGameState();
  state.credits = new Decimal(0);
  state.lastSaveTimestamp = 0; // Set to 0 so time diff is meaningful
  state.autoroll.enabled = true;
  state.autoroll.level = 1;
  state.autoroll.cooldown = new Decimal(1);
  return state;
};

describe('offline-progress', () => {
  it('grants positive credits when autoroll enabled and time elapsed', () => {
    const state = makeState();
    const updated = calculateOfflineProgress(state, 5000); // 5s, cooldown=1s -> >=1 roll

    expect(updated.credits.gt(state.credits)).toBe(true);
    expect(updated.lastSaveTimestamp).toBe(5000);
  });

  it('keeps best-roll stats unchanged when applying offline progress', () => {
    const state = makeState();
    state.stats.bestRoll = new Decimal(1234);
    state.stats.bestRollFaces = [6, 5, 4];

    const updated = calculateOfflineProgress(state, 5000);

    expect(updated.stats.bestRoll.toString()).toBe('1234');
    expect(updated.stats.bestRollFaces).toEqual([6, 5, 4]);
  });
});
