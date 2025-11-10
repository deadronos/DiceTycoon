import { describe, it, expect } from 'vitest';
import Decimal from '../src/utils/decimal';
import { getAutorollUpgradeCost, toggleAutoroll } from '../src/utils/game-autoroll';
import type { GameState } from '../src/types/game';
import { createDefaultGameState } from '../src/utils/storage';

const makeState = (): GameState => {
  const state = createDefaultGameState();
  state.credits = new Decimal(1e6);
  state.autoroll.enabled = false;
  state.autoroll.level = 1;
  state.autoroll.cooldown = new Decimal(1);
  return state;
};

describe('game-autoroll', () => {
  it('upgrade cost increases with level', () => {
    const c1 = getAutorollUpgradeCost(1);
    const c3 = getAutorollUpgradeCost(3);
    expect(c3.gt(c1)).toBe(true);
  });

  it('toggleAutoroll flips enabled when level > 0', () => {
    const toggled = toggleAutoroll(makeState());
    expect(toggled.autoroll.enabled).toBe(true);
  });
});
