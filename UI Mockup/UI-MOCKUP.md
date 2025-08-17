```markdown
# Dice Tycoon — UI Mockup & Component Guide

Summary
-------
This document describes a UI mockup for the Dice Tycoon incremental/idle game. The mockup demonstrates layout, interactions, and visual states for up to 6 dice, the Roll button, autoroll, credits display, and per-die upgrades/animation unlocks.

Files included:
- mockup.html — runnable HTML/CSS/JS prototype you can open in a browser.
- This design doc — describes components, states, and interactions.

Primary Screen Layout
---------------------
Header
- Credits display (large, centered)
- Small controls: settings, export/import save

Main area (two columns on desktop; stacked on mobile)
- Left: Dice grid (2 rows x 3 columns)
  - Die card (per die):
    - Locked overlay with unlock cost (if locked)
    - If unlocked:
      - Animated face area (shows current face)
      - Level (number) and multiplier (Decimal formatted)
      - Level-up button (cost shown)
      - Animation unlock indicator (star / padlock)
- Right: Controls panel
  - Big "Roll" button (primary CTA)
  - Autoroll section:
    - Toggle enable
    - Cooldown / speed display
    - Upgrade button for autoroll (cost shown)
  - Recent earnings feed (floating popups aggregated)
  - Global upgrades (placeholder)

Component Behavior & States
---------------------------
Die state:
- locked: boolean — shows lock overlay and unlock button (cost Decimal)
- unlocked: shows face, level, multiplier
- level: integer — increases multiplier by configured growth
- animationLevel: integer — 0 means no animation (static), higher levels increase animation richness
- multiplier: Decimal — base * growth^level

Actions:
- Unlock die: spend credits to set locked=false
- Level up: spend credits, increment level, update multiplier
- Roll (global): for each unlocked die generate face (1–6), compute face * multiplier, sum across dice, add to credits
- Autoroll: when enabled, automatically triggers Roll on a cooldown. Upgrades reduce cooldown.

Visual feedback:
- Dice show rolling animation for 800ms (duration can vary per die animation level)
- Floating "+X credits" popup per roll aggregated at the top-right of the dice card
- Roll button disabled visually while a roll animation is active (unless autoroll allows concurrent)

Number Handling (Decimal)
--------------------------
- All numeric values use Decimal (from @Patashu/break_eternity.js) in production.
- Save serialization: store Decimal values as strings (Decimal.toString())
- UI formatting: show human-friendly suffixes (K, M, B, etc.) for readability; show full on hover.

Layout & Responsive rules
-------------------------
- Desktop: grid 3 columns, 2 rows (dice) + control sidebar
- Tablet: 2 columns (dice) + controls beneath or in a flyout
- Mobile: single column stacked, roll button pinned to bottom
- Animations disabled or simplified at low frame-rates or in battery-saver mode

Colors & Typography
-------------------
- Primary accent: #6C5CE7 (violet)
- Secondary: #00B894 (green)
- Background: dark (#0F1724) with subtle gradients
- Card background: slightly lighter (glassmorphism with blur)
- Fonts: Inter or system sans-serif
- Clear visual hierarchy; large credits, prominent roll CTA

Accessibility
-------------
- Buttons with aria-labels
- Keyboard focus states for Roll and level up
- Color contrast checked for accessibility (WCAG AA)
- Prefer reduced-motion setting respected

Assets & Animations
-------------------
- Placeholder dice faces use simple SVG / CSS squares in prototype.
- Replace with sprite or canvas animations for richer visuals.
- Progressive unlocks for animation:
  - Level 0: static face
  - Level 1: fade/flip
  - Level 2: faster spin + blur trail
  - Level 3: 3D-like spin using transform + shadow

Integration Notes
-----------------
- Replace the mock Decimal in the prototype with:
  import { Decimal } from '@Patashu/break_eternity.js'
- Keep all arithmetic in Decimal.
- Provide utilities: toDecimal(x), fromDecimalString(s), formatDecimal(dec, options)
- Use requestAnimationFrame for roll animations and debounce UI updates for high autoroll rates.
- Persist game state (player credits, dice states, autoroll level) to localStorage with Decimal strings.

Prototype goals
---------------
- Validate layout and UX flows (unlock, level-up, roll, autoroll)
- Provide simple visual feedback to tune pacing and feel
- Useful as a reference for building React components or canvas animations

Next steps
----------
- Replace mock Decimal with actual Decimal import.
- Add persistence and offline accrual.
- Convert prototype to React/TS components and wire to game logic.
- Add polish: sound, particle effects, animation frames, playtesting adjustments.
```

<!-- markdownlint-disable-file -->