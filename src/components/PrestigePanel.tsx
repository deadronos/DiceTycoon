import React, { useMemo, useState } from 'react';
import { type Decimal as DecimalType } from '@patashu/break_eternity.js';
import type { GameState } from '../types/game';
import type { PrestigeShopItem, PrestigeShopKey } from '../utils/constants';
import { getLuckMultiplier, getLuckGainMultiplier, getShopMultiplier, getAutorollCooldownMultiplier, getLuckProgress } from '../utils/game-logic';
import PrestigeShopSection from './prestige/PrestigeShopSection';
import PrestigeConsumablesSection from './prestige/PrestigeConsumablesSection';
import { PrestigeOverview } from './prestige/PrestigeOverview';

/**
 * Props for the PrestigePanel component.
 */
interface Props {
  /** Whether the panel is visible. */
  visible: boolean;
  /** Callback to close the panel. */
  onClose: () => void;
  /** Callback to confirm prestige reset. */
  onConfirm: () => void;
  /** Amount of Luck Points to be gained. */
  luckGain: DecimalType;
  /** Current Luck Points balance. */
  currentLuck: DecimalType;
  /** The full game state. */
  gameState: GameState;
  /** Callback to purchase a shop upgrade. */
  onBuyUpgrade: (key: PrestigeShopKey) => void;
  /** Function to check if an upgrade is affordable. */
  canBuyUpgrade: (state: GameState, key: PrestigeShopKey) => boolean;
  /** Function to calculate upgrade cost. */
  getUpgradeCost: (key: PrestigeShopKey, level: number) => DecimalType;
  /** Dictionary of shop items. */
  shopItems: Record<PrestigeShopKey, PrestigeShopItem>;
}

/**
 * The main modal for the Prestige system, containing the overview, shop, and consumables tabs.
 */
export const PrestigePanel: React.FC<Props> = ({
  visible,
  onClose,
  onConfirm,
  luckGain,
  currentLuck,
  gameState,
  onBuyUpgrade,
  canBuyUpgrade,
  getUpgradeCost,
  shopItems,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'shop' | 'consumables'>('overview');
  const [shopFilter, setShopFilter] = useState<'all' | 'affordable' | 'recommended'>('all');

  const luckMultiplier = useMemo(() => getLuckMultiplier(gameState), [gameState]);
  const luckGainBoost = useMemo(() => getLuckGainMultiplier(gameState), [gameState]);
  const shopMultiplier = useMemo(() => getShopMultiplier(gameState), [gameState]);
  const autorollBoost = useMemo(() => getAutorollCooldownMultiplier(gameState), [gameState]);
  const luckProgress = useMemo(() => getLuckProgress(gameState), [gameState]);
  const luckProgressPercent = Math.round(Math.min(100, luckProgress.progressPercent));
  const projectedLuck = currentLuck.plus(luckGain);
  const autorollReductionPercent = Math.max(0, Math.round((1 - autorollBoost.toNumber()) * 100));

  if (!visible) return null;

  return (
    <div className="prestige-panel-overlay">
      <div className="prestige-panel glass-card">
        <div className="prestige-panel__header">
          <div>
            <h2>✨ Prestige - Luck Nexus</h2>
            <p className="prestige-panel__subtitle">
              Trade your current run for permanent Luck bonuses and strategic upgrades.
            </p>
          </div>
          <button className="btn btn-secondary" onClick={onClose} aria-label="Close prestige panel">
            ✕
          </button>
        </div>

        <div className="prestige-tabs">
          <button
            className={activeTab === 'overview' ? 'prestige-tab prestige-tab--active' : 'prestige-tab'}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={activeTab === 'shop' ? 'prestige-tab prestige-tab--active' : 'prestige-tab'}
            onClick={() => setActiveTab('shop')}
          >
            Shop
          </button>
          <button
            className={activeTab === 'consumables' ? 'prestige-tab prestige-tab--active' : 'prestige-tab'}
            onClick={() => setActiveTab('consumables')}
          >
            Consumables
          </button>
        </div>

        {activeTab === 'overview' && (
          <PrestigeOverview
            gameState={gameState}
            luckGain={luckGain}
            currentLuck={currentLuck}
            projectedLuck={projectedLuck}
            luckMultiplier={luckMultiplier}
            luckGainBoost={luckGainBoost}
            shopMultiplier={shopMultiplier}
            autorollBoost={autorollBoost}
            autorollReductionPercent={autorollReductionPercent}
            luckProgressPercent={luckProgressPercent}
            onConfirm={onConfirm}
            onClose={onClose}
          />
        )}

        {activeTab === 'shop' && (
          <PrestigeShopSection
            gameState={gameState}
            shopItems={shopItems}
            canBuyUpgrade={canBuyUpgrade}
            getUpgradeCost={getUpgradeCost}
            onBuyUpgrade={onBuyUpgrade}
            filter={shopFilter}
            setFilter={setShopFilter}
          />
        )}

        {activeTab === 'consumables' && (
          <PrestigeConsumablesSection
            gameState={gameState}
            shopItems={shopItems}
            canBuyUpgrade={canBuyUpgrade}
            getUpgradeCost={getUpgradeCost}
            onBuyUpgrade={onBuyUpgrade}
          />
        )}
      </div>
    </div>
  );
};

export default PrestigePanel;
