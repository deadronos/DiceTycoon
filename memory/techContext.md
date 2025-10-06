# Technical Context

## Technologies

- TypeScript, React, Vite
- @patashu/break_eternity.js for Decimal math (required)
- Vitest + Testing Library for unit and UI tests

## Local development

- Install dependencies: `npm install`
- Run dev server: `npm run dev` (Vite)
- Run tests: `npm test` or `npm run test:watch`

## Build and CI

- Production build: `npm run build`
- CI should run linting and `npm test`.

## Important constraints

- Use Decimal for all game numeric logic; persist Decimal values as strings.
- Use crypto.getRandomValues for dice randomness where possible.
