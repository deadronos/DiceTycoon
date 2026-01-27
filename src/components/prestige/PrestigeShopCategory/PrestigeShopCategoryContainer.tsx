import React from 'react';
import { type PrestigeShopKey } from '../../../utils/constants';
import type { PrestigeShopItemPayload } from '../PrestigeShopTypes';
import { PrestigeShopCategoryPresenter } from './PrestigeShopCategoryPresenter';

interface PrestigeShopCategoryContainerProps {
    title: string;
    description?: string;
    items: PrestigeShopItemPayload[];
    onBuyUpgrade: (key: PrestigeShopKey) => void;
}

export const PrestigeShopCategoryContainer: React.FC<PrestigeShopCategoryContainerProps> = (props) => {
    return <PrestigeShopCategoryPresenter {...props} />;
};
