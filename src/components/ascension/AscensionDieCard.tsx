import React from 'react';
import { type Decimal as DecimalType } from '@patashu/break_eternity.js';
import { type AscensionDieState, type AscensionDieFocus } from '../../types/game';
import { formatShort } from '../../utils/decimal';

/**
 * Props for the AscensionDieCard component.
 */
interface Props {
  /** The state of the ascension die. */
  die: AscensionDieState;
  /** Current available stardust. */
  stardust: DecimalType;
  /** Calculated production rates for this die. */
  production: { stardustPerSecond: DecimalType; resonancePerSecond: DecimalType };
  /** Cost to unlock the die. */
  unlockCost: DecimalType;
  /** Cost to upgrade the die's tier. */
  upgradeCost: DecimalType;
  /** Callback to unlock the die. */
  onUnlock: (id: number) => void;
  /** Callback to upgrade the die. */
  onUpgrade: (id: number) => void;
  /** Callback to change the resource focus of the die. */
  onFocusChange: (id: number, focus: AscensionDieFocus) => void;
}

/**
 * Displays a single ascension die with its stats, upgrade options, and focus toggle.
 */
export const AscensionDieCard: React.FC<Props> = ({
  die,
  stardust,
  production,
  unlockCost,
  upgradeCost,
  onUnlock,
  onUpgrade,
  onFocusChange,
}) => {
  const isUnlocked = die.unlocked;
  const canUnlock = !isUnlocked && stardust.gte(unlockCost);
  const canUpgrade = isUnlocked && stardust.gte(upgradeCost);

  return (
    <div className="ascension-die-card glass-card">
      <div className="ascension-die-card__header">
        <div className="ascension-die-card__title">Die {die.id}</div>
        <span className="ascension-die-card__status">{isUnlocked ? 'Active' : 'Dormant'}</span>
      </div>

      <div className="ascension-die-card__body">
        <div className="ascension-die-card__row">
          <span>Tier</span>
          <strong>{isUnlocked ? `T${die.tier + 1}` : 'Locked'}</strong>
        </div>
        <div className="ascension-die-card__row">
          <span>Stardust</span>
          <strong>+{formatShort(production.stardustPerSecond)}/s</strong>
        </div>
        <div className="ascension-die-card__row">
          <span>Resonance</span>
          <strong>+{formatShort(production.resonancePerSecond)}/s</strong>
        </div>
      </div>

      <div className="ascension-die-card__actions">
        {!isUnlocked ? (
          <button
            className="btn btn-primary"
            disabled={!canUnlock}
            onClick={() => onUnlock(die.id)}
          >
            Unlock for {formatShort(unlockCost)} ✨
          </button>
        ) : (
          <button className="btn btn-primary" disabled={!canUpgrade} onClick={() => onUpgrade(die.id)}>
            Upgrade for {formatShort(upgradeCost)} ✨
          </button>
        )}
        {isUnlocked && (
          <div className="ascension-focus-toggle" role="group" aria-label="Focus selection">
            <button
              className={die.focus === 'stardust' ? 'pill-button pill-button--active' : 'pill-button'}
              onClick={() => onFocusChange(die.id, 'stardust')}
            >
              Stardust
            </button>
            <button
              className={die.focus === 'resonance' ? 'pill-button pill-button--active' : 'pill-button'}
              onClick={() => onFocusChange(die.id, 'resonance')}
            >
              Resonance
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AscensionDieCard;
