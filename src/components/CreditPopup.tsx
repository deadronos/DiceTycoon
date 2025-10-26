import React, { useEffect, useState } from 'react';
import { formatShort } from '../utils/decimal';
import Decimal from '@patashu/break_eternity.js';
import { CREDIT_POPUP_DURATION } from '../utils/constants';

interface CreditPopupProps {
  credits: Decimal;
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
