# System Patterns

## Architecture

- Single-page web application (React + Vite) implemented in TypeScript. The root UI lives in `src/App.tsx` which composes smaller components from `src/components/` and drives the main game flow.
- Game state is kept as a single `GameState` object in React state and persisted via `src/utils/storage.ts` to `localStorage`.
- Numeric logic uses a vendored Decimal implementation (`@patashu/break_eternity.js`) exposed through helpers in `src/utils/decimal.ts`.

## Key files & components

- `src/App.tsx` — application root, loads saved state (via `safeLoad`), applies offline progress, hooks up autoroll and autosave intervals, and wires all game actions to `src/utils/game-logic.ts`.
- `src/components/` — present components include `CreditsDisplay.tsx`, `DieCard.tsx`, `RollButton.tsx`, `AutorollControls.tsx`, `PrestigePanel.tsx`, `ComboHistoryPanel.tsx`, `CreditPopup.tsx`, and others. These are small, focused, and receive state + action callbacks from `App`.
- `src/utils/decimal.ts` — Decimal helper functions (toDecimal, fromDecimalString, formatting helpers like `formatShort`/`formatFull`, `calculateCost`, `rollDie()` which uses `crypto.getRandomValues` when available).
- `src/utils/storage.ts` — serialization/deserialization logic for the game's `GameState` (`serializeGameState` / `deserializeGameState`), plus `safeSave`/`safeLoad`, `exportGameState`/`importGameState`, and helpers for creating default state.
- `src/utils/constants.ts` — central game constants (MAX_DICE, BASE_UNLOCK_COST, autoroll cooldowns, `STORAGE_KEY = 'dicetycoon.gamestate.v2'`, animation timings, autosave interval, etc.).
- `src/utils/game-logic.ts` — core pure-game functions used by `App` (rolling, unlocking, leveling, autoroll upgrades, prestige logic, cost getters). Keep logic here so UI components remain thin.

## Design & implementation patterns

- Single source of truth: `App` holds `GameState` and passes relevant slices and callbacks into presentational components.
- Persistence: `safeSave` / `safeLoad` wrap `localStorage` usage, always serializing Decimal values to strings and restoring them with `fromDecimalString`.
- Autosave & autoroll: implemented via `window.setInterval` in `App.tsx`. Autoroll scheduling reads `autoroll.cooldown` (a Decimal) and converts to milliseconds for the interval. Roll animation end is handled with `setTimeout` using `ROLL_ANIMATION_DURATION` from `constants.ts`.
- Randomness: `rollDie()` prefers `crypto.getRandomValues` and falls back to `Math.random()` when unavailable.
- Serialization: `serializeGameState` emits a `version` and stringified Decimal values; `deserializeGameState` applies sensible defaults when fields are missing (backwards-compatible with older save shapes).

## Data model (summary)

- `GameState` (see `src/types/game.ts`) includes:
  - `credits: Decimal`
  - `dice: DieState[]` (each `DieState` has id, unlocked, level, multiplier: Decimal, animationLevel, currentFace, isRolling)
  - `autoroll: { enabled, level, cooldown: Decimal }`
  - `settings`, `stats`, `achievements`, `prestige`, and audit fields like `lastSaveTimestamp` and `totalRolls`.

## Testing patterns

- Unit tests: Vitest is used for unit tests under `tests/` (examples: `decimal.test.ts`, `die-position-multiplier.test.ts`, `decimal-costs.spec.ts`). These cover Decimal math, cost formulas, and utility functions.
- Component tests: React Testing Library is used in `tests/components/` (e.g., `header.test.tsx`, `diecard.test.tsx`) to validate UI behavior and accessibility hooks.
- Test environment: configured in `package.json` vitest section and `tests/setupTests.ts` for DOM test helpers.

## Recommended patterns for contributors

- Keep pure game logic in `src/utils/game-logic.ts` so it is easy to unit test.
- Use `fromDecimalString`/`toDecimal` helpers when converting between persisted strings and Decimal instances.
- Prefer passing small, well-typed props into components (credit values as `Decimal` or pre-formatted strings via `formatShort`).
- Document any migrations by adding a `version` bump in `STORAGE_VERSION` and a short decision record in `memory/designs/`.
