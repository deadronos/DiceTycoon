import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PrestigeOverview } from '../../src/components/prestige/PrestigeOverview';
import Decimal from '../../src/utils/decimal';
import { createDefaultGameState } from '../../src/utils/storage';

// Simple smoke test to ensure prestige overview renders basic UI.

describe('PrestigeOverview', () => {
  it('renders prestige overview section', () => {
    const gameState = createDefaultGameState();
    gameState.credits = new Decimal(1000);
    const zero = new Decimal(0);
    const one = new Decimal(1);

    render(
      <PrestigeOverview
        gameState={gameState}
        luckGain={zero}
        currentLuck={zero}
        projectedLuck={zero}
        luckMultiplier={one}
        luckGainBoost={one}
        shopMultiplier={one}
        autorollBoost={one}
        autorollReductionPercent={0}
        luckProgressPercent={0}
        onConfirm={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText(/Projected Luck Gain/i)).not.toBeNull();
  });
});
