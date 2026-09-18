---
phase: 02-primitives-assets-and-component-contracts
plan: 02
subsystem: design-system
tags: [react-native, primitives, design-tokens, accessibility, tdd]
requires:
  - phase: 01-foundations-storybook
    provides: Immutable Penpot-backed colors, typography, spacing, radii, and border tokens
provides:
  - Guarded token-backed Text, Stack, Inline, and Surface primitives
  - Narrow identity-preserving primitive and root design-system barrels
  - Exact token, style ownership, child ordering, Unicode, and semantic contract tests
affects: [02-03-assets-and-pressable, phase-03-components, phase-04-components]
actuals:
  tokens: 6557
  tasks: 3
  commits: 6
tech-stack:
  added: []
  patterns: [caller-layout-first invariant-style-last, closed token props, runtime style tamper guards]
key-files:
  created: [src/design-system/primitives/Text.tsx, src/design-system/primitives/Stack.tsx, src/design-system/primitives/Inline.tsx, src/design-system/primitives/Surface.tsx, src/design-system/primitives/styleGuards.ts, src/design-system/primitives/index.ts, src/design-system/index.ts, tests/primitive-contracts.test.tsx]
  modified: []
key-decisions:
  - "Primitive style props admit only a small Pick-based layout correction surface; development and tests flatten arrays and registered styles before rejecting every other key."
  - "Stack and Inline default to space16 gap, while Surface defaults to the authored surface color and space16 padding; every other visual value remains an explicit existing token."
  - "Presentational primitives pass through native accessibility props but never infer a role; Text preserves native scaling and content semantics."
patterns-established:
  - "Resolve all cast/runtime token inputs through own-property membership checks with explicit supported-value diagnostics."
  - "Apply caller layout styles first and immutable token-owned visual styles last."
requirements-completed: [PRIM-01, QUAL-01, QUAL-05, QUAL-07]
coverage:
  - id: D1
    description: "Text, Stack, Inline, and Surface resolve every supported token to its exact existing React Native value and reject unsupported runtime values."
    requirement: PRIM-01
    verification:
      - kind: unit
        ref: "tests/primitive-contracts.test.tsx#Text primitive, layout primitives, and Surface primitive"
        status: pass
      - kind: integration
        ref: "npm test -- --runInBand"
        status: pass
    human_judgment: false
  - id: D2
    description: "Public primitive props and re-export-only barrels expose only bounded token-backed contracts while retaining direct component and token identities."
    requirement: QUAL-01
    verification:
      - kind: unit
        ref: "tests/primitive-contracts.test.tsx#design-system primitive public boundaries"
        status: pass
      - kind: integration
        ref: "npm run typecheck"
        status: pass
    human_judgment: false
  - id: D3
    description: "Native accessibility props pass through without inferred roles, hidden content, child merging, or Unicode normalization."
    requirement: QUAL-05
    verification:
      - kind: unit
        ref: "tests/primitive-contracts.test.tsx#semantic pass-through and child boundary tests"
        status: pass
    human_judgment: false
  - id: D4
    description: "Text leaves native font scaling enabled, adds no default maximum multiplier, and preserves long or Unicode content without truncation logic."
    requirement: QUAL-07
    verification:
      - kind: unit
        ref: "tests/primitive-contracts.test.tsx#passes Unicode, native accessibility props, and default scaling through untouched"
        status: pass
    human_judgment: false
duration: 8min
completed: 2026-09-18
status: complete
---

# Phase 02 Plan 02: Token-backed Primitive Contracts Summary

**Four React Native composition primitives now enforce exact source tokens, bounded layout corrections, invariant visual ownership, and untouched native semantics.**

## Performance

- **Duration:** 8 minutes
- **Started:** 2026-09-18T12:48:17Z
- **Completed:** 2026-09-18T12:56:00Z
- **Tasks:** 3
- **Files modified:** 8

## Accomplishments

- Published `Text`, `Stack`, `Inline`, and `Surface` with closed token props and explicit runtime rejection instead of fallbacks.
- Protected typography, color, direction, spacing, padding, background, border, radius, shadow, and elevation ownership while retaining a small typed layout escape hatch.
- Proved all inherited tokens, registered/array style guards, zero/one/many children, adjacent equal content, Unicode, native accessibility pass-through, scaling defaults, and barrel identities in 130 primitive contract tests.
- Kept runtime primitives free of Penpot evidence, navigation, storage, networking, product modules, and new packages.

## Task Commits

Each task was committed atomically through its TDD gates:

1. **Task 1 RED: Add failing Text contracts** - `af75942` (test)
2. **Task 1 GREEN: Implement guarded Text** - `09261dd` (feat)
3. **Task 2 RED: Add failing layout contracts** - `876c98d` (test)
4. **Task 2 GREEN: Implement Stack and Inline** - `254e6b2` (feat)
5. **Task 3 RED: Add failing Surface and barrel contracts** - `adacdac` (test)
6. **Task 3 GREEN: Implement Surface and public barrels** - `2ed1abf` (feat)

## Files Created/Modified

- `src/design-system/primitives/styleGuards.ts` - Own-property token resolution, flattened style validation, and shared layout boundaries.
- `src/design-system/primitives/Text.tsx` - Exact typography/color primitive with native text and accessibility pass-through.
- `src/design-system/primitives/Stack.tsx` - Fixed-column token-backed layout primitive.
- `src/design-system/primitives/Inline.tsx` - Fixed-row layout primitive with explicit boolean wrapping.
- `src/design-system/primitives/Surface.tsx` - Token-backed background, padding, radius, and border container without shadow/elevation.
- `src/design-system/primitives/index.ts` - Narrow named primitive and prop-type exports.
- `src/design-system/index.ts` - Re-export-only primitive and token boundary.
- `tests/primitive-contracts.test.tsx` - Exact value, rejection, edge, semantics, and barrel identity coverage.

## Decisions Made

- The layout escape hatch is an explicit `Pick` of positioning, sizing, flex, margin, and alignment correction keys; anything outside that list fails during development and tests.
- Runtime token membership uses own-property checks so cast values such as `null`, unknown names, and prototype keys cannot silently resolve.
- Native content and semantic behavior remain React Native's responsibility: primitives do not normalize strings, map children, infer roles, disable scaling, or cap font multipliers.

## Deviations from Plan

None - the plan executed exactly as written.

## Issues Encountered

- RNTL 14 asynchronous unmounts initially overlapped `act()` scopes in tests that rendered two roots. Awaiting unmount preserved the planned boundary assertions and removed the warning.

## Verification

- Full repository suite: 194 tests pass across 6 suites.
- Focused primitive and token regressions: 169 tests pass across 3 suites.
- Strict TypeScript passes with `npm run typecheck`.
- Expo lint passes with `npm run lint`.
- `package.json` and `package-lock.json` are unchanged from the plan start.
- Static runtime import scan finds no Penpot, evidence, navigation, storage, network, or product dependency.

## Known Stubs

None.

## User Setup Required

None - the primitives use only repository-local React Native code and existing tokens.

## Next Phase Readiness

- Asset and interaction plans can consume the root token/primitive boundary without reaching into internal guards.
- Phase 3 and 4 component families can compose exact text, fixed-direction layouts, and surfaces while retaining native accessibility props.
- Native visual catalogue acceptance remains correctly deferred to Phase 5.

## Self-Check: PASSED

- All eight implementation/test artifacts and this summary exist.
- All six RED/GREEN task commits exist in repository history.
- Full tests, focused regressions, strict TypeScript, Expo lint, package-state, and runtime-import checks pass.

---
*Phase: 02-primitives-assets-and-component-contracts*
*Completed: 2026-09-18*
