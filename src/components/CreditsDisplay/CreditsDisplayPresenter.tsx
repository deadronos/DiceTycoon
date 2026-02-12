import React from 'react';

interface CreditsDisplayPresenterProps {
    formattedCredits: string;
    accessibleName: string;
}

export const CreditsDisplayPresenter: React.FC<CreditsDisplayPresenterProps> = ({
    formattedCredits,
    accessibleName,
}) => {
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
