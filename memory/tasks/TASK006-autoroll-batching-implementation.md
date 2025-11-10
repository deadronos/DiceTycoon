# TASK006 - Implement Autoroll Decimal Batching

**Status:** In Progress
**Added:** 2025-11-10
**Updated:** 2025-11-10

## Original Request

Add a Decimal-based autoroll batch runner that computes due rolls on a short tick (Decimal time accumulator), processes up to a per-tick cap (default 1000), defers the remainder, and preserves sampled-first animations (animate the first `animationBudget` rolls and aggregate the rest into a single popup). Persist settings under the `autoroll` state and add tests for parity, capping, and animation sampling.

## Thought Process

- Use Decimal for all time math to avoid precision/overflow when cooldowns get very small or accumulated time is large.
- Use a short tick (e.g., 32ms) to accumulate elapsed ms in a Decimal `accumulator` and compute how many rolls are due with `accumulator.div(cooldownMs).floor()`.
- Cap processed rolls per tick to `maxRollsPerTick` (default 1000), convert the capped Decimal to a native `number` for the loop, and subtract processed time from `accumulator` using Decimal math.
- Call the core roll function synchronously `processed` times with `suppressPerRollUI: true`, collect outcomes, animate the first `animationBudget` outcomes, and show a single aggregated popup for the remainder.
- Ensure persistence for new autoroll config fields and safe defaulting for older saves.

## Implementation Plan (high level)

1. Create `src/utils/autorollBatchRunner.ts` (new)

   - Export a factory or class `createAutorollBatchRunner({ getState, performRoll, onBatchComplete, options })`.
   - Internals: `accumulator: Decimal` (ms), `lastTs: number`, `MIN_TICK_MS` (e.g., 32).
   - Tick handler (every `MIN_TICK_MS`): compute elapsed (Decimal), add to `accumulator`, compute `dueDecimal = accumulator.div(cooldownMsDecimal).floor()`. If `dueDecimal.gt(0)`, compute `toProcessDecimal = Decimal.min(dueDecimal, new Decimal(maxRollsPerTick))`, get `processed = toProcessDecimal.toNumber()`, subtract `cooldownMsDecimal.times(toProcessDecimal)` from `accumulator`, call `performRoll({ suppressPerRollUI: true })` `processed` times synchronously, collect outcomes, call `onBatchComplete(outcomes)`.

2. Wire up start/stop in `src/components/AutorollControls.tsx`

   - Replace existing `setInterval` autoroll scheduling with runner start/stop (store runner in a ref).
   - Start runner when autoroll enabled, stop on disable/unmount.
   - Pass `performRoll` and a handler to emit sampled animations and aggregated popup.
   - Add UI controls for:
     - `autoroll.dynamicBatch` (bool)
     - `autoroll.batchThresholdMs` (number, default 100)
     - `autoroll.maxRollsPerTick` (number, default 1000)
     - `autoroll.animationBudget` (number, default 10)
   - Display computed `batchSize` preview when active.

3. Extend the roll API (in `src/App.tsx` or the module exporting the central roll function)

   - Add `performRoll(options?: { suppressPerRollUI?: boolean })` that performs state updates (credits, combos, etc.) but suppresses per-roll UI when requested, and returns an outcome object describing the roll (credits gained, combo events, face values).
   - Keep the single-click/manual roll behavior unchanged.

4. Sampled-first animations & aggregated popup

   - Implement `emitSampledAnimations(outcomes[])` to animate the first `animationBudget` outcomes (use `requestAnimationFrame` or small staggered timeouts for smoothness).
   - Implement `emitAggregatedPopup(totalCredits, totalRolls)` to show a single summary (visual-only, does not re-apply credits).
   - Place these helpers in existing UI modules (`CreditPopup`, `ComboToastStack`) or a small UI helper module.

5. Persistence and types

   - Update game-state types (likely `src/types/*.ts`) to include under `autoroll`:
     - `dynamicBatch: boolean` (default `true`)
     - `batchThresholdMs: number` (default `100`)
     - `maxRollsPerTick: number` (default `1000`)
     - `animationBudget: number` (default `10`)
   - Update save/load wrapper (where Decimal cooldown is serialized) to persist these primitives and deserialize `cooldown` back to `Decimal`.

6. Tests

   - Add `tests/autoroll-batch-runner.test.ts` with:
     - Parity test: fast-forward simulated time and assert batched runner results match repeated single-roll calls (credits and roll counts equal).
     - Cap test: set `maxRollsPerTick = 1000`, set tiny cooldown so `due >> 1000`, run one tick and assert only 1000 processed and remainder deferred.
     - Animation sampling test: assert `animationBudget` causes the first N animations and aggregated popup for the rest.
   - Update any storage/serialization tests to include new fields.

## Subtasks

| ID  | Description                                | Status       | Updated     | Notes |
| --- | ------------------------------------------ | ------------ | ----------- | ----- |
| 6.1 | Scaffold `autorollBatchRunner.ts`          | In Progress  | 2025-11-10  | Runner skeleton + Decimal tick loop |
| 6.2 | Wire runner into `AutorollControls.tsx`    | Not Started  |             | start/stop, UI fields |
| 6.3 | Extend `performRoll` API                   | Not Started  |             | suppressPerRollUI option |
| 6.4 | Implement sampled animations helpers       | Not Started  |             | animate first N, aggregated popup |
| 6.5 | Persist new autoroll fields                 | Not Started  |             | storage load/save changes |
| 6.6 | Add unit tests for parity, cap, animations | Not Started  |             | new test file |
| 6.7 | Run tests and fix issues                   | Not Started  |             | CI / local run |

## Progress Log

### 2025-11-10

- Created task file and linked design: `memory/designs/D007-autoroll-batching.md`.
- Marked TASK006 as In Progress; started subtask 6.1 (runner scaffold).


---

*End of TASK006* 
