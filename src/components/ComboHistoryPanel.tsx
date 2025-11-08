import React from 'react';
import type { ComboChainStats } from '../types/game';
import { getComboMetadata } from '../utils/combos';

interface ComboHistoryPanelProps {
  comboChain: ComboChainStats;
}

export const ComboHistoryPanel: React.FC<ComboHistoryPanelProps> = ({ comboChain }) => {
  const chainBonusPercent = comboChain.current > 1 ? (comboChain.current - 1) * 10 : 0;

  return (
    <div className="combo-history glass-card">
      <div className="combo-history__header">
        <h3>🔗 Combo Chain</h3>
        <div className="combo-history__summary">
          <div>
            <span className="combo-history__label">Current</span>
            <span className="combo-history__value">{comboChain.current}</span>
          </div>
          <div>
            <span className="combo-history__label">Best</span>
            <span className="combo-history__value">{comboChain.best}</span>
          </div>
        </div>
      </div>
      <p className="combo-history__hint">
        {comboChain.current > 1
          ? `Combo streak bonus: +${chainBonusPercent}% credits`
          : 'Keep chaining combos for escalating credit bonuses!'}
      </p>
      <div className="combo-history__list" aria-live="polite">
        {comboChain.history.length === 0 ? (
          <div className="combo-history__empty">No combos yet — roll those dice!</div>
        ) : (
          comboChain.history.map((entry, index) => {
            const meta = getComboMetadata(entry.combo);
            return (
              <div
                key={`${entry.timestamp}-${index}`}
                className={`combo-history__entry combo-${meta.intensity}`}
              >
                <div className="combo-history__entry-title">
                  <span>{meta.title}</span>
                  <span className="combo-history__chain">Chain ×{entry.chain}</span>
                </div>
                <div className="combo-history__entry-body">{meta.message}</div>
                <div className="combo-history__entry-footer">+{meta.bonusPercent}% credits</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ComboHistoryPanel;
