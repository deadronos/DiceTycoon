import React from 'react';

/**
 * Props for the RollButton component.
 */
interface RollButtonProps {
  /** Callback to trigger a roll. */
  onRoll: () => void;
  /** Whether the button is disabled. */
  disabled: boolean;
  /** Whether a roll is currently in progress. */
  isRolling: boolean;
}

/**
 * The primary action button for rolling dice.
 */
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
