import React from 'react';
import { type Decimal as DecimalType } from '@patashu/break_eternity.js';
import { CreditsDisplay } from '../CreditsDisplay';
import { LuckCurrencyDisplay } from '../LuckCurrencyDisplay';

/**
 * Props for the AppHeader component.
 */
interface Props {
  /** Current credits available. */
  credits: DecimalType;
  /** Current luck points available. */
  luckPoints: DecimalType;
  /** Total number of rolls performed in the game. */
  totalRolls: number;
  /** Callback to open the prestige panel. */
  onOpenPrestige: () => void;
}

/**
 * The main header of the application, displaying currencies and global stats.
 */
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
