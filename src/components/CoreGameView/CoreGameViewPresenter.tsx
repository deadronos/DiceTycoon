import React from 'react';
import DiceGrid from '../DiceGrid';
import GameControlPanel from '../app/GameControlPanel';
import { GameState } from '../../types/game';
import { type Decimal as DecimalType } from '../../utils/decimal';

interface CoreGameViewPresenterProps {
    gameState: GameState;
    isAnyDieRolling: boolean;
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

export const CoreGameViewPresenter: React.FC<CoreGameViewPresenterProps> = ({
    gameState,
    isAnyDieRolling,
    onUnlockDie,
    onLevelUpDie,
    onUnlockAnimation,
    onRoll,
    onToggleAutoroll,
    onUpgradeAutoroll,
    onDynamicBatchChange,
    onBatchThresholdChange,
    onMaxRollsPerTickChange,
    onAnimationBudgetChange,
    onExport,
    onImport,
    onReset,
    autorollUpgradeCost,
    canUpgradeAutoroll,
}) => {
    return (
        <div className="main-layout">
            <div className="dice-section">
                <DiceGrid
                    gameState={gameState}
                    onUnlockDie={onUnlockDie}
                    onLevelUpDie={onLevelUpDie}
                    onUnlockAnimation={onUnlockAnimation}
                />
            </div>

            <GameControlPanel
                isAnyDieRolling={isAnyDieRolling}
                onRoll={onRoll}
                autoroll={gameState.autoroll}
                autorollUpgradeCost={autorollUpgradeCost}
                canUpgradeAutoroll={canUpgradeAutoroll}
                sessionStats={gameState.stats.autoroll}
                onToggleAutoroll={onToggleAutoroll}
                onUpgradeAutoroll={onUpgradeAutoroll}
                onDynamicBatchChange={onDynamicBatchChange}
                onBatchThresholdChange={onBatchThresholdChange}
                onMaxRollsPerTickChange={onMaxRollsPerTickChange}
                onAnimationBudgetChange={onAnimationBudgetChange}
                gameState={gameState}
                onExport={onExport}
                onImport={onImport}
                onReset={onReset}
            />
        </div>
    );
};
