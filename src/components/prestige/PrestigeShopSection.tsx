import React, { useMemo } from 'react';
import { type Decimal as DecimalType } from '@patashu/break_eternity.js';
import type { GameState } from '../../types/game';
import type { PrestigeShopItem, PrestigeShopKey, PrestigeShopCategory } from '../../utils/constants';
import { PrestigeShopFilters, type PrestigeShopFilterOption } from './PrestigeShopFilters';
import { PrestigeShopCategory as PrestigeShopCategoryComponent } from './PrestigeShopCategory';
import type { PrestigeShopItemPayload } from './PrestigeShopTypes';

interface Props {
  gameState: GameState;
  shopItems: Record<PrestigeShopKey, PrestigeShopItem>;
  canBuyUpgrade: (state: GameState, key: PrestigeShopKey) => boolean;
  getUpgradeCost: (key: PrestigeShopKey, level: number) => DecimalType;
  onBuyUpgrade: (key: PrestigeShopKey) => void;
  filter: PrestigeShopFilterOption;
  setFilter: (value: PrestigeShopFilterOption) => void;
}

const categoryOrder: PrestigeShopCategory[] = ['passive', 'gameplay', 'qol', 'prestige-exclusive'];
const categoryLabels: Record<PrestigeShopCategory, string> = {
  passive: 'Economy Boosters',
  gameplay: 'Gameplay Tweaks',
  qol: 'Quality of Life',
  consumable: 'Consumables',
  'prestige-exclusive': 'Prestige Exclusives',
};
const categoryDescriptions: Partial<Record<PrestigeShopCategory, string>> = {
  passive: 'Scale your long-term multipliers and luck generation.',
  gameplay: 'Modify how your rolls behave and guarantee better outcomes.',
  qol: 'Automate and accelerate the grind so you can focus on strategy.',
  'prestige-exclusive': 'Unlock unique systems that only exist beyond prestige resets.',
};

const recommendationKeys: PrestigeShopKey[] = ['multiplier', 'luckFabricator', 'autorollCooldown'];

export const PrestigeShopSection: React.FC<Props> = ({
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
    <div className="prestige-shop">
      <PrestigeShopFilters filter={filter} setFilter={setFilter} />
      {groupedShop.map(group => (
        <PrestigeShopCategoryComponent
          key={group.category}
          title={group.title}
          description={group.description}
          items={group.items}
          onBuyUpgrade={onBuyUpgrade}
        />
      ))}
    </div>
  );
};

export default PrestigeShopSection;
