# D008 — Die Animations & Abilities

**Status:** Accepted
**Date:** 2025-12-15
**Author:** GitHub Copilot

## Overview

This design documents per-die abilities and the animation tier system used by the UI. It clarifies the data model, upgrade mechanics, acceptance criteria, and interactions with autoroll animation sampling.

## Requirements (EARS-style)

- WHEN the player purchases or upgrades a die animation, THE SYSTEM SHALL increase the die's `animationLevel` and deduct the appropriate cost (Acceptance: credits decreased and `animationLevel` increments; UI shows new animation state).
- WHEN the die's `animationLevel` is updated, THE SYSTEM SHALL persist the value to save data and restore it on load (Acceptance: roundtrip preserves `animationLevel`).
- WHEN an autoroll batch runs and `animationBudget` is limited, THE SYSTEM SHALL sample at most `animationBudget` outcomes for per-roll animations and aggregate the rest into a single popup (Acceptance: sampled animations show; aggregated popup reports total credits and roll count).

## Animation Levels

- `animationLevel` is an integer (0..MAX_ANIMATION_LEVEL). 0 indicates no animation; higher levels unlock richer animations.
- Implemented in code as `die.animationLevel` (default `0`).
- Upgrades: costs increase per-level (use existing cost helpers) and are explicit UI actions (`Unlock Animation` / `Upgrade Animation` in `DieCard`).
- Acceptance test: paying animation unlock cost increases `animationLevel` and saves the state.

## Die Abilities

- Each die may expose an ability that affects gameplay (not merely cosmetic). Examples from the current implementation (see `src/components/DieCard.tsx`):
  - The Starter — reliable first die (baseline).
  - Buffer — +10% multiplier to adjacent dice.
  - Rusher — chance to trigger an immediate extra roll.
  - Combo Master — triples the value of combos it participates in.
  - Lucky — slight chance for higher face values.
  - Tycoon — global multiplier boost.

- Abilities should be clearly documented and covered by unit tests that verify their intended gameplay effect in deterministic scenarios.

## UI & Interaction

- `DieCard` presents the animation unlock/upgrade action and shows current `animationLevel` and preview information.
- Autoroll animation sampling references `animationBudget`. Animation-heavy autoroll runs should be throttled and provide aggregated feedback.

## Persistence & Migration

- `dice[].animationLevel` is persisted as a number in the serialized game state; the storage layer defaults missing values to `0` on load.

## Acceptance tests

- Animation unlock/upgrade test: verify cost deduction, `animationLevel` increment, and persisted roundtrip.
- Ability-effect unit tests: verify ability effects (e.g., Buffer applies +10% to neighbors) with deterministic RNG or mocked state.

## Notes

- Abilities are a balance lever; keep them configurable and documented in `GAME_CONSTANTS` or a dedicated balance table for easy iteration.
- Consider separating purely visual animation tiers from gameplay-impacting tiers if future changes require it.

End of design D008
