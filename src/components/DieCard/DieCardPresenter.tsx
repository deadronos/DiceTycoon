import React from 'react';
import { getDieFace } from '../../utils/die-config';

interface DieCardPresenterProps {
    id: number;
    level: number;
    unlocked: boolean;
    isMaxLevel: boolean;
    dieFace: number;
    multiplier: string;
    fullMultiplier: string;
    nextLevel: number;
    nextMultiplier: string;
    multiplierGain: string;
    levelsToBuy: number;
    unlockCost?: string;
    fullUnlockCost?: string;
    levelUpCost?: string;
    fullLevelUpCost?: string;
    animationUnlockCost?: string;
    fullAnimationUnlockCost?: string;
    animationLevel: number;
    maxAnimationLevel: number;
    ability?: { name: string; description: string };
    isMilestoneClose: boolean;
    nextMilestone: number | null | undefined;
    cardClassName: string;
    levelButtonClass: string;
    animationButtonClass: string;
    getAnimationClass: string;
    canUnlock: boolean;
    canLevelUp: boolean;
    canUnlockAnimation: boolean;
    onUnlock: () => void;
    onLevelUp: () => void;
    onUnlockAnimation: () => void;
}

export const DieCardPresenter: React.FC<DieCardPresenterProps> = ({
    id,
    level,
    unlocked,
    isMaxLevel,
    dieFace,
    multiplier,
    fullMultiplier,
    nextLevel,
    nextMultiplier,
    multiplierGain,
    levelsToBuy,
    unlockCost,
    fullUnlockCost,
    levelUpCost,
    fullLevelUpCost,
    animationUnlockCost,
    fullAnimationUnlockCost,
    animationLevel,
    maxAnimationLevel,
    ability,
    isMilestoneClose,
    nextMilestone,
    cardClassName,
    levelButtonClass,
    animationButtonClass,
    getAnimationClass,
    canUnlock,
    canLevelUp,
    canUnlockAnimation,
    onUnlock,
    onLevelUp,
    onUnlockAnimation,
}) => {
    if (!unlocked) {
        return (
            <div className="die-card glass-card locked">
                <div className="lock-overlay">
                    <div className="lock-icon">🔒</div>
                    <div className="die-info">
                        <div className="die-level">Die #{id}</div>
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
                            title={fullUnlockCost}
                        >
                            Unlock ({unlockCost || '?'})
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
                    Die #{id} • Level {level}
                    {nextMilestone && (
                        <span className={`die-milestone ${isMilestoneClose ? 'die-milestone--close' : ''}`} title={`Milestone at Level ${nextMilestone}`}>
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

            <div className={`die-face ${getAnimationClass}`}>
                {getDieFace(dieFace)}
            </div>

            <div className="die-info">
                <div className="die-multiplier tooltip">
                    ×{multiplier}
                    <span className="tooltiptext">Multiplier: {fullMultiplier}</span>
                </div>
            </div>

            <div className="die-actions" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {!isMaxLevel ? (
                    <div className="die-action die-action--previewable">
                        <button
                            className={levelButtonClass}
                            onClick={onLevelUp}
                            disabled={!canLevelUp || levelsToBuy === 0}
                            title={fullLevelUpCost}
                        >
                            Level Up {levelsToBuy > 1 ? `x${levelsToBuy} ` : ''}({levelUpCost || '?'})
                        </button>
                        <div className="die-action__preview">
                            <div>Level: {level} → {nextLevel}</div>
                            <div>Multiplier: ×{nextMultiplier}</div>
                            <div>Gain: +{multiplierGain} / face</div>
                        </div>
                    </div>
                ) : (
                    <div className="die-max-label" aria-live="polite">⭐ Max Level Reached</div>
                )}

                {animationLevel < maxAnimationLevel && (
                    <button
                        className={animationButtonClass}
                        onClick={onUnlockAnimation}
                        disabled={!canUnlockAnimation}
                        title={fullAnimationUnlockCost}
                    >
                        {animationLevel === 0
                            ? '✨ Unlock Animation'
                            : `✨ Upgrade Animation (${animationLevel}/${maxAnimationLevel})`}
                        {levelUpCost && ` - ${animationUnlockCost}`}
                    </button>
                )}

                {animationLevel === maxAnimationLevel && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-secondary)', textAlign: 'center' }}>
                        ⭐ Max Animation
                    </div>
                )}
            </div>
        </div>
    );
};
