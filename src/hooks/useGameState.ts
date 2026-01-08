import { useState, useCallback, useRef, useEffect } from 'react';
import { GameState } from '../types/game';
import {
  createDefaultGameState,
  safeLoad,
  safeSave,
  resetGameState,
} from '../utils/storage';
import { calculateOfflineProgress } from '../utils/offline-progress';
import { AUTO_SAVE_INTERVAL } from '../utils/constants';

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const loaded = safeLoad();
    if (loaded && typeof loaded === 'object' && 'credits' in loaded && 'dice' in loaded) {
      return calculateOfflineProgress(loaded as GameState, Date.now());
    }
    return createDefaultGameState();
  });

  const gameStateRef = useRef<GameState>(gameState);
  const autoSaveIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const saveGame = useCallback(() => {
    const stateToSave = {
      ...gameStateRef.current,
      lastSaveTimestamp: Date.now(),
    };
    safeSave(undefined, stateToSave);
  }, []);

  // Auto-save
  useEffect(() => {
    autoSaveIntervalRef.current = window.setInterval(saveGame, AUTO_SAVE_INTERVAL);
    const handleBeforeUnload = () => saveGame();
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      if (autoSaveIntervalRef.current) clearInterval(autoSaveIntervalRef.current);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saveGame]);

  const resetGame = useCallback(() => {
    if (confirm('Are you sure you want to reset your game? This cannot be undone!')) {
      resetGameState();
      setGameState(createDefaultGameState());
    }
  }, []);

  return {
    gameState,
    setGameState,
    saveGame,
    resetGame,
    gameStateRef,
  };
};
