# D002 — Persistence & Save/Load Design

## Overview

This document defines the save/load format, safe localStorage access patterns, Decimal serialization, versioning/migration strategy, and tests to validate persistence integrity.

## Requirements (EARS-style)

- WHEN the game saves state, THE SYSTEM SHALL persist the entire GameState to `localStorage` under a single key with a version suffix (Acceptance: data saved without throwing and is restorable).
- WHEN the game loads state, THE SYSTEM SHALL validate the version and attempt migration if an older version is found (Acceptance: old saves are migrated to the new schema or a safe fallback used).
- WHEN serialization or deserialization fails, THE SYSTEM SHALL produce a recoverable fallback (Acceptance: log error and load a safe default state).

## Storage Key and Versioning

- STORAGE_KEY: `dicetycoon.gamestate.v1` (update version suffix when schema changes).
- The stored payload is a single JSON object containing metadata:
  - version: string
  - savedAt: ISO timestamp
  - state: GameState with Decimal values serialized as strings

Example payload:

{
  "version": "v1",
  "savedAt": "2025-10-06T12:00:00Z",
  "state": { ... }
}

## Decimal Serialization

- All Decimal instances must be converted to strings before JSON serialization.
- On load, strings that represent numeric game fields are converted back into Decimal instances.
- The `storage` utility will explicitly list keys that require Decimal conversion for robustness (e.g., credits, die.multiplier, autoroll.cooldown).
- Note: Several new primitive autoroll fields (`dynamicBatch`, `batchThresholdMs`, `maxRollsPerTick`, `animationBudget`) and per-die `animationLevel` are stored as native booleans/numbers and are restored with sensible defaults when missing from older save versions (see Migration Strategy).

## Migration Strategy

- Implement `migrateSave(payload)` which inspects `payload.version` and applies migrations sequentially to produce the target version `vN`.
- Maintain an array of migration functions keyed by version.
- When migration fails, write an error to console and offer to reset to a safe default, preserving problematic raw payload in `localStorage` under an `_invalid_` key for manual inspection.

## Safe Access API

Provide a wrapper utility (in `src/utils/storage.ts`):

- `safeLoad(key, fallback)` — returns fallback on errors, converts Decimal strings.
- `safeSave(key, data)` — converts Decimal to strings and writes to localStorage in try/catch.

## Testing

- Unit tests: roundtrip serialization/deserialization for representative GameState instances using Decimal values.
- Migration tests: simulate older versions and validate migration functions are applied.

## Acceptance tests

- Save a GameState with non-trivial Decimal values and reload — values match (Decimal equality) after roundtrip.
- Simulate a corrupted payload and verify safeLoad returns fallback and preserves corrupted payload under `_invalid_` key.

## Notes

- Keep migration functions small and additive (one migration per version change).
- Consider export/import feature to allow players to backup saves as text blobs (this should reuse the serialization format).
