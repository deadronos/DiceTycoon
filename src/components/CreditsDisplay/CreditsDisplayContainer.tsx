import React from 'react';
import { formatShort } from '../../utils/decimal';
import { type Decimal as DecimalType } from '../../utils/decimal';
import { CreditsDisplayPresenter } from './CreditsDisplayPresenter';

interface CreditsDisplayContainerProps {
    credits: DecimalType;
    label?: string;
}

const DEFAULT_LABEL = 'Current Credits';

export const CreditsDisplayContainer: React.FC<CreditsDisplayContainerProps> = ({ credits, label }) => {
    const formattedCredits = formatShort(credits);
    const trimmedLabel = label ? label.trim() : '';
    const normalizedLabel = trimmedLabel.length > 0 ? trimmedLabel : DEFAULT_LABEL;
    const accessibleName = `${normalizedLabel}: ${formattedCredits}`;

    return (
        <CreditsDisplayPresenter
            formattedCredits={formattedCredits}
            accessibleName={accessibleName}
        />
    );
};
