import React from 'react';
import InfoTooltip from '../InfoTooltip';

interface LuckCurrencyDisplayPresenterProps {
    formattedLuck: string;
    onOpen: () => void;
    tooltipContent: React.ReactNode;
}

export const LuckCurrencyDisplayPresenter: React.FC<LuckCurrencyDisplayPresenterProps> = ({
    formattedLuck,
    onOpen,
    tooltipContent,
}) => {
    return (
        <div className="luck-display-row">
            <button className="btn btn-secondary btn-small" onClick={onOpen} aria-label="Open Prestige Panel">
                ✨ Prestige
            </button>
            <div className="luck-display-meta">
                Luck: {formattedLuck}
                <InfoTooltip content={tooltipContent} label="Luck details" />
            </div>
        </div>
    );
};
