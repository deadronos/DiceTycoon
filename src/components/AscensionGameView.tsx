import React, { useMemo } from 'react';
import AscensionPanel from './ascension/AscensionPanel';
import { GameState } from '../types/game';
import { getAscensionProduction } from '../utils/game-logic';

interface AscensionGameViewProps {
  gameState: GameState;
  onUnlockDie: (dieId: number) => void;
  onUpgradeDie: (dieId: number) => void;
  onFocusChange: (dieId: number, focus: 'stardust' | 'resonance') => void;
}

const AscensionGameView: React.FC<AscensionGameViewProps> = ({
  gameState,
  onUnlockDie,
  onUpgradeDie,
  onFocusChange,
}) => {
  const ascensionProduction = useMemo(() => getAscensionProduction(gameState), [gameState]);

  if (!gameState.ascension.unlocked) {
    return null; // Or some placeholder/redirect
  }

  return (
    <AscensionPanel
      gameState={gameState}
      production={ascensionProduction}
      onUnlockDie={onUnlockDie}
      onUpgradeDie={onUpgradeDie}
      onFocusChange={onFocusChange}
    />
  );
};

export default AscensionGameView;
