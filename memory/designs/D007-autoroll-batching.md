# D007 — Autoroll Decimal Batching

**Status:** Proposed
**Date:** 2025-11-10
**Author:** GitHub Copilot (work for user)

## Summary

Add a Decimal-based autoroll batch runner that converts the autoroll cooldown into milliseconds (Decimal), accumulates elapsed time on a short tick (recommended 32ms), computes how many rolls are due using Decimal division/floor, executes up to a per-tick cap (default 1000) and defers the remainder. Preserve sampled-first animations by animating the first `animationBudget` outcomes and aggregating the rest into a single summary popup. Persist batch settings in the game state.

This design implements the user's requirements:
- Use Decimal for time math (safer for long runtimes / large numbers).
- Keep animations visible (sampled-first approach).
- Cap per-tick work at 1000 rolls by default and defer remainder to subsequent ticks.

## Goals & Acceptance Criteria

- WHEN autoroll is enabled AND cooldown becomes < `batchThresholdMs` (default 100 ms), THE SYSTEM SHALL switch to the Decimal-based batch runner. Acceptance: no uncontrolled thousands of UI updates per second; roll math identical to repeated single-roll calls.
- THE SYSTEM SHALL use Decimal for all time accumulation math and only convert to native `number` for safe loop counts after capping. Acceptance: no precision loss in credit totals compared to baseline.
- THE SYSTEM SHALL animate the first `animationBudget` rolls from a batch and show an aggregated credit popup for the remaining rolls. Acceptance: user sees animation feedback without spam.
- THE SYSTEM SHALL cap processed rolls per tick to `maxRollsPerTick` (default 1000) and defer remainder. Acceptance: per-tick work < configured cap.

## High-Level Architecture

Components involved:
- `AutorollBatchRunner` (new helper in `src/utils/autorollBatchRunner.ts`) — Decimal accumulator, short tick interval, compute due rolls, cap, run `performRoll(...)` repeated times with `suppressPerRollUI` option, collect outcomes, call `onBatchComplete(outcomes)`.
- `src/components/AutorollControls.tsx` — start/stop runner; provide UI controls for `dynamicBatch`, `batchThresholdMs`, `maxRollsPerTick`, `animationBudget` and show computed batch size preview.
- `performRoll(...)` (existing central roll function; likely in `src/App.tsx` or a domain module) — extended to accept `options.suppressPerRollUI` and return an outcome describing credits/combo/etc. Without `suppressPerRollUI` it behaves unchanged.
- UI animation components: `CreditPopup`, `ComboToastStack`, etc. — add helpers `emitSampledAnimations(outcomes[])` and `emitAggregatedPopup(totalCredits, totalRolls)` (visual-only).
- Storage / types — add new fields under `autoroll` in game state and persist them; continue to serialize Decimal fields (cooldown) as strings.

## Algorithm (pseudocode)

Constants:
- `MIN_TICK_MS = 32` (configurable)
- `MAX_ROLLS_PER_TICK = gameState.autoroll.maxRollsPerTick || 1000`

Runner state:
- `accumulator: Decimal` // milliseconds
- `lastTs: number`

Tick handler (every MIN_TICK_MS):
1. `now = performance.now()`
2. `elapsedMs = new Decimal(now - lastTs)`; `lastTs = now`
3. `accumulator = accumulator.plus(elapsedMs)`
4. `cooldownMsDecimal = gameState.autoroll.cooldown.times(1000)` // Decimal
5. `dueDecimal = accumulator.div(cooldownMsDecimal).floor()`
6. `if dueDecimal.gt(0):`
   a. `toProcessDecimal = Decimal.min(dueDecimal, new Decimal(MAX_ROLLS_PER_TICK))`
   b. `processed = toProcessDecimal.toNumber()` // safe because capped
   c. `accumulator = accumulator.minus(cooldownMsDecimal.times(toProcessDecimal))`
   d. `outcomes = []` 
   e. `for i in 1..processed:`
       - `outcomes.push( performRoll({ suppressPerRollUI: true }) )` // synchronous
   f. `onBatchComplete(outcomes)` // will emit sampled animations + aggregated popup
7. Loop until stopped

Notes:
- Always operate on Decimal for time math to avoid overflow/rounding.
- Convert counts to JS `number` only after capping by `MAX_ROLLS_PER_TICK`.

## File-by-file change summary

- NEW: `src/utils/autorollBatchRunner.ts`
  - Export `createAutorollBatchRunner({ getState, performRoll, onBatchComplete, options })` or class with `start/stop/updateConfig`.
  - Implements the tick loop with Decimal math and capping.

- EDIT: `src/components/AutorollControls.tsx`
  - Replace current `setInterval` autoroll scheduling with runner start/stop.
  - Add UI controls for `dynamicBatch` (bool), `batchThresholdMs` (ms), `maxRollsPerTick` (number), `animationBudget` (number).
  - Show computed `batchSize` preview.

- EDIT: `src/App.tsx` (or the module exporting the roll function)
  - Extend `performRoll(options?: { suppressPerRollUI?: boolean })` to return an outcome object and skip per-roll UI when suppressed.

- EDIT: UI components (visual only)
  - `src/components/CreditPopup.tsx`, `ComboToastStack.tsx`, etc.
  - Add `emitSampledAnimations(outcomes[])` and `emitAggregatedPopup(totalCredits, totalRolls)` helpers that are visual-only.

- EDIT: Types / Game State file (e.g., `src/types/*.ts`)
  - Under `autoroll` add: `dynamicBatch: boolean`, `batchThresholdMs: number`, `maxRollsPerTick: number`, `animationBudget: number`.

- EDIT: Storage load/save wrapper (where Decimal fields are serialized)
  - Persist new primitive autoroll fields as normal values; still serialize `cooldown` as Decimal string and restore to `Decimal` on load.

- TESTS: `tests/autoroll-batch-runner.test.ts` (new)
  - Parity test comparing batched runner vs repeated single-roll calls.
  - Cap test verifying `maxRollsPerTick` enforced (1000), remainder deferred.
  - Animation sampling test ensuring `animationBudget` yields sampled animations and an aggregated popup.

## Persistence & Migration

Existing saved games will not have the new autoroll fields — load logic must provide sensible defaults:
- `dynamicBatch = true`
- `batchThresholdMs = 100`
- `maxRollsPerTick = 1000`
- `animationBudget = 10`

Keep `cooldown` a Decimal stored as string.

## Edge cases & risks

- Accumulator abuse: If the player is offline long and the accumulator yields an extremely large `dueDecimal`, the runner will only process up to `maxRollsPerTick` per tick and defer the rest. If backlog grows too large, consider an emergency throttling UI or processing schedule to avoid long recovery times.
- Concurrency: Ensure only one runner instance runs; guard with a ref/subsystem state.
- Manual rolls while batching: `performRoll` must be safe to call concurrently with runner (prefer serializing state updates inside the domain function so synchronous loops don't race with manual events).
- UI spam: Sampled-first mitigates spam; aggregate remainder.
- Decimal -> number: converting `toNumber()` must only be done after capping, otherwise it risks overflow for huge counts.

## Testing strategy

- Unit: parity & cap tests in `tests/autoroll-batch-runner.test.ts`.
- Integration: e2e-like UI test that enables autoroll, sets a tiny cooldown, verifies animations appear (sampled) and aggregated popup shows correct total.
- Serialization: save/load tests to confirm new fields persist and old saves load with defaults.

## UX details

- Sampling strategy: **sample-first** (animate the first `animationBudget` outcomes). Recommended because it provides immediate feedback and is simple to implement.
- Aggregated popup text example: `+1.23M credits (x789 rolls)`; if `animationBudget > 0` animate first few then show aggregated summary for the rest.
- Settings: keep an advanced settings section in `AutorollControls` for `maxRollsPerTick` and `animationBudget` (hidden by default for casual users).

## Acceptance checklist

- [ ] Decimal-based accumulator implemented and used for time math
- [ ] Cap applied (default 1000) and remainder deferred
- [ ] Sample-first animations shown and aggregated popup displayed
- [ ] Tests pass: parity, cap, animation sampling
- [ ] Save/load round-trips new autoroll fields

## Next steps

1. Implement `src/utils/autorollBatchRunner.ts` and unit tests.
2. Wire up `AutorollControls` to start/stop the runner.  
3. Extend `performRoll` and update UI helpers to support sampled animations.  
4. Add tests and run CI.


---

*End of design D007*