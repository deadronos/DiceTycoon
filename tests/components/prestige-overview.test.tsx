import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PrestigeOverview } from '../../src/components/prestige/PrestigeOverview';

// Simple smoke test to ensure prestige overview renders basic UI.

describe('PrestigeOverview', () => {
  it('renders prestige overview section', () => {
    const gameState: any = {
      credits: 1000,
    };

    render(
      <PrestigeOverview
        gameState={gameState}
        luckGain={0 as any}
        currentLuck={0 as any}
        projectedLuck={0 as any}
        luckMultiplier={1 as any}
        luckGainBoost={1 as any}
        shopMultiplier={1 as any}
        autorollBoost={1 as any}
        autorollReductionPercent={0}
        luckProgressPercent={0}
        onConfirm={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText(/Projected Luck Gain/i)).not.toBeNull();
  });
});
