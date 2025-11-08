import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState } from './types/game';
import { CreditsDisplay } from './components/CreditsDisplay';
import { LuckCurrencyDisplay } from './components/LuckCurrencyDisplay';
import { PrestigePanel } from './components/PrestigePanel';
import { RollButton } from './components/RollButton';
import { AutorollControls } from './components/AutorollControls';
import { CreditPopup } from './components/CreditPopup';
import { ComboToast } from './components/ComboToast';
import { ConfettiBurst } from './components/ConfettiBurst';
import { ComboHistoryPanel } from './components/ComboHistoryPanel';
import { AchievementsPanel } from './components/AchievementsPanel';
import StatsPanel from './components/StatsPanel';
import SettingsPanel from './components/SettingsPanel';
import DiceGrid from './components/DiceGrid';
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
import { canAfford, formatShort, formatFull } from './utils/decimal';
import Decimal from './utils/decimal';
import { ROLL_ANIMATION_DURATION, AUTO_SAVE_INTERVAL, PRESTIGE_SHOP_ITEMS, GAME_CONSTANTS, type PrestigeShopKey } from './utils/constants';
import { getComboMetadata, type ComboMetadata } from './utils/combos';
import type { ComboResult, ComboIntensity } from './types/combo';
import './styles.css';

const COMBO_TOAST_AUTO_DISMISS_MS = 3000;

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
  const [comboToasts, setComboToasts] = useState<Array<{
    id: number;
    combo: ComboResult;
    metadata: ComboMetadata;
    visible: boolean;
  }>>([]);
  const [lastComboMetadata, setLastComboMetadata] = useState<ComboMetadata | null>(null);
  const [confettiTrigger, setConfettiTrigger] = useState<number | null>(null);
  const [showPrestige, setShowPrestige] = useState(false);
  const autorollIntervalRef = useRef<number | null>(null);
  const autoSaveIntervalRef = useRef<number | null>(null);
  const comboToastTimersRef = useRef<Map<number, number>>(new Map());

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

  // Handle roll
  const handleRoll = useCallback(() => {
    setGameState(prevState => {
      const { newState, creditsEarned, combo } = performRoll(prevState);

      setPopupCredits(creditsEarned);
      setShowPopup(true);

      if (combo) {
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
      }

      setTimeout(() => {
        setGameState(prev => stopRollingAnimation(prev));
      }, ROLL_ANIMATION_DURATION);

      return newState;
    });
  }, [handleComboToastClose]);

  // Handle autoroll
  useEffect(() => {
    if (gameState.autoroll.enabled && gameState.autoroll.level > 0) {
      const cooldownMs = gameState.autoroll.cooldown.toNumber() * 1000;
      autorollIntervalRef.current = window.setInterval(() => {
        handleRoll();
      }, cooldownMs);
    } else {
      if (autorollIntervalRef.current) {
        clearInterval(autorollIntervalRef.current);
        autorollIntervalRef.current = null;
      }
    }

    return () => {
      if (autorollIntervalRef.current) {
        clearInterval(autorollIntervalRef.current);
      }
    };
  }, [gameState.autoroll.enabled, gameState.autoroll.level, gameState.autoroll.cooldown, handleRoll]);

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
  const totalPrestiges = gameState.prestige?.totalPrestiges ?? 0;

  return (
    <div id="app">
      <header className="header">
        <h1>🎲 Dice Tycoon</h1>
          <div className="header-bar">
            <CreditsDisplay credits={gameState.credits} />
            <LuckCurrencyDisplay
              luckPoints={gameState.prestige?.luckPoints ?? new Decimal(0)}
              onOpen={() => setShowPrestige(true)}
            />
          </div>
        <div className="header-subtitle">
          Total Rolls: {gameState.totalRolls.toLocaleString()}
        </div>
      </header>

      <div className="main-layout">
        <div className="dice-section">
          <DiceGrid
            gameState={gameState}
            onUnlockDie={handleUnlockDie}
            onLevelUpDie={handleLevelUpDie}
            onUnlockAnimation={handleUnlockAnimation}
          />
        </div>

        <div className="controls-panel glass-card">
          <RollButton
            onRoll={handleRoll}
            disabled={isAnyDieRolling}
            isRolling={isAnyDieRolling}
          />

          <AutorollControls
            autoroll={gameState.autoroll}
            upgradeCost={autorollUpgradeCost}
            canUpgrade={canAfford(gameState.credits, autorollUpgradeCost)}
            sessionStats={gameState.stats.autoroll}
            onToggle={handleToggleAutoroll}
            onUpgrade={handleUpgradeAutoroll}
          />

          <StatsPanel gameState={gameState} />

          <ComboHistoryPanel comboChain={gameState.stats.comboChain} />

          <AchievementsPanel achievements={gameState.achievements} />

          <SettingsPanel onExport={handleExport} onImport={handleImport} onReset={handleReset} />
        </div>
      </div>

      {showPopup && (
        <CreditPopup
          credits={popupCredits}
          onComplete={() => setShowPopup(false)}
        />
      )}
      <ConfettiBurst trigger={confettiTrigger} intensity={confettiIntensity} />
      {comboToasts.length > 0 && (
        <div className="combo-toast-stack" aria-live="polite" aria-relevant="additions text">
          {comboToasts.map(toast => (
            <ComboToast
              key={toast.id}
              combo={toast.combo}
              metadata={toast.metadata}
              visible={toast.visible}
              onClose={() => handleComboToastClose(toast.id)}
            />
          ))}
        </div>
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
        currentLuck={gameState.prestige?.luckPoints ?? new Decimal(0)}
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
