# Dice Tycoon: High-Level Concepts

## Core Premise
Dice Tycoon is an incremental idle game built around rolling and upgrading a collection of dice. Players invest the credits they earn from rolls to unlock new dice, level them up, and automate their income so that progress continues even when they are away from the game.

## Game Loop
1. **Roll Dice** – Triggering a roll activates every unlocked die at once. Each die generates credits based on its face value, its intrinsic multiplier, and its position in the roster. The result is added to the player's total credits and increments the lifetime roll counter.
2. **Spend Credits** – Credits are reinvested to unlock additional dice slots, increase individual die levels (which boosts their multiplier), improve autoroll automation, or enhance die animations.
3. **Repeat with Automation** – As autoroll upgrades are purchased, the loop continues automatically on a fixed cooldown, including while the player is offline, letting credits accumulate passively.

## Progression Systems
- **Dice Unlocking** – New dice are purchased sequentially. Each die starts locked and requires a growing amount of credits to add it to the roster. Once unlocked, a die begins at level one with a baseline multiplier.
- **Leveling & Multipliers** – Leveling a die consumes credits to permanently raise its multiplier. Multipliers scale the credits earned from each roll, and higher-tier dice also inherit larger positional multipliers.
- **Animation Upgrades** – Visual flair for dice can be purchased separately, giving a cosmetic sense of progression without affecting earnings.
- **Autoroll Automation** – Autoroll upgrades unlock and accelerate hands-free rolling. Every upgrade reduces the cooldown between automatic rolls and keeps the automation toggled on by default.

## Economy & Balancing
- Unlock, level, autoroll, and animation costs draw from shared economic helpers that apply exponential growth curves to keep late-game prices challenging.
- Roll payouts are calculated per die, combining the die's multiplier, the random face result, and the die's roster index. This ensures higher-tier dice pay out more even before upgrades.

## User Interface Structure
- **App Shell** – The `App` component orchestrates state management, triggering rolls, handling upgrades, and wiring UI elements together.
- **Dice Grid** – Each die renders through a `DieCard`, displaying its current state, roll animation, and actionable buttons to unlock, level up, or enhance animations.
- **Control Panel** – A side panel houses the manual `RollButton`, `AutorollControls`, statistics, and save-management utilities (export, import, reset).
- **Feedback & Effects** – Rolling toggles animations, shows a transient credit popup, and disables the roll button until animations resolve.

## Persistence & Offline Progress
- Game state auto-saves periodically, on-demand, and before page unload. Players can manually export/import save strings or perform a hard reset.
- When the game reloads, any time spent away is converted into simulated autorolls if automation was active, granting appropriate credits and incrementing the roll counter.
