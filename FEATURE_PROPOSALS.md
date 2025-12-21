# Dice Tycoon: Feature Proposals

This document outlines three proposed features to enhance gameplay depth, user convenience, and player retention.

## 1. Bulk Level Up (x1, x10, Max)

**Concept:**
Currently, players must click the "Level Up" button individually for each level. As costs grow and income scales, players often need to buy hundreds of levels at a time. A bulk purchase toggle allows players to buy 1, 10, or the maximum affordable levels in a single click.

**Implementation Details:**
*   **UI:** Add a toggle control (segmented button or dropdown) in the main game interface (likely near the Dice Grid) with options: `x1`, `x10`, `Max`.
*   **State:** Add `buyAmount` ('1' | '10' | 'max') to the `GameState` or a local UI state in `App.tsx` passed down to `DiceGrid` and `DieCard`.
*   **Logic (`dice-upgrades.ts`):**
    *   Implement `calculateBulkLevelUpCost(die: DieState, amount: number | 'max', currentCredits: Decimal)`:
        *   For fixed amount (e.g., 10): Sum the costs of the next 10 levels.
        *   For 'max': Calculate how many levels can be afforded with current credits (up to a reasonable cap to prevent lag) and return that count and total cost.
*   **DieCard Update:**
    *   Update the "Level Up" button text to reflect the amount (e.g., "Level Up x10").
    *   Show the total cost for the batch.
    *   Disable if the player cannot afford even 1 level (or the batch size, depending on design choice; usually "Max" just buys what is possible, "x10" grays out if you can't buy 10).

**Benefits:**
*   Significant Quality of Life (QoL) improvement for mid-to-late game.
*   Reduces repetitive clicking (RSI prevention).
*   Standard feature in the idle/incremental genre.

## 2. Critical Roll Mechanic

**Concept:**
To add excitement to the core loop, every roll has a small chance to be a "Critical Roll," multiplying the credits earned for that specific roll by a significant factor (e.g., x5 or x10).

**Implementation Details:**
*   **Stats:**
    *   Add `criticalChance` (default e.g., 1% or 0.5%) and `criticalMultiplier` (default x5) to `GameState` (or hardcoded initially, then upgradeable).
*   **Logic (`game-roll.ts`):**
    *   In `executeRoll`, generate a random number (0-1).
    *   If `random < criticalChance`:
        *   Apply `criticalMultiplier` to the final credit calculation.
        *   Flag the result as `isCritical`.
*   **UI:**
    *   Visual feedback is crucial.
    *   When a critical roll occurs, the "Credits Earned" popup should be distinct (e.g., gold text, larger font, shake animation).
    *   Add a "Critical Hits" counter to the Stats panel.

**Benefits:**
*   Adds variance and "high moments" to the gameplay.
*   Creates a foundation for new upgrades (e.g., "Increase Critical Chance", "Increase Critical Multiplier").
*   Synergizes with the "Luck" attribute mentioned in other design docs.

## 3. Die Milestones (Level Bonuses)

**Concept:**
To provide short-term goals and reward focusing on specific dice, dice receive a substantial multiplier boost when they reach specific level milestones (e.g., Level 25, 50, 100, 200, etc.).

**Implementation Details:**
*   **Config:** Define milestones in `constants.ts` (e.g., `[25, 50, 100, 200, 500, 1000]`).
*   **Logic (`decimal.ts` or `dice-upgrades.ts`):**
    *   Modify `calculateMultiplier`:
        *   In addition to the base exponential growth, check how many milestones have been passed.
        *   Apply a multiplier (e.g., x2 or x4) for each milestone reached.
        *   Formula: `Multiplier = Base * (Growth ^ Level) * (MilestoneBonus ^ MilestonesPassed)`
*   **UI (`DieCard.tsx`):**
    *   Visual indicator when a die reaches a milestone (e.g., border color change, icon).
    *   Progress bar or text indicating "Next Milestone: Level 50".
    *   Tooltips explaining the current milestone bonus.

**Benefits:**
*   Breaks up the linear progression with meaningful spikes in power.
*   Gives players sub-goals ("Just 5 more levels to hit 100!").
*   Encourages leveling up lower-tier dice if they are close to a milestone.
