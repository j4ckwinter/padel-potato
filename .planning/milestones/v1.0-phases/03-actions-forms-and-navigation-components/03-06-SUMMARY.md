---
phase: 03-actions-forms-and-navigation-components
plan: 06
subsystem: ui
tags: [react-native, forms, accessibility, storybook, penpot]

requires:
  - phase: 03-01
    provides: Revision-296 source registry with exact ChoiceChip, Checkbox, and DayTimeSelector ledgers
  - phase: 03-05
    provides: Controlled Field family and shared forms test boundary
provides:
  - Exact controlled ChoiceChip option/filter sparse matrix with radio and checkbox semantics
  - Boolean-only controlled Checkbox with stable naming and decorative check artwork
  - Individually named controlled day/time radio options with exact family-owned geometry and disabled opacity
  - Narrow forms barrel publishing Field and the three selection-control families
  - Five-category Storybook evidence and complete 30-record forms accounting
affects: [03-09, forms, storybook-catalogue, product-screen-assembly]

actuals:
  tokens: 13780
  tasks: 3
  commits: 6

tech-stack:
  added: []
  patterns:
    - Selection state remains caller-controlled and callbacks emit only the requested next value
    - Sparse source tuples are encoded as discriminated unions and rejected again at the runtime boundary
    - Compact 40-point visuals retain non-overlapping 44-point targets while larger selectors use exact visual targets

key-files:
  created:
    - src/design-system/components/forms/ChoiceChip.tsx
    - src/design-system/components/forms/ChoiceChip.stories.tsx
    - src/design-system/components/forms/Checkbox.tsx
    - src/design-system/components/forms/Checkbox.stories.tsx
    - src/design-system/components/forms/DayTimeSelector.tsx
    - src/design-system/components/forms/DayTimeSelector.stories.tsx
    - src/design-system/components/forms/index.ts
  modified:
    - tests/form-components.test.tsx

key-decisions:
  - "Encode ChoiceChip as the six persistent source-backed tuples represented by the eight records, with focused specimens derived from native focus rather than a persistent prop."
  - "Keep Checkbox strictly boolean and reject indeterminate or unknown state at the runtime boundary."
  - "Keep the DayTimeSelector 0.55 disabled opacity family-local while exposing each day or time option as its own radio with a visible-content-derived name."

patterns-established:
  - "Controlled selection closure: visible and semantic selected state changes only after the consumer rerenders with the emitted value."
  - "Source-order catalogue accounting: Variants stories map records without sorting or expanding the sparse matrix."

requirements-completed: [FORM-02, FORM-03, FORM-04]

coverage:
  - id: D1
    description: ChoiceChip implements the exact eight-record option/filter matrix with controlled radio or checkbox semantics, decorative icons, and compact target expansion
    requirement: FORM-02
    verification:
      - kind: unit
        ref: tests/form-components.test.tsx (ChoiceChip source, semantics, control, rejection, geometry, focus, and story tests)
        status: pass
      - kind: integration
        ref: node scripts/validate-phase-3-components.mjs
        status: pass
    human_judgment: false
  - id: D2
    description: Checkbox implements only controlled checked and unchecked values with blocked activation, stable checkbox naming, decorative art, and no indeterminate state
    requirement: FORM-03
    verification:
      - kind: unit
        ref: tests/form-components.test.tsx (Checkbox boolean, callback, semantics, target, rejection, and story tests)
        status: pass
    human_judgment: false
  - id: D3
    description: DayTimeSelector and the forms barrel publish six exact selector records and all four forms families with individual radio names and complete 30-record accounting
    requirement: FORM-04
    verification:
      - kind: unit
        ref: tests/form-components.test.tsx (DayTimeSelector source, naming, control, geometry, opacity, rejection, story, and barrel tests)
        status: pass
      - kind: integration
        ref: npm test -- --runInBand tests/form-components.test.tsx tests/phase3-source-registry.test.ts
        status: pass
      - kind: integration
        ref: npm run typecheck && npm run lint
        status: pass
    human_judgment: false

duration: 10min
completed: 2026-09-18
status: complete
---

# Phase 03 Plan 06: Controlled Selection Controls Summary

**ChoiceChip, Checkbox, and DayTimeSelector now expose exact revision-296 controlled matrices with correct radio/checkbox semantics, deterministic source-order stories, and a narrow four-family forms boundary.**

## Performance

- **Duration:** 10min
- **Started:** 2026-09-18T18:55:04Z
- **Completed:** 2026-09-18T19:04:50Z
- **Tasks:** 3
- **Files modified:** 8

## Accomplishments

- Added ChoiceChip as a closed sparse union rather than a Cartesian variant API, preserving source-owned icon placement, 148×40 geometry, 12-point inset, native focus, controlled next-value emission, and option-radio versus filter-checkbox semantics.
- Added a boolean-only Checkbox with a stable accessible name, controlled opposite-value emission, decorative check artwork, blocked callbacks, exact 40-point visual, and symmetric 44-point target expansion.
- Added individually named day/time radio options with exact 104×72 and 112×56 geometry, source-specific 0.55 disabled opacity, controlled selection, and deterministic time-then-day record ordering.
- Published only Field, ChoiceChip, Checkbox, DayTimeSelector, and their public types from the forms barrel, with all 30 retained forms records accounted for.

## Task Commits

Each task followed its required RED/GREEN TDD gates:

1. **Task 1 RED: failing ChoiceChip sparse-contract tests** - `e552d3b` (test)
2. **Task 1 GREEN: controlled ChoiceChip matrix and stories** - `ddfec16` (feat)
3. **Task 2 RED: failing boolean-only Checkbox tests** - `16e6a47` (test)
4. **Task 2 GREEN: controlled Checkbox and stories** - `ca3382f` (feat)
5. **Task 3 RED: failing DayTimeSelector and forms-publication tests** - `49f5b6a` (test)
6. **Task 3 GREEN: DayTimeSelector, stories, and forms barrel** - `0636ef0` (feat)

## Files Created/Modified

- `src/design-system/components/forms/ChoiceChip.tsx` - Sparse controlled chip tuples, radio/checkbox semantics, decorative icons, and exact compact geometry.
- `src/design-system/components/forms/ChoiceChip.stories.tsx` - Five-category source-ordered catalogue for all eight retained records.
- `src/design-system/components/forms/Checkbox.tsx` - Boolean-only controlled checkbox with decorative check art and compact target expansion.
- `src/design-system/components/forms/Checkbox.stories.tsx` - Five-category catalogue for all four retained checkbox records.
- `src/design-system/components/forms/DayTimeSelector.tsx` - Discriminated day/time content, individual radio names, exact geometry, and local disabled treatment.
- `src/design-system/components/forms/DayTimeSelector.stories.tsx` - Five-category catalogue for all six time-then-day records and controlled group demonstrations.
- `src/design-system/components/forms/index.ts` - Narrow four-family public forms boundary.
- `tests/form-components.test.tsx` - FORM-02..04 source, semantics, callback, rejection, target, story, order, and publication proof alongside Field.

## Decisions Made

- ChoiceChip exposes only persistent tuples that correspond to the retained records. Focused records reuse their matching default tuple and obtain focus solely from native events.
- ChoiceChip icon placement changes with the controlled selected value because the source defines leading check artwork only for selected records and trailing/absent artwork only for unselected records.
- DayTimeSelector uses a family-local native press boundary so its authored disabled opacity remains exactly 0.55 instead of widening the shared Pressable's global 0.4 opacity contract.
- Selector accessible names are deterministic combinations of their two visible lines (`day, date` or `time, availability`); no opaque group control or generic option name is introduced.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- The shared Pressable intentionally owns a global 0.4 disabled opacity, while DayTimeSelector is the approved 0.55 source exception. The selector keeps that exception family-local with the same disabled callback and native semantic guarantees rather than expanding the shared primitive API.

## User Setup Required

None - no external service configuration required.

## Verification Results

- `npm run validate:design-source` - passed canonical archive verification and controlled malformed-archive rejections.
- `node scripts/validate-phase-3-components.mjs` - passed for revision 296, 13 families, and 75 active records.
- `npm test -- --runInBand tests/form-components.test.tsx tests/phase3-source-registry.test.ts` - passed, 2 suites and 47 focused/source tests.
- `npm test -- --runInBand` - passed, 16 suites and 405 tests.
- `npm run typecheck` - passed.
- `npm run lint` - passed without warnings.
- Failure-direction assertions passed for unsupported ChoiceChip tuples, indeterminate or malformed Checkbox inputs, mixed DayTimeSelector content, selected-disabled combinations, empty visible content, and unknown runtime props.

## Known Stubs

None. Story labels, dates, times, and availability strings are intentional catalogue fixtures supplied through the real controlled public APIs.

## Threat Flags

None - changes stay inside the declared runtime-prop and blocked-callback trust boundaries and add no network, authentication, file, schema, persistence, or routing surface.

## Next Phase Readiness

- Plan 03-09 can publish the completed forms barrel through the phase-wide design-system boundary and story applicability registry.
- Native iOS/Android measurement, 200% font-scale rendering, VoiceOver, and TalkBack checks remain assigned to Phase 5 as planned.

## Self-Check: PASSED

All eight implementation/test files, this summary, and all six TDD task commits were verified on disk and in git history. Design-source validation, Phase 3 registry validation, focused tests, full regression, typecheck, lint, and explicit invalid-input failure directions all passed.

---
*Phase: 03-actions-forms-and-navigation-components*
*Completed: 2026-09-18*
