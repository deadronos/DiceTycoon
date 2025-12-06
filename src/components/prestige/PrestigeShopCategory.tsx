import React from 'react';
import type { PrestigeShopKey } from '../../utils/constants';
import { PrestigeShopItemCard } from './PrestigeShopItem';
import type { PrestigeShopItemPayload } from './PrestigeShopTypes';

/**
 * Props for the PrestigeShopCategory component.
 */
interface Props {
  /** Title of the shop category. */
  title: string;
  /** Optional description of the category. */
  description?: string;
  /** List of items to display in this category. */
  items: PrestigeShopItemPayload[];
  /** Callback to purchase an upgrade. */
  onBuyUpgrade: (key: PrestigeShopKey) => void;
}

/**
 * Renders a section of items within a specific category in the Prestige Shop.
 */
export const PrestigeShopCategory: React.FC<Props> = ({ title, description, items, onBuyUpgrade }) => {
  if (items.length === 0) return null;

  return (
    <div className="prestige-category">
      <div className="prestige-category__header">
        <h3>{title}</h3>
        {description && <p>{description}</p>}
      </div>
      <div className="prestige-shop-grid">
        {items.map(payload => (
          <PrestigeShopItemCard
            key={payload.key}
            item={payload.item}
            currentLevel={payload.currentLevel}
            nextCost={payload.nextCost}
            canBuy={payload.canBuy}
            isMaxed={payload.isMaxed}
            progressPercent={payload.progressPercent}
            isRecommended={payload.isRecommended}
            isNew={payload.isNew}
            onBuy={() => onBuyUpgrade(payload.key)}
          />
        ))}
      </div>
    </div>
  );
};

export default PrestigeShopCategory;
