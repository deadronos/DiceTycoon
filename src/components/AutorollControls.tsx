import React from 'react';
import { AutorollState } from '../types/game';
import { formatShort, formatFull } from '../utils/decimal';
import { type Decimal as DecimalType } from '@patashu/break_eternity.js';

interface AutorollControlsProps {
  autoroll: AutorollState;
  upgradeCost: DecimalType;
  canUpgrade: boolean;
  onToggle: () => void;
  onUpgrade: () => void;
}

export const AutorollControls: React.FC<AutorollControlsProps> = ({
  autoroll,
  upgradeCost,
  canUpgrade,
  onToggle,
  onUpgrade,
}) => {
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
