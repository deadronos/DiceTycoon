import React, { useMemo } from 'react';
import type { AchievementState } from '../../types/game';
import type { AchievementDefinition } from '../../utils/achievements';
import { getAchievementDefinitions } from '../../utils/achievements';
import { AchievementsPanelPresenter } from './AchievementsPanelPresenter';

interface AchievementsPanelContainerProps {
    achievements: AchievementState;
}

export const AchievementsPanelContainer: React.FC<AchievementsPanelContainerProps> = ({ achievements }) => {
    const definitions = useMemo(() => getAchievementDefinitions(), []);
    const newlyUnlocked = useMemo(() => new Set(achievements.newlyUnlocked), [achievements.newlyUnlocked]);

    const getRewardText = (def: AchievementDefinition) => {
        if (!def.reward) return null;
        if (def.reward.type === 'global_multiplier') {
            return `+${def.reward.value.times(100).toNumber()}% Global Multiplier`;
        }
        if (def.reward.type === 'luck_points') {
            return `+${def.reward.value.toString()} Luck Points`;
        }
        return null;
    };

    const structuredAchievements = useMemo(() => {
        return definitions.map(def => ({
            def,
            isUnlocked: achievements.unlocked.includes(def.id),
            isNew: newlyUnlocked.has(def.id),
            rewardText: getRewardText(def),
        }));
    }, [definitions, achievements.unlocked, newlyUnlocked]);

    return (
        <AchievementsPanelPresenter
            unlockedCount={achievements.unlocked.length}
            totalCount={definitions.length}
            achievements={structuredAchievements}
        />
    );
};
