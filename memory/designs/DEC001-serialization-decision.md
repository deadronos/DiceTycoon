# DEC001 — Serialization & Decimal Decision

**Status:** Accepted  
**Date:** 2025-10-06

## Decision

We will serialize all Decimal instances as strings in the saved JSON payload and use a single `STORAGE_KEY` with a version suffix (`dicetycoon.gamestate.v1`). On load, the storage utility will explicitly convert known numeric fields back into Decimal instances. We will implement a migration pipeline (`migrateSave`) to handle schema changes.

## Context

- Decimal supports arbitrary-precision arithmetic; JSON cannot represent Decimal directly.
- Many game fields use Decimal (credits, multipliers, cooldowns) and must not lose precision on save/load.

## Considered options

- A: Serialize Decimal using toJSON methods and revive via a custom JSON reviver.
- B: Convert Decimal to strings at save and rehydrate known numeric fields on load.
- C: Use a hybrid approach with explicit type tagging for every number (e.g., {"_dec": "123.45"}).

## Rationale

- Option B (strings) is simple and robust across environments and avoids introducing custom reviver complexity while keeping saved payloads human-readable.
- Explicit listing of keys requiring conversion reduces accidental conversion of unrelated strings and eases migration.
- Storing a versioned payload allows safe migration and backward compatibility.

## Consequences

- Saved payloads are human-readable and minimal.
- Migration code must be maintained; add a migration per schema change.
- Developers must update the list of Decimal keys whenever the GameState schema changes.

## Implementation notes

- Implement `serializeGameState(state): SerializableForm` to convert Decimal fields to strings.
- Implement `deserializeGameState(payload): GameState` to rehydrate known fields into Decimal instances.
- Save corrupted payloads to `dicetycoon.gamestate.v1._invalid_` for manual inspection.

## Acceptance tests

- Roundtrip serialization/deserialization maintains Decimal equality for representative states.
- On migration failure, a fallback default state is loaded and `_invalid_` payload is preserved.
