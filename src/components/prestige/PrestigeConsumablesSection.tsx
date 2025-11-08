import React, { useMemo } from 'react';
import type { GameState } from '../../types/game';
import type { PrestigeShopItem, PrestigeShopKey } from '../../utils/constants';
import { InfoTooltip } from '../InfoTooltip';
import { type Decimal as DecimalType } from '@patashu/break_eternity.js';

interface Props {
  gameState: GameState;
  shopItems: Record<PrestigeShopKey, PrestigeShopItem>;
  canBuyUpgrade: (state: GameState, key: PrestigeShopKey) => boolean;
  getUpgradeCost: (key: PrestigeShopKey, level: number) => DecimalType;
  onBuyUpgrade: (key: PrestigeShopKey) => void;
}

export const PrestigeConsumablesSection: React.FC<Props> = ({
  gameState,
  shopItems,
  canBuyUpgrade,
  getUpgradeCost,
  onBuyUpgrade,
}) => {
  const consumableKeys = useMemo(
    () => (Object.keys(shopItems) as PrestigeShopKey[]).filter(key => shopItems[key].category === 'consumable'),
    [shopItems]
  );

  return (
    <div className="prestige-shop">
      <div className="prestige-category">
        <div className="prestige-category__header">
          <h3>Consumables</h3>
          <p>Stockpile resources you can trigger manually during a run.</p>
        </div>
        <div className="prestige-shop-grid">
          {consumableKeys.map(key => {
            const item = shopItems[key];
            const currentCount = key === 'rerollTokens' ? gameState.prestige?.consumables?.rerollTokens ?? 0 : 0;
            const cost = getUpgradeCost(key, 0);
            const canBuy = canBuyUpgrade(gameState, key);
            const isNew = currentCount === 0;

            return (
              <div key={key} className={`prestige-item prestige-item--consumable ${canBuy ? 'prestige-item--affordable' : ''}`}>
                <div className="prestige-item__header">
                  <span className="prestige-item__icon" aria-hidden="true">{item.icon}</span>
                  <div className="prestige-item__text">
                    <div className="prestige-item__title-row">
                      <div className="prestige-item__title">{item.name}</div>
                      <div className="prestige-item__badges">
                        {isNew && <span className="prestige-item__badge prestige-item__badge--new">NEW</span>}
                      </div>
                    </div>
                    <div className="prestige-item__description">{item.description}</div>
                  </div>
                  <InfoTooltip content={item.formula} label={`${item.name} formula`} />
                </div>

                <div className="prestige-item__body">
                  <div className="prestige-item__effect">Owned: {currentCount}</div>
                  <div className="prestige-item__effect prestige-item__effect--next">Each purchase grants +5 tokens.</div>
                </div>

                <div className="prestige-item__footer">
                  <div className="prestige-item__cost">Cost: {cost.toString()} LP</div>
                  <button
                    className={canBuy ? 'btn btn-primary btn-small' : 'btn btn-secondary btn-small'}
                    onClick={() => onBuyUpgrade(key)}
                    disabled={!canBuy}
                  >
                    Purchase
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PrestigeConsumablesSection;
