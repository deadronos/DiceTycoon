import Decimal from './decimal';
import { type Decimal as DecimalType } from '@patashu/break_eternity.js';
import type { AutorollBatchOutcome } from './autorollBatchRunner';

/**
 * Describes how to visualize a batch of auto-roll outcomes.
 */
export interface AutorollBatchAnimationPlan {
  /** A subset of outcomes to be fully animated (visualized individually). */
  sampled: AutorollBatchOutcome[];
  /** The remaining outcomes that will not be animated but are accounted for. */
  remainder: AutorollBatchOutcome[];
  /** The total credits earned from the remainder outcomes. */
  aggregatedCredits: DecimalType;
}

/**
 * Creates an animation plan for a batch of auto-roll outcomes based on an animation budget.
 * @param outcomes The list of all auto-roll outcomes.
 * @param animationBudget The maximum number of animations allowed.
 * @returns A plan separating sampled outcomes for animation and aggregated remainder.
 */
export function createBatchAnimationPlan(
  outcomes: AutorollBatchOutcome[],
  animationBudget: number
): AutorollBatchAnimationPlan {
  const sampleCount = Math.max(0, Math.min(animationBudget, outcomes.length));
  const sampled = outcomes.slice(0, sampleCount);
  const remainder = outcomes.slice(sampled.length);
  const aggregatedCredits = remainder.reduce(
    (sum, outcome) => sum.plus(outcome.creditsEarned),
    new Decimal(0)
  );

  return {
    sampled,
    remainder,
    aggregatedCredits,
  };
}
