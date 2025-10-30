# Decimal Guide — Quick Reference for Contributors

This guide aligns the project's Decimal guidance with the current implementation in `src/` (2025-10-30). It highlights the actual helper names and patterns used across the codebase and gives practical examples for contributors.

## Why Decimal

- Use `@Patashu/break_eternity.js` Decimal for all game numeric state (credits, costs, multipliers, cooldowns). Native `Number` loses precision for large values and should not be used for persisted or game-critical arithmetic.

## Source-of-truth helpers

- Formatting and Decimal utilities live in `src/utils/decimal.ts` and include:
  - `toDecimal(value)` — canonical converter to Decimal
  - `fromDecimalString(str, fallback)` — safe parse with fallback
  - `formatDecimal(value, {decimals, style})` — flexible formatter (style: 'suffixed'|'scientific'|'engineering')
  - `formatShort(value)` — short adaptive formatting for compact UI
  - `formatFull(value)` — full-precision string for tooltips/logs
  - `canAfford(credits, cost)` — boolean affordability check
  - `calculateCost(baseCost, growthRate, level)` — exponential cost helper

## Recommended usage patterns

- Always convert inputs to Decimal with `toDecimal()` before performing operations.
- Use the helper functions rather than mixing Decimal methods and native Number operators.

Example (preferred):

```ts
import { toDecimal, calculateCost } from 'src/utils/decimal';

const cost = calculateCost(GAME_CONSTANTS.BASE_LEVEL_COST, GAME_CONSTANTS.LEVEL_COST_GROWTH, currentLevel);
if (canAfford(state.credits, cost)) {
  // proceed
}
```

## Formatting for UI

- Use `formatShort()` for compact displays (e.g., in dashboards and buttons).
- Use `formatDecimal(..., { style: 'scientific' })` or `formatFull()` for tooltips and debug views.
- Cache formatted strings for high-frequency updates (autoroll) and only recompute when the underlying Decimal changes.

## Persistence and storage helpers

- The storage helpers live in `src/utils/storage.ts` and implement canonical serialization/deserialization:
  - `serializeGameState(state)` / `deserializeGameState(data)` — game-shaped roundtrip serialization
  - `safeSave(key?, state)` / `safeLoad(key?, fallback)` — resilient localStorage wrappers
  - `createDefaultGameState()` — default-initialized state used on first run or after reset

Example save/load pattern (use the helpers, not ad-hoc JSON):

```ts
import { safeSave, safeLoad } from 'src/utils/storage';

safeSave(undefined, gameState);
const loaded = safeLoad();
```

These functions ensure Decimal fields are saved as strings and rehydrated via `fromDecimalString()` during load.

## Migrations and versioning

- `storage.ts` includes a `version` field in the serialized payload. When changing `GameState` shape, bump `STORAGE_VERSION` and implement migration logic in `deserializeGameState` or a dedicated `migrateSave(payload)` helper.

## Performance tips

- Avoid creating Decimals inside tight loops; batch computations using chained Decimal methods.
- Use `formatShort()` for UI and debounce updates during autoroll to reduce re-render work.
- For offline/autoroll batching (see `src/utils/game-logic.ts`), perform aggregated Decimal math rather than per-roll storage writes.

## Tests to include

- Serialization roundtrip tests using `serializeGameState`/`deserializeGameState`.
- Formatting unit tests for `formatDecimal`, `formatShort`, and `formatFull`.
- Autoroll stress tests to validate performance and allocations.

## Common pitfalls

- Mixing Number and Decimal without conversion.
- Recomputing formatted strings every frame instead of on-change.
- Not versioning saved payloads when schema changes.

## Quick checklist

- [ ] Use `toDecimal`/`fromDecimalString` for conversions.
- [ ] Use `serializeGameState` / `deserializeGameState` for saving and loading.
- [ ] Add migrations when the schema changes and bump `STORAGE_VERSION`.
- [ ] Cache formatting and batch autoroll computations.

## References

- `src/utils/decimal.ts` — implementation of Decimal helpers
- `src/utils/storage.ts` — canonical save/load helpers
- `memory/designs/D004-numeric-safety.md` — detailed design and rules
- `memory/designs/DEC001-serialization-decision.md` — serialization decision rationale
