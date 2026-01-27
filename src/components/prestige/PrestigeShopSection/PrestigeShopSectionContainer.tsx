import React, { useMemo } from 'react';
import { type Decimal as DecimalType } from '../../../utils/decimal';
import type { GameState } from '../../../types/game';
import {
    type PrestigeShopItem,
    type PrestigeShopKey,
    type PrestigeShopCategory as CategoryType
} from '../../../utils/constants';
import { type PrestigeShopFilterOption } from '../PrestigeShopFilters';
import type { PrestigeShopItemPayload } from '../PrestigeShopTypes';
import { PrestigeShopSectionPresenter } from './PrestigeShopSectionPresenter';

interface PrestigeShopSectionContainerProps {
    gameState: GameState;
    shopItems: Record<PrestigeShopKey, PrestigeShopItem>;
    canBuyUpgrade: (state: GameState, key: PrestigeShopKey) => boolean;
    getUpgradeCost: (key: PrestigeShopKey, level: number) => DecimalType;
    onBuyUpgrade: (key: PrestigeShopKey) => void;
    filter: PrestigeShopFilterOption;
    setFilter: (value: PrestigeShopFilterOption) => void;
}

const categoryOrder: CategoryType[] = ['passive', 'gameplay', 'qol', 'prestige-exclusive'];
const categoryLabels: Record<CategoryType, string> = {
    passive: 'Economy Boosters',
    gameplay: 'Gameplay Tweaks',
    qol: 'Quality of Life',
    consumable: 'Consumables',
    'prestige-exclusive': 'Prestige Exclusives',
};
const categoryDescriptions: Partial<Record<CategoryType, string>> = {
    passive: 'Scale your long-term multipliers and luck generation.',
    gameplay: 'Modify how your rolls behave and guarantee better outcomes.',
    qol: 'Automate and accelerate the grind so you can focus on strategy.',
    'prestige-exclusive': 'Unlock unique systems that only exist beyond prestige resets.',
};

const recommendationKeys: PrestigeShopKey[] = ['multiplier', 'luckFabricator', 'autorollCooldown'];

export const PrestigeShopSectionContainer: React.FC<PrestigeShopSectionContainerProps> = ({
    gameState,
    shopItems,
    canBuyUpgrade,
    getUpgradeCost,
    onBuyUpgrade,
    filter,
    setFilter,
}) => {
    const recommendedSet = useMemo(() => new Set<PrestigeShopKey>(recommendationKeys), []);

    const shopKeys = useMemo(
        () =>
            (Object.keys(shopItems) as PrestigeShopKey[]).filter(
                key => shopItems[key].category !== 'consumable'
            ),
        [shopItems]
    );

    const filteredShopKeys = useMemo(
        () =>
            shopKeys.filter(key => {
                if (filter === 'affordable') return canBuyUpgrade(gameState, key);
                if (filter === 'recommended') return recommendedSet.has(key);
                return true;
            }),
        [shopKeys, filter, canBuyUpgrade, gameState, recommendedSet]
    );

    const groupedShop = useMemo(() => {
        return categoryOrder
            .map(category => {
                const items: PrestigeShopItemPayload[] = filteredShopKeys
                    .filter(key => shopItems[key].category === category)
                    .map(key => {
                        const item = shopItems[key];
                        const currentLevel = gameState.prestige?.shop?.[key] ?? 0;
                        const nextCost = getUpgradeCost(key, currentLevel);
                        const canBuy = canBuyUpgrade(gameState, key);
                        const isMaxed = item.maxLevel > 0 && currentLevel >= item.maxLevel;
                        const progress = item.maxLevel > 0 ? Math.min(100, (currentLevel / item.maxLevel) * 100) : 0;
                        const isRecommended = recommendedSet.has(key);
                        const isNew = currentLevel === 0;

                        return {
                            key,
                            item,
                            currentLevel,
                            nextCost,
                            canBuy,
                            isMaxed,
                            progressPercent: progress,
                            isRecommended,
                            isNew,
                        };
                    });

                return {
                    category,
                    title: categoryLabels[category],
                    description: categoryDescriptions[category],
                    items,
                };
            })
            .filter(group => group.items.length > 0);
    }, [filteredShopKeys, shopItems, gameState, canBuyUpgrade, getUpgradeCost, recommendedSet]);

    return (
        <PrestigeShopSectionPresenter
            filter={filter}
            setFilter={setFilter}
            groupedShop={groupedShop}
            onBuyUpgrade={onBuyUpgrade}
        />
    );
};
