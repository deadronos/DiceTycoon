import { describe, it, expect } from 'vitest';
import Decimal from '../src/utils/decimal';
import { getAutorollUpgradeCost, toggleAutoroll } from '../src/utils/game-autoroll';
import type { GameState } from '../src/types/game';

const baseState: GameState = {
  credits: new Decimal(1e6),
  dice: [],
  autoroll: {
    enabled: false,
    level: 1,
    cooldown: new Decimal(1),
  },
  lastSaveTimestamp: 0,
  // @ts-expect-error minimal stub
  stats: { autoroll: {} },
  // @ts-expect-error minimal stub
  achievements: [],
};

describe('game-autoroll', () => {
  it('upgrade cost increases with level', () => {
    const c1 = getAutorollUpgradeCost(1);
    const c3 = getAutorollUpgradeCost(3);
    expect(c3.gt(c1)).toBe(true);
  });

  it('toggleAutoroll flips enabled when level > 0', () => {
    const toggled = toggleAutoroll(baseState);
    expect(toggled.autoroll.enabled).toBe(true);
  });
});
