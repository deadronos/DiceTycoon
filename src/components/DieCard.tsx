import React from 'react';

type Die = {
  id: number;
  locked: boolean;
  level: number;
  animationLevel?: number;
};

export default function DieCard({ die, onLevelUp, onUnlock, onAnimUnlock }: { die: Die, onLevelUp?: any, onUnlock?: any, onAnimUnlock?: any }) {
  const unlockCost = 500 * (die.id + 1);
  const levelUpCost = Math.floor(50 * Math.pow(1.5, die.level));
  const animCost = 200 * ((die.animationLevel ?? 0) + 1);

  return (
    <div className="dt-die-card">
      {die.locked ? (
        <div className="dt-locked">
          <div>Locked — unlock for {unlockCost}</div>
          <button data-testid={`unlock-${die.id}`} onClick={() => onUnlock && onUnlock(die.id)}>Unlock</button>
        </div>
      ) : (
        <div>
          <div className="dt-face">[{die.id + 1}]</div>
          <div className="dt-small">Level: {die.level}</div>
          <div className="dt-margin-top-8">
            <button data-testid={`levelup-${die.id}`} onClick={() => onLevelUp && onLevelUp(die.id)}>Level Up ({levelUpCost})</button>
            <button data-testid={`animup-${die.id}`} onClick={() => onAnimUnlock && onAnimUnlock(die.id)} className="dt-ml-6">Unlock Anim ({animCost})</button>
          </div>
        </div>
      )}
    </div>
  );
}
