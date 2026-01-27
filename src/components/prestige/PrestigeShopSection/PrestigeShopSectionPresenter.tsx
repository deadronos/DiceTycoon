import React from 'react';
import { PrestigeShopFilters, type PrestigeShopFilterOption } from '../PrestigeShopFilters';
import { PrestigeShopCategory } from '../PrestigeShopCategory';
import type { PrestigeShopItemPayload } from '../PrestigeShopTypes';
import { type PrestigeShopKey, type PrestigeShopCategory as CategoryType } from '../../../utils/constants';

interface GroupedShopCategory {
    category: CategoryType;
    title: string;
    description?: string;
    items: PrestigeShopItemPayload[];
}

interface PrestigeShopSectionPresenterProps {
    filter: PrestigeShopFilterOption;
    setFilter: (value: PrestigeShopFilterOption) => void;
    groupedShop: GroupedShopCategory[];
    onBuyUpgrade: (key: PrestigeShopKey) => void;
}

export const PrestigeShopSectionPresenter: React.FC<PrestigeShopSectionPresenterProps> = ({
    filter,
    setFilter,
    groupedShop,
    onBuyUpgrade,
}) => {
    return (
        <div className="prestige-shop">
            <PrestigeShopFilters filter={filter} setFilter={setFilter} />
            {groupedShop.map(group => (
                <PrestigeShopCategory
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
