import React from 'react';
import { DieState } from '../types/game';
import { formatShort, formatFull, calculateMultiplier } from '../utils/decimal';
import { type Decimal as DecimalType } from '@patashu/break_eternity.js';
import { GAME_CONSTANTS } from '../utils/constants';

interface DieCardProps {
  die: DieState;
  unlockCost?: DecimalType;
  levelUpCost?: DecimalType;
  animationUnlockCost?: DecimalType;
  onUnlock: () => void;
  onLevelUp: () => void;
  onUnlockAnimation: () => void;
  canUnlock: boolean;
  canLevelUp: boolean;
  canUnlockAnimation: boolean;
}

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
}) => {
  const isMaxLevel = die.level >= GAME_CONSTANTS.MAX_DIE_LEVEL;
  const nextLevel = die.level + 1;
  const nextMultiplier = calculateMultiplier(
    GAME_CONSTANTS.BASE_MULTIPLIER,
    nextLevel,
    GAME_CONSTANTS.MULTIPLIER_PER_LEVEL
  );
  const multiplierGain = nextMultiplier.minus(die.multiplier);
  const cardClasses = [
    'die-card',
    'glass-card',
    die.unlocked ? 'unlocked' : 'locked',
  ];

  if (canLevelUp && !isMaxLevel) {
    cardClasses.push('die-card--upgrade-ready');
  }
  if (canUnlockAnimation && die.animationLevel < GAME_CONSTANTS.MAX_ANIMATION_LEVEL) {
    cardClasses.push('die-card--animation-ready');
  }
  if (isMaxLevel) {
    cardClasses.push('die-card--maxed');
  }

  const cardClassName = cardClasses.join(' ');
  const levelButtonClass = canLevelUp && !isMaxLevel
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

  if (!die.unlocked) {
    return (
      <div className="die-card glass-card locked">
        <div className="lock-overlay">
          <div className="lock-icon">🔒</div>
          <div className="die-info">
            <div className="die-level">Die #{die.id}</div>
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
        <div className="die-level">Die #{die.id} • Level {die.level}</div>
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
              disabled={!canLevelUp}
              title={levelUpCost ? formatFull(levelUpCost) : ''}
            >
              Level Up ({levelUpCost ? formatShort(levelUpCost) : '?'})
            </button>
            <div className="die-action__preview">
              <div>Next Level: {nextLevel}</div>
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
