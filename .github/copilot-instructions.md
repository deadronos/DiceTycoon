# Project general coding guidelines

## Purpose
Short, actionable guidance so an AI coding agent (and humans) can be immediately productive in this repo.

Big picture
- Single-page static web app: `index.html`, `styles.css`, `app.js`. No server or build pipeline by default.
- App state is client-side and persisted in `localStorage` (see `app.js` STORAGE_KEY/THEME_KEY).

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
- DOM ids: kebab-case (e.g., `task-form`).
- Data keys in localStorage: include a version suffix (e.g., `.v1`) to indicate shape changes.

## Key files & DOM conventions
- `index.html`: semantic markup and the DOM IDs/classes the JS expects:
  - `#task-form`, `#task-input`, `#tasks`, `#task-count`, `#empty-note`, `#announcer`, `.filter-btn` (data-filter values: `all|active|completed`), `#theme-toggle`.
- `app.js`: single source of behavior. Important patterns:
  - `render()` drives DOM updates; avoid ad-hoc DOM mutations outside it.

## Safe localStorage access (required)
- Wrap all localStorage reads/writes in try/catch and keep a single helper module. Example:
````javascript
// Example localStorage wrapper (use in app.js)
const STORAGE_KEY = 'dicetycoon.tasks.v1';
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


