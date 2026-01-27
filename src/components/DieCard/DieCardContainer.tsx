import React, { useMemo } from 'react';
import { DieState } from '../../types/game';
import { formatShort, formatFull, calculateMultiplier } from '../../utils/decimal';
import { type Decimal as DecimalType } from '../../utils/decimal';
import { GAME_CONSTANTS } from '../../utils/constants';
import { DIE_ABILITIES } from '../../utils/die-config';
import { getNextMilestone } from '../../utils/dice-upgrades';
import { DieCardPresenter } from './DieCardPresenter';

interface DieCardContainerProps {
    die: DieState;
    unlockCost?: DecimalType;
    levelUpCost?: DecimalType;
    animationUnlockCost?: DecimalType;
    levelsToBuy?: number;
    onUnlock: () => void;
    onLevelUp: () => void;
    onUnlockAnimation: () => void;
    canUnlock: boolean;
    canLevelUp: boolean;
    canUnlockAnimation: boolean;
}

export const DieCardContainer: React.FC<DieCardContainerProps> = ({
    die,
    unlockCost,
    levelUpCost,
    animationUnlockCost,
    onUnlock,
    onLevelUp,
    onUnlockAnimation,
    canUnlock,
    canLevelUp,
    canUnlockAnimation,
    levelsToBuy = 1,
}) => {
    const isMaxLevel = die.level >= GAME_CONSTANTS.MAX_DIE_LEVEL;
    const nextLevel = die.level + levelsToBuy;
    const nextMultiplier = calculateMultiplier(
        GAME_CONSTANTS.BASE_MULTIPLIER,
        nextLevel,
        GAME_CONSTANTS.MULTIPLIER_PER_LEVEL,
        {
            levels: GAME_CONSTANTS.MILESTONE_LEVELS,
            bonus: GAME_CONSTANTS.MILESTONE_MULTIPLIER
        }
    );
    const multiplierGain = nextMultiplier.minus(die.multiplier);

    const nextMilestone = getNextMilestone(die.level);
    const isMilestoneClose = !!(nextMilestone && nextMilestone - die.level <= 5);

    const cardClasses = [
        'die-card',
        'glass-card',
        die.unlocked ? 'unlocked' : 'locked',
    ];

    if (canLevelUp && !isMaxLevel && levelsToBuy > 0) {
        cardClasses.push('die-card--upgrade-ready');
    }
    if (canUnlockAnimation && die.animationLevel < GAME_CONSTANTS.MAX_ANIMATION_LEVEL) {
        cardClasses.push('die-card--animation-ready');
    }
    if (isMaxLevel) {
        cardClasses.push('die-card--maxed');
    }

    const levelButtonClass = canLevelUp && !isMaxLevel && levelsToBuy > 0
        ? 'btn btn-secondary btn-small btn-glow'
        : 'btn btn-secondary btn-small';
    const animationButtonClass = canUnlockAnimation
        ? 'btn btn-primary btn-small btn-glow'
        : 'btn btn-primary btn-small';

    const getAnimationClass = useMemo(() => {
        if (!die.isRolling) return '';
        if (die.animationLevel === 0) return 'rolling';
        return `animation-level-${die.animationLevel} rolling`;
    }, [die.isRolling, die.animationLevel]);

    const ability = DIE_ABILITIES[die.id];

    return (
        <DieCardPresenter
            id={die.id}
            level={die.level}
            unlocked={die.unlocked}
            isMaxLevel={isMaxLevel}
            dieFace={die.currentFace}
            multiplier={formatShort(die.multiplier)}
            fullMultiplier={formatFull(die.multiplier)}
            nextLevel={nextLevel}
            nextMultiplier={formatShort(nextMultiplier)}
            multiplierGain={formatShort(multiplierGain)}
            levelsToBuy={levelsToBuy}
            unlockCost={unlockCost ? formatShort(unlockCost) : undefined}
            fullUnlockCost={unlockCost ? formatFull(unlockCost) : undefined}
            levelUpCost={levelUpCost ? formatShort(levelUpCost) : undefined}
            fullLevelUpCost={levelUpCost ? formatFull(levelUpCost) : undefined}
            animationUnlockCost={animationUnlockCost ? formatShort(animationUnlockCost) : undefined}
            fullAnimationUnlockCost={animationUnlockCost ? formatFull(animationUnlockCost) : undefined}
            animationLevel={die.animationLevel}
            maxAnimationLevel={GAME_CONSTANTS.MAX_ANIMATION_LEVEL}
            ability={ability}
            isMilestoneClose={isMilestoneClose}
            nextMilestone={nextMilestone}
            cardClassName={cardClasses.join(' ')}
            levelButtonClass={levelButtonClass}
            animationButtonClass={animationButtonClass}
            getAnimationClass={getAnimationClass}
            canUnlock={canUnlock}
            canLevelUp={canLevelUp}
            canUnlockAnimation={canUnlockAnimation}
            onUnlock={onUnlock}
            onLevelUp={onLevelUp}
            onUnlockAnimation={onUnlockAnimation}
        />
    );
};
