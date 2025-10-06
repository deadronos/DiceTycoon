# D004 — Numeric Safety & Decimal Usage

## Overview

This design codifies the project's Decimal usage rules, performance considerations when using Decimal, formatting for display, and best practices to prevent precision bugs.

## Requirements (EARS-style)

- WHEN performing game numeric calculations, THE SYSTEM SHALL use `@patashu/break_eternity.js` Decimal for all game-state math (Acceptance: no native Number is used for credits, costs, multipliers, cooldowns).
- WHEN persisting numeric state, THE SYSTEM SHALL serialize Decimals to strings and reconstruct them on load (Acceptance: roundtrip tests show Decimal equality).

## Rules and Patterns

- Always construct Decimal instances from strings when values are not literal integers (e.g., `new Decimal('12345.67')`).
- Avoid mixing Number and Decimal in expressions; explicitly convert `Number` to `Decimal` via `Decimal.fromNumber(n)` when necessary.
- Group Decimal math operations to minimize intermediate allocations: compute using chained Decimal methods and avoid creating many ephemeral Decimals inside tight loops.

## Formatting & Display

- Provide a formatting utility (in `src/utils/decimal.ts`) with functions:

  - `formatShort(decimal, digits)` — returns suffixed notation (K, M, B) for large numbers
  - `formatScientific(decimal, digits)` — scientific notation for extremely large values
  - `toFixedString(decimal, places)` — stable fixed decimal representation for UI where needed

## Performance Considerations

- Cache formatting results for frequently updated UI elements; only recompute on value change.
- Batch Decimal-heavy computations (e.g., autoroll batches) and debounce UI updates to avoid performance spikes.
- Run performance tests to measure allocations; optimize hot paths by reducing Decimal creations when possible.

## Tests & Acceptance

- Unit tests for formatting utilities to assert expected strings for representative values.
- Performance benchmark tests for high-frequency autoroll simulations to ensure smooth UI at target autoroll rates.

## Notes

- Document common pitfalls in README or a short `DECIMAL_GUIDE.md` for contributors.
- Consider helper wrappers that accept Number or Decimal but always return Decimal to simplify API use.
