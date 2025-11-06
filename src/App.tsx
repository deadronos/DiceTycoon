import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState } from './types/game';
import { CreditsDisplay } from './components/CreditsDisplay';
import { LuckCurrencyDisplay } from './components/LuckCurrencyDisplay';
import { PrestigePanel } from './components/PrestigePanel';
import { DieCard } from './components/DieCard';
import { RollButton } from './components/RollButton';
import { AutorollControls } from './components/AutorollControls';
import { CreditPopup } from './components/CreditPopup';
import { ComboToast } from './components/ComboToast';
import { ConfettiBurst } from './components/ConfettiBurst';
import { ComboHistoryPanel } from './components/ComboHistoryPanel';
import { AchievementsPanel } from './components/AchievementsPanel';
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
  getUnlockCost,
  getLevelUpCost,
  getAutorollUpgradeCost,
  getAnimationUnlockCost,
  calculateOfflineProgress,
  calculateLuckGain,
  preparePrestigePreview,
  performPrestigeReset,
  buyPrestigeUpgrade,
  canBuyPrestigeUpgrade,
  getPrestigeUpgradeCost,
} from './utils/game-logic';
import { canAfford, formatShort, formatFull } from './utils/decimal';
import Decimal from '@patashu/break_eternity.js';
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
    return () => {
      comboToastTimersRef.current.forEach(timerId => {
        window.clearTimeout(timerId);
      });
      comboToastTimersRef.current.clear();
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
    const { newState, creditsEarned, combo } = performRoll(gameState);
    setGameState(newState);

    // Show popup
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

    // Stop rolling animation after duration
    setTimeout(() => {
      setGameState(prev => stopRollingAnimation(prev));
    }, ROLL_ANIMATION_DURATION);
  }, [gameState]);

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
  const unlockedDiceCount = gameState.dice.filter(d => d.unlocked).length;
  const totalLevels = gameState.dice.reduce((sum, d) => sum + d.level, 0);
  const totalPrestiges = gameState.prestige?.totalPrestiges ?? 0;
  const totalCreditsEarned = gameState.stats.totalCreditsEarned;
  const creditsPerRoll = gameState.totalRolls > 0
    ? totalCreditsEarned.div(gameState.totalRolls)
    : new Decimal(0);
  const recentSampleSize = gameState.stats.recentRolls.length;
  const averageRecent = recentSampleSize > 0
    ? gameState.stats.recentRolls.reduce(
        (sum, value) => sum.plus(new Decimal(value)),
        new Decimal(0)
      ).div(recentSampleSize)
    : new Decimal(0);
  const bestRoll = gameState.stats.bestRoll;

  return (
    <div id="app">
      <header className="header">
        <h1>🎲 Dice Tycoon</h1>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <CreditsDisplay credits={gameState.credits} />
            <LuckCurrencyDisplay
              luckPoints={gameState.prestige?.luckPoints ?? new Decimal(0)}
              onOpen={() => setShowPrestige(true)}
            />
          </div>
        <div style={{ marginTop: '10px', fontSize: '0.9rem', color: 'var(--color-text-dim)' }}>
          Total Rolls: {gameState.totalRolls.toLocaleString()}
        </div>
      </header>

      <div className="main-layout">
        <div className="dice-section">
          <div className="dice-grid">
            {gameState.dice.map(die => {
              const unlockCost = !die.unlocked ? getUnlockCost(die.id) : undefined;
              const isMaxLevel = die.level >= GAME_CONSTANTS.MAX_DIE_LEVEL;
              const levelUpCost = die.unlocked && !isMaxLevel ? getLevelUpCost(die.level) : undefined;
              const animationUnlockCost = die.unlocked && die.animationLevel < GAME_CONSTANTS.MAX_ANIMATION_LEVEL
                ? getAnimationUnlockCost(die.animationLevel)
                : undefined;

              return (
                <DieCard
                  key={die.id}
                  die={die}
                  unlockCost={unlockCost}
                  levelUpCost={levelUpCost}
                  animationUnlockCost={animationUnlockCost}
                  onUnlock={() => handleUnlockDie(die.id)}
                  onLevelUp={() => handleLevelUpDie(die.id)}
                  onUnlockAnimation={() => handleUnlockAnimation(die.id)}
                  canUnlock={unlockCost ? canAfford(gameState.credits, unlockCost) : false}
                  canLevelUp={levelUpCost ? canAfford(gameState.credits, levelUpCost) : false}
                  canUnlockAnimation={animationUnlockCost ? canAfford(gameState.credits, animationUnlockCost) : false}
                />
              );
            })}
          </div>
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

          <div className="stats-section glass-card">
            <h3>📊 Stats</h3>
            <div className="stat-grid">
              <div className="stat-item">
                <div className="stat-label">Unlocked Dice</div>
                <div className="stat-value">
                  {unlockedDiceCount} / {gameState.dice.length}
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Total Levels</div>
                <div className="stat-value">{totalLevels}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Credits / Roll</div>
                <div className="stat-value" title={formatFull(creditsPerRoll)}>
                  {formatShort(creditsPerRoll)}
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Best Roll Ever</div>
                <div className="stat-value" title={formatFull(bestRoll)}>
                  {formatShort(bestRoll)}
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-label">
                  Average Roll {recentSampleSize > 0 ? `(last ${recentSampleSize})` : ''}
                </div>
                <div className="stat-value" title={formatFull(averageRecent)}>
                  {recentSampleSize > 0 ? formatShort(averageRecent) : '—'}
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Total Credits Earned</div>
                <div className="stat-value" title={formatFull(totalCreditsEarned)}>
                  {formatShort(totalCreditsEarned)}
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Prestiges Performed</div>
                <div className="stat-value">{totalPrestiges}</div>
              </div>
            </div>
          </div>

          <ComboHistoryPanel comboChain={gameState.stats.comboChain} />

          <AchievementsPanel achievements={gameState.achievements} />

          <div className="settings-section glass-card">
            <h3>⚙️ Settings</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button className="btn btn-secondary btn-small" onClick={handleExport}>
                💾 Export Save
              </button>
              <button className="btn btn-secondary btn-small" onClick={handleImport}>
                📂 Import Save
              </button>
              <button className="btn btn-danger btn-small" onClick={handleReset}>
                🔄 Reset Game
              </button>
            </div>
          </div>
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
