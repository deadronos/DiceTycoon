# Requirements Log

## 2025-11-06 – Header credits accessibility & build health

1. **WHEN** the header renders the primary credits summary, **THE SYSTEM SHALL** expose the element with a unique, accessible label that distinguishes it from other credit-related statistics. _Acceptance: UI tests can query a single element representing current credits without ambiguity._
2. **WHEN** the automated unit test suite is executed with `npm run test`, **THE SYSTEM SHALL** complete successfully with exit code `0`. _Acceptance: Vitest finishes without failing assertions._
3. **WHEN** the lint task runs via `npm run lint`, **THE SYSTEM SHALL** report no linting errors. _Acceptance: ESLint exits with code `0`._
4. **WHEN** the TypeScript type checker is executed with `npm run typecheck`, **THE SYSTEM SHALL** complete without type errors. _Acceptance: `tsc --noEmit` exits with code `0`._
