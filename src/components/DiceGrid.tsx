import React from 'react';
import { toDecimal, formatDecimal } from '../utils/decimal';
import DieCard from './DieCard';

type Die = { id: number; locked: boolean; level: number };

export default function DiceGrid({ dice, credits, onLevelUp, onUnlock, onAnimUnlock, onAscend }: any) {
  const available = Number((credits && credits.toString && credits.toString()) || '0');
  return (
    <div className="dt-dice-grid">
      {dice.map((d: any) => {
        const unlockCostDec = toDecimal(500).times(d.id + 1);
        const levelUpCostDec = toDecimal(50).times(toDecimal(1.5).pow(d.level)).floor();
        const animCostDec = toDecimal(200).times((d.animationLevel ?? 0) + 1);
        const ascCostDec = toDecimal(1000).times(toDecimal(4).pow(d.ascensionLevel || 0));
        const unlockCost = formatDecimal(unlockCostDec);
        const levelUpCost = formatDecimal(levelUpCostDec);
        const animCost = formatDecimal(animCostDec);
        const ascCost = formatDecimal(ascCostDec);
        return (
          <DieCard key={d.id} die={d} onLevelUp={onLevelUp} onUnlock={onUnlock} onAnimUnlock={onAnimUnlock} onAscend={onAscend} affordable={{ unlock: available >= Number(unlockCostDec.toString()), levelUp: available >= Number(levelUpCostDec.toString()), anim: available >= Number(animCostDec.toString()), ascend: available >= Number(ascCostDec.toString()) }} />
        );
      })}
    </div>
  );
}
