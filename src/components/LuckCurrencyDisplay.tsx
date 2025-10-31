import React from 'react';
import { type Decimal as DecimalType } from '@patashu/break_eternity.js';
import { formatShort } from '../utils/decimal';

interface Props {
  luckPoints: DecimalType;
  onOpen: () => void;
}

export const LuckCurrencyDisplay: React.FC<Props> = ({ luckPoints, onOpen }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <button className="btn btn-secondary btn-small" onClick={onOpen} aria-label="Open Prestige Panel">
        ✨ Prestige
      </button>
      <div style={{ fontSize: '0.9rem', color: 'var(--color-text-dim)' }}>
        Luck: {formatShort(luckPoints)}
      </div>
    </div>
  );
};

export default LuckCurrencyDisplay;
