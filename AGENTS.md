# Repository Guidelines

## Project Structure & Module Organization
Dice Tycoon UI lives under `src/` with the entry in `main.tsx` and the core board logic in `App.tsx`. UI atoms and panels belong in `src/components/`, shared math in `src/utils/`, and domain contracts in `src/types/`. Tests mirror these modules inside `tests/` plus `tests/components/` for rendering checks, bootstrapped by `tests/setupTests.ts`. Vendorized exponential-arithmetic helpers stay inside `libs/@patashu/`. Static deliverables and knowledge bases live in `docs/`, `memory/`, and `milestones/`; rebuild `docs/` via the provided script instead of editing `dist/` directly.

## Build, Test, and Development Commands
Use `npm run dev` for the Vite dev server and hot reload. `npm run build` emits the production bundle into `dist/`, while `npm run preview` serves that bundle locally. Run `npm run test` for the Vitest suite, `npm run typecheck` before PRs, and `npm run lint` or `npm run lint:fix` to enforce ESLint rules. Documentation hosting uses `npm run build:docs` (or `npm run update-docs`); the `npm run deploy` helper rebuilds docs and pushes the generated site.

## Coding Style & Naming Conventions
This repo is TypeScript-first with React 19. Follow Prettier (`tabWidth: 2`, `singleQuote: true`, `printWidth: 80`, trailing commas) and keep files formatted via your editor or `npx prettier --write`. React components and hooks use PascalCase (`PrestigePanel.tsx`) and camelCase (`usePrestigeStore`). Favor descriptive names that match in-game concepts; keep derived values pure and colocate styles in `styles.css` until a module split is planned. ESLint already warns on unused or `any` heavy code and restricts console usage.

## Testing Guidelines
Vitest with jsdom powers the suite; Testing Library assertions are preloaded via `@testing-library/jest-dom`. Name files `*.test.ts` for logic and `*.spec.tsx` for UI workflows (see `tests/prestige-shop.spec.ts`). Expand coverage for prestige, storage, and import/export flows before merging features. Run `npm run test -- --runInBand` in CI-like environments, and snapshot user-facing calculations whenever balance tables change.

## Commit & Pull Request Guidelines
Follow the short `scope: summary` convention visible in `git log` (`balance:`, `docs:`). Keep the subject in present tense and describe the gameplay lever touched. PRs must include: what changed, why, how to validate (`npm run dev`, test IDs, or screenshots for UI shifts), and linked issues or design docs (`memory/` cards, `SUGGESTED_IMPROVEMENTS.md` items). Rebase onto `main`, ensure green lint/test/typecheck runs, and attach screenshots whenever styles move.

## Documentation & Knowledge Base
Before large refactors, read `high-level-overview.md`, `PROJECT-REQUIREMENTS.md`, and the `memory/` narratives. Update `game-balance-report.md` or add notes under `docs/` when altering multipliers so downstream agents keep simulation assumptions aligned.
