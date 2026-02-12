import React from 'react';
import { type Decimal as DecimalType } from '../../../utils/decimal';
import type { GameState, AscensionDieFocus } from '../../../types/game';
import { formatShort } from '../../../utils/decimal';
import { getAscensionCreditBonus } from '../../../utils/ascension';
import { AscensionPanelPresenter } from './AscensionPanelPresenter';

interface AscensionPanelContainerProps {
    gameState: GameState;
    production: { stardustPerSecond: DecimalType; resonancePerSecond: DecimalType };
    onUnlockDie: (id: number) => void;
    onUpgradeDie: (id: number) => void;
    onFocusChange: (id: number, focus: AscensionDieFocus) => void;
}

export const AscensionPanelContainer: React.FC<AscensionPanelContainerProps> = ({
    gameState,
    production,
    onUnlockDie,
    onUpgradeDie,
    onFocusChange,
}) => {
    const stardust = gameState.ascension.stardust;
    const resonance = gameState.ascension.resonance;
    const resonanceBonus = getAscensionCreditBonus(gameState);

    return (
        <AscensionPanelPresenter
            stardust={stardust}
            resonance={resonance}
            resonanceBonusText={resonanceBonus.toFixed(2)}
            stardustProductionText={formatShort(production.stardustPerSecond)}
            resonanceProductionText={formatShort(production.resonancePerSecond)}
            cyclesObservedText={Math.floor(gameState.ascension.totalCycles).toLocaleString()}
            unlockedDiceCount={gameState.ascension.dice.filter(d => d.unlocked).length}
            totalDiceCount={gameState.ascension.dice.length}
            gameState={gameState}
            production={production}
            onUnlockDie={onUnlockDie}
            onUpgradeDie={onUpgradeDie}
            onFocusChange={onFocusChange}
        />
    );
};
