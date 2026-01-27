import React from 'react';

interface ComboHistoryPanelPresenterProps {
    currentChain: number;
    bestChain: number;
    chainBonusPercent: number;
    history: Array<{
        id: string;
        title: string;
        message: string;
        bonusPercent: number;
        intensity: string;
        chain: number;
    }>;
}

export const ComboHistoryPanelPresenter: React.FC<ComboHistoryPanelPresenterProps> = ({
    currentChain,
    bestChain,
    chainBonusPercent,
    history,
}) => {
    return (
        <div className="combo-history glass-card">
            <div className="combo-history__header">
                <h3>🔗 Combo Chain</h3>
                <div className="combo-history__summary">
                    <div>
                        <span className="combo-history__label">Current</span>
                        <span className="combo-history__value">{currentChain}</span>
                    </div>
                    <div>
                        <span className="combo-history__label">Best</span>
                        <span className="combo-history__value">{bestChain}</span>
                    </div>
                </div>
            </div>
            <p className="combo-history__hint">
                {currentChain > 1
                    ? `Combo streak bonus: +${chainBonusPercent}% credits`
                    : 'Keep chaining combos for escalating credit bonuses!'}
            </p>
            <div className="combo-history__list" aria-live="polite">
                {history.length === 0 ? (
                    <div className="combo-history__empty">No combos yet — roll those dice!</div>
                ) : (
                    history.map((entry) => (
                        <div
                            key={entry.id}
                            className={`combo-history__entry combo-${entry.intensity}`}
                        >
                            <div className="combo-history__entry-title">
                                <span>{entry.title}</span>
                                <span className="combo-history__chain">Chain ×{entry.chain}</span>
                            </div>
                            <div className="combo-history__entry-body">{entry.message}</div>
                            <div className="combo-history__entry-footer">+{entry.bonusPercent}% credits</div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
