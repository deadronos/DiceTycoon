import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PrestigeShopSection } from '../../src/components/prestige/PrestigeShopSection';
import { createDefaultGameState } from '../../src/utils/storage';
import Decimal from '../../src/utils/decimal';
import { PRESTIGE_SHOP_ITEMS } from '../../src/utils/constants';

// Simple smoke + interaction: uses real shopItems shape and ensures click handler is wired.

describe('PrestigeShopSection', () => {
  it('calls onBuyUpgrade when a shop item is clicked', () => {
    const onBuyUpgrade = vi.fn();
    const gameState = createDefaultGameState();
    if (gameState.prestige) {
      gameState.prestige.shop = {};
    }

    render(
      <PrestigeShopSection
        gameState={gameState}
        shopItems={PRESTIGE_SHOP_ITEMS}
        canBuyUpgrade={() => true}
        getUpgradeCost={() => new Decimal(0)}
        onBuyUpgrade={onBuyUpgrade}
        filter="all"
        setFilter={() => {}}
      />
    );

    const buttons = screen.getAllByRole('button', { name: /Purchase/i });
    fireEvent.click(buttons[0]);

    expect(onBuyUpgrade).toHaveBeenCalled();
  });
});
