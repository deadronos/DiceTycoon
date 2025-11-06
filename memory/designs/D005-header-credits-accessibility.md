# D005 – Header Credits Accessibility & Build Health

**Date:** 2025-11-06  
**Status:** Draft  
**Owner:** GitHub Copilot (GPT-5-Codex Preview)

## 1. Summary

- Fix the failing header test introduced by additional credit-related copy in the UI.  
- Provide an accessible, uniquely identifiable container for the live credits total so that automated tests and assistive tech can both target it reliably.  
- Ensure the build health scripts (`npm run test`, `npm run lint`, `npm run typecheck`) complete successfully.

## 2. Architecture & Component Interactions

- `App.tsx` renders the header and passes the live `Decimal` credits value to `CreditsDisplay`.
- `CreditsDisplay` is a presentational component that formats the number via `formatShort` and currently renders a bare `<div>` with visible text.
- Vitest test `tests/components/header.test.tsx` mounts `App` and asserts on the presence of the credits display through a text query.

**Changes:**

1. Enhance `CreditsDisplay` to expose an accessibility surface:  
   - Set `role="status"` and `aria-live="polite"` for live updates.  
   - Introduce a deterministic `aria-label` (default `"Current Credits"`) coupled with the formatted value for screen readers.  
   - Keep inner visual text identical while marking decorative spans with `aria-hidden` when appropriate.
2. Extend component props to accept an optional `label` to maintain flexibility for future contexts while defaulting to the main header label.  
3. Update `App.tsx` usages if custom labels are needed (not expected for MVP; default suffices).  
4. Update `header.test.tsx` to query by role/name instead of ambiguous text.

## 3. Data Flow

- `GameState.credits` (Decimal) → `CreditsDisplay` props → `formatShort` string.  
- Accessibility metadata stays static except for dynamic aria-label string that concatenates label + formatted credits.

## 4. Interfaces & Schemas

- `CreditsDisplayProps`
  - `credits: DecimalType` (existing)
  - `label?: string` (new; defaults to `"Current Credits"`).

- Component renders:

  ```html
  <div class="credits-display" role="status" aria-live="polite" aria-label="{label}: {formatted}">
    <span aria-hidden="true">💰 {formatted}</span>
    <span class="sr-only">{label}: {formatted}</span>
  </div>
  ```

  (Exact markup subject to implementation; goal is to keep visual formatting while providing accessible text.)

## 5. Error Handling Matrix

| Scenario | Likelihood | Impact | Handling Strategy |
| --- | --- | --- | --- |
| `credits` prop undefined/null | Low | High | TypeScript typing enforces Decimal; guard via PropTypes not needed. |
| Formatting throws (unexpected Decimal state) | Very Low | High | `formatShort` already handles Decimal; no additional handling planned. |
| `label` provided as empty string | Low | Medium | Fallback to default label before rendering; ensure string trim. |
| Test queries remain ambiguous | Medium | High | Switch to role/name query; verify unique match via unit test. |
| ESLint/TypeScript regressions after prop change | Medium | High | Run lint/typecheck; update types/imports as needed. |

## 6. Testing Strategy

- Update `tests/components/header.test.tsx` to assert `screen.getByRole('status', { name: /Current Credits/ })` and verify formatted value.
- Consider adding focused test for `CreditsDisplay` component (unit) if coverage is lacking; optional if existing tests cover semantics.
- Full regression via `npm run test`, `npm run lint`, `npm run typecheck`.

## 7. Task Breakdown

1. Update `CreditsDisplay` component to add accessible metadata and optional label prop.  
2. Adjust `App.tsx` imports/usages if interface changes.  
3. Modify `header.test.tsx` expectations to use the new role/name query.  
4. Re-run tests, lint, typecheck; resolve any regressions.  
5. Document verification results and update Memory Bank progress entries.

## 8. Open Questions

- None at this time.

## 9. Decision Log

- Opted for accessibility-first approach (role/status with aria-live) rather than test-only attributes to benefit both automated testing and end users.
