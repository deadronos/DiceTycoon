import React from 'react';
import { type Decimal as DecimalType } from '../../utils/decimal';
import { formatShort, formatFull } from '../../utils/decimal';
import { LuckCurrencyDisplayPresenter } from './LuckCurrencyDisplayPresenter';

interface LuckCurrencyDisplayContainerProps {
    luckPoints: DecimalType;
    onOpen: () => void;
}

export const LuckCurrencyDisplayContainer: React.FC<LuckCurrencyDisplayContainerProps> = ({ luckPoints, onOpen }) => {
    const multiplier = Math.min(10, 1 + luckPoints.toNumber() * 0.02);

    const tooltipContent = (
        <div>
            <div><strong>Prestige Luck</strong></div>
            <div>Every Luck Point adds +2% to your credit gains up to a 10× cap.</div>
            <div className="tooltip-meta-row">Luck Points: {formatFull(luckPoints)}</div>
            <div className="tooltip-meta-row tooltip-meta-row--tight">Current multiplier: ×{multiplier.toFixed(2)}</div>
        </div>
    );

    return (
        <LuckCurrencyDisplayPresenter
            formattedLuck={formatShort(luckPoints)}
            onOpen={onOpen}
            tooltipContent={tooltipContent}
        />
    );
};
