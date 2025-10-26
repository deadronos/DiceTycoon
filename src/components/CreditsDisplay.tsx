import React from 'react';
import { formatShort } from '../utils/decimal';
import Decimal from '@patashu/break_eternity.js';

interface CreditsDisplayProps {
  credits: Decimal;
}

export const CreditsDisplay: React.FC<CreditsDisplayProps> = ({ credits }) => {
  return (
    <div className="credits-display">
      💰 {formatShort(credits)} Credits
    </div>
  );
};
