import React from 'react';
import type { Decimal as DecimalType } from '../../../utils/decimal';
import type { AutorollState, AutorollSessionStats, GameState } from '../../../types/game';
import { GameControlPanelPresenter } from './GameControlPanelPresenter';

interface GameControlPanelContainerProps {
    isAnyDieRolling: boolean;
    onRoll: () => void;
    autoroll: AutorollState;
    autorollUpgradeCost: DecimalType;
    canUpgradeAutoroll: boolean;
    sessionStats: AutorollSessionStats;
    onToggleAutoroll: () => void;
    onUpgradeAutoroll: () => void;
    onDynamicBatchChange?: (value: boolean) => void;
    onBatchThresholdChange?: (value: number) => void;
    onMaxRollsPerTickChange?: (value: number) => void;
    onAnimationBudgetChange?: (value: number) => void;
    gameState: GameState;
    onExport: () => void;
    onImport: () => void;
    onReset: () => void;
}

export const GameControlPanelContainer: React.FC<GameControlPanelContainerProps> = ({
    onDynamicBatchChange = () => { },
    onBatchThresholdChange = () => { },
    onMaxRollsPerTickChange = () => { },
    onAnimationBudgetChange = () => { },
    ...props
}) => {
    return (
        <GameControlPanelPresenter
            {...props}
            onDynamicBatchChange={onDynamicBatchChange}
            onBatchThresholdChange={onBatchThresholdChange}
            onMaxRollsPerTickChange={onMaxRollsPerTickChange}
            onAnimationBudgetChange={onAnimationBudgetChange}
        />
    );
};
