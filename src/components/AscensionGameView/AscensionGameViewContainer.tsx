import React, { useMemo } from 'react';
import { GameState } from '../../types/game';
import { getAscensionProduction } from '../../utils/game-logic';
import { AscensionGameViewPresenter } from './AscensionGameViewPresenter';

interface AscensionGameViewContainerProps {
    gameState: GameState;
    onUnlockDie: (dieId: number) => void;
    onUpgradeDie: (dieId: number) => void;
    onFocusChange: (dieId: number, focus: 'stardust' | 'resonance') => void;
}

export const AscensionGameViewContainer: React.FC<AscensionGameViewContainerProps> = ({
    gameState,
    onUnlockDie,
    onUpgradeDie,
    onFocusChange,
}) => {
    const ascensionProduction = useMemo(() => getAscensionProduction(gameState), [gameState]);

    return (
        <AscensionGameViewPresenter
            gameState={gameState}
            production={ascensionProduction}
            onUnlockDie={onUnlockDie}
            onUpgradeDie={onUpgradeDie}
            onFocusChange={onFocusChange}
        />
    );
};
