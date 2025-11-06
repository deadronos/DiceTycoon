import React from 'react';
import type { AchievementState } from '../types/game';
import { getAchievementDefinitions } from '../utils/achievements';

interface AchievementsPanelProps {
  achievements: AchievementState;
}

export const AchievementsPanel: React.FC<AchievementsPanelProps> = ({ achievements }) => {
  const definitions = getAchievementDefinitions();
  const newlyUnlocked = new Set(achievements.newlyUnlocked);

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
          return (
            <div
              key={def.id}
              className={`achievement ${isUnlocked ? 'achievement--unlocked' : ''} ${isNew ? 'achievement--new' : ''}`}
            >
              <div className="achievement__status" aria-hidden="true">
                {isUnlocked ? '✅' : '⬜'}
              </div>
              <div>
                <div className="achievement__name">{def.name}</div>
                <div className="achievement__description">{def.description}</div>
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
