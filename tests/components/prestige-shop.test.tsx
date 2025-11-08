import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PrestigeShopSection } from '../../src/components/prestige/PrestigeShopSection';

// Simple smoke + interaction: uses real shopItems shape and ensures click handler is wired.

describe('PrestigeShopSection', () => {
  it('calls onBuyUpgrade when a shop item is clicked', () => {
    const onBuyUpgrade = vi.fn();
    const gameState: any = {
      prestige: { shop: {} },
    };

    const localShopItems: any = {
      test: {
        id: 'test',
        label: 'Test Upgrade',
        description: 'desc',
        category: 'passive',
        maxLevel: 1,
      },
    };

    render(
      <PrestigeShopSection
        gameState={gameState}
        shopItems={localShopItems}
        canBuyUpgrade={() => true}
        getUpgradeCost={() => 0 as any}
        onBuyUpgrade={onBuyUpgrade}
        filter="all"
        setFilter={() => {}}
      />
    );

    const button = screen.getByRole('button', { name: /Purchase/i });
    fireEvent.click(button);

    expect(onBuyUpgrade).toHaveBeenCalled();
  });
});
