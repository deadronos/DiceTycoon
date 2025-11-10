import { describe, it, expect } from 'vitest';
import { calculateOfflineProgress } from '../src/utils/offline-progress';
import Decimal from '../src/utils/decimal';
import type { GameState } from '../src/types/game';

const makeState = (): GameState => ({
  credits: new Decimal(0),
  dice: [
    {
      id: 1,
      unlocked: true,
      level: 1,
      multiplier: new Decimal(1),
      animationLevel: 0,
      currentFace: 1,
      isRolling: false,
    },
  ],
  autoroll: {
    enabled: true,
    level: 1,
    cooldown: new Decimal(1),
  },
  lastSaveTimestamp: 0,
  totalRolls: 0,
  stats: {
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
  },
  achievements: {
    unlocked: [],
    newlyUnlocked: [],
  },
  settings: {
    sound: true,
    formatting: 'suffixed',
    theme: 'dark',
  },
});

describe('offline-progress', () => {
  it('grants positive credits when autoroll enabled and time elapsed', () => {
    const state = makeState();
    const updated = calculateOfflineProgress(state, 5000); // 5s, cooldown=1s -> >=1 roll

    expect(updated.credits.gt(state.credits)).toBe(true);
    expect(updated.lastSaveTimestamp).toBe(5000);
  });
});
