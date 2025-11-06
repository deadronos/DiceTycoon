# Technical Context

## Technologies

- TypeScript, React, Vite (ESM)
- Vendored Decimal implementation: `libs/@patashu/break_eternity.js` (imported in code as `@patashu/break_eternity.js`)
- Vitest + Testing Library for unit and UI tests

## Tooling & dev scripts

- Install dependencies: `npm install` (project relies on both npm packages and the local `libs/` vendor folder)
- Dev server: `npm run dev` (Vite)
- Run tests: `npm run test` (Vitest)
- Typecheck: `npm run typecheck` (tsc --noEmit)
- Lint: `npm run lint` (eslint)
- Build docs (site): `npm run build:docs` and `npm run deploy` convenience script for pushing docs

## Build and CI

- Production build: `npm run build` (Vite build)
- Recommended CI steps: `npm ci && npm run typecheck && npm run lint && npm run test && npm run build`

## Test config

- Vitest is configured in `package.json` to run tests in a `jsdom` environment and uses `tests/setupTests.ts` to configure DOM helpers and matchers.

## Important constraints

- Use Decimal for all game numeric logic; persist Decimal values as strings (see `src/utils/decimal.ts` and `src/utils/storage.ts`).
- The canonical storage key is `dicetycoon.gamestate.v2` (defined in `src/utils/constants.ts`).
- Prefer `crypto.getRandomValues` (used in `src/utils/decimal.ts::rollDie()`) for randomness when available.

## Notes for maintainers

- The project contains a local `libs/@patashu/break_eternity.js/` folder. When updating dependencies, ensure tests still run in CI where the vendor folder may be present or absent.
- Keep `tests/` up to date when refactoring component APIs; many tests query ARIA roles and labels (see `tests/components/header.test.tsx`).
