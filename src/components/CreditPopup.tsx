import React, { useEffect } from 'react';
import { formatShort } from '../utils/decimal';
import { type Decimal as DecimalType } from '@patashu/break_eternity.js';
import { CREDIT_POPUP_DURATION } from '../utils/constants';

interface CreditPopupProps {
  credits: DecimalType;
  onComplete: () => void;
}

export const CreditPopup: React.FC<CreditPopupProps> = ({ credits, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, CREDIT_POPUP_DURATION);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="credit-popup">
      +{formatShort(credits)} 💎
    </div>
  );
};
