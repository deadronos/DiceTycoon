import React from 'react';
import DieCard from './DieCard';

type Die = { id: number; locked: boolean; level: number };

export default function DiceGrid({ dice, onLevelUp, onUnlock, onAnimUnlock }: any) {
  return (
    <div className="dt-dice-grid">
      {dice.map((d: any) => <DieCard key={d.id} die={d} onLevelUp={onLevelUp} onUnlock={onUnlock} onAnimUnlock={onAnimUnlock} />)}
    </div>
  );
}
