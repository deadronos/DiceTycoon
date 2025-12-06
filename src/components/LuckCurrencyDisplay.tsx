import React from 'react';
import { type Decimal as DecimalType } from '@patashu/break_eternity.js';
// Decimal creation handled through tooltip math; no direct construction needed here.
import { formatShort, formatFull } from '../utils/decimal';
import InfoTooltip from './InfoTooltip';

/**
 * Props for the LuckCurrencyDisplay component.
 */
interface Props {
  /** The current amount of Luck Points. */
  luckPoints: DecimalType;
  /** Callback to open the prestige panel. */
  onOpen: () => void;
}

/**
 * Displays the current Luck Points and provides a button to open the Prestige menu.
 */
export const LuckCurrencyDisplay: React.FC<Props> = ({ luckPoints, onOpen }) => {
  const multiplier = Math.min(10, 1 + luckPoints.toNumber() * 0.02);
  const tooltip = (
    <div>
      <div><strong>Prestige Luck</strong></div>
      <div>Every Luck Point adds +2% to your credit gains up to a 10× cap.</div>
      <div className="tooltip-meta-row">Luck Points: {formatFull(luckPoints)}</div>
      <div className="tooltip-meta-row tooltip-meta-row--tight">Current multiplier: ×{multiplier.toFixed(2)}</div>
    </div>
  );

  return (
    <div className="luck-display-row">
      <button className="btn btn-secondary btn-small" onClick={onOpen} aria-label="Open Prestige Panel">
        ✨ Prestige
      </button>
      <div className="luck-display-meta">
        Luck: {formatShort(luckPoints)}
        <InfoTooltip content={tooltip} label="Luck details" />
      </div>
    </div>
  );
};

export default LuckCurrencyDisplay;
