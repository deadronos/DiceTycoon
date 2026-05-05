import { describe, it, expect } from 'vitest';
import { calculateOfflineProgress } from '../src/utils/offline-progress';
import Decimal from '../src/utils/decimal';
import { createDefaultGameState } from '../src/utils/storage';

describe('offline-progress crit handling', () => {
  it('should include crit multiplier in average roll calculation', () => {
    const state = createDefaultGameState();
    state.autoroll.enabled = true;
    state.autoroll.level = 1;
    state.autoroll.cooldown = new Decimal(1);
    state.lastSaveTimestamp = 0;
    state.credits = new Decimal(0);

    // 5 seconds = 5 rolls, at 1 crit per second expected
    const updated = calculateOfflineProgress(state, 5000);

    // With 1% crit chance, 5 rolls should have ~1 crit
    // Crit multiplier is 5x, so some credits should be boosted
    // Verify credits are higher than base calculation without crits
    const baseCredits = updated.credits.toNumber();
    // With 1% crit chance at 5x multiplier, expect credits higher than base calculation
    // Base calculation: 1 die * 3.5 avg * 5 rolls = 17.5 (without combo)
    // With 1% crit at 5x, expected value multiplier is 1 + 0.01*(5-1) = 1.04
    // So credits should be > 17.5 * 1.04 = 18.2
    expect(baseCredits).toBeGreaterThan(18);
  });
});
