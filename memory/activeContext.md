# Active Context

## Current focus (2025-10-30)

- Maintain and extend the Memory Bank so it remains the single source of truth for project context and tasks.
- Ensure design documents under `memory/designs/` are discoverable and linked from tasks when relevant.
- Add routine validation tasks that keep the Memory Bank up to date as the codebase evolves.

## Recent changes

- Initial Memory Bank created (2025-10-06): `projectbrief.md`, `productContext.md`, `activeContext.md`, `systemPatterns.md`, `techContext.md`, `progress.md`.
- Added and refined design documents under `memory/designs/`:
  - `D001-core-gameplay.md` — Core gameplay formula, die model, leveling and acceptance tests
  - `D002-persistence.md` — Save/load format, versioning, migration, and safe storage APIs
  - `D003-autoroll.md` — Autoroll model, upgrades, batching, and performance considerations
  - `D004-numeric-safety.md` — Decimal usage rules, formatting, and performance guidance
  - `DEC001-serialization-decision.md` — Decision record for serialization/Decimal strategy
  - `DECIMAL_GUIDE.md` — Expanded Decimal guidelines and examples (editorial)

## Next steps

- Validation task `TASK003` was executed on 2025-10-30 and the Memory Bank was synchronized (see progress log).
- Continue adding design and task artifacts as features are implemented; link tasks to designs where applicable.
- Periodically review Memory Bank files for accuracy after significant merges or refactors.

## Decisions & Open Questions

- Decision: Use H1 for top-level memory file headings to satisfy repository linter rules.
- Open: Whether to archive completed tasks under `memory/tasks/COMPLETED` or keep them inline in `_index.md` (team preference).
