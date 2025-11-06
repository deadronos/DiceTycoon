import React, { useMemo, useState } from 'react';
import Decimal, { type Decimal as DecimalType } from '@patashu/break_eternity.js';
import { formatFull, formatShort } from '../utils/decimal';
import type { GameState } from '../types/game';
import type { PrestigeShopItem, PrestigeShopKey, PrestigeShopCategory } from '../utils/constants';
import { InfoTooltip } from './InfoTooltip';
import {
  getLuckMultiplier,
  getLuckGainMultiplier,
  getShopMultiplier,
  getAutorollCooldownMultiplier,
} from '../utils/game-logic';

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

  const luckMultiplier = useMemo(() => getLuckMultiplier(gameState), [gameState]);
  const luckGainBoost = useMemo(() => getLuckGainMultiplier(gameState), [gameState]);
  const shopMultiplier = useMemo(() => getShopMultiplier(gameState), [gameState]);
  const autorollBoost = useMemo(() => getAutorollCooldownMultiplier(gameState), [gameState]);

  const shopKeys = useMemo(
    () =>
      (Object.keys(shopItems) as PrestigeShopKey[]).filter(
        key => shopItems[key].category !== 'consumable'
      ),
    [shopItems]
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
        items: shopKeys.filter(key => shopItems[key].category === category),
      }))
      .filter(group => group.items.length > 0);
  }, [shopKeys, shopItems]);

  if (!visible) return null;

  const prestigeFormulaTooltip = (
    <div>
      <div><strong>Luck Gain Formula</strong></div>
      <div>floor(max(log10(credits) − 3, 0) × 0.25 × (1 + 0.10 × Luck Fabricator level))</div>
      <div style={{ marginTop: '6px', opacity: 0.8 }}>Current credits: {formatFull(gameState.credits)}</div>
    </div>
  );

  const luckMultiplierTooltip = (
    <div>
      <div><strong>Luck Multiplier</strong></div>
      <div>1 + Luck Points × 0.02 (capped at 10×)</div>
      <div style={{ marginTop: '6px', opacity: 0.8 }}>Luck Points: {formatFull(currentLuck)}</div>
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

            <div className="prestige-actions">
              <button className="btn btn-primary" onClick={onConfirm}>
                Confirm Prestige
              </button>
              <button className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
            </div>
            <div className="prestige-retained">Persisted on prestige: Luck Points, shop purchases, consumables, and settings. All other progression resets.</div>
          </div>
        )}

        {activeTab === 'shop' && (
          <div className="prestige-shop">
            {groupedShop.map(group => (
              <div className="prestige-category" key={group.category}>
                <div className="prestige-category__header">
                  <h3>{categoryLabels[group.category]}</h3>
                  {categoryDescriptions[group.category] && (
                    <p>{categoryDescriptions[group.category]}</p>
                  )}
                </div>
                <div className="prestige-shop-grid">
                  {group.items.map(key => {
                    const item = shopItems[key];
                    const currentLevel = gameState.prestige?.shop?.[key] ?? 0;
                    const nextCost = getUpgradeCost(key, currentLevel);
                    const canBuy = canBuyUpgrade(gameState, key);
                    const isMaxed = item.maxLevel > 0 && currentLevel >= item.maxLevel;
                    const progress = item.maxLevel > 0 ? Math.min(100, (currentLevel / item.maxLevel) * 100) : 0;

                    return (
                      <div
                        key={key}
                        className={`prestige-item ${canBuy && !isMaxed ? 'prestige-item--affordable' : ''}`}
                      >
                        <div className="prestige-item__header">
                          <span className="prestige-item__icon" aria-hidden="true">{item.icon}</span>
                          <div>
                            <div className="prestige-item__title">{item.name}</div>
                            <div className="prestige-item__description">{item.description}</div>
                          </div>
                          <InfoTooltip content={item.formula} label={`${item.name} formula`} />
                        </div>

                        <div className="prestige-item__body">
                          <div className="prestige-item__level-row">
                            <span>Level {currentLevel}{item.maxLevel > 0 && ` / ${item.maxLevel}`}</span>
                            {item.maxLevel > 0 && (
                              <div className="prestige-progress" aria-hidden="true">
                                <div className="prestige-progress__bar" style={{ width: `${progress}%` }} />
                              </div>
                            )}
                          </div>

                          <div className="prestige-item__effects">
                            {item.getCurrentEffect && (
                              <div className="prestige-item__effect">{item.getCurrentEffect(currentLevel)}</div>
                            )}
                            {item.getNextEffect && !isMaxed && (
                              <div className="prestige-item__effect prestige-item__effect--next">
                                {item.getNextEffect(currentLevel)}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="prestige-item__footer">
                          <div className="prestige-item__cost">
                            {isMaxed ? 'Maxed out' : `Cost: ${formatShort(nextCost)} LP`}
                          </div>
                          <button
                            className={canBuy && !isMaxed ? 'btn btn-primary btn-small' : 'btn btn-secondary btn-small'}
                            onClick={() => onBuyUpgrade(key)}
                            disabled={!canBuy || isMaxed}
                          >
                            {isMaxed ? 'Complete' : 'Purchase'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'consumables' && (
          <div className="prestige-shop">
            <div className="prestige-category">
              <div className="prestige-category__header">
                <h3>{categoryLabels.consumable}</h3>
                <p>Stockpile resources you can trigger manually during a run.</p>
              </div>
              <div className="prestige-shop-grid">
                {consumableKeys.map(key => {
                  const item = shopItems[key];
                  const currentCount = key === 'rerollTokens'
                    ? gameState.prestige?.consumables?.rerollTokens ?? 0
                    : 0;
                  const cost = getUpgradeCost(key, 0);
                  const canBuy = canBuyUpgrade(gameState, key);

                  return (
                    <div
                      key={key}
                      className={`prestige-item prestige-item--consumable ${canBuy ? 'prestige-item--affordable' : ''}`}
                    >
                      <div className="prestige-item__header">
                        <span className="prestige-item__icon" aria-hidden="true">{item.icon}</span>
                        <div>
                          <div className="prestige-item__title">{item.name}</div>
                          <div className="prestige-item__description">{item.description}</div>
                        </div>
                        <InfoTooltip content={item.formula} label={`${item.name} formula`} />
                      </div>

                      <div className="prestige-item__body">
                        <div className="prestige-item__effect">Owned: {currentCount}</div>
                        <div className="prestige-item__effect prestige-item__effect--next">Each purchase grants +5 tokens.</div>
                      </div>

                      <div className="prestige-item__footer">
                        <div className="prestige-item__cost">Cost: {formatShort(cost)} LP</div>
                        <button
                          className={canBuy ? 'btn btn-primary btn-small' : 'btn btn-secondary btn-small'}
                          onClick={() => onBuyUpgrade(key)}
                          disabled={!canBuy}
                        >
                          Purchase
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrestigePanel;
