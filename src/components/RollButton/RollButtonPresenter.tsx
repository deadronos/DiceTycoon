import React from 'react';

interface RollButtonPresenterProps {
    onRoll: () => void;
    disabled: boolean;
    buttonText: string;
}

export const RollButtonPresenter: React.FC<RollButtonPresenterProps> = ({ onRoll, disabled, buttonText }) => {
    return (
        <button
            className="roll-button"
            onClick={onRoll}
            disabled={disabled}
        >
            {buttonText}
        </button>
    );
};
