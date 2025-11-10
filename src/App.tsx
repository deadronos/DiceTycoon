import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { GameState } from './types/game';
import { PrestigePanel } from './components/PrestigePanel';
import { CreditPopup } from './components/CreditPopup';
import { ConfettiBurst } from './components/ConfettiBurst';
import DiceGrid from './components/DiceGrid';
import AppHeader from './components/app/AppHeader';
import GameControlPanel from './components/app/GameControlPanel';
import ComboToastStack, { type ComboToastEntry } from './components/ComboToastStack';
import {
  createDefaultGameState,
  safeLoad,
  safeSave,
  exportGameState,
  importGameState,
  resetGameState,
} from './utils/storage';
import {
  performRoll,
  unlockDie,
  levelUpDie,
  upgradeAutoroll,
  toggleAutoroll,
  unlockAnimation,
  stopRollingAnimation,
  getAutorollUpgradeCost,
  calculateLuckGain,
  performPrestigeReset,
  buyPrestigeUpgrade,
  canBuyPrestigeUpgrade,
  getPrestigeUpgradeCost,
} from './utils/game-logic';
import { calculateOfflineProgress } from './utils/offline-progress';
import { canAfford } from './utils/decimal';
import Decimal from './utils/decimal';
import type { Decimal as DecimalType } from '@patashu/break_eternity.js';
import { ROLL_ANIMATION_DURATION, AUTO_SAVE_INTERVAL, PRESTIGE_SHOP_ITEMS, type PrestigeShopKey, CREDIT_POPUP_DURATION } from './utils/constants';
import { getComboMetadata, type ComboMetadata } from './utils/combos';
import type { ComboIntensity, ComboResult } from './types/combo';
import './styles.css';
import { createAutorollBatchRunner, type AutorollBatchOutcome, type AutorollBatchRunner } from './utils/autorollBatchRunner';
import { createBatchAnimationPlan } from './utils/autorollBatchAnimations';
import { AUTOROLL_BATCH_MIN_TICK_MS } from './utils/constants';
import type { AutorollState } from './types/game';

const COMBO_TOAST_AUTO_DISMISS_MS = 3000;
const BATCH_POPUP_SPACING = CREDIT_POPUP_DURATION + 150;

export const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const loaded = safeLoad();
    // safeLoad returns unknown; narrow before treating as GameState
    if (loaded && typeof loaded === 'object' && 'credits' in loaded && 'dice' in loaded) {
      // Calculate offline progress
      const withOfflineProgress = calculateOfflineProgress(loaded as GameState, Date.now());
      return withOfflineProgress;
    }
    return createDefaultGameState();
  });

  const [showPopup, setShowPopup] = useState(false);
  const [popupCredits, setPopupCredits] = useState(new Decimal(0));
  const [popupRollCount, setPopupRollCount] = useState<number | null>(null);
  const [comboToasts, setComboToasts] = useState<ComboToastEntry[]>([]);
  const [lastComboMetadata, setLastComboMetadata] = useState<ComboMetadata | null>(null);
  const [confettiTrigger, setConfettiTrigger] = useState<number | null>(null);
  const [showPrestige, setShowPrestige] = useState(false);
  const autorollIntervalRef = useRef<number | null>(null);
  const autoSaveIntervalRef = useRef<number | null>(null);
  const comboToastTimersRef = useRef<Map<number, number>>(new Map());
  const batchAnimationTimersRef = useRef<number[]>([]);
  const autorollBatchRunnerRef = useRef<AutorollBatchRunner | null>(null);
  const gameStateRef = useRef<GameState>(gameState);
  const batchCompleteRef = useRef<(outcomes: AutorollBatchOutcome[], state: GameState) => void>(() => {});

  // Save game state
  const saveGame = useCallback(() => {
    const stateToSave = {
      ...gameState,
      lastSaveTimestamp: Date.now(),
    };
    safeSave(undefined, stateToSave);
  }, [gameState]);

  // Auto-save every 30 seconds
  useEffect(() => {
    autoSaveIntervalRef.current = window.setInterval(saveGame, AUTO_SAVE_INTERVAL);
    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [saveGame]);

  useEffect(() => {
    const timers = comboToastTimersRef.current;
    return () => {
      timers.forEach(timerId => {
        window.clearTimeout(timerId);
      });
      timers.clear();
    };
  }, []);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => () => {
    batchAnimationTimersRef.current.forEach(timerId => window.clearTimeout(timerId));
    batchAnimationTimersRef.current = [];
  }, []);

  useEffect(() => {
    const activeIds = new Set(comboToasts.map(toast => toast.id));
    comboToastTimersRef.current.forEach((timerId, toastId) => {
      if (!activeIds.has(toastId)) {
        window.clearTimeout(timerId);
        comboToastTimersRef.current.delete(toastId);
      }
    });
  }, [comboToasts]);

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveGame();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saveGame]);

  const handleComboToastClose = useCallback((id: number) => {
    const timerId = comboToastTimersRef.current.get(id);
    if (timerId) {
      window.clearTimeout(timerId);
      comboToastTimersRef.current.delete(id);
    }
    setComboToasts(prev =>
      prev.map(toast => (toast.id === id ? { ...toast, visible: false } : toast))
    );
    window.setTimeout(() => {
      setComboToasts(prev => prev.filter(toast => toast.id !== id));
    }, 320);
  }, []);

  const clearBatchAnimationTimers = useCallback(() => {
    batchAnimationTimersRef.current.forEach(timerId => window.clearTimeout(timerId));
    batchAnimationTimersRef.current = [];
  }, []);

  const emitComboForOutcome = useCallback((combo: ComboResult) => {
    const timestamp = Date.now() + Math.random();
    const metadata = getComboMetadata(combo);
    setComboToasts(prev => {
      const next = [
        { id: timestamp, combo, metadata, visible: true },
        ...prev.filter(toast => toast.id !== timestamp),
      ];
      return next.slice(0, 3);
    });
    const timerId = window.setTimeout(() => {
      handleComboToastClose(timestamp);
    }, COMBO_TOAST_AUTO_DISMISS_MS);
    comboToastTimersRef.current.set(timestamp, timerId);
    setLastComboMetadata(metadata);
    setConfettiTrigger(timestamp);
  }, [handleComboToastClose]);

  const showRollFeedback = useCallback((outcome: AutorollBatchOutcome, rollCount: number | null = null) => {
    setPopupCredits(outcome.creditsEarned);
    setPopupRollCount(rollCount);
    setShowPopup(true);
    if (outcome.combo) {
      emitComboForOutcome(outcome.combo);
    }
  }, [emitComboForOutcome]);

  const scheduleBatchOutcome = useCallback((outcome: AutorollBatchOutcome, delay: number) => {
    const timerId = window.setTimeout(() => showRollFeedback(outcome), delay);
    batchAnimationTimersRef.current.push(timerId);
  }, [showRollFeedback]);

  const scheduleAggregatedPopup = useCallback((credits: DecimalType, rolls: number, delay: number) => {
    const timerId = window.setTimeout(() => {
      showRollFeedback({ creditsEarned: credits, combo: null }, rolls);
    }, delay);
    batchAnimationTimersRef.current.push(timerId);
  }, [showRollFeedback]);

  const emitSampledAnimations = useCallback((outcomes: AutorollBatchOutcome[], animationBudget: number) => {
    clearBatchAnimationTimers();
    const plan = createBatchAnimationPlan(outcomes, animationBudget);
    plan.sampled.forEach((outcome, index) => {
      const delay = index * BATCH_POPUP_SPACING;
      scheduleBatchOutcome(outcome, delay);
    });
    if (plan.remainder.length > 0) {
      const delay = plan.sampled.length * BATCH_POPUP_SPACING + 100;
      scheduleAggregatedPopup(plan.aggregatedCredits, plan.remainder.length, delay);
    }
  }, [clearBatchAnimationTimers, scheduleBatchOutcome, scheduleAggregatedPopup]);

  const handlePopupComplete = useCallback(() => {
    setShowPopup(false);
    setPopupRollCount(null);
  }, []);

  const stopLegacyAutorollInterval = useCallback(() => {
    if (autorollIntervalRef.current) {
      window.clearInterval(autorollIntervalRef.current);
      autorollIntervalRef.current = null;
    }
  }, []);

  // Handle roll
  const handleRoll = useCallback(() => {
    setGameState(prevState => {
      const { newState, creditsEarned, combo } = performRoll(prevState);
      showRollFeedback({ creditsEarned, combo });

      setTimeout(() => {
        setGameState(prev => stopRollingAnimation(prev));
      }, ROLL_ANIMATION_DURATION);

      return newState;
    });
  }, [showRollFeedback]);

  const handleBatchComplete = useCallback((outcomes: AutorollBatchOutcome[], finalState: GameState) => {
    setGameState(finalState);
    emitSampledAnimations(outcomes, finalState.autoroll.animationBudget);
  }, [emitSampledAnimations]);

  useEffect(() => {
    batchCompleteRef.current = handleBatchComplete;
  }, [handleBatchComplete]);

  useEffect(() => {
    const runner = createAutorollBatchRunner({
      getState: () => gameStateRef.current,
      performRoll,
      handlers: {
        onBatchComplete: (outcomes, finalState) => batchCompleteRef.current(outcomes, finalState),
      },
      config: {
        maxRollsPerTick: gameStateRef.current.autoroll.maxRollsPerTick,
        minTickMs: AUTOROLL_BATCH_MIN_TICK_MS,
      },
    });
    autorollBatchRunnerRef.current = runner;
    return () => runner.stop();
  }, []);

  useEffect(() => {
    autorollBatchRunnerRef.current?.updateConfig({
      maxRollsPerTick: gameState.autoroll.maxRollsPerTick,
    });
  }, [gameState.autoroll.maxRollsPerTick]);

  // Handle autoroll
  const shouldUseBatching = useMemo(() => {
    if (!gameState.autoroll.dynamicBatch) return false;
    const cooldownMs = gameState.autoroll.cooldown.toNumber() * 1000;
    return cooldownMs > 0 && cooldownMs < gameState.autoroll.batchThresholdMs;
  }, [
    gameState.autoroll.dynamicBatch,
    gameState.autoroll.cooldown,
    gameState.autoroll.batchThresholdMs,
  ]);

  useEffect(() => {
    const runner = autorollBatchRunnerRef.current;
    if (!gameState.autoroll.enabled || gameState.autoroll.level === 0) {
      stopLegacyAutorollInterval();
      runner?.stop();
      return;
    }

    if (shouldUseBatching) {
      stopLegacyAutorollInterval();
      runner?.start();
    } else {
      runner?.stop();
      stopLegacyAutorollInterval();
      const cooldownMs = Math.max(gameState.autoroll.cooldown.toNumber() * 1000, 32);
      autorollIntervalRef.current = window.setInterval(() => {
        handleRoll();
      }, cooldownMs);
    }

    return () => {
      stopLegacyAutorollInterval();
    };
  }, [
    shouldUseBatching,
    gameState.autoroll.enabled,
    gameState.autoroll.level,
    gameState.autoroll.cooldown,
    handleRoll,
    stopLegacyAutorollInterval,
  ]);

  // Handle unlock die
  const handleUnlockDie = useCallback((dieId: number) => {
    const newState = unlockDie(gameState, dieId);
    if (newState) {
      setGameState(newState);
    }
  }, [gameState]);

  // Handle level up die
  const handleLevelUpDie = useCallback((dieId: number) => {
    const newState = levelUpDie(gameState, dieId);
    if (newState) {
      setGameState(newState);
    }
  }, [gameState]);

  // Handle unlock animation
  const handleUnlockAnimation = useCallback((dieId: number) => {
    const newState = unlockAnimation(gameState, dieId);
    if (newState) {
      setGameState(newState);
    }
  }, [gameState]);

  // Handle upgrade autoroll
  const handleUpgradeAutoroll = useCallback(() => {
    const newState = upgradeAutoroll(gameState);
    if (newState) {
      setGameState(newState);
    }
  }, [gameState]);

  // Handle toggle autoroll
  const handleToggleAutoroll = useCallback(() => {
    setGameState(toggleAutoroll(gameState));
  }, [gameState]);

  const updateAutorollSettings = useCallback((updates: Partial<AutorollState>) => {
    setGameState(prev => ({
      ...prev,
      autoroll: {
        ...prev.autoroll,
        ...updates,
      },
    }));
  }, []);

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

  // Export/Import handlers
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
  }, []);

  const handleReset = useCallback(() => {
    if (confirm('Are you sure you want to reset your game? This cannot be undone!')) {
      resetGameState();
      setGameState(createDefaultGameState());
    }
  }, []);

  // Prestige shop handler
  const handleBuyPrestigeUpgrade = useCallback((key: PrestigeShopKey) => {
    const newState = buyPrestigeUpgrade(gameState, key);
    if (newState) {
      setGameState(newState);
    }
  }, [gameState]);

  const isAnyDieRolling = gameState.dice.some(d => d.isRolling);
  const autorollUpgradeCost = getAutorollUpgradeCost(gameState.autoroll.level);
  const confettiIntensity: ComboIntensity = lastComboMetadata?.intensity ?? 'low';
  const currentLuck = gameState.prestige?.luckPoints ?? new Decimal(0);
  const canUpgradeAutoroll = canAfford(gameState.credits, autorollUpgradeCost);

  return (
    <div id="app">
      <AppHeader
        credits={gameState.credits}
        luckPoints={currentLuck}
        totalRolls={gameState.totalRolls}
        onOpenPrestige={() => setShowPrestige(true)}
      />

      <div className="main-layout">
        <div className="dice-section">
          <DiceGrid
            gameState={gameState}
            onUnlockDie={handleUnlockDie}
            onLevelUpDie={handleLevelUpDie}
            onUnlockAnimation={handleUnlockAnimation}
          />
        </div>

        <GameControlPanel
          isAnyDieRolling={isAnyDieRolling}
          onRoll={handleRoll}
          autoroll={gameState.autoroll}
          autorollUpgradeCost={autorollUpgradeCost}
          canUpgradeAutoroll={canUpgradeAutoroll}
          sessionStats={gameState.stats.autoroll}
          onToggleAutoroll={handleToggleAutoroll}
          onUpgradeAutoroll={handleUpgradeAutoroll}
          onDynamicBatchChange={handleDynamicBatchChange}
          onBatchThresholdChange={handleBatchThresholdChange}
          onMaxRollsPerTickChange={handleMaxRollsPerTickChange}
          onAnimationBudgetChange={handleAnimationBudgetChange}
          gameState={gameState}
          onExport={handleExport}
          onImport={handleImport}
          onReset={handleReset}
        />
      </div>

      {showPopup && (
        <CreditPopup
          credits={popupCredits}
          rollCount={popupRollCount}
          onComplete={handlePopupComplete}
        />
      )}
      <ConfettiBurst trigger={confettiTrigger} intensity={confettiIntensity} />
      {comboToasts.length > 0 && (
        <ComboToastStack comboToasts={comboToasts} onClose={handleComboToastClose} />
      )}
      <PrestigePanel
        visible={showPrestige}
        onClose={() => setShowPrestige(false)}
        onConfirm={() => {
          const newState = performPrestigeReset(gameState);
          setGameState(newState);
          // Immediately save new state
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
