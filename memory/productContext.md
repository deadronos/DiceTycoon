# Product Context

## Why this exists

DiceTycoon is intended to be a compact, well-balanced incremental game that demonstrates satisfying progression loops and clear upgrade paths. It is suitable as both a small indie title and a demo of Decimal-based numeric handling in browser games.

## Problems it solves

- Provides a clear example of safe Decimal math for incremental mechanics.
- Demonstrates persistent state management for complex numeric types.
- Offers an accessible incremental experience focused on short-session satisfaction and long-term progression.

## Target user

- Casual players who enjoy incremental/idle mechanics.
- Developers and students looking for a well-structured example of Decimal usage, save/load persistence, and incremental design patterns.

## Success metrics

- Functional MVP: rolling and upgrading through 6 dice with persistence.
- Positive usability feedback from at least 5 playtests.
- No loss of precision or state corruption from save/load operations.

## Acceptance tests

- Save and reload retains Decimal-based numeric values exactly (string serialization roundtrip).
- Autoroll runs reliably and respects cooldown settings across sessions.
