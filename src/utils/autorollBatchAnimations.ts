import Decimal from './decimal';
import { type Decimal as DecimalType } from '@patashu/break_eternity.js';
import type { AutorollBatchOutcome } from './autorollBatchRunner';

export interface AutorollBatchAnimationPlan {
  sampled: AutorollBatchOutcome[];
  remainder: AutorollBatchOutcome[];
  aggregatedCredits: DecimalType;
}

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
