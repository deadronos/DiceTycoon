import React from 'react';
import type { AchievementState } from '../types/game';
import type { AchievementDefinition } from '../utils/achievements';
import { getAchievementDefinitions } from '../utils/achievements';

/**
 * Props for the AchievementsPanel.
 */
interface AchievementsPanelProps {
  /** The current achievement state. */
  achievements: AchievementState;
}

/**
 * Displays the list of achievements and their unlock status.
 */
export const AchievementsPanel: React.FC<AchievementsPanelProps> = ({ achievements }) => {
  const definitions = getAchievementDefinitions();
  const newlyUnlocked = new Set(achievements.newlyUnlocked);

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

  return (
    <div className="achievements-panel glass-card">
      <div className="achievements-panel__header">
        <h3>🏆 Achievements</h3>
        <span className="achievements-panel__count">
          {achievements.unlocked.length} / {definitions.length}
        </span>
      </div>
      <div className="achievements-panel__list" aria-live="polite">
        {definitions.map(def => {
          const isUnlocked = achievements.unlocked.includes(def.id);
          const isNew = newlyUnlocked.has(def.id);
          const rewardText = getRewardText(def);

          return (
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
          );
        })}
      </div>
    </div>
  );
};

export default AchievementsPanel;
