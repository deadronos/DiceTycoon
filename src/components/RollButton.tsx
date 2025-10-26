import React from 'react';

interface RollButtonProps {
  onRoll: () => void;
  disabled: boolean;
  isRolling: boolean;
}

export const RollButton: React.FC<RollButtonProps> = ({ onRoll, disabled, isRolling }) => {
  return (
    <button
      className="roll-button"
      onClick={onRoll}
      disabled={disabled || isRolling}
    >
      {isRolling ? '🎲 Rolling...' : '🎲 ROLL DICE'}
    </button>
  );
};
