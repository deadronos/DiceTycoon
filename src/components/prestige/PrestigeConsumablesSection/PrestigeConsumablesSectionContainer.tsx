import React, { useMemo } from 'react';
import type { GameState } from '../../../types/game';
import type { PrestigeShopItem, PrestigeShopKey } from '../../../utils/constants';
import { type Decimal as DecimalType } from '../../../utils/decimal';
import { PrestigeConsumablesSectionPresenter } from './PrestigeConsumablesSectionPresenter';

interface PrestigeConsumablesSectionContainerProps {
    gameState: GameState;
    shopItems: Record<PrestigeShopKey, PrestigeShopItem>;
    canBuyUpgrade: (state: GameState, key: PrestigeShopKey) => boolean;
    getUpgradeCost: (key: PrestigeShopKey, level: number) => DecimalType;
    onBuyUpgrade: (key: PrestigeShopKey) => void;
}

export const PrestigeConsumablesSectionContainer: React.FC<PrestigeConsumablesSectionContainerProps> = ({
    gameState,
    shopItems,
    canBuyUpgrade,
    getUpgradeCost,
    onBuyUpgrade,
}) => {
    const consumableItems = useMemo(() => {
        return (Object.keys(shopItems) as PrestigeShopKey[])
            .filter(key => shopItems[key].category === 'consumable')
            .map(key => {
                const item = shopItems[key];
                const currentCount = key === 'rerollTokens' ? gameState.prestige?.consumables?.rerollTokens ?? 0 : 0;
                const cost = getUpgradeCost(key, 0);
                const canBuy = canBuyUpgrade(gameState, key);
                const isNew = currentCount === 0;

                return {
                    key,
                    name: item.name,
                    icon: item.icon,
                    description: item.description,
                    formula: item.formula,
                    currentCount,
                    costText: cost.toString(),
                    canBuy,
                    isNew,
                };
            });
    }, [gameState, shopItems, canBuyUpgrade, getUpgradeCost]);

    return (
        <PrestigeConsumablesSectionPresenter
            consumableItems={consumableItems}
            onBuyUpgrade={(key) => onBuyUpgrade(key as PrestigeShopKey)}
        />
    );
};
