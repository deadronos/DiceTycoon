import Decimal from './decimal';
import { type Decimal as DecimalType } from '@patashu/break_eternity.js';
import type { GameState } from '../types/game';
import type { ComboResult } from '../types/combo';
import { AUTOROLL_BATCH_MIN_TICK_MS } from './constants';

/**
 * Represents the result of a single auto-roll within a batch.
 */
export interface AutorollBatchOutcome {
  /** The amount of credits earned in this roll. */
  creditsEarned: DecimalType;
  /** The combo result achieved in this roll, if any. */
  combo: ComboResult | null;
}

interface RollResult {
  newState: GameState;
  creditsEarned: DecimalType;
  combo: ComboResult | null;
}

/**
 * Configuration options for the auto-roll batch runner.
 */
export interface AutorollBatchRunnerConfig {
  /** Maximum number of rolls to process in a single tick (frame). */
  maxRollsPerTick: number;
  /** Minimum time in milliseconds between processing ticks. */
  minTickMs: number;
}

/**
 * Callback handlers for batch runner events.
 */
export interface AutorollBatchRunnerHandlers {
  /**
   * Called when a batch of rolls is completed.
   * @param outcomes The list of outcomes from the batch.
   * @param finalState The game state after applying all rolls.
   */
  onBatchComplete: (outcomes: AutorollBatchOutcome[], finalState: GameState) => void;
}

type PerformRollFn = (state: GameState, options?: { suppressPerRollUI?: boolean }) => RollResult;

/**
 * Interface for the AutorollBatchRunner.
 */
export interface AutorollBatchRunner {
  /** Starts the auto-roll processing loop. */
  start(): void;
  /** Stops the auto-roll processing loop. */
  stop(): void;
  /**
   * Updates the runner's configuration.
   * @param config Partial configuration object.
   */
  updateConfig(config: Partial<AutorollBatchRunnerConfig>): void;
  /**
   * Updates the runner's event handlers.
   * @param handlers Partial handlers object.
   */
  updateHandlers(handlers: Partial<AutorollBatchRunnerHandlers>): void;
  /**
   * Manually triggers a processing tick (useful for testing or custom loops).
   * @param elapsedMs Optional elapsed time since last tick; calculates automatically if omitted.
   */
  processTick(elapsedMs?: number): void;
}

interface AutorollBatchRunnerParams {
  getState: () => GameState;
  performRoll: PerformRollFn;
  handlers: AutorollBatchRunnerHandlers;
  config: AutorollBatchRunnerConfig;
}

/**
 * Creates a new instance of an AutorollBatchRunner.
 * @param params Initialization parameters.
 * @returns A new AutorollBatchRunner instance.
 */
export function createAutorollBatchRunner(params: AutorollBatchRunnerParams): AutorollBatchRunner {
  return new AutorollBatchRunnerImpl(params);
}

class AutorollBatchRunnerImpl implements AutorollBatchRunner {
  private accumulator = new Decimal(0);
  private intervalId: number | null = null;
  private lastTimestamp = typeof performance !== 'undefined' ? performance.now() : Date.now();
  private config: AutorollBatchRunnerConfig;
  private handlers: AutorollBatchRunnerHandlers;
  private getState: () => GameState;
  private performRoll: PerformRollFn;

  constructor({ getState, performRoll, handlers, config }: AutorollBatchRunnerParams) {
    this.getState = getState;
    this.performRoll = performRoll;
    this.handlers = handlers;
    this.config = this.normalizeConfig(config);
  }

  public start(): void {
    if (this.intervalId) return;
    this.accumulator = new Decimal(0);
    this.lastTimestamp = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const tickMs = this.config.minTickMs;
    this.intervalId = window.setInterval(() => this.processTick(), tickMs);
  }

  public stop(): void {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.accumulator = new Decimal(0);
  }

  public updateConfig(config: Partial<AutorollBatchRunnerConfig>): void {
    this.config = this.normalizeConfig({ ...this.config, ...config });
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
      this.intervalId = window.setInterval(() => this.processTick(), this.config.minTickMs);
    }
  }

  public updateHandlers(handlers: Partial<AutorollBatchRunnerHandlers>): void {
    if (handlers.onBatchComplete) {
      this.handlers.onBatchComplete = handlers.onBatchComplete;
    }
  }

  public processTick(elapsedMs?: number): void {
    const delta = typeof elapsedMs === 'number'
      ? new Decimal(elapsedMs)
      : new Decimal((typeof performance !== 'undefined' ? performance.now() : Date.now()) - this.lastTimestamp);
    if (typeof elapsedMs !== 'number') {
      this.lastTimestamp = typeof performance !== 'undefined' ? performance.now() : Date.now();
    } else {
      this.lastTimestamp += elapsedMs;
    }
    this.handleElapsed(delta);
  }

  private handleElapsed(elapsed: DecimalType): void {
    const state = this.getState();
    if (!state.autoroll.enabled || state.autoroll.level === 0) return;

    const cooldownMs = state.autoroll.cooldown.times(1000);
    if (cooldownMs.lte(0)) return;

    this.accumulator = this.accumulator.plus(elapsed);
    const due = this.accumulator.div(cooldownMs).floor();
    if (due.lte(0)) return;

    const cap = new Decimal(this.config.maxRollsPerTick);
    const toProcess = Decimal.min(due, cap);
    const processedCount = toProcess.toNumber();
    this.accumulator = this.accumulator.minus(cooldownMs.times(toProcess));
    if (this.accumulator.lt(0)) {
      this.accumulator = new Decimal(0);
    }

    if (processedCount <= 0) return;

    let workingState = state;
    const outcomes: AutorollBatchOutcome[] = [];
    for (let i = 0; i < processedCount; i += 1) {
      const result = this.performRoll(workingState, { suppressPerRollUI: true });
      workingState = result.newState;
      outcomes.push({
        creditsEarned: result.creditsEarned,
        combo: result.combo,
      });
    }

    if (outcomes.length > 0) {
      this.handlers.onBatchComplete(outcomes, workingState);
    }
  }

  private normalizeConfig(config: AutorollBatchRunnerConfig): AutorollBatchRunnerConfig {
    return {
      minTickMs: Math.max(1, Math.floor(config.minTickMs ?? AUTOROLL_BATCH_MIN_TICK_MS)),
      maxRollsPerTick: Math.max(1, Math.floor(config.maxRollsPerTick)),
    };
  }
}
