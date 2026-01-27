import React from 'react';

interface ComboToastPresenterProps {
    visible: boolean;
    onClose: () => void;
    intensity: string;
    title: string;
    rarityLabel: string;
    message: string;
    multiplierText: string;
    bonusPercent: number;
}

export const ComboToastPresenter: React.FC<ComboToastPresenterProps> = ({
    visible,
    onClose,
    intensity,
    title,
    rarityLabel,
    message,
    multiplierText,
    bonusPercent,
}) => {
    const rarityClass = `combo-toast__rarity combo-toast__rarity-${intensity}`;

    return (
        <div className={`combo-toast combo-${intensity} ${visible ? 'show' : ''}`} role="status">
            <button
                type="button"
                className="combo-toast__close"
                onClick={onClose}
                aria-label="Dismiss combo notification"
            >
                ×
            </button>
            <div className="combo-toast__header">
                <div className="combo-toast__title">{title}</div>
                <span className={rarityClass}>{rarityLabel}</span>
            </div>
            <div className="combo-toast__message">{message}</div>
            <div className="combo-toast__multiplier" aria-label={`Combo multiplier ${multiplierText}x`}>
                ×{multiplierText} Credits — +{bonusPercent}%
            </div>
        </div>
    );
};
