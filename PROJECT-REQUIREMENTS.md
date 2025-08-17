# Dice Tycoon — Project Requirements Summary

I drafted a focused project requirements summary for a dice-based incremental/idle game that uses @Patashu/break_eternity.js and the Decimal object for arbitrary-precision numbers. Below are the goals, gameplay mechanics, data modeling, UI/UX expectations, technical requirements, acceptance criteria, and suggested milestones to take this from concept to an MVP.

---

## 1. Project Overview

Build an incremental/idle game where the player rolls multiple dice (1–6). Each die produces a face result which is multiplied by an individual die multiplier (upgradable). Credits are awarded per roll based on the sum of (faceValue * dieMultiplier) across all unlocked dice. All numeric values use Decimal from @Patashu/break_eternity.js to support extremely large values.

Core experience highlights:

- Simultaneous rolling of all unlocked dice on a "Roll" button.
- Roll animations for each die that are gradually unlocked/upgradeable.
- Individual dice can be leveled up to increase a multiplier.
- Unlock additional dice with credits (max 6).
- Autoroll can be unlocked and upgraded to reduce cooldown and increase frequency.
- Final credits formula per roll: credits = Σ (die_i_face * mult_die_i)

---

## 2. Primary Gameplay Mechanics

- Roll action:
  - Player presses "Roll" -> all unlocked dice animate and produce face values simultaneously.
  - Possibly show intermediate rolling animation frames then final face.
  - Credits earned = sum(face_i * mult_i) across all unlocked dice.
  - All arithmetic uses Decimal from @Patashu/break_eternity.js.

- Dice:
  - Up to 6 dice; each die has:
    - unlocked: boolean
    - level: integer
    - multiplier: Decimal (base multiplier * growth per level)
    - animationUnlocked: boolean/level
    - rollCooldown / rollSpeed modifiers (if per-die autoroll variations are supported)
  - Base die face values depend on die type (standard 1–6 faces) but you may scale face base value with upgrades (e.g., faceValueMultiplier) to allow growth.

- Leveling and Upgrades:
  - Each die can be leveled to increase its multiplier.
  - Costs for levels scale exponentially/softly (choose a function suited for playtesting; use Decimal).
  - Separate upgrades:
    - Unlock dice (1 → 6)
    - Unlock or enhance die animations
    - Autoroll: unlocks auto-rolling and provides upgrades to:
      - Speed (rolls per second or cooldown reduction)
      - Batch roll size (optional)
      - Efficiency multipliers (optional)
  - Consider prestige/rebirth mechanics as a later feature for deeper progression.

- Autoroll behavior:
  - Initially locked. When unlocked, auto-roll triggers at an interval (cooldown).
  - Upgrading autoroll reduces cooldown or increases effective roll count per tick.
  - Provide slider/options to set autoroll rate within allowed bounds.
  - Autoroll should obey UI state (paused, offline, etc.).

---

## 3. Numbers & Math (@Patashu/break_eternity.js)

- Use @Patashu/break_eternity.js Decimal for:
  - All credit balances, upgrade costs, multipliers, cumulative totals.
- Example operations:
  - Adding earned credits:
    - credits = credits.plus(sum)
  - Level scaling example:
    - cost(level) = new Decimal(BASE_COST).times(new Decimal(BASE_GROWTH).pow(level))
- Ensure serialization/deserialization of Decimal for saves (store as strings).
- Avoid mixing native Number and Decimal. Provide utility wrappers for common operations (e.g., safePlus, safeTimes, toDecimal).

- Example import (JS/TS):

```ts
import { Decimal } from "@Patashu/break_eternity.js";
```

---

## 4. UI / UX Requirements

- Main screen:
  - Header: Credits balance (Decimal formatting with suffixes / scientific notation)
  - Dice row/grid (1–6 visible slots):
    - Locked dice show cost to unlock.
    - Unlocked dice show:
      - Current face (animated when rolling)
      - Level and multiplier (formatted via Decimal)
      - Level-up button (shows cost as Decimal string)
      - Animation lock/unlock indicator
  - Roll button (primary CTA):
    - Click triggers simultaneous roll animation for all unlocked dice.
    - Disabled during roll cooldown (unless autoroll triggers).
  - Autoroll toggle and upgrade button(s).
  - Detailed tooltip / modal for each die with history/stats.
- Animation unlock:
  - Progressively reveal more advanced roll animations (e.g., simple flip → blur → 3D spin).
  - Each die’s animation can be unlocked separately or globally by upgrade.

- Feedback:
  - Visual and haptic (if on mobile) feedback for big wins.
  - Numeric popups showing credits earned per roll (animated, aggregated when many).
  - Sound effects for roll and level-up (optional toggles).

---

## 5. Data Model (example)

All Decimal values should be serialized to strings for saves.

```json
{
  "credits": "12345.67", // Decimal as string
  "dice": [
    {
      "id": 1,
      "unlocked": true,
      "level": 10,
      "multiplier": "15.3",
      "animationUnlocked": true
    }
    /* up to 6 dice */
  ],
  "autoroll": {
    "enabled": false,
    "level": 0,
    "cooldown": "2.0" // seconds as string
  },
  "settings": {
    "sound": true,
    "formatting": "suffixed"
  }
}
```

At load, convert strings back to Decimal:

```ts
state.credits = new Decimal(saved.credits);
state.dice[i].multiplier = new Decimal(saved.dice[i].multiplier);
```

---

## 6. Persistence & Offline Behavior

- Save game state to localStorage / IndexedDB with Decimal values serialized as strings.
- Provide manual export/import save
- Implement offline progress accumulation while the player is away (cap at reasonable max).
- Consider server-side persistence (optional later) for cross-device sync.

---

## 7. Performance & Scaling

- Render only visible animations with requestAnimationFrame.
- Batch Decimal operations to avoid performance spikes.
- Debounce UI updates for high-frequency autoroll.
- Use worker thread for heavy background computations (optional).

---

## 8. Technical Stack

- Language: TypeScript (recommended) or JavaScript
- UI: React (recommended) or plain vanilla JS + HTML/CSS
- State: Redux / Zustand / React context (or local state)
- Number library: @Patashu/break_eternity.js (required for all numeric operations) — use Decimal exclusively
- Bundler: Vite / Webpack
- Storage: localStorage / IndexedDB
- Optional: WebAudio API for sounds, CSS/Canvas/WebGL for animations

---

## 9. Acceptance Criteria (MVP)

- Player can unlock and play up to 6 dice.
- "Roll" button triggers simultaneous roll animations (or a placeholder animation) and yields credits per formula:
  - creditsEarned = Σ (face_i * multiplier_i)
  - Implement math using Decimal operations and persist Decimal values.
- Each die can be leveled up and increases its multiplier; leveling costs increase and use Decimal math.
- Autoroll can be unlocked and reduces or automates cooldowns as upgrades.
- All numbers (credits, multipliers, costs) use Decimal and persist on save/load.
- UI shows credit balance formatted for large numbers; animations and tooltips function.
- Save/load works between sessions.

---

## 10. Stretch / Future Enhancements

- Prestige/rebirth currency that multiplies future earnings.
- Unique die types with special mechanics (exploding dice, rerolls).
- Global upgrades / synergies between dice.
- Leaderboards, achievements.
- Mobile optimized controls and offline rewards system.
- Themeable skins and animation presets.

---

## 11. Milestones & Estimates (Rough)

- Week 1: Project scaffolding, basic UI, Decimal utilities, single-die roll + credits.
- Week 2: Multi-dice support (unlock 1–6), leveling system, cost scaling.
- Week 3: Autoroll system, persist/save/load, formatting large numbers.
- Week 4: Roll animations system and animation unlocks, polishing, playtesting.
- Week 5: Polish UI/UX, analytics, bugfixing, deploy.

---

## 12. Risks & Notes

- Mixing native numbers and Decimal is a common bug — enforce Decimal at boundaries.
- Animations for many simultaneous dice must be optimized for low-end devices.
- Balancing exponential progression requires playtesting; provide telemetry counters for tuning.

---
