import React from 'react';
import AscensionPanel from '../ascension/AscensionPanel';
import { GameState } from '../../types/game';
import { type Decimal as DecimalType } from '../../utils/decimal';

interface AscensionGameViewPresenterProps {
    gameState: GameState;
    production: {
        stardustPerSecond: DecimalType;
        resonancePerSecond: DecimalType;
    };
    onUnlockDie: (dieId: number) => void;
    onUpgradeDie: (dieId: number) => void;
    onFocusChange: (dieId: number, focus: 'stardust' | 'resonance') => void;
}

export const AscensionGameViewPresenter: React.FC<AscensionGameViewPresenterProps> = ({
    gameState,
    production,
    onUnlockDie,
    onUpgradeDie,
    onFocusChange,
}) => {
    if (!gameState.ascension.unlocked) {
        return null;
    }

    return (
        <AscensionPanel
            gameState={gameState}
            production={production}
            onUnlockDie={onUnlockDie}
            onUpgradeDie={onUpgradeDie}
            onFocusChange={onFocusChange}
        />
    );
};
