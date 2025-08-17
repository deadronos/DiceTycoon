import React from 'react';
import { toDecimal, formatDecimal } from '../utils/decimal';

type Die = {
  id: number;
  locked: boolean;
  level: number;
  animationLevel?: number;
  ascensionLevel?: number;
};

export default function DieCard({ die, onLevelUp, onUnlock, onAnimUnlock, onAscend, affordable = {} }: { die: Die, onLevelUp?: any, onUnlock?: any, onAnimUnlock?: any, onAscend?: any, affordable?: Record<string, boolean> }) {
  const unlockCost = formatDecimal(toDecimal(500).times(die.id + 1));
  const levelUpCost = formatDecimal(toDecimal(50).times(toDecimal(1.5).pow(die.level)).floor());
  const animCost = formatDecimal(toDecimal(200).times((die.animationLevel ?? 0) + 1));
  const ascCost = formatDecimal(toDecimal(1000).times(toDecimal(4).pow(die.ascensionLevel || 0)));

  const canUnlock = affordable.unlock ?? true;
  const canLevel = affordable.levelUp ?? true;
  const canAnim = affordable.anim ?? true;
  const canAscend = affordable.ascend ?? true;

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
            <button disabled={!canLevel} data-testid={`levelup-${die.id}`} onClick={() => onLevelUp && onLevelUp(die.id)}>Level Up ({levelUpCost})</button>
            <button disabled={!canAnim} data-testid={`animup-${die.id}`} onClick={() => onAnimUnlock && onAnimUnlock(die.id)} className="dt-ml-6">Unlock Anim ({animCost})</button>
            <button disabled={!canAscend} data-testid={`ascend-${die.id}`} onClick={() => onAscend && onAscend(die.id)} className="dt-ml-6">Ascend (Lv {die.ascensionLevel || 0}) ({ascCost})</button>
          </div>
        </div>
      )}
    </div>
  );
}
