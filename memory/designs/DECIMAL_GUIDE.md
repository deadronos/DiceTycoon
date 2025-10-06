# Decimal Guide — Quick Reference for Contributors

## Overview

This short guide provides practical rules, examples, and common pitfalls for using `@Patashu/break_eternity.js` Decimal in DiceTycoon. Follow these conventions to ensure numeric correctness, safe persistence, and performant game logic.

## Why Decimal

- Decimal preserves precision for very large and fractional numbers used in incremental games.
- Native `Number` will lose precision for large values and is unsuitable for game-state arithmetic.

## Basic Usage

- Create Decimals from strings when precision matters:

```ts
import { Decimal } from '@patashu/break_eternity.js';

const credits = new Decimal('0');
const cost = new Decimal('123.45');
const multiplier = Decimal.fromNumber(2.5); // use when starting from Number
```

- Preferred patterns:
  - Use `Decimal` methods (`plus`, `times`, `pow`, `gte`, `lt`) instead of mixing native arithmetic.
  - Chain operations where possible to minimize temporary allocations.

Example arithmetic:

```ts
// Bad: mixing Number and Decimal
// const next = credits + 10 * level;

// Good:
const levelBonus = Decimal.fromNumber(level).times(10);
const next = credits.plus(levelBonus);
```

## Comparisons

Use Decimal comparison methods:

```ts
if (credits.gte(cost)) {
  // can afford
}
```

Avoid `>` and `>=` with Decimal objects — use `.gt()`, `.gte()`, `.lt()`, `.lte()` for clarity.

## Formatting for UI

Centralize formatting in `src/utils/decimal.ts` with helpers:

- `formatShort(decimal, digits)` — suffixed format (K, M, B)
- `formatScientific(decimal, digits)` — scientific notation
- `toFixedString(decimal, places)` — stable fixed-point string

Cache formatted strings for frequently updated UI elements and only recompute when the underlying Decimal changes.

## Persistence (Save/Load)

- Always serialize Decimal instances to strings before saving to `localStorage`.
- Use a single storage wrapper that centralizes serialization and deserialization.

Example helpers:

```ts
function serializeDecimal(d: Decimal | undefined): string | undefined {
  return d ? d.toString() : undefined;
}

function deserializeDecimal(s: string | undefined): Decimal | undefined {
  return s ? new Decimal(s) : undefined;
}
```

Save/Load pattern (pseudo-code):

```ts
const STORAGE_KEY = 'dicetycoon.gamestate.v1';

function safeSave(gameState: GameState) {
  const serializable = {
    ...gameState,
    credits: gameState.credits.toString(),
    dice: gameState.dice.map(d => ({ ...d, multiplier: d.multiplier.toString() })),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
}

function safeLoad(): GameState | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  const parsed = JSON.parse(raw);
  // convert known string fields back to Decimal
  parsed.credits = new Decimal(parsed.credits);
  parsed.dice = parsed.dice.map((d: any) => ({ ...d, multiplier: new Decimal(d.multiplier) }));
  return parsed as GameState;
}
```

- Keep an explicit list of keys that require Decimal rehydration so migrations are straightforward.

## Migration and Versioning

- Version the saved payload (`dicetycoon.gamestate.v1`); when schema changes, bump version and add a migration.
- Implement `migrateSave(payload)` to upgrade older saves to the current schema.

## Performance Tips

- Avoid creating Decimals in tight loops — compute aggregated results using chained Decimal operations.
- Batch autoroll operations into fewer updates and only perform expensive Decimal math on the batched result.
- Debounce UI updates when autoroll is running fast to avoid reformatting every tick.

## Testing

- Unit: write roundtrip serialization tests that assert Decimal equality after save/load.
- Performance: add a test that simulates high-rate autoroll to ensure the UI remains responsive and CPU usage stays reasonable.

Example Vitest unit snippet:

```ts
import { describe, it, expect } from 'vitest';

it('serializes and deserializes Decimal values', () => {
  const original = new Decimal('123456789.123');
  const s = original.toString();
  const parsed = new Decimal(s);
  expect(parsed.eq(original)).toBe(true);
});
```

## Common Pitfalls

- Mixing Number and Decimal without explicit conversion (leads to surprising results).
- Storing Decimals directly in `localStorage` without converting to strings.
- Recomputing formatted strings on every animation frame instead of on value change.

## Quick Checklist for Contributors

- [ ] Use Decimal for all game numbers in state and logic.
- [ ] Construct from strings where precision matters.
- [ ] Serialize Decimals to strings for persistence and rehydrate explicitly on load.
- [ ] Add migration functions when the GameState schema changes.
- [ ] Cache formatting results and batch autoroll computations.

## References

- See `memory/designs/D004-numeric-safety.md` for the detailed design and `memory/designs/DEC001-serialization-decision.md` for serialization rationale.
