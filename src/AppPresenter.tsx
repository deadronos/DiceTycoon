import React from 'react';
import { PrestigePanel } from './components/PrestigePanel';
import { CreditPopup } from './components/CreditPopup';
import { ConfettiBurst } from './components/ConfettiBurst';
import AppHeader from './components/app/AppHeader';
import ComboToastStack from './components/ComboToastStack';
import CoreGameView from './components/CoreGameView';
import AscensionGameView from './components/AscensionGameView';
import { ASCENSION_CONFIG, PRESTIGE_SHOP_ITEMS } from './utils/constants';
import { GameState } from './types/game';
import { type Decimal as DecimalType } from './utils/decimal';
import { PrestigeShopKey } from './utils/constants';

export interface AppPresenterProps {
    gameState: GameState;
    showPrestige: boolean;
    activeView: 'core' | 'ascension';
    currentLuck: DecimalType;
    autorollUpgradeCost: DecimalType;
    canUpgradeAutoroll: boolean;
    ascensionUnlocked: boolean;
    confettiIntensity: 'low' | 'medium' | 'high';
    confettiTrigger: number;
    feedbackState: any; // Simplified for now, should be typed properly
    feedbackActions: any;
    luckGain: DecimalType;

    // Handlers
    setShowPrestige: (show: boolean) => void;
    setActiveView: (view: 'core' | 'ascension') => void;
    handleUnlockDie: (dieId: number) => void;
    handleLevelUpDie: (dieId: number, amount?: number) => void;
    handleUnlockAnimation: (dieId: number) => void;
    handleRoll: () => void;
    handleToggleAutoroll: () => void;
    handleUpgradeAutoroll: () => void;
    handleDynamicBatchChange: (value: boolean) => void;
    handleBatchThresholdChange: (value: number) => void;
    handleMaxRollsPerTickChange: (value: number) => void;
    handleAnimationBudgetChange: (value: number) => void;
    handleExport: () => void;
    handleImport: () => void;
    resetGame: () => void;
    handleUnlockAscensionDie: (dieId: number) => void;
    handleUpgradeAscensionDie: (dieId: number) => void;
    handleAscensionFocusChange: (dieId: number, focus: 'stardust' | 'resonance') => void;
    handlePrestigeConfirm: () => void;
    handleBuyPrestigeUpgrade: (key: PrestigeShopKey) => void;
    canBuyPrestigeUpgrade: (state: GameState, key: PrestigeShopKey) => boolean;
    getPrestigeUpgradeCost: (key: PrestigeShopKey, level: number) => DecimalType;
}

export const AppPresenter: React.FC<AppPresenterProps> = ({
    gameState,
    showPrestige,
    activeView,
    currentLuck,
    autorollUpgradeCost,
    canUpgradeAutoroll,
    ascensionUnlocked,
    confettiIntensity,
    confettiTrigger,
    feedbackState,
    feedbackActions,
    setShowPrestige,
    setActiveView,
    handleUnlockDie,
    handleLevelUpDie,
    handleUnlockAnimation,
    handleRoll,
    handleToggleAutoroll,
    handleUpgradeAutoroll,
    handleDynamicBatchChange,
    handleBatchThresholdChange,
    handleMaxRollsPerTickChange,
    handleAnimationBudgetChange,
    handleExport,
    handleImport,
    resetGame,
    handleUnlockAscensionDie,
    handleUpgradeAscensionDie,
    handleAscensionFocusChange,
    handlePrestigeConfirm,
    handleBuyPrestigeUpgrade,
    canBuyPrestigeUpgrade,
    getPrestigeUpgradeCost,
    luckGain,
}) => {
    return (
        <div id="app">
            <AppHeader
                credits={gameState.credits}
                luckPoints={currentLuck}
                totalRolls={gameState.totalRolls}
                onOpenPrestige={() => setShowPrestige(true)}
            />

            <div className="view-tabs">
                <button
                    className={activeView === 'core' ? 'view-tab view-tab--active' : 'view-tab'}
                    onClick={() => setActiveView('core')}
                >
                    Current Run
                </button>
                {ascensionUnlocked ? (
                    <button
                        className={activeView === 'ascension' ? 'view-tab view-tab--active' : 'view-tab'}
                        onClick={() => setActiveView('ascension')}
                    >
                        Eclipse Prestige
                    </button>
                ) : (
                    <button className="view-tab view-tab--locked" disabled>
                        Eclipse Prestige (Prestige {ASCENSION_CONFIG.unlockPrestiges}+)
                    </button>
                )}
            </div>

            {activeView === 'core' && (
                <CoreGameView
                    gameState={gameState}
                    onUnlockDie={handleUnlockDie}
                    onLevelUpDie={handleLevelUpDie}
                    onUnlockAnimation={handleUnlockAnimation}
                    onRoll={handleRoll}
                    onToggleAutoroll={handleToggleAutoroll}
                    onUpgradeAutoroll={handleUpgradeAutoroll}
                    onDynamicBatchChange={handleDynamicBatchChange}
                    onBatchThresholdChange={handleBatchThresholdChange}
                    onMaxRollsPerTickChange={handleMaxRollsPerTickChange}
                    onAnimationBudgetChange={handleAnimationBudgetChange}
                    onExport={handleExport}
                    onImport={handleImport}
                    onReset={resetGame}
                    autorollUpgradeCost={autorollUpgradeCost}
                    canUpgradeAutoroll={canUpgradeAutoroll}
                />
            )}

            {activeView === 'ascension' && (
                <AscensionGameView
                    gameState={gameState}
                    onUnlockDie={handleUnlockAscensionDie}
                    onUpgradeDie={handleUpgradeAscensionDie}
                    onFocusChange={handleAscensionFocusChange}
                />
            )}

            {feedbackState.showPopup && (
                <CreditPopup
                    credits={feedbackState.popupCredits}
                    rollCount={feedbackState.popupRollCount}
                    isCritical={feedbackState.popupIsCritical}
                    onComplete={feedbackActions.handlePopupComplete}
                />
            )}
            <ConfettiBurst trigger={confettiTrigger} intensity={confettiIntensity} />
            {feedbackState.comboToasts.length > 0 && (
                <ComboToastStack comboToasts={feedbackState.comboToasts} onClose={feedbackActions.handleComboToastClose} />
            )}

            <PrestigePanel
                visible={showPrestige}
                onClose={() => setShowPrestige(false)}
                onConfirm={handlePrestigeConfirm}
                luckGain={luckGain}
                currentLuck={currentLuck}
                gameState={gameState}
                onBuyUpgrade={handleBuyPrestigeUpgrade}
                canBuyUpgrade={canBuyPrestigeUpgrade}
                getUpgradeCost={getPrestigeUpgradeCost}
                shopItems={PRESTIGE_SHOP_ITEMS}
            />
        </div>
    );
};
