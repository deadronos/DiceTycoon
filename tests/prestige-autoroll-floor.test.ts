import { describe, it, expect } from 'vitest';
import Decimal from '../src/utils/decimal';
import { buyPrestigeUpgrade } from '../src/utils/game-prestige';
import { createDefaultGameState } from '../src/utils/storage';

describe('prestige autoroll cooldown floor', () => {
  it('keeps autoroll cooldown above the minimum floor after prestige upgrades', () => {
    const state = createDefaultGameState();
    state.prestige!.luckPoints = new Decimal(1000);
    state.autoroll.level = 100;
    state.autoroll.enabled = true;
    state.prestige!.shop.autorollCooldown = 4;

    const newState = buyPrestigeUpgrade(state, 'autorollCooldown');

    expect(newState).not.toBeNull();
    expect(newState!.autoroll.cooldown.gte(new Decimal(0.05))).toBe(true);
  });
});
