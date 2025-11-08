import React, { useMemo } from 'react';
import type { GameState } from '../../types/game';
import type { PrestigeShopItem, PrestigeShopKey, PrestigeShopCategory } from '../../utils/constants';
import { InfoTooltip } from '../InfoTooltip';
import { type Decimal as DecimalType } from '@patashu/break_eternity.js';

interface Props {
  gameState: GameState;
  shopItems: Record<PrestigeShopKey, PrestigeShopItem>;
  canBuyUpgrade: (state: GameState, key: PrestigeShopKey) => boolean;
  getUpgradeCost: (key: PrestigeShopKey, level: number) => DecimalType;
  onBuyUpgrade: (key: PrestigeShopKey) => void;
  filter: 'all' | 'affordable' | 'recommended';
  setFilter: (v: 'all' | 'affordable' | 'recommended') => void;
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


export const PrestigeShopSection: React.FC<Props> = ({
  gameState,
  shopItems,
  canBuyUpgrade,
  getUpgradeCost,
  onBuyUpgrade,
  filter,
  setFilter,
}) => {
  const recommendedSet = useMemo(
    () => new Set<PrestigeShopKey>(['multiplier', 'luckFabricator', 'autorollCooldown']),
    []
  );

  const shopKeys = useMemo(
    () => (Object.keys(shopItems) as PrestigeShopKey[]).filter(key => shopItems[key].category !== 'consumable'),
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
      .map(category => ({
        category,
        items: filteredShopKeys.filter(key => shopItems[key].category === category),
      }))
      .filter(group => group.items.length > 0);
  }, [filteredShopKeys, shopItems]);

  return (
    <div className="prestige-shop">
      <div className="prestige-shop__filters">
        <label htmlFor="prestige-shop-filter">Filter</label>
        <select
          id="prestige-shop-filter"
          value={filter}
          onChange={event => setFilter(event.target.value as 'all' | 'affordable' | 'recommended')}
        >
          <option value="all">All Upgrades</option>
          <option value="affordable">Affordable Now</option>
          <option value="recommended">Recommended Picks</option>
        </select>
      </div>
      {groupedShop.map(group => (
        <div className="prestige-category" key={group.category}>
          <div className="prestige-category__header">
            <h3>{categoryLabels[group.category]}</h3>
            {categoryDescriptions[group.category] && <p>{categoryDescriptions[group.category]}</p>}
          </div>
          <div className="prestige-shop-grid">
            {group.items.map(key => {
              const item = shopItems[key];
              const currentLevel = gameState.prestige?.shop?.[key] ?? 0;
              const nextCost = getUpgradeCost(key, currentLevel);
              const canBuy = canBuyUpgrade(gameState, key);
              const isMaxed = item.maxLevel > 0 && currentLevel >= item.maxLevel;
              const progress = item.maxLevel > 0 ? Math.min(100, (currentLevel / item.maxLevel) * 100) : 0;
              const isRecommended = recommendedSet.has(key);
              const isNew = currentLevel === 0;
              const itemClassNames = [
                'prestige-item',
                canBuy && !isMaxed ? 'prestige-item--affordable' : '',
                isRecommended ? 'prestige-item--recommended' : '',
              ]
                .filter(Boolean)
                .join(' ');

              return (
                <div key={key} className={itemClassNames}>
                  <div className="prestige-item__header">
                    <span className="prestige-item__icon" aria-hidden="true">{item.icon}</span>
                    <div className="prestige-item__text">
                      <div className="prestige-item__title-row">
                        <div className="prestige-item__title">{item.name}</div>
                        <div className="prestige-item__badges">
                          {isNew && <span className="prestige-item__badge prestige-item__badge--new">NEW</span>}
                          {isRecommended && (
                            <span className="prestige-item__badge prestige-item__badge--recommended">Recommended</span>
                          )}
                        </div>
                      </div>
                      <div className="prestige-item__description">{item.description}</div>
                    </div>
                    <InfoTooltip content={item.formula} label={`${item.name} formula`} />
                  </div>

                  <div className="prestige-item__body">
                    <div className="prestige-item__level-row">
                      <span>
                        Level {currentLevel}
                        {item.maxLevel > 0 && ` / ${item.maxLevel}`}
                      </span>
                      {item.maxLevel > 0 && (
                        <div className="prestige-progress" aria-hidden="true">
                          <div className="prestige-progress__bar" data-width={`${progress}%`} />
                        </div>
                      )}
                    </div>

                    <div className="prestige-item__effects">
                      {item.getCurrentEffect && (
                        <div className="prestige-item__effect">{item.getCurrentEffect(currentLevel)}</div>
                      )}
                      {item.getNextEffect && !isMaxed && (
                        <div className="prestige-item__effect prestige-item__effect--next">
                          {item.getNextEffect(currentLevel)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="prestige-item__footer">
                    <div className="prestige-item__cost">
                      {isMaxed ? 'Maxed out' : `Cost: ${nextCost.toString()} LP`}
                    </div>
                    <button
                      className={canBuy && !isMaxed ? 'btn btn-primary btn-small' : 'btn btn-secondary btn-small'}
                      onClick={() => onBuyUpgrade(key)}
                      disabled={!canBuy || isMaxed}
                    >
                      {isMaxed ? 'Complete' : 'Purchase'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PrestigeShopSection;
