import React from 'react';
import { type Decimal as DecimalType } from '@patashu/break_eternity.js';
import { formatShort, formatFull } from '../utils/decimal';
import InfoTooltip from './InfoTooltip';

interface Props {
  luckPoints: DecimalType;
  onOpen: () => void;
}

export const LuckCurrencyDisplay: React.FC<Props> = ({ luckPoints, onOpen }) => {
  const multiplier = Math.min(10, 1 + luckPoints.toNumber() * 0.02);
  const tooltip = (
    <div>
      <div><strong>Prestige Luck</strong></div>
      <div>Every Luck Point adds +2% to your credit gains up to a 10× cap.</div>
      <div style={{ marginTop: '6px', opacity: 0.8 }}>Luck Points: {formatFull(luckPoints)}</div>
      <div style={{ marginTop: '4px', opacity: 0.8 }}>Current multiplier: ×{multiplier.toFixed(2)}</div>
    </div>
  );

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <button className="btn btn-secondary btn-small" onClick={onOpen} aria-label="Open Prestige Panel">
        ✨ Prestige
      </button>
      <div style={{ fontSize: '0.9rem', color: 'var(--color-text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
        Luck: {formatShort(luckPoints)}
        <InfoTooltip content={tooltip} label="Luck details" />
      </div>
    </div>
  );
};

export default LuckCurrencyDisplay;
