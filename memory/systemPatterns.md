# System Patterns

## Architecture

- Single-page web application (React + Vite) with a small TypeScript codebase.
- Core game loop implemented in `src/app.ts` (or `App.tsx`) with `render()` driving UI updates.
- Numeric operations use `@patashu/break_eternity.js` Decimal.

## Key Components

- `src/components/DiceGrid.tsx` - Displays up to 6 dice and their UI.
- `src/components/Controls.tsx` - Roll button, autoroll toggle, and reset.
- `src/utils/decimal.ts` - Decimal helpers and formatting.
- `src/utils/storage.ts` - Safe localStorage read/write with Decimal serialization.

## Design Patterns

- Single source of truth for game state (GameState) serialized in `localStorage`.
- Small, focused functions and components; prefer composition over inheritance.
- Use requestAnimationFrame for dice animations and debounce autoroll UI updates.

## Data Model (summary)

- `GameState` includes `credits: Decimal`, `dice: Array<DieState>`, `autoroll`, and `settings`.
- Dice state: `{ id, unlocked, level, multiplier: Decimal, animationUnlocked }`.

## Testing Patterns

- Unit tests with Vitest covering Decimal math and storage serialization.
- UI tests for key flows in `tests/components` using React Testing Library.
