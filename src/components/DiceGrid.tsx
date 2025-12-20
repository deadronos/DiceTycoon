import React from 'react';
import type { GameState } from '../types/game';
import { DieCard } from './DieCard';
import { GAME_CONSTANTS } from '../utils/constants';
import { getUnlockCost, getLevelUpCost, getAnimationUnlockCost } from '../utils/game-logic';
import { canAfford } from '../utils/decimal';

/**
 * Props for the DiceGrid component.
 */
interface Props {
  /** The full game state. */
  gameState: GameState;
  /** Callback to unlock a die. */
  onUnlockDie: (dieId: number) => void;
  /** Callback to level up a die. */
  onLevelUpDie: (dieId: number) => void;
  /** Callback to unlock an animation. */
  onUnlockAnimation: (dieId: number) => void;
}

/**
 * Renders the grid of all dice, including locked and unlocked ones.
 */
export const DiceGrid: React.FC<Props> = ({ gameState, onUnlockDie, onLevelUpDie, onUnlockAnimation }) => {
  return (
    <div className="dice-grid">
      {gameState.dice.map(die => {
        const unlockCost = !die.unlocked ? getUnlockCost(die.id) : undefined;
        const isMaxLevel = die.level >= GAME_CONSTANTS.MAX_DIE_LEVEL;
        const levelUpCost = die.unlocked && !isMaxLevel ? getLevelUpCost(die.level) : undefined;
        const animationUnlockCost = die.unlocked && die.animationLevel < GAME_CONSTANTS.MAX_ANIMATION_LEVEL
          ? getAnimationUnlockCost(die.animationLevel)
          : undefined;

        return (
          <DieCard
            key={die.id}
            die={die}
            unlockCost={unlockCost}
            levelUpCost={levelUpCost}
            animationUnlockCost={animationUnlockCost}
            onUnlock={() => onUnlockDie(die.id)}
            onLevelUp={() => onLevelUpDie(die.id)}
            onUnlockAnimation={() => onUnlockAnimation(die.id)}
            canUnlock={unlockCost ? canAfford(gameState.credits, unlockCost) : false}
            canLevelUp={levelUpCost ? canAfford(gameState.credits, levelUpCost) : false}
            canUnlockAnimation={animationUnlockCost ? canAfford(gameState.credits, animationUnlockCost) : false}
          />
        );
      })}
    </div>
  );
};

export default DiceGrid;
