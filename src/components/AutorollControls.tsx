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
  onDynamicBatchChange?: (value: boolean) => void;
  onBatchThresholdChange?: (value: number) => void;
  onMaxRollsPerTickChange?: (value: number) => void;
  onAnimationBudgetChange?: (value: number) => void;
}

export const AutorollControls: React.FC<AutorollControlsProps> = ({
  autoroll,
  upgradeCost,
  canUpgrade,
  sessionStats,
  onToggle,
  onUpgrade,
  onDynamicBatchChange = () => {},
  onBatchThresholdChange = () => {},
  onMaxRollsPerTickChange = () => {},
  onAnimationBudgetChange = () => {},
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

  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const cooldownMs = autoroll.cooldown.toNumber() * 1000;
  const thresholdRatio = cooldownMs > 0 ? autoroll.batchThresholdMs / cooldownMs : 1;
  const batchPreviewRolls = Math.min(
    autoroll.maxRollsPerTick,
    Math.max(1, Math.round(thresholdRatio))
  );

  const isBatchActive = autoroll.dynamicBatch && cooldownMs > 0 && cooldownMs < autoroll.batchThresholdMs;
  const displayBatchSize = isBatchActive ? `${batchPreviewRolls} / tick` : '1 (single)';

  const handleDynamicBatchToggle = () => onDynamicBatchChange(!autoroll.dynamicBatch);
  const handleThresholdInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = Number(event.target.value);
    if (!Number.isNaN(next)) {
      onBatchThresholdChange(next);
    }
  };
  const handleMaxRollsInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = Number(event.target.value);
    if (!Number.isNaN(next)) {
      onMaxRollsPerTickChange(next);
    }
  };
  const handleAnimationBudgetInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = Number(event.target.value);
    if (!Number.isNaN(next)) {
      onAnimationBudgetChange(next);
    }
  };

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
            <div>Batch Size: {displayBatchSize}</div>
            {activeSeconds !== null && (
              <div>Active for {activeSeconds}s</div>
            )}
          </div>

          <div className="autoroll-advanced-toggler">
            <button
              type="button"
              className="btn btn-transparent"
              onClick={() => setShowAdvanced(prev => !prev)}
            >
              {showAdvanced ? 'Hide advanced settings' : 'Show advanced settings'}
            </button>
          </div>

          {showAdvanced && (
            <div className="autoroll-advanced-settings">
              <label className="autoroll-setting">
                <span>Dynamic Batch</span>
                <input
                  type="checkbox"
                  checked={autoroll.dynamicBatch}
                  onChange={handleDynamicBatchToggle}
                />
              </label>
              <label className="autoroll-setting">
                <span>Batch Threshold (ms)</span>
                <input
                  type="number"
                  min={10}
                  step={10}
                  value={autoroll.batchThresholdMs}
                  onChange={handleThresholdInput}
                />
              </label>
              <label className="autoroll-setting">
                <span>Max Rolls / Tick</span>
                <input
                  type="number"
                  min={1}
                  step={100}
                  value={autoroll.maxRollsPerTick}
                  onChange={handleMaxRollsInput}
                />
              </label>
              <label className="autoroll-setting">
                <span>Animation Budget</span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={autoroll.animationBudget}
                  onChange={handleAnimationBudgetInput}
                />
              </label>
            </div>
          )}

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
