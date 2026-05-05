import { describe, it, expect } from 'vitest';
import { deserializeGameState } from '../src/utils/storage';

describe('storage migration', () => {
  it('should handle v1 save without version field', () => {
    // Simulate old v1 save format (no version field)
    const v1Save = {
      credits: '1000',
      dice: [
        { id: 1, unlocked: true, level: 5, multiplier: '7.5', animationLevel: 0, currentFace: 4, isRolling: false },
        { id: 2, unlocked: false, level: 0, multiplier: '1', animationLevel: 0, currentFace: 1, isRolling: false },
      ],
      autoroll: {
        enabled: false,
        level: 0,
        cooldown: '2',
        dynamicBatch: true,
        batchThresholdMs: 100,
        maxRollsPerTick: 1000,
        animationBudget: 10
      },
      settings: { sound: false, formatting: 'suffixed', theme: 'dark' },
      totalRolls: 50,
      lastSaveTimestamp: Date.now(),
      stats: {
        bestRoll: '0',
        bestRollFaces: [],
        totalCreditsEarned: '1000',
        recentRolls: [],
        lastRollCredits: '0',
        comboChain: { current: 0, best: 0, lastComboRoll: null, history: [] },
        autoroll: { startedAt: null, creditsEarned: '0', rolls: 0 },
      },
      achievements: { unlocked: [], newlyUnlocked: [] },
      ascension: { unlocked: false, stardust: '0', resonance: '0', dice: [], lastTick: Date.now(), totalCycles: 0 },
    };

    const result = deserializeGameState(v1Save as any);

    // Should default prestige
    expect(result.prestige).toBeDefined();
    expect(result.prestige!.luckPoints.toString()).toBe('0');
    expect(result.credits.toString()).toBe('1000');
  });

  it('should handle v1 save with version field', () => {
    // Simulate old v1 save format with version
    const v1Save = {
      version: 'v1',
      credits: '500',
      dice: [],
      autoroll: {
        enabled: false,
        level: 0,
        cooldown: '2',
        dynamicBatch: true,
        batchThresholdMs: 100,
        maxRollsPerTick: 1000,
        animationBudget: 10
      },
      settings: { sound: false, formatting: 'suffixed', theme: 'dark' },
      totalRolls: 0,
      lastSaveTimestamp: Date.now(),
      stats: {
        bestRoll: '0',
        bestRollFaces: [],
        totalCreditsEarned: '0',
        recentRolls: [],
        lastRollCredits: '0',
        comboChain: { current: 0, best: 0, lastComboRoll: null, history: [] },
        autoroll: { startedAt: null, creditsEarned: '0', rolls: 0 },
      },
      achievements: { unlocked: [], newlyUnlocked: [] },
      ascension: { unlocked: false, stardust: '0', resonance: '0', dice: [], lastTick: Date.now(), totalCycles: 0 },
    };

    const result = deserializeGameState(v1Save as any);
    expect(result).toBeDefined();
    expect(result.credits.toString()).toBe('500');
  });
});