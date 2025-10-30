# D004 — Numeric Safety & Decimal Usage

## Overview

This design codifies the project's Decimal usage rules, performance considerations when using Decimal, formatting for display, and best practices to prevent precision bugs.

## Requirements (EARS-style)

- WHEN performing game numeric calculations, THE SYSTEM SHALL use `@patashu/break_eternity.js` Decimal for all game-state math (Acceptance: no native Number is used for credits, costs, multipliers, cooldowns).
- WHEN persisting numeric state, THE SYSTEM SHALL serialize Decimals to strings and reconstruct them on load (Acceptance: roundtrip tests show Decimal equality).

## Rules and Patterns

- Always construct Decimal instances from strings when values are not literal integers (e.g., `new Decimal('12345.67')`) or use `toDecimal()`/`fromDecimalString()` helpers from `src/utils/decimal.ts`.
- Avoid mixing Number and Decimal in expressions; explicitly convert `Number` to `Decimal` via `toDecimal(n)` or `Decimal.fromNumber(n)` when necessary.
- Group Decimal math operations to minimize intermediate allocations: compute using chained Decimal methods and avoid creating many ephemeral Decimals inside tight loops. When possible, aggregate values (sum multipliers then multiply) rather than per-item pow/ops in hot loops.

## Formatting & Display

- The project exposes formatting helpers in `src/utils/decimal.ts`. Use these helpers rather than reimplementing formatting throughout the codebase:

  - `formatShort(value)` — compact suffixed notation for UI elements
  - `formatDecimal(value, { decimals, style })` — flexible formatting (styles: `'suffixed'`, `'scientific'`, `'engineering'`)
  - `formatFull(value)` — full-precision string for tooltips and debug

Use `formatShort` for buttons and compact displays and `formatFull` for tooltips or copy-paste fields. Cache formatted strings for frequently updated UI fragments and only recompute on value change.

## Performance Considerations

- Cache formatting results for frequently updated UI elements; only recompute on value change.
- Batch Decimal-heavy computations (e.g., autoroll batches) and debounce UI updates to avoid performance spikes.
- Run performance tests to measure allocations; optimize hot paths by reducing Decimal creations when possible.

## Tests & Acceptance

- Unit tests for formatting utilities (`formatDecimal`, `formatShort`, `formatFull`) asserting expected outputs for representative values.
- Roundtrip serialization tests using `serializeGameState` and `deserializeGameState` from `src/utils/storage.ts` to assert Decimal equality after save/load.
- Performance benchmark tests for high-frequency autoroll simulations to ensure UI responsiveness and acceptable allocation profiles.

## Notes

- Keep `memory/designs/DECIMAL_GUIDE.md` up to date with helper names and usage patterns (this file exists).
- Prefer thin helper wrappers (e.g., `toDecimal`) that accept Number|string|Decimal and always return Decimal to simplify calling code.
