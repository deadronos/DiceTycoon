import React, { useState } from 'react';
import Decimal from '@patashu/break_eternity.js';
import { formatShort } from '../utils/decimal';
import type { GameState } from '../types/game';
import type { PrestigeShopKey } from '../utils/constants';

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  luckGain: Decimal;
  currentLuck: Decimal;
  gameState: GameState;
  onBuyUpgrade: (key: PrestigeShopKey) => void;
  canBuyUpgrade: (state: GameState, key: PrestigeShopKey) => boolean;
  getUpgradeCost: (key: PrestigeShopKey, level: number) => Decimal;
  shopItems: Record<PrestigeShopKey, any>;
}

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

  if (!visible) return null;

  const shopKeys = (Object.keys(shopItems) as PrestigeShopKey[]).filter(
    k => shopItems[k].category !== 'consumable'
  );
  const consumableKeys = (Object.keys(shopItems) as PrestigeShopKey[]).filter(
    k => shopItems[k].category === 'consumable'
  );

  return (
    <div className="prestige-panel-overlay">
      <div className="prestige-panel glass-card" style={{ maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>✨ Prestige - Luck Nexus</h2>
          <button className="btn btn-secondary" onClick={onClose} style={{ padding: '4px 8px' }}>
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', borderBottom: '1px solid var(--color-border)' }}>
          <button
            className={activeTab === 'overview' ? 'btn btn-primary' : 'btn btn-secondary'}
            onClick={() => setActiveTab('overview')}
            style={{ flex: 1 }}
          >
            Overview
          </button>
          <button
            className={activeTab === 'shop' ? 'btn btn-primary' : 'btn btn-secondary'}
            onClick={() => setActiveTab('shop')}
            style={{ flex: 1 }}
          >
            Shop
          </button>
          <button
            className={activeTab === 'consumables' ? 'btn btn-primary' : 'btn btn-secondary'}
            onClick={() => setActiveTab('consumables')}
            style={{ flex: 1 }}
          >
            Consumables
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <p>
              Reset your progress to gain <strong>{formatShort(luckGain)}</strong> Luck Points.
            </p>
            <p>
              Total Luck: <strong>{formatShort(currentLuck)}</strong>
            </p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button className="btn btn-primary" onClick={onConfirm}>
                Confirm Prestige
              </button>
              <button className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
            </div>
            <div style={{ marginTop: '10px', fontSize: '0.9rem', color: 'var(--color-text-dim)' }}>
              Persisted on prestige: Luck Points, Shop Purchases, and Settings. All other progression will reset.
            </div>
          </div>
        )}

        {/* Shop Tab */}
        {activeTab === 'shop' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {shopKeys.map(key => {
              const item = shopItems[key];
              const currentLevel = gameState.prestige?.shop?.[key] ?? 0;
              const nextCost = getUpgradeCost(key, currentLevel);
              const canBuy = canBuyUpgrade(gameState, key);
              const isMaxed = item.maxLevel > 0 && currentLevel >= item.maxLevel;

              return (
                <div
                  key={key}
                  style={{
                    padding: '10px',
                    border: '1px solid var(--color-border)',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <strong>{item.name}</strong>
                      <div style={{ fontSize: '0.9rem', color: 'var(--color-text-dim)', marginTop: '4px' }}>
                        {item.description}
                      </div>
                      <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                        Level: {currentLevel} {item.maxLevel > 0 && `/ ${item.maxLevel}`}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.9rem', marginBottom: '6px' }}>
                        {isMaxed ? 'MAXED' : `Cost: ${formatShort(nextCost)} LP`}
                      </div>
                      <button
                        className={canBuy && !isMaxed ? 'btn btn-primary' : 'btn btn-secondary'}
                        onClick={() => onBuyUpgrade(key)}
                        disabled={!canBuy || isMaxed}
                        style={{ padding: '4px 8px', fontSize: '0.85rem' }}
                      >
                        {isMaxed ? '✓' : 'Buy'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Consumables Tab */}
        {activeTab === 'consumables' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {consumableKeys.map(key => {
              const item = shopItems[key];
              const currentCount = key === 'rerollTokens' ? gameState.prestige?.consumables?.rerollTokens ?? 0 : 0;
              const cost = getUpgradeCost(key, 0); // consumables use a fixed cost per purchase
              const canBuy = canBuyUpgrade(gameState, key);

              return (
                <div
                  key={key}
                  style={{
                    padding: '10px',
                    border: '1px solid var(--color-border)',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <strong>{item.name}</strong>
                      <div style={{ fontSize: '0.9rem', color: 'var(--color-text-dim)', marginTop: '4px' }}>
                        {item.description}
                      </div>
                      <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                        Owned: <strong>{currentCount}</strong>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.9rem', marginBottom: '6px' }}>
                        Cost: {formatShort(cost)} LP
                      </div>
                      <button
                        className={canBuy ? 'btn btn-primary' : 'btn btn-secondary'}
                        onClick={() => onBuyUpgrade(key)}
                        disabled={!canBuy}
                        style={{ padding: '4px 8px', fontSize: '0.85rem' }}
                      >
                        +5
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PrestigePanel;

