import React, { useState, useCallback } from 'react';
import { useGameState } from './hooks/useGameState';
import { useGameFeedback } from './hooks/useGameFeedback';
import { useGameLoop } from './hooks/useGameLoop';
import {
    unlockDie,
    levelUpDie,
    upgradeAutoroll,
    toggleAutoroll,
    unlockAnimation,
    getAutorollUpgradeCost,
    calculateLuckGain,
    performPrestigeReset,
    buyPrestigeUpgrade,
    canBuyPrestigeUpgrade,
    getPrestigeUpgradeCost,
    unlockAscensionDie,
    upgradeAscensionDie,
    updateAscensionFocus,
    exportGameState,
    importGameState,
} from './utils/game-logic';
import { canAfford } from './utils/decimal';
import Decimal from './utils/decimal';
import { type PrestigeShopKey } from './utils/constants';
import { GameState, AutorollState } from './types/game';
import { AutorollBatchOutcome } from './utils/autorollBatchRunner';
import { safeSave } from './utils/storage';
import { AppPresenter } from './AppPresenter';

export const AppContainer: React.FC = () => {
    const { gameState, setGameState, gameStateRef, resetGame } = useGameState();
    const { feedbackState, actions: feedbackActions } = useGameFeedback();

    const [showPrestige, setShowPrestige] = useState(false);
    const [activeView, setActiveView] = useState<'core' | 'ascension'>('core');

    const onBatchComplete = useCallback((outcomes: AutorollBatchOutcome[], finalState: GameState) => {
        setGameState(finalState);
        feedbackActions.emitSampledAnimations(outcomes, finalState.autoroll.animationBudget);
    }, [setGameState, feedbackActions]);

    const { handleRoll } = useGameLoop({
        gameState,
        setGameState,
        gameStateRef,
        onBatchComplete,
        onRollFeedback: feedbackActions.showRollFeedback,
    });

    // Action handlers
    const handleUnlockDie = useCallback((dieId: number) => {
        const newState = unlockDie(gameState, dieId);
        if (newState) setGameState(newState);
    }, [gameState, setGameState]);

    const handleLevelUpDie = useCallback((dieId: number, amount: number = 1) => {
        const newState = levelUpDie(gameState, dieId, amount);
        if (newState) setGameState(newState);
    }, [gameState, setGameState]);

    const handleUnlockAnimation = useCallback((dieId: number) => {
        const newState = unlockAnimation(gameState, dieId);
        if (newState) setGameState(newState);
    }, [gameState, setGameState]);

    const handleUpgradeAutoroll = useCallback(() => {
        const newState = upgradeAutoroll(gameState);
        if (newState) setGameState(newState);
    }, [gameState, setGameState]);

    const handleToggleAutoroll = useCallback(() => {
        setGameState(toggleAutoroll(gameState));
    }, [gameState, setGameState]);

    const updateAutorollSettings = useCallback((updates: Partial<AutorollState>) => {
        setGameState(prev => ({
            ...prev,
            autoroll: {
                ...prev.autoroll,
                ...updates,
            },
        }));
    }, [setGameState]);

    const handleDynamicBatchChange = useCallback((value: boolean) => {
        updateAutorollSettings({ dynamicBatch: value });
    }, [updateAutorollSettings]);

    const handleBatchThresholdChange = useCallback((value: number) => {
        updateAutorollSettings({ batchThresholdMs: Math.max(10, value) });
    }, [updateAutorollSettings]);

    const handleMaxRollsPerTickChange = useCallback((value: number) => {
        updateAutorollSettings({ maxRollsPerTick: Math.max(1, value) });
    }, [updateAutorollSettings]);

    const handleAnimationBudgetChange = useCallback((value: number) => {
        updateAutorollSettings({ animationBudget: Math.max(0, value) });
    }, [updateAutorollSettings]);

    const handleBuyPrestigeUpgrade = useCallback((key: PrestigeShopKey) => {
        const newState = buyPrestigeUpgrade(gameState, key);
        if (newState) setGameState(newState);
    }, [gameState, setGameState]);

    const handleUnlockAscensionDie = useCallback((dieId: number) => {
        setGameState(prev => unlockAscensionDie(prev, dieId) ?? prev);
    }, [setGameState]);

    const handleUpgradeAscensionDie = useCallback((dieId: number) => {
        setGameState(prev => upgradeAscensionDie(prev, dieId) ?? prev);
    }, [setGameState]);

    const handleAscensionFocusChange = useCallback((dieId: number, focus: 'stardust' | 'resonance') => {
        setGameState(prev => updateAscensionFocus(prev, dieId, focus));
    }, [setGameState]);

    const handleExport = useCallback(() => {
        const exported = exportGameState(gameState);
        navigator.clipboard.writeText(exported);
        alert('Game state copied to clipboard!');
    }, [gameState]);

    const handleImport = useCallback(() => {
        const imported = prompt('Paste your save data:');
        if (imported) {
            const newState = importGameState(imported);
            if (newState) {
                setGameState(newState);
                alert('Game loaded successfully!');
            } else {
                alert('Invalid save data!');
            }
        }
    }, [setGameState]);

    const handlePrestigeConfirm = useCallback(() => {
        const newState = performPrestigeReset(gameState);
        setGameState(newState);
        safeSave(undefined, { ...newState, lastSaveTimestamp: Date.now() });
        setShowPrestige(false);
    }, [gameState, setGameState]);

    // Derived values
    const autorollUpgradeCost = getAutorollUpgradeCost(gameState.autoroll.level);
    const currentLuck = gameState.prestige?.luckPoints ?? new Decimal(0);
    const canUpgradeAutoroll = canAfford(gameState.credits, autorollUpgradeCost);
    const ascensionUnlocked = gameState.ascension.unlocked;
    const confettiIntensity: "low" | "medium" | "high" = (feedbackState.lastComboMetadata?.intensity === 'legendary' ? 'high' : (feedbackState.lastComboMetadata?.intensity ?? 'low')) as any;
    const confettiTrigger: number = feedbackState.confettiTrigger ?? 0;
    const luckGain = calculateLuckGain(gameState);

    return (
        <AppPresenter
            gameState={gameState}
            showPrestige={showPrestige}
            activeView={activeView}
            currentLuck={currentLuck}
            autorollUpgradeCost={autorollUpgradeCost}
            canUpgradeAutoroll={canUpgradeAutoroll}
            ascensionUnlocked={ascensionUnlocked}
            confettiIntensity={confettiIntensity}
            confettiTrigger={confettiTrigger}
            luckGain={luckGain}
            feedbackState={feedbackState}
            feedbackActions={feedbackActions}
            setShowPrestige={setShowPrestige}
            setActiveView={setActiveView}
            handleUnlockDie={handleUnlockDie}
            handleLevelUpDie={handleLevelUpDie}
            handleUnlockAnimation={handleUnlockAnimation}
            handleRoll={handleRoll}
            handleToggleAutoroll={handleToggleAutoroll}
            handleUpgradeAutoroll={handleUpgradeAutoroll}
            handleDynamicBatchChange={handleDynamicBatchChange}
            handleBatchThresholdChange={handleBatchThresholdChange}
            handleMaxRollsPerTickChange={handleMaxRollsPerTickChange}
            handleAnimationBudgetChange={handleAnimationBudgetChange}
            handleExport={handleExport}
            handleImport={handleImport}
            resetGame={resetGame}
            handleUnlockAscensionDie={handleUnlockAscensionDie}
            handleUpgradeAscensionDie={handleUpgradeAscensionDie}
            handleAscensionFocusChange={handleAscensionFocusChange}
            handlePrestigeConfirm={handlePrestigeConfirm}
            handleBuyPrestigeUpgrade={handleBuyPrestigeUpgrade}
            canBuyPrestigeUpgrade={canBuyPrestigeUpgrade}
            getPrestigeUpgradeCost={getPrestigeUpgradeCost}
        />
    );
};
