import React from 'react';
import { type Decimal as DecimalType } from '../../../utils/decimal';
import type { PrestigeShopItem } from '../../../utils/constants';
import { PrestigeShopItemPresenter } from './PrestigeShopItemPresenter';

interface PrestigeShopItemContainerProps {
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

export const PrestigeShopItemContainer: React.FC<PrestigeShopItemContainerProps> = ({
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

    const currentEffect = item.getCurrentEffect ? item.getCurrentEffect(currentLevel) : undefined;
    const nextEffect = item.getNextEffect ? item.getNextEffect(currentLevel) : undefined;

    return (
        <PrestigeShopItemPresenter
            name={item.name}
            icon={item.icon}
            description={item.description}
            formula={item.formula}
            currentLevel={currentLevel}
            maxLevel={item.maxLevel}
            costText={nextCost.toString()}
            canBuy={canBuy}
            isMaxed={isMaxed}
            progressPercent={progressPercent}
            isRecommended={isRecommended}
            isNew={isNew}
            currentEffect={currentEffect}
            nextEffect={nextEffect}
            onBuy={onBuy}
            itemClassNames={itemClassNames}
        />
    );
};
