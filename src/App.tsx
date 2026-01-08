import React, { useState, useCallback } from 'react';
import { PrestigePanel } from './components/PrestigePanel';
import { CreditPopup } from './components/CreditPopup';
import { ConfettiBurst } from './components/ConfettiBurst';
import AppHeader from './components/app/AppHeader';
import ComboToastStack from './components/ComboToastStack';
import CoreGameView from './components/CoreGameView';
import AscensionGameView from './components/AscensionGameView';

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
import { PRESTIGE_SHOP_ITEMS, type PrestigeShopKey, ASCENSION_CONFIG } from './utils/constants';
import { GameState, AutorollState } from './types/game';
import { AutorollBatchOutcome } from './utils/autorollBatchRunner';
import { safeSave } from './utils/storage';
import './styles.css';

/**
 * The root component of the Dice Tycoon application.
 * Manages the global game state, game loop, and high-level UI orchestration.
 */
export const App: React.FC = () => {
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

  // Derived values
  const autorollUpgradeCost = getAutorollUpgradeCost(gameState.autoroll.level);
  const currentLuck = gameState.prestige?.luckPoints ?? new Decimal(0);
  const canUpgradeAutoroll = canAfford(gameState.credits, autorollUpgradeCost);
  const ascensionUnlocked = gameState.ascension.unlocked;
  const confettiIntensity = feedbackState.lastComboMetadata?.intensity ?? 'low';

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
      <ConfettiBurst trigger={feedbackState.confettiTrigger} intensity={confettiIntensity} />
      {feedbackState.comboToasts.length > 0 && (
        <ComboToastStack comboToasts={feedbackState.comboToasts} onClose={feedbackActions.handleComboToastClose} />
      )}

      <PrestigePanel
        visible={showPrestige}
        onClose={() => setShowPrestige(false)}
        onConfirm={() => {
          const newState = performPrestigeReset(gameState);
          setGameState(newState);
          safeSave(undefined, { ...newState, lastSaveTimestamp: Date.now() });
          setShowPrestige(false);
        }}
        luckGain={calculateLuckGain(gameState)}
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

export default App;
