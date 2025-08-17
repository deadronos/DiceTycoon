# DiceTycoon Task Manager - Development Instructions

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

DiceTycoon is a single-page static web application built with vanilla HTML, CSS, and JavaScript. It's a task management app with localStorage persistence, theme switching, and task filtering capabilities.

## Working Effectively

### Bootstrap and Setup
Run these commands in sequence to set up the development environment:

```bash
# Install dependencies (takes ~1 minute, NEVER CANCEL)
npm install

# Validate code quality and formatting (takes ~1 second)
npm run validate
```

Set explicit timeout of 3+ minutes for `npm install` commands.

### Development Server
Start the development server:
```bash
# Start development server on port 8000
npm run dev
```
Access the application at `http://localhost:8000/`

### Code Quality Tools
ALWAYS run these commands before committing changes:
```bash
# Format code automatically
npm run format

# Check code quality and formatting
npm run validate

# Individual commands:
npm run lint          # ESLint check (~1 second)
npm run format:check  # Prettier format check (~1 second)
```

## Validation Requirements

### Manual Testing Scenarios
ALWAYS run through these complete end-to-end scenarios after making changes:

1. **Task Management Flow**:
   - Add multiple tasks using the input field
   - Mark tasks as complete/incomplete using checkboxes
   - Delete tasks using the × button
   - Verify task count updates correctly

2. **Filtering and State**:
   - Test All/Active/Completed filter buttons
   - Verify each filter shows correct tasks
   - Check that filter buttons highlight correctly

3. **Theme and Persistence**:
   - Toggle between light and dark themes using the 🌙/☀️ button
   - Refresh the page to verify tasks and theme persist
   - Clear localStorage and verify empty state shows correctly

4. **Accessibility**:
   - Test keyboard navigation with Tab key
   - Use Alt+N to focus on new task input
   - Use Alt+T to toggle theme
   - Verify screen reader announcements work

### Browser Testing
Use these exact commands to test in browser:
```bash
# Start server
npm run dev

# In browser, navigate to http://localhost:8000/
# Complete all manual testing scenarios above
```

## Application Architecture

### Core Files
- `index.html`: Main HTML structure with semantic markup
- `styles.css`: CSS with CSS custom properties for theming
- `app.js`: Application logic with state management
- `package.json`: Dependencies and npm scripts
- `.eslintrc.json`: ESLint configuration
- `.prettierrc.json`: Prettier configuration

### Key DOM Elements
The JavaScript expects these specific DOM IDs:
- `#task-form`: Form for adding new tasks
- `#task-input`: Input field for task text
- `#tasks`: Container for task list
- `#task-count`: Display for active task count
- `#empty-note`: Empty state message
- `#announcer`: Screen reader announcements
- `.filter-btn`: Filter buttons with data-filter attributes (`all`, `active`, `completed`)
- `#theme-toggle`: Theme switching button

### State Management
- Tasks stored in localStorage with key: `dicetycoon.tasks.v1`
- Theme stored in localStorage with key: `dicetycoon.theme.v1`
- All localStorage access wrapped in try/catch blocks via `safeLoad()` and `safeSave()` functions
- Application state managed through `render()` function - avoid ad-hoc DOM mutations

## Code Style Requirements

### JavaScript Standards
- Use 2-space indentation
- Use semicolons consistently
- Prefer single quotes for strings
- Use const/let (no var)
- Keep functions small and single-responsibility
- Follow camelCase for variables, UPPER_SNAKE_CASE for constants

### CSS Standards
- Use CSS custom properties for theming
- Follow kebab-case for class names and IDs
- Maintain responsive design principles
- Support both light and dark themes

### HTML Standards
- Use semantic HTML elements
- Include proper ARIA labels and roles
- Maintain accessibility best practices

## Common Tasks Reference

### Repository Structure
```
/home/runner/work/DiceTycoon/DiceTycoon/
├── .github/
│   ├── copilot-instructions.md
│   └── chatmodes/
├── index.html          # Main HTML file
├── styles.css          # Main stylesheet
├── app.js             # Main JavaScript file
├── package.json       # Dependencies and scripts
├── .eslintrc.json     # ESLint configuration
├── .prettierrc.json   # Prettier configuration
└── node_modules/      # Dependencies (after npm install)
```

### Available npm Scripts
```bash
npm run dev           # Start development server (python3 -m http.server 8000)
npm run lint          # Run ESLint
npm run format        # Format code with Prettier
npm run format:check  # Check code formatting
npm run validate      # Run both formatting check and linting
```

### Common Development Workflow
1. Make code changes
2. Run `npm run format` to auto-format
3. Run `npm run validate` to check quality
4. Start `npm run dev` to test changes
5. Complete manual validation scenarios
6. Commit changes

### Timing Expectations
- `npm install`: ~1 minute (first time), ~1 second (subsequent)
- `npm run validate`: ~1 second
- `npm run dev`: Starts immediately
- Manual testing: ~2-3 minutes for complete scenarios

NEVER CANCEL any npm commands - they complete quickly (under 2 minutes).

### Troubleshooting
- If server port 8000 is busy: `pkill -f "python3 -m http.server"` then restart
- If localStorage seems corrupted: Clear browser data and refresh
- If formatting fails: Check for syntax errors with `npm run lint`
- If dependencies missing: Run `npm install` again


