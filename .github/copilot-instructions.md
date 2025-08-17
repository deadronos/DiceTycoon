# DiceTycoon - Dice Rolling Game Instructions

## Purpose
Short, actionable guidance so an AI coding agent (and humans) can be immediately productive in this dice rolling game repository.

## Project Overview
DiceTycoon is a dice rolling game implemented as a single-page static web application.

**Architecture:**
- Single-page static web app: `index.html`, `styles.css`, `app.js`. No server or build pipeline by default.
- Game state is client-side and persisted in `localStorage` for player progress and preferences.
- Focus on dice mechanics, game progression, and player interaction.

## Code Style
- Use 2-space indentation.
- Use semicolons consistently.
- Prefer single quotes for JS strings; double quotes allowed in HTML.
- Prefer const/let (no var).
- Keep functions small and single-responsibility.
- Run Prettier and ESLint before committing. Example devDependencies:
  - eslint, prettier, eslint-config-prettier, eslint-plugin-html
- Example .eslintrc / .prettierrc should be added in a follow-up PR.

## Naming Conventions
- Files: kebab-case (e.g., `app.js`, `styles.css`).
- JS variables: camelCase.
- Constants: UPPER_SNAKE_CASE (STORAGE_KEY, THEME_KEY).
- DOM ids: kebab-case (e.g., `dice-container`, `roll-button`).
- Data keys in localStorage: include a version suffix (e.g., `.v1`) to indicate shape changes.

## Key files & DOM conventions
- `index.html`: semantic markup for dice game interface
- `app.js`: single source of game behavior. Important patterns:
  - `render()` drives DOM updates; avoid ad-hoc DOM mutations outside it.
  - Game state management for dice rolls, player progress, scoring
- Expected DOM elements for dice game functionality:
  - Game area: `#game-container`, `#dice-container`
  - Controls: `#roll-button`, `#reset-button`
  - Display: `#score-display`, `#roll-history`
  - Settings: `#theme-toggle`

## Game Development Guidelines
- Implement fair dice rolling mechanics with proper randomization
- Maintain game state consistency across browser sessions
- Provide clear visual feedback for dice rolls and game events
- Ensure responsive design for various screen sizes
- Include accessibility features for keyboard navigation

## Safe localStorage access (required)
- Wrap all localStorage reads/writes in try/catch and keep a single helper module. Example:
````javascript
// Example localStorage wrapper (use in app.js)
const STORAGE_KEY = 'dicetycoon.gamestate.v1';
const THEME_KEY = 'dicetycoon.theme.v1';

function safeLoad(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.error('Load failed', key, err);
    return fallback;
  }
}
function safeSave(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('Save failed', key, err);
  }
}
````

## Development Notes
- Refer to PROJECT-REQUIREMENTS.md for specific game mechanics and rules when available
- Implement dice rolling with proper randomization (e.g., crypto.getRandomValues when available)
- Consider game balance and player progression mechanics
- Test dice probability distributions to ensure fairness


