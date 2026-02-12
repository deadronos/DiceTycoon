import React, { useMemo, useState } from 'react';
import { type Decimal as DecimalType } from '../../utils/decimal';
import type { GameState } from '../../types/game';
import type { PrestigeShopItem, PrestigeShopKey } from '../../utils/constants';
import { getLuckMultiplier, getLuckGainMultiplier, getShopMultiplier, getAutorollCooldownMultiplier, getLuckProgress } from '../../utils/game-logic';
import { PrestigePanelPresenter } from './PrestigePanelPresenter';

interface PrestigePanelContainerProps {
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

export const PrestigePanelContainer: React.FC<PrestigePanelContainerProps> = ({
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

    return (
        <PrestigePanelPresenter
            visible={visible}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            shopFilter={shopFilter}
            setShopFilter={setShopFilter}
            onClose={onClose}
            onConfirm={onConfirm}
            luckGain={luckGain}
            currentLuck={currentLuck}
            projectedLuck={projectedLuck}
            gameState={gameState}
            onBuyUpgrade={onBuyUpgrade}
            canBuyUpgrade={canBuyUpgrade}
            getUpgradeCost={getUpgradeCost}
            shopItems={shopItems}
            luckMultiplier={luckMultiplier}
            luckGainBoost={luckGainBoost}
            shopMultiplier={shopMultiplier}
            autorollBoost={autorollBoost}
            autorollReductionPercent={autorollReductionPercent}
            luckProgressPercent={luckProgressPercent}
        />
    );
};
