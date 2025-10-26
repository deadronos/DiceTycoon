import React from 'react';
import { DieState } from '../types/game';
import { formatShort, formatFull } from '../utils/decimal';
import Decimal from '@patashu/break_eternity.js';

interface DieCardProps {
  die: DieState;
  unlockCost?: Decimal;
  levelUpCost?: Decimal;
  animationUnlockCost?: Decimal;
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
    <div className="die-card glass-card unlocked">
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
        <button
          className="btn btn-secondary btn-small"
          onClick={onLevelUp}
          disabled={!canLevelUp}
          title={levelUpCost ? formatFull(levelUpCost) : ''}
        >
          Level Up ({levelUpCost ? formatShort(levelUpCost) : '?'})
        </button>

        {die.animationLevel < 3 && (
          <button
            className="btn btn-primary btn-small"
            onClick={onUnlockAnimation}
            disabled={!canUnlockAnimation}
            title={animationUnlockCost ? formatFull(animationUnlockCost) : ''}
          >
            {die.animationLevel === 0 ? '✨ Unlock Animation' : `✨ Upgrade Animation (${die.animationLevel}/3)`}
            {animationUnlockCost && ` - ${formatShort(animationUnlockCost)}`}
          </button>
        )}

        {die.animationLevel === 3 && (
          <div style={{ fontSize: '0.85rem', color: 'var(--color-secondary)', textAlign: 'center' }}>
            ⭐ Max Animation
          </div>
        )}
      </div>
    </div>
  );
};
