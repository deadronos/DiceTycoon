import React from 'react';
import { type Decimal as DecimalType } from '../../../utils/decimal';
import { CreditsDisplay } from '../../CreditsDisplay';
import { LuckCurrencyDisplay } from '../../LuckCurrencyDisplay';

interface AppHeaderPresenterProps {
    credits: DecimalType;
    luckPoints: DecimalType;
    totalRollsText: string;
    onOpenPrestige: () => void;
}

export const AppHeaderPresenter: React.FC<AppHeaderPresenterProps> = ({
    credits,
    luckPoints,
    totalRollsText,
    onOpenPrestige,
}) => (
    <header className="header">
        <h1>🎲 Dice Tycoon</h1>
        <div className="header-bar">
            <CreditsDisplay credits={credits} />
            <LuckCurrencyDisplay luckPoints={luckPoints} onOpen={onOpenPrestige} />
        </div>
        <div className="header-subtitle">Total Rolls: {totalRollsText}</div>
    </header>
);
