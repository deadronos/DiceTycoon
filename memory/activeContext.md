# Active Context

## Current focus (2025-10-06)

- Initialize the project's Memory Bank by creating core memory files and a tasks index.
- Ensure files follow repository markdown standards and the memory-bank templates.

## Recent changes

- Added `projectbrief.md` and `productContext.md`.
- Created `memory/tasks/_index.md` and `memory/tasks/TASK001-initialize-memory-bank.md`.
- Added design documents under `memory/designs/`:
  - `D001-core-gameplay.md` — Core gameplay formula, die model, leveling and acceptance tests
  - `D002-persistence.md` — Save/load format, versioning, migration, and safe storage APIs
  - `D003-autoroll.md` — Autoroll model, upgrades, batching, and performance considerations
  - `D004-numeric-safety.md` — Decimal usage rules, formatting, and performance guidance
  - `DEC001-serialization-decision.md` — Decision record for serialization/Decimal strategy

## Next steps

- Populate `progress.md` with an initial entry and review it with the team.
- Continue to add task entries for feature work and store design artifacts under `memory/designs/`.

## Decisions & Open Questions

- Decision: Use H1 for top-level memory file headings to satisfy repository linter rules.
- Open: Whether to backfill historical tasks into `memory/tasks/COMPLETED`.
