import React, { useMemo, useState } from 'react';
import Decimal from '../utils/decimal';
import { type Decimal as DecimalType } from '@patashu/break_eternity.js';
import { formatFull, formatShort } from '../utils/decimal';
import type { GameState } from '../types/game';
import type { PrestigeShopItem, PrestigeShopKey, PrestigeShopCategory } from '../utils/constants';
import { InfoTooltip } from './InfoTooltip';
import { getLuckMultiplier, getLuckGainMultiplier, getShopMultiplier, getAutorollCooldownMultiplier, getLuckProgress } from '../utils/game-logic';
import PrestigeShopSection from './prestige/PrestigeShopSection';
import PrestigeConsumablesSection from './prestige/PrestigeConsumablesSection';

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  luckGain: DecimalType;
  currentLuck: DecimalType;
  gameState: GameState;
  onBuyUpgrade: (key: PrestigeShopKey) => void;
  canBuyUpgrade: (state: GameState, key: PrestigeShopKey) => boolean;
  getUpgradeCost: (key: PrestigeShopKey, level: number) => DecimalType;
  shopItems: Record<PrestigeShopKey, PrestigeShopItem>;
}

const categoryOrder: PrestigeShopCategory[] = ['passive', 'gameplay', 'qol', 'prestige-exclusive'];

const categoryLabels: Record<PrestigeShopCategory, string> = {
  passive: 'Economy Boosters',
  gameplay: 'Gameplay Tweaks',
  qol: 'Quality of Life',
  consumable: 'Consumables',
  'prestige-exclusive': 'Prestige Exclusives',
};

const categoryDescriptions: Partial<Record<PrestigeShopCategory, string>> = {
  passive: 'Scale your long-term multipliers and luck generation.',
  gameplay: 'Modify how your rolls behave and guarantee better outcomes.',
  qol: 'Automate and accelerate the grind so you can focus on strategy.',
  'prestige-exclusive': 'Unlock unique systems that only exist beyond prestige resets.',
};

const formatMultiplier = (value: DecimalType): string => `×${value.toFixed(2)}`;

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
  const recommendedSet = useMemo(
    () => new Set<PrestigeShopKey>(['multiplier', 'luckFabricator', 'autorollCooldown']),
    []
  );

  const shopKeys = useMemo(
    () =>
      (Object.keys(shopItems) as PrestigeShopKey[]).filter(
        key => shopItems[key].category !== 'consumable'
      ),
    [shopItems]
  );

  const filteredShopKeys = useMemo(
    () =>
      shopKeys.filter(key => {
        if (shopFilter === 'affordable') {
          return canBuyUpgrade(gameState, key);
        }
        if (shopFilter === 'recommended') {
          return recommendedSet.has(key);
        }
        return true;
      }),
    [shopKeys, shopFilter, canBuyUpgrade, gameState, recommendedSet]
  );

  const consumableKeys = useMemo(
    () =>
      (Object.keys(shopItems) as PrestigeShopKey[]).filter(
        key => shopItems[key].category === 'consumable'
      ),
    [shopItems]
  );

  const groupedShop = useMemo(() => {
    return categoryOrder
      .map(category => ({
        category,
        items: filteredShopKeys.filter(key => shopItems[key].category === category),
      }))
      .filter(group => group.items.length > 0);
  }, [filteredShopKeys, shopItems]);

  if (!visible) return null;

  const prestigeFormulaTooltip = (
    <div>
      <div><strong>Luck Gain Formula</strong></div>
      <div>floor(max(log10(credits) − 3, 0) × 0.25 × (1 + 0.10 × Luck Fabricator level))</div>
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

  const autorollReductionPercent = Math.max(0, Math.round((1 - autorollBoost.toNumber()) * 100));

  return (
    <div className="prestige-panel-overlay">
      <div className="prestige-panel glass-card">
        <div className="prestige-panel__header">
          <div>
            <h2>✨ Prestige - Luck Nexus</h2>
            <p className="prestige-panel__subtitle">Trade your current run for permanent Luck bonuses and strategic upgrades.</p>
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
                <span>{luckProgressPercent}%</span>
              </div>
              <div className="luck-progress__track" aria-hidden="true">
                <div
                  className="luck-progress__fill"
                  data-width={`${Math.min(100, luckProgress.progressPercent)}%`}
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
            <div className="prestige-retained">Persisted on prestige: Luck Points, shop purchases, consumables, and settings. All other progression resets.</div>
          </div>
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
