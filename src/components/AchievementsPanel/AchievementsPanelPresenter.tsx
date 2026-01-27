import React from 'react';
import type { AchievementDefinition } from '../../utils/achievements';

interface AchievementsPanelPresenterProps {
    unlockedCount: number;
    totalCount: number;
    achievements: Array<{
        def: AchievementDefinition;
        isUnlocked: boolean;
        isNew: boolean;
        rewardText: string | null;
    }>;
}

export const AchievementsPanelPresenter: React.FC<AchievementsPanelPresenterProps> = ({
    unlockedCount,
    totalCount,
    achievements,
}) => {
    return (
        <div className="achievements-panel glass-card">
            <div className="achievements-panel__header">
                <h3>🏆 Achievements</h3>
                <span className="achievements-panel__count">
                    {unlockedCount} / {totalCount}
                </span>
            </div>
            <div className="achievements-panel__list" aria-live="polite">
                {achievements.map(({ def, isUnlocked, isNew, rewardText }) => (
                    <div
                        key={def.id}
                        className={`achievement ${isUnlocked ? 'achievement--unlocked' : ''} ${isNew ? 'achievement--new' : ''}`}
                    >
                        <div className="achievement__status" aria-hidden="true">
                            {isUnlocked ? '✅' : '⬜'}
                        </div>
                        <div className="achievement__content">
                            <div className="achievement__name">{def.name}</div>
                            <div className="achievement__description">{def.description}</div>
                            {rewardText && (
                                <div className="achievement__reward">
                                    Reward: <strong>{rewardText}</strong>
                                </div>
                            )}
                        </div>
                        {isNew && <span className="achievement__badge">New!</span>}
                    </div>
                ))}
            </div>
        </div>
    );
};
