import React from 'react';
import { type Decimal as DecimalType } from '@patashu/break_eternity.js';
import { CreditsDisplay } from '../CreditsDisplay';
import { LuckCurrencyDisplay } from '../LuckCurrencyDisplay';

interface Props {
  credits: DecimalType;
  luckPoints: DecimalType;
  totalRolls: number;
  onOpenPrestige: () => void;
}

export const AppHeader: React.FC<Props> = ({ credits, luckPoints, totalRolls, onOpenPrestige }) => (
  <header className="header">
    <h1>🎲 Dice Tycoon</h1>
    <div className="header-bar">
      <CreditsDisplay credits={credits} />
      <LuckCurrencyDisplay luckPoints={luckPoints} onOpen={onOpenPrestige} />
    </div>
    <div className="header-subtitle">Total Rolls: {totalRolls.toLocaleString()}</div>
  </header>
);

export default AppHeader;
