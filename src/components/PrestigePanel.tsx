import React from 'react';
import Decimal from '@patashu/break_eternity.js';
import { formatShort } from '../utils/decimal';
import type { GameState } from '../types/game';

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  luckGain: Decimal;
  currentLuck: Decimal;
}

export const PrestigePanel: React.FC<Props> = ({ visible, onClose, onConfirm, luckGain, currentLuck }) => {
  if (!visible) return null;

  return (
    <div className="prestige-panel-overlay">
      <div className="prestige-panel glass-card">
        <h2>✨ Prestige - Luck Nexus</h2>
        <p>
          Reset your progress to gain <strong>{formatShort(luckGain)}</strong> Luck Points.
        </p>
        <p>
          Current Luck: <strong>{formatShort(currentLuck)}</strong>
        </p>
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <button className="btn btn-primary" onClick={onConfirm}>
            Confirm Prestige
          </button>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
        <div style={{ marginTop: '10px', fontSize: '0.9rem', color: 'var(--color-text-dim)' }}>
          Persisted on prestige: Luck Points and Settings. All other progression will reset.
        </div>
      </div>
    </div>
  );
};

export default PrestigePanel;
