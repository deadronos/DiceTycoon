import React, { useEffect } from 'react';
import { formatShort } from '../utils/decimal';
import { type Decimal as DecimalType } from '@patashu/break_eternity.js';
import { CREDIT_POPUP_DURATION } from '../utils/constants';

/**
 * Props for the CreditPopup component.
 */
interface CreditPopupProps {
  /** The amount of credits earned. */
  credits: DecimalType;
  /** Optional roll count context (unused visually but part of interface). */
  rollCount?: number | null;
  /** Whether the roll was critical. */
  isCritical?: boolean;
  /** Callback when popup duration ends. */
  onComplete: () => void;
}

/**
 * A floating popup showing credits earned from a roll.
 */
export const CreditPopup: React.FC<CreditPopupProps> = ({ credits, rollCount, onComplete, isCritical }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, CREDIT_POPUP_DURATION);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`credit-popup ${isCritical ? 'critical' : ''}`}>
      {isCritical && <div className="critical-label">CRITICAL!</div>}
      +{formatShort(credits)} 💎
      {typeof rollCount === 'number' && (
        <div className="credit-popup__detail">({rollCount} rolls)</div>
      )}
    </div>
  );
};
