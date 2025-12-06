import React from 'react';
import { formatShort } from '../utils/decimal';
import { type Decimal as DecimalType } from '@patashu/break_eternity.js';

/**
 * Props for the CreditsDisplay component.
 */
interface CreditsDisplayProps {
  /** The credit amount to display. */
  credits: DecimalType;
  /** Optional label prefix (defaults to "Current Credits"). */
  label?: string;
}

const DEFAULT_LABEL = 'Current Credits';

/**
 * Displays the current credit balance formatted with suffixes.
 */
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
