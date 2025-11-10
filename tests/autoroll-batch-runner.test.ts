import { describe, it, expect, vi } from 'vitest';
import Decimal from '../src/utils/decimal';
import type { Decimal as DecimalType } from '@patashu/break_eternity.js';
import { createDefaultGameState } from '../src/utils/storage';
import { createAutorollBatchRunner, type AutorollBatchRunnerConfig, type AutorollBatchOutcome } from '../src/utils/autorollBatchRunner';
import { createBatchAnimationPlan } from '../src/utils/autorollBatchAnimations';
import type { GameState } from '../src/types/game';

const buildTestState = (): GameState => {
  const state = createDefaultGameState();
  state.autoroll.enabled = true;
  state.autoroll.level = 1;
  state.autoroll.cooldown = new Decimal(0.1);
  state.autoroll.dynamicBatch = true;
  state.autoroll.batchThresholdMs = 200;
  state.autoroll.maxRollsPerTick = 1000;
  state.autoroll.animationBudget = 5;
  return state;
};

type BatchPerformRoll = (
  state: GameState,
  options?: { suppressPerRollUI?: boolean }
) => {
  newState: GameState;
  creditsEarned: DecimalType;
  combo: null;
};

describe('AutorollBatchRunner', () => {
  const setupRunner = (configOverrides: Partial<AutorollBatchRunnerConfig> = {}) => {
    let currentState = buildTestState();
    const outcomes: AutorollBatchOutcome[] = [];
    const performRoll: BatchPerformRoll = vi.fn((state: GameState) => {
      const newState = {
        ...state,
        credits: state.credits.plus(1),
        totalRolls: state.totalRolls + 1,
      };
      currentState = newState;
      return {
        newState,
        creditsEarned: new Decimal(1),
        combo: null,
      };
    });

    const runner = createAutorollBatchRunner({
      getState: () => currentState,
      performRoll,
      handlers: {
        onBatchComplete: (batchOutcomes, finalState) => {
          outcomes.push(...batchOutcomes);
          currentState = finalState;
        },
      },
      config: {
        maxRollsPerTick: 1000,
        minTickMs: 32,
        ...configOverrides,
      },
    });

    return { runner, outcomes, performRoll, getState: () => currentState };
  };

  it('processes the correct number of rolls per tick and matches credits', () => {
    const { runner, outcomes, getState } = setupRunner();
    runner.processTick(500);

    expect(outcomes.length).toBe(5);
    expect(getState().credits.toNumber()).toBe(5);
  });

  it('caps rolls per tick and defers the remainder', () => {
    const { runner, outcomes, performRoll } = setupRunner({ maxRollsPerTick: 3 });
    runner.processTick(500);

    expect(outcomes.length).toBe(3);
    expect(performRoll).toHaveBeenCalledTimes(3);

    runner.processTick(200);
    expect(outcomes.length).toBe(6);
    expect(performRoll).toHaveBeenCalledTimes(6);
  });
});

describe('createBatchAnimationPlan', () => {
  it('samples the first animationBudget outcomes and aggregates the rest', () => {
    const outcomes: AutorollBatchOutcome[] = [
      { creditsEarned: new Decimal(1), combo: null },
      { creditsEarned: new Decimal(2), combo: null },
      { creditsEarned: new Decimal(3), combo: null },
    ];
    const plan = createBatchAnimationPlan(outcomes, 2);

    expect(plan.sampled.length).toBe(2);
    expect(plan.remainder.length).toBe(1);
    expect(plan.aggregatedCredits.toNumber()).toBe(3);
  });

  it('does not aggregate when budget covers all outcomes', () => {
    const outcomes: AutorollBatchOutcome[] = [
      { creditsEarned: new Decimal(5), combo: null },
    ];
    const plan = createBatchAnimationPlan(outcomes, 5);

    expect(plan.sampled.length).toBe(1);
    expect(plan.remainder).toHaveLength(0);
    expect(plan.aggregatedCredits.eq(new Decimal(0))).toBe(true);
  });
});
