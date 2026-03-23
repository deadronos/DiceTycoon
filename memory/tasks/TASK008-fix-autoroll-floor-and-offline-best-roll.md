# TASK008 - Fix autoroll cooldown floor and offline best-roll handling

**Status:** Completed  
**Added:** 2026-03-23  
**Updated:** 2026-03-23

## Original Request

Implement the review-requested fixes for the branch: clamp the final autoroll cooldown after all multipliers, and stop offline progress from fabricating an inconsistent best-roll estimate.

## Thought Process

The branch’s gameplay refactor is stable, but two correctness issues were identified in review: the autoroll cooldown floor is only applied before prestige/shop multipliers, and the offline progress approximation updates `bestRoll` without a corresponding real roll or face metadata. The safest fix is to normalize autoroll cooldown wherever it is written and to keep offline progress limited to credit accumulation unless a full roll simulation is performed.

## Implementation Plan

- Add a reusable cooldown floor helper in `game-autoroll.ts`.
- Apply the cooldown floor after upgrade/prestige calculations and on game load normalization.
- Remove the offline `bestRoll` heuristic so save data stays internally consistent.
- Add regression tests for the cooldown floor and offline progress behavior.

## Progress Tracking

**Overall Status:** Completed - 100%

### Subtasks

|ID|Description|Status|Updated|Notes|
|---|---|---|---|---|
|8.1|Add a final autoroll cooldown floor helper|Completed|2026-03-23|helper shared by upgrade/load paths|
|8.2|Clamp autoroll cooldown after multipliers|Completed|2026-03-23|upgrade, prestige, and load paths now normalize cooldown|
|8.3|Remove offline best-roll heuristic|Completed|2026-03-23|offline progress now preserves stats.bestRoll/bestRollFaces|
|8.4|Add regression tests|Completed|2026-03-23|covered cooldown floor and offline consistency|

## Progress Log

### 2026-03-23

- Captured the review-requested fixes in the Memory Bank.
- Confirmed the branch otherwise builds and passes targeted gameplay tests.
- Implemented the autoroll cooldown floor fix and removed the offline best-roll estimate.
- Verified with targeted Vitest suites, `npm run typecheck`, and `npm run build`.

End of TASK008
