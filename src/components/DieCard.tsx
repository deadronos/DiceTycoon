import React from 'react';
import { DieState } from '../types/game';
import { formatShort, formatFull, calculateMultiplier } from '../utils/decimal';
import { type Decimal as DecimalType } from '@patashu/break_eternity.js';
import { GAME_CONSTANTS } from '../utils/constants';

/**
 * Props for the DieCard component.
 */
interface DieCardProps {
  /** The die's current state. */
  die: DieState;
  /** Cost to unlock the die (undefined if already unlocked). */
  unlockCost?: DecimalType;
  /** Cost to level up the die. */
  levelUpCost?: DecimalType;
  /** Cost to unlock the next animation. */
  animationUnlockCost?: DecimalType;
  /** Number of levels to purchase (for display). */
  levelsToBuy?: number;
  /** Callback to unlock the die. */
  onUnlock: () => void;
  /** Callback to level up the die. */
  onLevelUp: () => void;
  /** Callback to unlock an animation. */
  onUnlockAnimation: () => void;
  /** Whether the unlock is affordable. */
  canUnlock: boolean;
  /** Whether the level up is affordable. */
  canLevelUp: boolean;
  /** Whether the animation unlock is affordable. */
  canUnlockAnimation: boolean;
}

const DIE_ABILITIES: Record<number, { name: string; description: string }> = {
  1: { name: 'The Starter', description: 'Reliable first die.' },
  2: { name: 'Buffer', description: '+10% multiplier to adjacent dice.' },
  3: { name: 'Rusher', description: '5% chance to trigger an immediate extra roll.' },
  4: { name: 'Combo Master', description: 'Triples the value of combos it participates in.' },
  5: { name: 'Lucky', description: '+5% chance for higher face values.' },
  6: { name: 'Tycoon', description: '+5% Global Multiplier.' },
};

/**
 * Renders a single die card with its status, face, and upgrade actions.
 */
export const DieCard: React.FC<DieCardProps> = ({
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

  const nextMilestone = GAME_CONSTANTS.MILESTONE_LEVELS.find(l => l > die.level);
  const isMilestoneClose = nextMilestone && nextMilestone - die.level <= 5;
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

  const cardClassName = cardClasses.join(' ');
  const levelButtonClass = canLevelUp && !isMaxLevel && levelsToBuy > 0
    ? 'btn btn-secondary btn-small btn-glow'
    : 'btn btn-secondary btn-small';
  const animationButtonClass = canUnlockAnimation
    ? 'btn btn-primary btn-small btn-glow'
    : 'btn btn-primary btn-small';

  const getDieFace = (face: number): string => {
    const faces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    return faces[face - 1] || '⚀';
  };

  const getAnimationClass = (): string => {
    if (!die.isRolling) return '';
    if (die.animationLevel === 0) return 'rolling';
    return `animation-level-${die.animationLevel} rolling`;
  };

  const ability = DIE_ABILITIES[die.id];

  if (!die.unlocked) {
    return (
      <div className="die-card glass-card locked">
        <div className="lock-overlay">
          <div className="lock-icon">🔒</div>
          <div className="die-info">
            <div className="die-level">Die #{die.id}</div>
            {ability && (
                 <div className="die-ability-locked">
                    <span className="die-ability-name">{ability.name}</span>
                    <span className="die-ability-desc">{ability.description}</span>
                 </div>
            )}
            <button
              className="btn btn-primary btn-small"
              onClick={onUnlock}
              disabled={!canUnlock}
              title={unlockCost ? formatFull(unlockCost) : ''}
            >
              Unlock ({unlockCost ? formatShort(unlockCost) : '?'})
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cardClassName}>
      <div className="die-info">
        <div className="die-level">
           Die #{die.id} • Level {die.level}
           {nextMilestone && (
             <span className={`die-milestone ${isMilestoneClose ? 'die-milestone--close' : ''}`} title={`x${GAME_CONSTANTS.MILESTONE_MULTIPLIER} Multiplier at Level ${nextMilestone}`}>
               Goal: {nextMilestone}
             </span>
           )}
        </div>
        {ability && (
             <div className="die-ability" title={ability.description}>
                <span className="die-ability-icon">⚡</span>
                <span className="die-ability-name">{ability.name}</span>
             </div>
        )}
      </div>

      <div className={`die-face ${getAnimationClass()}`}>
        {getDieFace(die.currentFace)}
      </div>

      <div className="die-info">
        <div className="die-multiplier tooltip">
          ×{formatShort(die.multiplier)}
          <span className="tooltiptext">Multiplier: {formatFull(die.multiplier)}</span>
        </div>
      </div>

      <div className="die-actions" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {!isMaxLevel ? (
          <div className="die-action die-action--previewable">
            <button
              className={levelButtonClass}
              onClick={onLevelUp}
              disabled={!canLevelUp || levelsToBuy === 0}
              title={levelUpCost ? formatFull(levelUpCost) : ''}
            >
              Level Up {levelsToBuy > 1 ? `x${levelsToBuy} ` : ''}({levelUpCost ? formatShort(levelUpCost) : '?'})
            </button>
            <div className="die-action__preview">
              <div>Level: {die.level} → {nextLevel}</div>
              <div>Multiplier: ×{formatShort(nextMultiplier)}</div>
              <div>Gain: +{formatShort(multiplierGain)} / face</div>
            </div>
          </div>
        ) : (
          <div className="die-max-label" aria-live="polite">⭐ Max Level Reached</div>
        )}

        {die.animationLevel < GAME_CONSTANTS.MAX_ANIMATION_LEVEL && (
          <button
            className={animationButtonClass}
            onClick={onUnlockAnimation}
            disabled={!canUnlockAnimation}
            title={animationUnlockCost ? formatFull(animationUnlockCost) : ''}
          >
            {die.animationLevel === 0
              ? '✨ Unlock Animation'
              : `✨ Upgrade Animation (${die.animationLevel}/${GAME_CONSTANTS.MAX_ANIMATION_LEVEL})`}
            {animationUnlockCost && ` - ${formatShort(animationUnlockCost)}`}
          </button>
        )}

        {die.animationLevel === GAME_CONSTANTS.MAX_ANIMATION_LEVEL && (
          <div style={{ fontSize: '0.85rem', color: 'var(--color-secondary)', textAlign: 'center' }}>
            ⭐ Max Animation
          </div>
        )}
      </div>
    </div>
  );
};

export default DieCard;
