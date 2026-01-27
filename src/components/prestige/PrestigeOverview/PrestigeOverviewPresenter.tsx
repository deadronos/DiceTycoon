import React from 'react';
import { InfoTooltip } from '../../InfoTooltip';

interface PrestigeOverviewPresenterProps {
    luckGain: string;
    luckMultiplier: string;
    luckGainBoost: string;
    shopMultiplier: string;
    autorollBoost: string;
    autorollReductionPercent: number;
    currentLuck: string;
    projectedLuck: string;
    luckProgressPercent: number;
    prestigeFormulaTooltip: React.ReactNode;
    luckMultiplierTooltip: React.ReactNode;
    luckBoostTooltip: React.ReactNode;
    shopMultiplierTooltip: React.ReactNode;
    autorollTooltip: React.ReactNode;
    onConfirm: () => void;
    onClose: () => void;
}

export const PrestigeOverviewPresenter: React.FC<PrestigeOverviewPresenterProps> = ({
    luckGain,
    luckMultiplier,
    luckGainBoost,
    shopMultiplier,
    autorollBoost,
    autorollReductionPercent,
    currentLuck,
    projectedLuck,
    luckProgressPercent,
    prestigeFormulaTooltip,
    luckMultiplierTooltip,
    luckBoostTooltip,
    shopMultiplierTooltip,
    autorollTooltip,
    onConfirm,
    onClose,
}) => {
    return (
        <div className="prestige-overview">
            <div className="prestige-stat-grid">
                <div className="prestige-stat-card">
                    <div className="prestige-stat-card__label">
                        Projected Luck Gain
                        <InfoTooltip content={prestigeFormulaTooltip} label="Luck gain formula" />
                    </div>
                    <div className="prestige-stat-card__value">{luckGain}</div>
                    <div className="prestige-stat-card__hint">Reset now to claim these Luck Points.</div>
                </div>

                <div className="prestige-stat-card">
                    <div className="prestige-stat-card__label">
                        Luck Multiplier
                        <InfoTooltip content={luckMultiplierTooltip} label="Luck multiplier details" />
                    </div>
                    <div className="prestige-stat-card__value">{luckMultiplier}</div>
                    <div className="prestige-stat-card__hint">Passive bonus applied to every roll.</div>
                </div>

                <div className="prestige-stat-card">
                    <div className="prestige-stat-card__label">
                        Luck Gain Boost
                        <InfoTooltip content={luckBoostTooltip} label="Luck boost details" />
                    </div>
                    <div className="prestige-stat-card__value">{luckGainBoost}</div>
                    <div className="prestige-stat-card__hint">From Luck Fabricator upgrades.</div>
                </div>

                <div className="prestige-stat-card">
                    <div className="prestige-stat-card__label">
                        Shop Multiplier
                        <InfoTooltip content={shopMultiplierTooltip} label="Shop multiplier info" />
                    </div>
                    <div className="prestige-stat-card__value">{shopMultiplier}</div>
                    <div className="prestige-stat-card__hint">Fortune Amplifier levels stack with luck.</div>
                </div>

                <div className="prestige-stat-card">
                    <div className="prestige-stat-card__label">
                        Autoroll Acceleration
                        <InfoTooltip content={autorollTooltip} label="Autoroll formula" />
                    </div>
                    <div className="prestige-stat-card__value">{autorollBoost}</div>
                    <div className="prestige-stat-card__hint">
                        {autorollReductionPercent > 0
                            ? `Cooldown reduced by ${autorollReductionPercent}%`
                            : 'No reduction yet'}
                    </div>
                </div>

                <div className="prestige-stat-card">
                    <div className="prestige-stat-card__label">Luck Bank</div>
                    <div className="prestige-stat-card__value">{currentLuck}</div>
                    <div className="prestige-stat-card__hint">Persistent Luck Points to spend in the shop.</div>
                </div>
            </div>

            <div className="luck-progress">
                <div className="luck-progress__header">
                    <span>Progress to next Luck Point</span>
                    <span>{Math.round(Math.min(100, luckProgressPercent))}%</span>
                </div>
                <div className="luck-progress__track" aria-hidden="true">
                    <div
                        className="luck-progress__fill"
                        style={{ width: `${Math.min(100, luckProgressPercent)}%` }} // Fixed from data-width to style
                    />
                </div>
                <div className="luck-progress__hint">
                    Keep pushing your credits higher to secure the next Luck Point.
                </div>
            </div>

            <div className="prestige-actions">
                <div className="prestige-confirm-wrapper">
                    <button className="btn btn-primary" onClick={onConfirm}>
                        Confirm Prestige
                    </button>
                    <div className="prestige-confirm-preview">
                        <div className="prestige-confirm-preview__row">
                            <span>Luck Bank</span>
                            <span>{currentLuck} LP</span>
                        </div>
                        <div className="prestige-confirm-preview__arrow" aria-hidden="true">→</div>
                        <div className="prestige-confirm-preview__row">
                            <span>After Prestige</span>
                            <span>{projectedLuck} LP</span>
                        </div>
                        <div className="prestige-confirm-preview__gain">Gain: +{luckGain} LP</div>
                    </div>
                </div>
                <button className="btn btn-secondary" onClick={onClose}>
                    Cancel
                </button>
            </div>
            <div className="prestige-retained">
                Persisted on prestige: Luck Points, shop purchases, consumables, and settings. All other progression resets.
            </div>
        </div>
    );
};
