import { useRef, useEffect, useCallback, useMemo } from 'react';
import { GameState } from '../types/game';
import {
  canUnlockAscension,
  unlockAscension,
  tickAscension,
  performRoll,
  stopRollingAnimation,
} from '../utils/game-logic';
import { AutorollBatchOutcome, createAutorollBatchRunner, AutorollBatchRunner } from '../utils/autorollBatchRunner';
import { AUTOROLL_BATCH_MIN_TICK_MS, ROLL_ANIMATION_DURATION } from '../utils/constants';

interface UseGameLoopProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  gameStateRef: React.MutableRefObject<GameState>;
  onBatchComplete: (outcomes: AutorollBatchOutcome[], finalState: GameState) => void;
  onRollFeedback: (outcome: AutorollBatchOutcome & { isCritical?: boolean }) => void;
}

export const useGameLoop = ({
  gameState,
  setGameState,
  gameStateRef,
  onBatchComplete,
  onRollFeedback,
}: UseGameLoopProps) => {
  const autorollIntervalRef = useRef<number | null>(null);
  const autorollBatchRunnerRef = useRef<AutorollBatchRunner | null>(null);
  const batchCompleteRef = useRef<(outcomes: AutorollBatchOutcome[], state: GameState) => void>(onBatchComplete);

  // Keep ref up to date
  useEffect(() => {
    batchCompleteRef.current = onBatchComplete;
  }, [onBatchComplete]);

  // Ascension unlock check
  useEffect(() => {
    if (!gameState.ascension.unlocked && canUnlockAscension(gameState)) {
      const timeoutId = window.setTimeout(() => {
        setGameState(prev => unlockAscension(prev));
      }, 0);
      return () => window.clearTimeout(timeoutId);
    }
  }, [gameState.ascension.unlocked, gameState, setGameState]);

  // Ascension tick
  useEffect(() => {
    if (!gameState.ascension.unlocked) return;
    const interval = window.setInterval(() => {
      setGameState(prev => tickAscension(prev));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [gameState.ascension.unlocked, setGameState]);

  // Initialize batch runner
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
  }, [gameStateRef]); // Added gameStateRef dependency although it's a ref

  // Update batch runner config
  useEffect(() => {
    autorollBatchRunnerRef.current?.updateConfig({
      maxRollsPerTick: gameState.autoroll.maxRollsPerTick,
    });
  }, [gameState.autoroll.maxRollsPerTick]);

  const stopLegacyAutorollInterval = useCallback(() => {
    if (autorollIntervalRef.current) {
      window.clearInterval(autorollIntervalRef.current);
      autorollIntervalRef.current = null;
    }
  }, []);

  const handleRoll = useCallback(() => {
    setGameState(prevState => {
      const { newState, creditsEarned, combo, isCritical } = performRoll(prevState);
      onRollFeedback({ creditsEarned, combo, isCritical });

      setTimeout(() => {
        setGameState(prev => stopRollingAnimation(prev));
      }, ROLL_ANIMATION_DURATION);

      return newState;
    });
  }, [setGameState, onRollFeedback]);

  const shouldUseBatching = useMemo(() => {
    if (!gameState.autoroll.dynamicBatch) return false;
    const cooldownMs = gameState.autoroll.cooldown.toNumber() * 1000;
    return cooldownMs > 0 && cooldownMs < gameState.autoroll.batchThresholdMs;
  }, [
    gameState.autoroll.dynamicBatch,
    gameState.autoroll.cooldown,
    gameState.autoroll.batchThresholdMs,
  ]);

  // Manage autoroll state
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

  return {
    handleRoll,
  };
};
