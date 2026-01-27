import React from 'react';
import { PrestigeShopFiltersPresenter, type PrestigeShopFilterOption } from './PrestigeShopFiltersPresenter';

interface PrestigeShopFiltersContainerProps {
    filter: PrestigeShopFilterOption;
    setFilter: (value: PrestigeShopFilterOption) => void;
}

export const PrestigeShopFiltersContainer: React.FC<PrestigeShopFiltersContainerProps> = (props) => {
    return <PrestigeShopFiltersPresenter {...props} />;
};
