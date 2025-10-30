import React from 'react';
import { formatShort } from '../utils/decimal';
import { type Decimal as DecimalType } from '@patashu/break_eternity.js';

interface CreditsDisplayProps {
  credits: DecimalType;
}

export const CreditsDisplay: React.FC<CreditsDisplayProps> = ({ credits }) => {
  return (
    <div className="credits-display">
      💰 {formatShort(credits)} Credits
    </div>
  );
};
