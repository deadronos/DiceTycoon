import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
} from './utils/game-logic';
import { canAfford } from './utils/decimal';
import Decimal from '@patashu/break_eternity.js';
import { ROLL_ANIMATION_DURATION, AUTO_SAVE_INTERVAL } from './utils/constants';
import { getComboMetadata, type ComboMetadata } from './utils/combos';
import type { ComboResult, ComboIntensity } from './types/combo';
import './styles.css';

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
  const [comboToast, setComboToast] = useState<{ combo: ComboResult; id: number } | null>(null);
  const [comboMetadata, setComboMetadata] = useState<ComboMetadata | null>(null);
  const [showComboToast, setShowComboToast] = useState(false);
  const [confettiTrigger, setConfettiTrigger] = useState<number | null>(null);
  const [showPrestige, setShowPrestige] = useState(false);
  const autorollIntervalRef = useRef<number | null>(null);
  const autoSaveIntervalRef = useRef<number | null>(null);

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

  const handleComboToastClose = useCallback(() => {
    setShowComboToast(false);
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
      setComboToast({ combo, id: timestamp });
      setComboMetadata(metadata);
      setShowComboToast(true);
      setConfettiTrigger(timestamp);
    }

    // Stop rolling animation after duration
    setTimeout(() => {
      setGameState(prev => stopRollingAnimation(prev));
    }, ROLL_ANIMATION_DURATION);
  }, [gameState]);

  useEffect(() => {
    if (showComboToast) {
      return;
    }

    if (!comboMetadata && !comboToast) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setComboMetadata(null);
      setComboToast(null);
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [showComboToast, comboMetadata, comboToast]);

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

  const isAnyDieRolling = gameState.dice.some(d => d.isRolling);
  const autorollUpgradeCost = getAutorollUpgradeCost(gameState.autoroll.level);
  const confettiIntensity: ComboIntensity = comboMetadata?.intensity ?? 'low';
  const activeCombo = useMemo(() => comboToast?.combo ?? null, [comboToast]);

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
              const levelUpCost = die.unlocked ? getLevelUpCost(die.level) : undefined;
              const animationUnlockCost = die.unlocked && die.animationLevel < 3
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
            onToggle={handleToggleAutoroll}
            onUpgrade={handleUpgradeAutoroll}
          />

          <div className="stats-section glass-card">
            <h3>📊 Stats</h3>
            <div className="stat-item">
              <div className="stat-label">Unlocked Dice</div>
              <div className="stat-value">
                {gameState.dice.filter(d => d.unlocked).length} / {gameState.dice.length}
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Total Levels</div>
              <div className="stat-value">
                {gameState.dice.reduce((sum, d) => sum + d.level, 0)}
              </div>
            </div>
          </div>

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
      <ComboToast
        combo={activeCombo}
        metadata={comboMetadata}
        visible={showComboToast}
        onClose={handleComboToastClose}
      />
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
      />
    </div>
  );
};

export default App;
