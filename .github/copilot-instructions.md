# DiceTycoon Task Manager

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

DiceTycoon is a single-page static web application for task management built with vanilla HTML, CSS, and JavaScript. The app stores data client-side in localStorage and requires no backend or build pipeline by default.

## Working Effectively

### Initial Setup
- Install dependencies: `npm install` -- takes ~3 seconds. Set timeout to 30+ seconds.
- Validate setup: `npm run validate` -- takes ~2 seconds. Set timeout to 30+ seconds.

### Development
- Start development server: `npm start` or `npm run dev` -- starts immediately, serves on http://localhost:8000
- Always run `npm run validate` before committing changes to ensure code passes CI checks

### Code Quality
- Lint JavaScript and HTML: `npm run lint` -- takes ~1 second. Set timeout to 30+ seconds.
- Fix linting issues: `npm run lint:fix` -- takes ~2 seconds. Set timeout to 30+ seconds.
- Check code formatting: `npm run format:check` -- takes ~1 second. Set timeout to 30+ seconds.
- Fix formatting: `npm run format` -- takes ~2 seconds. Set timeout to 30+ seconds.
- Validate all quality checks: `npm run validate` -- runs lint and format:check. Takes ~2 seconds. Set timeout to 30+ seconds.

## Validation

### Manual Testing Requirements
Always manually test the application after making changes. Complete this validation scenario:

1. Start the development server: `npm start`
2. Open http://localhost:8000 in a browser
3. Add at least 2 tasks using the task input form
4. Mark one task as completed by clicking its checkbox
5. Test all filter buttons: All, Active, Completed
6. Test theme toggle (moon/sun icon in header)
7. Delete a task using the Delete button
8. Refresh the page to verify localStorage persistence
9. Verify the task count updates correctly throughout

The application must be fully functional - simply starting the server is NOT sufficient validation.

### Automated Validation
- Always run `npm run validate` before committing - this ensures ESLint and Prettier checks pass
- The CI pipeline (.github/workflows) will fail if code doesn't pass these checks

## Key Architecture

### File Structure
```
.
├── index.html          # Main HTML page with semantic markup
├── styles.css          # CSS with CSS custom properties for theming
├── app.js              # JavaScript application logic
├── package.json        # NPM dependencies and scripts
├── .eslintrc.json      # ESLint configuration
├── .prettierrc.json    # Prettier configuration
├── .github/
│   └── copilot-instructions.md
└── node_modules/       # Dependencies (do not commit)
```

### Core DOM Elements (defined in index.html)
- `#task-form` - Form for adding new tasks
- `#task-input` - Input field for task text
- `#tasks` - Container for task list items
- `#task-count` - Display of remaining task count
- `#empty-note` - Empty state message
- `#announcer` - Screen reader announcements
- `.filter-btn` - Filter buttons with data-filter values: `all|active|completed`
- `#theme-toggle` - Theme switching button

### Application State
- Tasks stored in localStorage with key `dicetycoon.tasks.v1`
- Theme preference stored with key `dicetycoon.theme.v1`
- All localStorage access wrapped in try/catch via `safeLoad()` and `safeSave()` functions

## Code Style Guidelines

### JavaScript
- Use const/let (no var)
- Prefer single quotes for strings
- Use semicolons consistently
- Keep functions small and single-responsibility
- Use camelCase for variables
- Use UPPER_SNAKE_CASE for constants (STORAGE_KEY, THEME_KEY)

### HTML/CSS
- Use kebab-case for file names, DOM IDs, and CSS classes
- Use 2-space indentation
- Semantic HTML markup
- CSS custom properties for theming

### Safe localStorage Pattern (required)
Always use these helper functions for localStorage access:
```javascript
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
```

## Important Notes
- No server-side build pipeline required - runs directly in browser
- App state managed entirely client-side
- Theme persistence and task data survive page refreshes
- Responsive design with mobile-first approach
- Accessibility features including screen reader support


