---
phase: 01-foundations-storybook
plan: 05
subsystem: design-system
tags: [react-native, penpot, design-tokens, spacing, radii, dimensions]
requires:
  - phase: 01-foundations-storybook-03
    provides: Revision-292 validated Penpot foundation manifest
  - phase: 01-foundations-storybook-04
    provides: Immutable token and provenance conventions
provides:
  - Exact immutable spacing, radius, dimension, border-width, and opacity token contracts
  - Single re-export-only public boundary for all seven foundation categories
  - Exhaustive manifest-order, normalization, provenance, and barrel-identity regression tests
affects: [01-06-foundation-gallery, phase-02-components]
actuals:
  tokens: 3182
  tasks: 3
  commits: 5
tech-stack:
  added: []
  patterns: [source-backed immutable scalar tokens, lower-camel semantic normalization, re-export-only public barrel]
key-files:
  created: [src/design-system/tokens/spacing.ts, src/design-system/tokens/radii.ts, src/design-system/tokens/dimensions.ts, src/design-system/tokens/borders.ts, src/design-system/tokens/opacity.ts, src/design-system/tokens/index.ts, tests/scale-tokens.test.ts]
  modified: []
key-decisions:
  - "Normalize Penpot scalar names to lower camel case by splitting only on non-alphanumeric runs, preserving numeric segments exactly."
  - "Reject normalized-name collisions through exhaustive manifest tests instead of inventing arbitrary aliases."
  - "Keep the public token boundary re-export-only so direct modules and barrel imports retain object identity."
patterns-established:
  - "Each scalar module exports one frozen value object, a derived key type, and a parallel frozen source map."
  - "Scalar ordering follows manifest code-point order even when numeric suffixes are not numerically sorted."
requirements-completed: [PNPT-02, FNDT-03]
duration: 12m
completed: 2026-09-18
status: complete
---

# Phase 01 Plan 05: Foundation Scale Tokens Summary

**All 21 authored Penpot scalar values now ship as immutable, provenance-backed React Native tokens through one identity-preserving public boundary.**

## Performance

- **Duration:** 12 minutes
- **Completed:** 2026-09-18
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments

- Published 8 spacing, 6 radius, 4 dimension, 2 border-width, and 1 opacity token in exact revision-292 manifest order.
- Retained the authoritative design name, source node, file, page, and revision beside every scalar value.
- Added one re-export-only barrel for colors, typography, spacing, radii, dimensions, borders, opacity, font assets, and all related types and provenance maps.
- Locked exact counts, values, ordering, freezing, semantic normalization, collision rejection, provenance, boundary values, and barrel object identity into regression tests.

## Task Commits

1. **Task 1 RED: Add failing layout scale contract tests** — `f1d5f63` (test)
2. **Task 1 GREEN: Publish layout scale tokens** — `d2f148b` (feat)
3. **Task 2 RED: Add failing border and opacity contract tests** — `86baba9` (test)
4. **Task 2 GREEN: Publish border and opacity tokens** — `635ce6d` (feat)
5. **Task 3: Publish foundation token barrel** — `bccd49b` (feat)

## Files Created/Modified

- `src/design-system/tokens/spacing.ts` — exact 8-token spacing scale and provenance.
- `src/design-system/tokens/radii.ts` — exact 6-token radius scale and provenance.
- `src/design-system/tokens/dimensions.ts` — exact 4-token control/icon dimension scale and provenance.
- `src/design-system/tokens/borders.ts` — exact 2-token border-width scale and provenance.
- `src/design-system/tokens/opacity.ts` — exact disabled-opacity token and provenance.
- `src/design-system/tokens/index.ts` — re-export-only public foundation boundary.
- `tests/scale-tokens.test.ts` — exhaustive scalar and barrel contract suite.

## Decisions Made

- Scalar keys use a deterministic lower-camel transformation of the complete Penpot name: split on non-alphanumeric runs, lowercase the first character, capitalize subsequent segment initials, and preserve numeric segments.
- Source record order remains authoritative. For example, `space4` follows `space32` because the validated manifest uses code-point ordering, not numeric sorting.
- The barrel contains exports only and never restates token values; tests compare every exported object to its direct-module identity.

## Deviations from Plan

None — the plan executed exactly as written.

## Verification

- Penpot evidence validator passes with exact counts: 15 colors, 9 typography styles, 8 spacing, 6 radii, 4 dimensions, 2 border widths, and 1 opacity.
- Both focused token suites pass: 16 tests.
- Full repository suite passes: 22 tests across 4 suites.
- Strict TypeScript and Expo lint pass.

## Known Stubs

None.

## Threat Review

- Exact ordered manifest equality, collision checks, and one-to-one source maps mitigate token tampering and ambiguous normalization.
- No packages, network endpoints, authentication paths, file-access behavior, or schema boundaries were added.

## Next Phase Readiness

- Plan 01-06 can consume every foundation category exclusively from `src/design-system/tokens` when rendering the Storybook foundation gallery.
- Exact source provenance is available for gallery labels and later native comparison evidence.

## Self-Check: PASSED

- All seven implementation/test artifacts and this summary exist.
- Task commits `f1d5f63`, `d2f148b`, `86baba9`, `635ce6d`, and `bccd49b` exist in repository history.
- Evidence validation, focused and full tests, strict TypeScript, and lint all pass.

---
*Phase: 01-foundations-storybook*
*Completed: 2026-09-18*
