import React from 'react';
import { type Decimal as DecimalType } from '../../../utils/decimal';
import { type AscensionDieState, type AscensionDieFocus } from '../../../types/game';
import { formatShort } from '../../../utils/decimal';
import { AscensionDieCardPresenter } from './AscensionDieCardPresenter';

interface AscensionDieCardContainerProps {
    die: AscensionDieState;
    stardust: DecimalType;
    production: { stardustPerSecond: DecimalType; resonancePerSecond: DecimalType };
    unlockCost: DecimalType;
    upgradeCost: DecimalType;
    onUnlock: (id: number) => void;
    onUpgrade: (id: number) => void;
    onFocusChange: (id: number, focus: AscensionDieFocus) => void;
}

export const AscensionDieCardContainer: React.FC<AscensionDieCardContainerProps> = ({
    die,
    stardust,
    production,
    unlockCost,
    upgradeCost,
    onUnlock,
    onUpgrade,
    onFocusChange,
}) => {
    const isUnlocked = die.unlocked;
    const canUnlock = !isUnlocked && stardust.gte(unlockCost);
    const canUpgrade = isUnlocked && stardust.gte(upgradeCost);

    return (
        <AscensionDieCardPresenter
            id={die.id}
            unlocked={isUnlocked}
            tier={die.tier}
            focus={die.focus}
            stardustProduction={formatShort(production.stardustPerSecond)}
            resonanceProduction={formatShort(production.resonancePerSecond)}
            unlockCostText={formatShort(unlockCost)}
            upgradeCostText={formatShort(upgradeCost)}
            canUnlock={canUnlock}
            canUpgrade={canUpgrade}
            onUnlock={onUnlock}
            onUpgrade={onUpgrade}
            onFocusChange={onFocusChange}
        />
    );
};
