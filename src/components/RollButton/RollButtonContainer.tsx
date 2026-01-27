import React from 'react';
import { RollButtonPresenter } from './RollButtonPresenter';

interface RollButtonContainerProps {
    onRoll: () => void;
    disabled: boolean;
    isRolling: boolean;
}

export const RollButtonContainer: React.FC<RollButtonContainerProps> = ({ onRoll, disabled, isRolling }) => {
    const buttonText = isRolling ? '🎲 Rolling...' : '🎲 ROLL DICE';
    const totalDisabled = disabled || isRolling;

    return (
        <RollButtonPresenter
            onRoll={onRoll}
            disabled={totalDisabled}
            buttonText={buttonText}
        />
    );
};
