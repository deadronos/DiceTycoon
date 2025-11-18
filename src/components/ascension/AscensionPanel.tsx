import React from 'react';
import { type Decimal as DecimalType } from '@patashu/break_eternity.js';
import type { GameState, AscensionDieFocus } from '../../types/game';
import { formatShort } from '../../utils/decimal';
import { getAscensionCreditBonus, getAscensionDieProduction, getAscensionUnlockCost, getAscensionUpgradeCost } from '../../utils/ascension';
import AscensionDieCard from './AscensionDieCard';

interface Props {
  gameState: GameState;
  production: { stardustPerSecond: DecimalType; resonancePerSecond: DecimalType };
  onUnlockDie: (id: number) => void;
  onUpgradeDie: (id: number) => void;
  onFocusChange: (id: number, focus: AscensionDieFocus) => void;
}

export const AscensionPanel: React.FC<Props> = ({
  gameState,
  production,
  onUnlockDie,
  onUpgradeDie,
  onFocusChange,
}) => {
  const stardust = gameState.ascension.stardust;
  const resonance = gameState.ascension.resonance;
  const resonanceBonus = getAscensionCreditBonus(gameState);

  return (
    <section className="ascension-panel">
      <header className="ascension-panel__header">
        <div>
          <p className="eyebrow">Second Prestige • Eclipse Run</p>
          <h2>🌌 Resonant Forge</h2>
          <p className="ascension-panel__lede">
            An idle layer built around slow, deliberate dice forging. Each Resonance point fuels your core run,
            while Stardust unlocks more interlinked dice inside the forge.
          </p>
        </div>
        <div className="ascension-panel__summary-card glass-card">
          <div className="ascension-summary-row">
            <span>Stardust</span>
            <strong>
              {formatShort(stardust)} <small>+{formatShort(production.stardustPerSecond)}/s</small>
            </strong>
          </div>
          <div className="ascension-summary-row">
            <span>Resonance</span>
            <strong>
              {formatShort(resonance)} <small>+{formatShort(production.resonancePerSecond)}/s</small>
            </strong>
          </div>
          <div className="ascension-summary-row ascension-summary-row--hint">
            <span>Core run boost</span>
            <strong>×{resonanceBonus.toFixed(2)} credits</strong>
          </div>
        </div>
      </header>

      <div className="ascension-dice-grid">
        {gameState.ascension.dice.map(die => (
          <AscensionDieCard
            key={die.id}
            die={die}
            stardust={stardust}
            production={getAscensionDieProduction(die, gameState)}
            unlockCost={getAscensionUnlockCost(die)}
            upgradeCost={getAscensionUpgradeCost(die)}
            onUnlock={onUnlockDie}
            onUpgrade={onUpgradeDie}
            onFocusChange={onFocusChange}
          />
        ))}
      </div>

      <div className="ascension-panel__footer glass-card">
        <div>
          <h4>Layer Synergy</h4>
          <p>
            Prestige luck and total prestiges accelerate stardust flow, while Resonance feeds back into every roll as a
            multiplicative credit bonus. Focus dice on Stardust to unlock the grid, then pivot into Resonance to scale both
            tabs together.
          </p>
        </div>
        <div className="ascension-panel__metrics">
          <div className="ascension-panel__metric">
            <span>Cycles observed</span>
            <strong>{Math.floor(gameState.ascension.totalCycles).toLocaleString()}</strong>
          </div>
          <div className="ascension-panel__metric">
            <span>Unlocked dice</span>
            <strong>
              {gameState.ascension.dice.filter(d => d.unlocked).length}/{gameState.ascension.dice.length}
            </strong>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AscensionPanel;
