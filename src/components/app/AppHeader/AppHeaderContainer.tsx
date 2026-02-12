import React from 'react';
import { type Decimal as DecimalType } from '../../../utils/decimal';
import { AppHeaderPresenter } from './AppHeaderPresenter';

interface AppHeaderContainerProps {
    credits: DecimalType;
    luckPoints: DecimalType;
    totalRolls: number;
    onOpenPrestige: () => void;
}

export const AppHeaderContainer: React.FC<AppHeaderContainerProps> = ({
    credits,
    luckPoints,
    totalRolls,
    onOpenPrestige,
}) => {
    const totalRollsText = totalRolls.toLocaleString();

    return (
        <AppHeaderPresenter
            credits={credits}
            luckPoints={luckPoints}
            totalRollsText={totalRollsText}
            onOpenPrestige={onOpenPrestige}
        />
    );
};
