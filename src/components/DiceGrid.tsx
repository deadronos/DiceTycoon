import React from 'react';
import type { GameState } from '../types/game';
import { DieCard } from './DieCard';
import { GAME_CONSTANTS } from '../utils/constants';
import { getUnlockCost, getLevelUpCost, getAnimationUnlockCost, getBulkLevelUpCost, getMaxAffordableLevels } from '../utils/game-logic';
import { canAfford } from '../utils/decimal';
import { useState } from 'react';

/**
 * Props for the DiceGrid component.
 */
interface Props {
  /** The full game state. */
  gameState: GameState;
  /** Callback to unlock a die. */
  onUnlockDie: (dieId: number) => void;
  /** Callback to level up a die. */
  onLevelUpDie: (dieId: number, amount?: number) => void;
  /** Callback to unlock an animation. */
  onUnlockAnimation: (dieId: number) => void;
}

/**
 * Renders the grid of all dice, including locked and unlocked ones.
 */
export const DiceGrid: React.FC<Props> = ({ gameState, onUnlockDie, onLevelUpDie, onUnlockAnimation }) => {
  const [buyAmount, setBuyAmount] = useState<number | 'max'>(1);

  return (
    <div className="dice-section-container">
      <div className="buy-controls" style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Buy Amount:</span>
        {[1, 10].map(amount => (
          <button
            key={amount}
            className={`btn btn-small ${buyAmount === amount ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setBuyAmount(amount)}
          >
            x{amount}
          </button>
        ))}
        <button
          className={`btn btn-small ${buyAmount === 'max' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setBuyAmount('max')}
        >
          Max
        </button>
      </div>

      <div className="dice-grid">
        {gameState.dice.map(die => {
          const unlockCost = !die.unlocked ? getUnlockCost(die.id) : undefined;
          const isMaxLevel = die.level >= GAME_CONSTANTS.MAX_DIE_LEVEL;

          let levelUpCost: any = undefined;
          let levelsToBuy = 1;

          if (die.unlocked && !isMaxLevel) {
            if (buyAmount === 'max') {
               const affordable = getMaxAffordableLevels(die.level, gameState.credits);
               levelsToBuy = affordable > 0 ? affordable : 1;
               // If affordable is 0, we calculate cost for 1 (which will be unaffordable)
               levelUpCost = affordable > 0 ? getBulkLevelUpCost(die.level, levelsToBuy) : getLevelUpCost(die.level);
            } else {
               levelsToBuy = buyAmount as number;
               const maxPossible = GAME_CONSTANTS.MAX_DIE_LEVEL - die.level;
               levelsToBuy = Math.min(levelsToBuy, maxPossible);
               levelUpCost = getBulkLevelUpCost(die.level, levelsToBuy);
            }
          }

          const animationUnlockCost = die.unlocked && die.animationLevel < GAME_CONSTANTS.MAX_ANIMATION_LEVEL
            ? getAnimationUnlockCost(die.animationLevel)
            : undefined;

          return (
            <DieCard
              key={die.id}
              die={die}
              unlockCost={unlockCost}
              levelUpCost={levelUpCost}
              levelsToBuy={levelsToBuy}
              animationUnlockCost={animationUnlockCost}
              onUnlock={() => onUnlockDie(die.id)}
              onLevelUp={() => onLevelUpDie(die.id, levelsToBuy)}
              onUnlockAnimation={() => onUnlockAnimation(die.id)}
              canUnlock={unlockCost ? canAfford(gameState.credits, unlockCost) : false}
              canLevelUp={levelUpCost ? canAfford(gameState.credits, levelUpCost) : false}
              canUnlockAnimation={animationUnlockCost ? canAfford(gameState.credits, animationUnlockCost) : false}
            />
          );
        })}
      </div>
    </div>
  );
};

export default DiceGrid;
