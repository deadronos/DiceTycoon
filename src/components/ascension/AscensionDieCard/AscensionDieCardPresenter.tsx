import React from 'react';
import { type AscensionDieFocus } from '../../../types/game';

interface AscensionDieCardPresenterProps {
    id: number;
    unlocked: boolean;
    tier: number;
    focus: AscensionDieFocus;
    stardustProduction: string;
    resonanceProduction: string;
    unlockCostText: string;
    upgradeCostText: string;
    canUnlock: boolean;
    canUpgrade: boolean;
    onUnlock: (id: number) => void;
    onUpgrade: (id: number) => void;
    onFocusChange: (id: number, focus: AscensionDieFocus) => void;
}

export const AscensionDieCardPresenter: React.FC<AscensionDieCardPresenterProps> = ({
    id,
    unlocked,
    tier,
    focus,
    stardustProduction,
    resonanceProduction,
    unlockCostText,
    upgradeCostText,
    canUnlock,
    canUpgrade,
    onUnlock,
    onUpgrade,
    onFocusChange,
}) => {
    return (
        <div className="ascension-die-card glass-card">
            <div className="ascension-die-card__header">
                <div className="ascension-die-card__title">Die {id}</div>
                <span className="ascension-die-card__status">{unlocked ? 'Active' : 'Dormant'}</span>
            </div>

            <div className="ascension-die-card__body">
                <div className="ascension-die-card__row">
                    <span>Tier</span>
                    <strong>{unlocked ? `T${tier + 1}` : 'Locked'}</strong>
                </div>
                <div className="ascension-die-card__row">
                    <span>Stardust</span>
                    <strong>+{stardustProduction}/s</strong>
                </div>
                <div className="ascension-die-card__row">
                    <span>Resonance</span>
                    <strong>+{resonanceProduction}/s</strong>
                </div>
            </div>

            <div className="ascension-die-card__actions">
                {!unlocked ? (
                    <button
                        className="btn btn-primary"
                        disabled={!canUnlock}
                        onClick={() => onUnlock(id)}
                    >
                        Unlock for {unlockCostText} ✨
                    </button>
                ) : (
                    <button className="btn btn-primary" disabled={!canUpgrade} onClick={() => onUpgrade(id)}>
                        Upgrade for {upgradeCostText} ✨
                    </button>
                )}
                {unlocked && (
                    <div className="ascension-focus-toggle" role="group" aria-label="Focus selection">
                        <button
                            className={focus === 'stardust' ? 'pill-button pill-button--active' : 'pill-button'}
                            onClick={() => onFocusChange(id, 'stardust')}
                        >
                            Stardust
                        </button>
                        <button
                            className={focus === 'resonance' ? 'pill-button pill-button--active' : 'pill-button'}
                            onClick={() => onFocusChange(id, 'resonance')}
                        >
                            Resonance
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
