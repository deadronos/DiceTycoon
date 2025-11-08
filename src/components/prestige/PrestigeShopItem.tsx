import React from 'react';
import { InfoTooltip } from '../InfoTooltip';
import { type Decimal as DecimalType } from '@patashu/break_eternity.js';
import type { PrestigeShopItem } from '../../utils/constants';

interface Props {
  item: PrestigeShopItem;
  currentLevel: number;
  nextCost: DecimalType;
  canBuy: boolean;
  isMaxed: boolean;
  progressPercent: number;
  isRecommended: boolean;
  isNew: boolean;
  onBuy: () => void;
}

export const PrestigeShopItemCard: React.FC<Props> = ({
  item,
  currentLevel,
  nextCost,
  canBuy,
  isMaxed,
  progressPercent,
  isRecommended,
  isNew,
  onBuy,
}) => {
  const itemClassNames = [
    'prestige-item',
    canBuy && !isMaxed ? 'prestige-item--affordable' : '',
    isRecommended ? 'prestige-item--recommended' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={itemClassNames}>
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
              <div className="prestige-progress__bar" data-width={`${progressPercent}%`} />
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
          onClick={onBuy}
          disabled={!canBuy || isMaxed}
        >
          {isMaxed ? 'Complete' : 'Purchase'}
        </button>
      </div>
    </div>
  );
};

export default PrestigeShopItemCard;
