import React from 'react';
import { GameState } from '../../types/game';
import { type Decimal as DecimalType } from '../../utils/decimal';
import { CoreGameViewPresenter } from './CoreGameViewPresenter';

interface CoreGameViewContainerProps {
    gameState: GameState;
    onUnlockDie: (dieId: number) => void;
    onLevelUpDie: (dieId: number, amount?: number) => void;
    onUnlockAnimation: (dieId: number) => void;
    onRoll: () => void;
    onToggleAutoroll: () => void;
    onUpgradeAutoroll: () => void;
    onDynamicBatchChange: (value: boolean) => void;
    onBatchThresholdChange: (value: number) => void;
    onMaxRollsPerTickChange: (value: number) => void;
    onAnimationBudgetChange: (value: number) => void;
    onExport: () => void;
    onImport: () => void;
    onReset: () => void;
    autorollUpgradeCost: DecimalType;
    canUpgradeAutoroll: boolean;
}

export const CoreGameViewContainer: React.FC<CoreGameViewContainerProps> = (props) => {
    const isAnyDieRolling = props.gameState.dice.some(d => d.isRolling);

    return (
        <CoreGameViewPresenter
            {...props}
            isAnyDieRolling={isAnyDieRolling}
        />
    );
};
