import React from 'react';
import { formatShort } from '../utils/decimal';
import { type Decimal as DecimalType } from '@patashu/break_eternity.js';

interface CreditsDisplayProps {
  credits: DecimalType;
  label?: string;
}

const DEFAULT_LABEL = 'Current Credits';

export const CreditsDisplay: React.FC<CreditsDisplayProps> = ({ credits, label }) => {
  const formattedCredits = formatShort(credits);
  const trimmedLabel = label ? label.trim() : '';
  const normalizedLabel = trimmedLabel.length > 0 ? trimmedLabel : DEFAULT_LABEL;
  const accessibleName = `${normalizedLabel}: ${formattedCredits}`;

  return (
    <div
      className="credits-display"
      role="status"
      aria-live="polite"
      aria-label={accessibleName}
    >
      <span aria-hidden="true">💰 {formattedCredits}</span>
      <span aria-hidden="true"> Credits</span>
    </div>
  );
};
