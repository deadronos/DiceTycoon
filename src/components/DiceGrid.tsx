import React from 'react';
import DieCard from './DieCard';

type Die = { id: number; locked: boolean; level: number };

export default function DiceGrid({ dice, credits, onLevelUp, onUnlock, onAnimUnlock }: any) {
  const available = Number((credits && credits.toString && credits.toString()) || '0');
  return (
    <div className="dt-dice-grid">
      {dice.map((d: any) => {
        const unlockCost = 500 * (d.id + 1);
        const levelUpCost = Math.floor(50 * Math.pow(1.5, d.level));
        const animCost = 200 * ((d.animationLevel ?? 0) + 1);
        return (
          <DieCard key={d.id} die={d} onLevelUp={onLevelUp} onUnlock={onUnlock} onAnimUnlock={onAnimUnlock} affordable={{ unlock: available >= unlockCost, levelUp: available >= levelUpCost, anim: available >= animCost }} />
        );
      })}
    </div>
  );
}
