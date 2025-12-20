# D001 — Core Gameplay Design

## Overview

This design document defines the core gameplay loop, die data model, credit calculation formula, upgrade mechanics, and acceptance tests for the DiceTycoon incremental game.

## Requirements (EARS-style)

- WHEN the player presses the roll button, THE SYSTEM SHALL roll all unlocked dice and award credits equal to the weighted sum of die faces (Acceptance: UI animates roll; credits increase by expected amount).
- WHEN the player upgrades a die, THE SYSTEM SHALL increase that die's level and apply the level's effect to the die's multiplier (Acceptance: cost is deducted; multiplier increases; UI shows new level).
- WHEN the player unlocks a die, THE SYSTEM SHALL make the die available for rolling with default level and multiplier (Acceptance: die becomes visible and participates in rolls).

## Game Formula

Credits earned per roll:

creditsEarned = Σ_{die in unlockedDice} (faceValue_die × multiplier_die)

Where:

- faceValue_die ∈ {1, 2, 3, 4, 5, 6}, uniformly random per die (prefer crypto.getRandomValues).
- multiplier_die is a Decimal representing the current effective multiplier for the die.

## Die Data Model

Each die is represented as:

{
  id: number,
  unlocked: boolean,
  level: number,
  multiplier: Decimal,
  animationLevel: number, // 0 = no animation; positive integers indicate animation tier
  currentFace: number,
  isRolling: boolean,
  ability?: {
    name: string,
    description: string
  }
}

Initial values for a newly unlocked die:

- unlocked: true
- level: 1
- multiplier: Decimal(1)
- animationLevel: 0
- currentFace: 1
- isRolling: false
- ability: (defined per die id; see D008 — Die Animations & Abilities)

## Leveling & Costs

Leveling uses exponential cost growth to ensure incremental progression is smooth.

cost(level) = BASE_COST × (GROWTH_RATE ^ level)

Suggested constants (tunable by game design):

- BASE_COST: Decimal(10) for initial die upgrade
- GROWTH_RATE: Decimal(1.75)

Level effect on multiplier is additive or multiplicative depending on balance decisions. Example:

- multiplier = baseMultiplier × (1 + level × 0.15)

Use Decimal math for all calculations.

## Autoroll Interaction (brief)

- Autoroll triggers the roll action automatically at a configurable cooldown.
- Autoroll credits follow the same formula; autoroll should be debounced and batched for performance.

## UX/Notification requirements

- Show credits gained as a transient UI toast per roll.
- Animate each die face update concurrently with requestAnimationFrame.
- Provide affordances for auto-roll toggle and upgrade affordance (disabled state when insufficient credits).

## Acceptance tests

- Unit test: Given fixed RNG seed or mocked randomness, verify credits calculation matches expected Decimal result.
- Integration test: Perform a roll and assert UI updates and credit totals.
- Animation test: Purchasing or upgrading an animation should deduct cost, increase the die's `animationLevel`, and the UI should reflect animation changes (Acceptance: animationLevel increments and roundtrip persisted).
- Die abilities test: Verify known die abilities apply their effects (e.g., Buffer increases adjacent die multipliers, Rusher has a chance to trigger an extra roll) in unit tests with deterministic RNG or mocked states.

## Notes and Open Questions

- Balance tuning parameters (BASE_COST, GROWTH_RATE, levelEffect) should be exposed in a single config so playtesters can iterate quickly.
- Consider adding per-die unique multipliers or passive bonuses in future updates.
