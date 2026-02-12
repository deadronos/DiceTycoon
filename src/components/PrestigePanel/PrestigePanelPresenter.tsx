import React from 'react';
import type { Decimal as DecimalType } from '../../utils/decimal';
import type { GameState } from '../../types/game';
import type { PrestigeShopItem, PrestigeShopKey } from '../../utils/constants';
import PrestigeShopSection from '../prestige/PrestigeShopSection';
import PrestigeConsumablesSection from '../prestige/PrestigeConsumablesSection';
import { PrestigeOverview } from '../prestige/PrestigeOverview';

interface PrestigePanelPresenterProps {
    visible: boolean;
    activeTab: 'overview' | 'shop' | 'consumables';
    setActiveTab: (tab: 'overview' | 'shop' | 'consumables') => void;
    shopFilter: 'all' | 'affordable' | 'recommended';
    setShopFilter: (filter: 'all' | 'affordable' | 'recommended') => void;
    onClose: () => void;
    onConfirm: () => void;
    luckGain: DecimalType;
    currentLuck: DecimalType;
    projectedLuck: DecimalType;
    gameState: GameState;
    onBuyUpgrade: (key: PrestigeShopKey) => void;
    canBuyUpgrade: (state: GameState, key: PrestigeShopKey) => boolean;
    getUpgradeCost: (key: PrestigeShopKey, level: number) => DecimalType;
    shopItems: Record<PrestigeShopKey, PrestigeShopItem>;
    luckMultiplier: DecimalType;
    luckGainBoost: DecimalType;
    shopMultiplier: DecimalType;
    autorollBoost: DecimalType;
    autorollReductionPercent: number;
    luckProgressPercent: number;
}

export const PrestigePanelPresenter: React.FC<PrestigePanelPresenterProps> = ({
    visible,
    activeTab,
    setActiveTab,
    shopFilter,
    setShopFilter,
    onClose,
    onConfirm,
    luckGain,
    currentLuck,
    projectedLuck,
    gameState,
    onBuyUpgrade,
    canBuyUpgrade,
    getUpgradeCost,
    shopItems,
    luckMultiplier,
    luckGainBoost,
    shopMultiplier,
    autorollBoost,
    autorollReductionPercent,
    luckProgressPercent,
}) => {
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
