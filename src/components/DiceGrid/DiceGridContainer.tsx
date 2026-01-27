import React, { useState, useMemo } from 'react';
import { GameState } from '../../types/game';
import { GAME_CONSTANTS } from '../../utils/constants';
import { getUnlockCost, getLevelUpCost, getAnimationUnlockCost, getBulkLevelUpCost, getMaxAffordableLevels } from '../../utils/game-logic';
import { canAfford } from '../../utils/decimal';
import { DiceGridPresenter } from './DiceGridPresenter';

interface DiceGridContainerProps {
    gameState: GameState;
    onUnlockDie: (dieId: number) => void;
    onLevelUpDie: (dieId: number, amount?: number) => void;
    onUnlockAnimation: (dieId: number) => void;
}

export const DiceGridContainer: React.FC<DiceGridContainerProps> = ({
    gameState,
    onUnlockDie,
    onLevelUpDie,
    onUnlockAnimation,
}) => {
    const [buyAmount, setBuyAmount] = useState<number | 'max'>(1);

    const diceData = useMemo(() => {
        return gameState.dice.map(die => {
            const unlockCost = !die.unlocked ? getUnlockCost(die.id) : undefined;
            const isMaxLevel = die.level >= GAME_CONSTANTS.MAX_DIE_LEVEL;

            let levelUpCost: any; // Using any for DecimalType to avoid type mismatches during transition
            let levelsToBuy = 1;

            if (die.unlocked && !isMaxLevel) {
                if (buyAmount === 'max') {
                    const affordable = getMaxAffordableLevels(die.level, gameState.credits);
                    levelsToBuy = affordable > 0 ? affordable : 1;
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

            return {
                die,
                unlockCost,
                levelUpCost,
                levelsToBuy,
                animationUnlockCost,
                onUnlock: () => onUnlockDie(die.id),
                onLevelUp: () => onLevelUpDie(die.id, levelsToBuy),
                onUnlockAnimation: () => onUnlockAnimation(die.id),
                canUnlock: unlockCost ? canAfford(gameState.credits, unlockCost) : false,
                canLevelUp: levelUpCost ? canAfford(gameState.credits, levelUpCost) : false,
                canUnlockAnimation: animationUnlockCost ? canAfford(gameState.credits, animationUnlockCost) : false,
            };
        });
    }, [gameState.dice, gameState.credits, buyAmount, onUnlockDie, onLevelUpDie, onUnlockAnimation]);

    return (
        <DiceGridPresenter
            buyAmount={buyAmount}
            setBuyAmount={setBuyAmount}
            diceData={diceData}
        />
    );
};
