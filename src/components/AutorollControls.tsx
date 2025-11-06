import React from 'react';
import { AutorollState, AutorollSessionStats } from '../types/game';
import { formatShort, formatFull } from '../utils/decimal';
import { type Decimal as DecimalType } from '@patashu/break_eternity.js';

interface AutorollControlsProps {
  autoroll: AutorollState;
  upgradeCost: DecimalType;
  canUpgrade: boolean;
  sessionStats: AutorollSessionStats;
  onToggle: () => void;
  onUpgrade: () => void;
}

export const AutorollControls: React.FC<AutorollControlsProps> = ({
  autoroll,
  upgradeCost,
  canUpgrade,
  sessionStats,
  onToggle,
  onUpgrade,
}) => {
  const cooldownSeconds = autoroll.cooldown.toNumber();
  const rollsPerMinute = autoroll.level > 0 ? Math.round((60 / cooldownSeconds) * 10) / 10 : 0;
  const autorollActive = autoroll.enabled && autoroll.level > 0;
  const progressStyle = {
    animationDuration: `${Math.max(cooldownSeconds, 0.1)}s`,
  } as React.CSSProperties;
  const [activeSeconds, setActiveSeconds] = React.useState<number | null>(null);

  React.useEffect(() => {
    const startedAt = sessionStats.startedAt;

    if (!startedAt) {
      setActiveSeconds(null);
      return;
    }

    const updateElapsed = () => {
      const elapsedMs = Date.now() - startedAt;
      setActiveSeconds(elapsedMs > 0 ? Math.floor(elapsedMs / 1000) : 0);
    };

    updateElapsed();
    const intervalId = window.setInterval(updateElapsed, 1000);
    return () => {
      window.clearInterval(intervalId);
    };
  }, [sessionStats.startedAt]);

  return (
    <div className="autoroll-section glass-card">
      <div className="autoroll-header">
        <h3>⚡ Autoroll</h3>
        {autoroll.level > 0 && (
          <div
            className={`toggle-switch ${autoroll.enabled ? 'active' : ''}`}
            onClick={onToggle}
          />
        )}
      </div>

      {autoroll.level === 0 ? (
        <button
          className="btn btn-secondary"
          onClick={onUpgrade}
          disabled={!canUpgrade}
          style={{ width: '100%' }}
          title={formatFull(upgradeCost)}
        >
          Unlock Autoroll ({formatShort(upgradeCost)})
        </button>
      ) : (
        <>
          <div className="autoroll-info">
            <div>Level: {autoroll.level}</div>
            <div>Cooldown: {autoroll.cooldown.toFixed(2)}s</div>
            <div>Status: {autoroll.enabled ? '✅ Active' : '⏸️ Paused'}</div>
          </div>

          <div className="autoroll-metrics">
            <div className="autoroll-metric">
              <span className="autoroll-metric__label">Rolls / min</span>
              <span className="autoroll-metric__value">{rollsPerMinute.toFixed(1)}</span>
            </div>
            <div className="autoroll-metric">
              <span className="autoroll-metric__label">Session Credits</span>
              <span className="autoroll-metric__value">
                {formatShort(sessionStats.creditsEarned)}
              </span>
            </div>
            <div className="autoroll-metric">
              <span className="autoroll-metric__label">Rolls Count</span>
              <span className="autoroll-metric__value">{sessionStats.rolls}</span>
            </div>
          </div>

          <div className={`autoroll-progress ${autorollActive ? 'autoroll-progress--active' : ''}`} aria-hidden="true">
            <div className="autoroll-progress__bar" style={progressStyle} />
          </div>

          <div className="autoroll-meta">
            <div>Batch Size: 1</div>
            {activeSeconds !== null && (
              <div>Active for {activeSeconds}s</div>
            )}
          </div>

          <button
            className="btn btn-secondary btn-small"
            onClick={onUpgrade}
            disabled={!canUpgrade}
            style={{ width: '100%', marginTop: '10px' }}
            title={formatFull(upgradeCost)}
          >
            Upgrade ({formatShort(upgradeCost)})
          </button>
        </>
      )}
    </div>
  );
};
