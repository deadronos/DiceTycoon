# TASK007 - Complete Autoroll Decimal Batching

**Status:** Completed
**Added:** 2025-11-11
**Updated:** 2025-11-11

## Original Request
Wire up design D007 by adding the Decimal-based autoroll batch runner, advanced autoroll settings, sampled-first animations with aggregated popups, and persistence for the new fields. The goal was to keep animations visible while capping per-tick work and ensuring older saves gain sane defaults.

## Completion Notes
- Added a dedicated  along with  so the system samples the first few rolls, aggregates the remainder, and uses Decimal-based time accumulation with per-tick caps.
- Updated  to accept the  option, rerouted the App’s autoroll handling to choose between the new runner and the legacy interval, and surfaced the advanced batching controls through the GameControlPanel/AutorollControls workflow.
- Persisted the new autoroll settings with sensible defaults (legacy saves fall back to dynamic batching, 100 ms threshold, 1000 max rolls, 10 animation budget) and reused the settings for the UI preview.
- Added  to cover parity, capping, and animation planning; reran 
> dice-tycoon-ui@0.1.0 test
> vitest


[1m[46m RUN [49m[22m [36mv4.0.7 [39m[90mD:/GitHub/DiceTycoon[39m

 [32m✓[39m tests/storage.test.ts [2m([22m[2m3 tests[22m[2m)[22m[32m 8[2mms[22m[39m
 [32m✓[39m tests/autoroll-batch-runner.test.ts [2m([22m[2m4 tests[22m[2m)[22m[32m 4[2mms[22m[39m
 [32m✓[39m tests/components/prestige-overview.test.tsx [2m([22m[2m1 test[22m[2m)[22m[32m 32[2mms[22m[39m
 [32m✓[39m tests/multi-combo.test.ts [2m([22m[2m17 tests[22m[2m)[22m[32m 47[2mms[22m[39m
 [32m✓[39m tests/die-position-multiplier.test.ts [2m([22m[2m3 tests[22m[2m)[22m[32m 4[2mms[22m[39m
 [32m✓[39m tests/prestige-shop.spec.ts [2m([22m[2m29 tests[22m[2m)[22m[32m 7[2mms[22m[39m
 [32m✓[39m tests/components/diecard.test.tsx [2m([22m[2m2 tests[22m[2m)[22m[32m 200[2mms[22m[39m
 [32m✓[39m tests/components/prestige-shop.test.tsx [2m([22m[2m1 test[22m[2m)[22m[32m 189[2mms[22m[39m
 [32m✓[39m tests/components/header.test.tsx [2m([22m[2m1 test[22m[2m)[22m[33m 324[2mms[22m[39m
     [33m[2m✓[22m[39m renders header with credits display [33m 322[2mms[22m[39m
 [32m✓[39m tests/components/lastroll.test.tsx [2m([22m[2m1 test[22m[2m)[22m[33m 378[2mms[22m[39m
     [33m[2m✓[22m[39m Last Roll area shows formatted total after roll [33m 377[2mms[22m[39m
 [32m✓[39m tests/export-import.test.tsx [2m([22m[2m1 test[22m[2m)[22m[33m 511[2mms[22m[39m
     [33m[2m✓[22m[39m exports and imports game state [33m 510[2mms[22m[39m
 [32m✓[39m tests/decimal.test.ts [2m([22m[2m3 tests[22m[2m)[22m[32m 3[2mms[22m[39m
 [32m✓[39m tests/game-roll.test.ts [2m([22m[2m1 test[22m[2m)[22m[32m 3[2mms[22m[39m
 [32m✓[39m tests/offline-progress.test.ts [2m([22m[2m1 test[22m[2m)[22m[32m 4[2mms[22m[39m
 [32m✓[39m tests/decimal-costs.spec.ts [2m([22m[2m3 tests[22m[2m)[22m[32m 3[2mms[22m[39m
 [32m✓[39m tests/game-autoroll.test.ts [2m([22m[2m2 tests[22m[2m)[22m[32m 2[2mms[22m[39m
 [32m✓[39m tests/game-logic.test.ts [2m([22m[2m1 test[22m[2m)[22m[32m 2[2mms[22m[39m
 [2m[90m↓[39m[22m tests/ui.app.test.ts [2m([22m[2m1 test[22m[2m | [22m[33m1 skipped[39m[2m)[22m
 [32m✓[39m tests/dice-upgrades.test.ts [2m([22m[2m1 test[22m[2m)[22m[32m 2[2mms[22m[39m
 [2m[90m↓[39m[22m tests/components/affordability.test.tsx [2m([22m[2m1 test[22m[2m | [22m[33m1 skipped[39m[2m)[22m
 [2m[90m↓[39m[22m tests/components/ascension.test.tsx [2m([22m[2m1 test[22m[2m | [22m[33m1 skipped[39m[2m)[22m
 [2m[90m↓[39m[22m tests/components/controls.test.tsx [2m([22m[2m1 test[22m[2m | [22m[33m1 skipped[39m[2m)[22m
 [2m[90m↓[39m[22m tests/components/dicegrid.test.tsx [2m([22m[2m1 test[22m[2m | [22m[33m1 skipped[39m[2m)[22m

[2m Test Files [22m [1m[32m18 passed[39m[22m[2m | [22m[33m5 skipped[39m[90m (23)[39m
[2m      Tests [22m [1m[32m75 passed[39m[22m[2m | [22m[33m5 skipped[39m[90m (80)[39m
[2m   Start at [22m 20:54:07
[2m   Duration [22m 2.61s[2m (transform 2.56s, setup 242ms, collect 4.22s, tests 1.72s, environment 13.69s, prepare 119ms)[22m successfully.
