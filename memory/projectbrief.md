# Project Brief — DiceTycoon

## Purpose

DiceTycoon is an incremental/idle browser game where players roll up to six dice to earn credits and upgrade dice to progress. This memory file is the single-source brief for project intent, scope, and high-level goals.

## Core Objectives

- Provide a satisfying incremental loop: roll → earn → upgrade → automate.
- Support up to 6 upgradeable dice with individual multipliers and unlockable autoroll.
- Persist game state across sessions using safe localStorage serialization of Decimal values.
- Use @Patashu/break_eternity.js Decimal for all numeric operations.

## MVP Acceptance Criteria

- Player can unlock and upgrade up to 6 dice.
- Rolling awards credits computed by the core formula: credits = Σ(face × multiplier).
- Autoroll feature is present and upgradeable.
- Game state is persisted and restored correctly, with Decimal values serialized as strings.

## Stakeholders

- Owner: deadronos (GitHub)
- Contributors: frontend engineers, QA testers, and designers

## Constraints

- All numeric logic must use Decimal (no native Number for game values).
- Safe localStorage access with try/catch and Decimal serialization.
- Randomness should be cryptographically secure (crypto.getRandomValues preferred).

## Reference

See `PROJECT-REQUIREMENTS.md` and `.github/instructions` for implementation and style guidance.
