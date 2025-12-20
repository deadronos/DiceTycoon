import React from 'react';
import { type Decimal as DecimalType } from '@patashu/break_eternity.js';
import type { GameState } from '../../types/game';
import { formatFull, formatShort } from '../../utils/decimal';
import { InfoTooltip } from '../InfoTooltip';

/**
 * Props for the PrestigeOverview component.
 */
interface Props {
  /** The full game state. */
  gameState: GameState;
  /** Amount of Luck Points to be gained upon prestige. */
  luckGain: DecimalType;
  /** Currently banked Luck Points. */
  currentLuck: DecimalType;
  /** Total Luck Points after prestige. */
  projectedLuck: DecimalType;
  /** Current Luck Multiplier effect. */
  luckMultiplier: DecimalType;
  /** Multiplier applied to luck gain. */
  luckGainBoost: DecimalType;
  /** Multiplier applied from shop upgrades. */
  shopMultiplier: DecimalType;
  /** Multiplier applied to autoroll cooldown. */
  autorollBoost: DecimalType;
  /** Percentage reduction of autoroll cooldown. */
  autorollReductionPercent: number;
  /** Percentage progress towards the next Luck Point. */
  luckProgressPercent: number;
  /** Callback to confirm prestige reset. */
  onConfirm: () => void;
  /** Callback to close the prestige modal. */
  onClose: () => void;
}

const formatMultiplier = (value: DecimalType): string => `×${value.toFixed(2)}`;

/**
 * Displays the main prestige confirmation screen with stats and projected gains.
 */
export const PrestigeOverview: React.FC<Props> = ({
  gameState,
  luckGain,
  currentLuck,
  projectedLuck,
  luckMultiplier,
  luckGainBoost,
  shopMultiplier,
  autorollBoost,
  autorollReductionPercent,
  luckProgressPercent,
  onConfirm,
  onClose,
}) => {
  const prestigeFormulaTooltip = (
    <div>
      <div><strong>Luck Gain Formula</strong></div>
      <div>floor(max(log10(credits) − 2, 0) × 0.5 × (1 + 0.10 × Luck Fabricator level))</div>
      <div className="tooltip-meta-row">Current credits: {formatFull(gameState.credits)}</div>
    </div>
  );

  const luckMultiplierTooltip = (
    <div>
      <div><strong>Luck Multiplier</strong></div>
      <div>1 + Luck Points × 0.02 (capped at 10×)</div>
      <div className="tooltip-meta-row">Luck Points: {formatFull(currentLuck)}</div>
    </div>
  );

  const luckBoostTooltip = (
    <div>
      <div><strong>Luck Fabricator Boost</strong></div>
      <div>Each level increases prestige luck gains by +10% multiplicatively.</div>
    </div>
  );

  const shopMultiplierTooltip = (
    <div>
      <div><strong>Fortune Amplifier</strong></div>
      <div>Every level adds +5% permanent credit multiplier.</div>
    </div>
  );

  const autorollTooltip = (
    <div>
      <div><strong>Temporal Accelerator</strong></div>
      <div>Autoroll cooldown is multiplied by 0.95 per level (stacking multiplicatively).</div>
    </div>
  );

  return (
    <div className="prestige-overview">
      <div className="prestige-stat-grid">
        <div className="prestige-stat-card">
          <div className="prestige-stat-card__label">
            Projected Luck Gain
            <InfoTooltip content={prestigeFormulaTooltip} label="Luck gain formula" />
          </div>
          <div className="prestige-stat-card__value">{formatShort(luckGain)}</div>
          <div className="prestige-stat-card__hint">Reset now to claim these Luck Points.</div>
        </div>

        <div className="prestige-stat-card">
          <div className="prestige-stat-card__label">
            Luck Multiplier
            <InfoTooltip content={luckMultiplierTooltip} label="Luck multiplier details" />
          </div>
          <div className="prestige-stat-card__value">{formatMultiplier(luckMultiplier)}</div>
          <div className="prestige-stat-card__hint">Passive bonus applied to every roll.</div>
        </div>

        <div className="prestige-stat-card">
          <div className="prestige-stat-card__label">
            Luck Gain Boost
            <InfoTooltip content={luckBoostTooltip} label="Luck boost details" />
          </div>
          <div className="prestige-stat-card__value">{formatMultiplier(luckGainBoost)}</div>
          <div className="prestige-stat-card__hint">From Luck Fabricator upgrades.</div>
        </div>

        <div className="prestige-stat-card">
          <div className="prestige-stat-card__label">
            Shop Multiplier
            <InfoTooltip content={shopMultiplierTooltip} label="Shop multiplier info" />
          </div>
          <div className="prestige-stat-card__value">{formatMultiplier(shopMultiplier)}</div>
          <div className="prestige-stat-card__hint">Fortune Amplifier levels stack with luck.</div>
        </div>

        <div className="prestige-stat-card">
          <div className="prestige-stat-card__label">
            Autoroll Acceleration
            <InfoTooltip content={autorollTooltip} label="Autoroll formula" />
          </div>
          <div className="prestige-stat-card__value">{formatMultiplier(autorollBoost)}</div>
          <div className="prestige-stat-card__hint">
            {autorollReductionPercent > 0
              ? `Cooldown reduced by ${autorollReductionPercent}%`
              : 'No reduction yet'}
          </div>
        </div>

        <div className="prestige-stat-card">
          <div className="prestige-stat-card__label">Luck Bank</div>
          <div className="prestige-stat-card__value">{formatShort(currentLuck)}</div>
          <div className="prestige-stat-card__hint">Persistent Luck Points to spend in the shop.</div>
        </div>
      </div>

      <div className="luck-progress">
        <div className="luck-progress__header">
          <span>Progress to next Luck Point</span>
          <span>{Math.round(Math.min(100, luckProgressPercent))}%</span>
        </div>
        <div className="luck-progress__track" aria-hidden="true">
          <div
            className="luck-progress__fill"
            data-width={`${Math.min(100, luckProgressPercent)}%`}
          />
        </div>
        <div className="luck-progress__hint">
          Keep pushing your credits higher to secure the next Luck Point.
        </div>
      </div>

      <div className="prestige-actions">
        <div className="prestige-confirm-wrapper">
          <button className="btn btn-primary" onClick={onConfirm}>
            Confirm Prestige
          </button>
          <div className="prestige-confirm-preview">
            <div className="prestige-confirm-preview__row">
              <span>Luck Bank</span>
              <span>{formatShort(currentLuck)} LP</span>
            </div>
            <div className="prestige-confirm-preview__arrow" aria-hidden="true">→</div>
            <div className="prestige-confirm-preview__row">
              <span>After Prestige</span>
              <span>{formatShort(projectedLuck)} LP</span>
            </div>
            <div className="prestige-confirm-preview__gain">Gain: +{formatShort(luckGain)} LP</div>
          </div>
        </div>
        <button className="btn btn-secondary" onClick={onClose}>
          Cancel
        </button>
      </div>
      <div className="prestige-retained">
        Persisted on prestige: Luck Points, shop purchases, consumables, and settings. All other progression resets.
      </div>
    </div>
  );
};

export default PrestigeOverview;
