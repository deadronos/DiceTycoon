import Decimal from './decimal';
import { type Decimal as DecimalType } from '@patashu/break_eternity.js';
import type { GameState } from '../types/game';
import type { ComboResult } from '../types/combo';
import { AUTOROLL_BATCH_MIN_TICK_MS } from './constants';

export interface AutorollBatchOutcome {
  creditsEarned: DecimalType;
  combo: ComboResult | null;
}

interface RollResult {
  newState: GameState;
  creditsEarned: DecimalType;
  combo: ComboResult | null;
}

export interface AutorollBatchRunnerConfig {
  maxRollsPerTick: number;
  minTickMs: number;
}

export interface AutorollBatchRunnerHandlers {
  onBatchComplete: (outcomes: AutorollBatchOutcome[], finalState: GameState) => void;
}

type PerformRollFn = (state: GameState, options?: { suppressPerRollUI?: boolean }) => RollResult;

export interface AutorollBatchRunner {
  start(): void;
  stop(): void;
  updateConfig(config: Partial<AutorollBatchRunnerConfig>): void;
  updateHandlers(handlers: Partial<AutorollBatchRunnerHandlers>): void;
  processTick(elapsedMs?: number): void;
}

interface AutorollBatchRunnerParams {
  getState: () => GameState;
  performRoll: PerformRollFn;
  handlers: AutorollBatchRunnerHandlers;
  config: AutorollBatchRunnerConfig;
}

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
