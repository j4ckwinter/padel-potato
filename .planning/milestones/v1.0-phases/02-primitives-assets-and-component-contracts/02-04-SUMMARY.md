---
phase: 02-primitives-assets-and-component-contracts
plan: 04
subsystem: design-system
tags: [react-native, pressable, accessibility, interaction-testing, tdd]
requires:
  - phase: 02-02
    provides: Guarded token-backed primitive and style ownership patterns
  - phase: 02-03
    provides: Accessible local Icon assets and public design-system boundaries
provides:
  - Shared Pressable with one disabled/loading activation and semantic state machine
  - Source-token focus indication and 40/44/48 minimum target contracts
  - Reusable observable accessibility, interaction, target, token, and asset test helpers
  - Long and Unicode content host-contract coverage without native visual overclaims
affects: [02-05, phase-03-components, phase-04-components, phase-05-native-verification]
actuals:
  tokens: 6945
  tasks: 3
  commits: 6
tech-stack:
  added: []
  patterns: [single blocked predicate, invariant-owned interaction styles, explicit observable test helpers]
key-files:
  created:
    - src/design-system/primitives/Pressable.tsx
    - src/design-system/testing/accessibility.ts
    - src/design-system/testing/index.ts
    - tests/pressable-contract.test.tsx
    - tests/accessibility-contracts.test.tsx
  modified:
    - src/design-system/primitives/index.ts
key-decisions:
  - "Pressable computes disabled or loading once and uses it for native disabling, callback suppression, accessibility disabled/busy state, and token opacity."
  - "The 40-point authored target receives symmetric two-point hitSlop while 44 and 48 retain zero expansion; target helpers explicitly do not claim native clipping or layout proof."
  - "Testing utilities remain ordinary exported assertion functions behind a dedicated testing barrel and are not re-exported by the production design-system root."
patterns-established:
  - "Merge caller accessibility state first, then force only the disabled and busy invariants while preserving checked, selected, expanded, and value semantics."
  - "Focus state is transient internal React state driven only by native focus/blur callbacks; no persistent focused prop exists."
requirements-completed: [PRIM-02, QUAL-01, QUAL-04, QUAL-05, QUAL-06, QUAL-07]
coverage:
  - id: D1
    description: "Enabled Pressable activates once while disabled, loading, and combined blocked states activate zero times with matching semantics and opacity."
    requirement: PRIM-02
    verification:
      - kind: unit
        ref: "tests/pressable-contract.test.tsx#Pressable interaction contract"
        status: pass
    human_judgment: false
  - id: D2
    description: "Authored 40, 44, and 48 visual minimums declare effective targets of at least 44 points without allowing invariant style overrides."
    requirement: QUAL-06
    verification:
      - kind: unit
        ref: "tests/pressable-contract.test.tsx#target and reserved-style cases"
        status: pass
    human_judgment: false
  - id: D3
    description: "Dedicated helpers assert roles, names, values, states, press results, target geometry, token styles, rejection, and labelled or decorative assets without snapshots or swallowed failures."
    requirement: QUAL-04
    verification:
      - kind: unit
        ref: "tests/accessibility-contracts.test.tsx#shared accessibility and interaction assertions"
        status: pass
    human_judgment: false
  - id: D4
    description: "Long Unicode content retains its explicit accessible action name, scaling defaults, wrapping host props, and enabled reachability."
    requirement: QUAL-07
    verification:
      - kind: unit
        ref: "tests/accessibility-contracts.test.tsx#published interaction and long-content host contract"
        status: pass
    human_judgment: false
duration: 8min
completed: 2026-09-18
status: complete
---

# Phase 02 Plan 04: Pressable and Accessibility Test Contracts Summary

**A single token-backed Pressable state machine now protects activation, focus, semantics, and touch targets, with explicit reusable helpers for later component tests.**

## Performance

- **Duration:** 8 minutes
- **Started:** 2026-09-18T14:48:22+01:00
- **Completed:** 2026-09-18T14:56:22+01:00
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments

- Published `Pressable` with closed 40/44/48 sizing, one disabled/loading predicate, accurate merged accessibility state, callback suppression, token opacity, and native-driven focus indication.
- Guaranteed the declared 44-point minimum target contract while retaining the authored 40-point visual minimum through symmetric two-point `hitSlop` and documenting parent-bound clipping.
- Published a dedicated testing boundary for explicit role/name/value/state, press, target, token, reserved-style, and asset assertions.
- Proved long Unicode labels, default font scaling, constrained wrapping host props, empty content, loading semantics, and required-action reachability.

## Task Commits

Each task was committed through its TDD gates:

1. **Task 1 RED: Add failing Pressable contracts** - `18f2c6e` (test)
2. **Task 1 GREEN: Implement Pressable interaction contract** - `4c5d302` (feat)
3. **Task 2 RED: Add failing accessibility helper contracts** - `01dfab8` (test)
4. **Task 2 GREEN: Publish observable accessibility helpers** - `59e9d6f` (feat)
5. **Task 3 RED: Add failing public host contracts** - `15f2534` (test)
6. **Task 3 GREEN: Publish interaction and host contracts** - `a99c036` (feat)

## Files Created/Modified

- `src/design-system/primitives/Pressable.tsx` - Shared state, focus, target, accessibility, and style-ownership contract.
- `src/design-system/primitives/index.ts` - Narrow Pressable component and prop/type exports.
- `src/design-system/testing/accessibility.ts` - Ordinary user-observable assertion helpers for later component suites.
- `src/design-system/testing/index.ts` - Stable test-only import boundary.
- `tests/pressable-contract.test.tsx` - Activation, blocked state, semantic merge, focus, target, and rejection coverage.
- `tests/accessibility-contracts.test.tsx` - Helper self-tests plus long-content and public-boundary host contracts.

## Decisions Made

- Caller width and height remain available for composition, while `minWidth`, `minHeight`, opacity, and focus-outline properties are invariant-owned and applied last.
- Caller role and product semantics remain explicit; Pressable never infers button, link, navigation, toggle, checked, selected, or expanded meaning.
- Native disabling and callback suppression are both retained as defense in depth, while accessibility disabled and busy are forced from the same state calculation.
- Jest assertions are limited to host props and semantics; native measurement, hitSlop clipping, focus order, VoiceOver, and TalkBack remain Phase 5 verification work.

## Deviations from Plan

None - the plan executed exactly as written.

## Issues Encountered

- React Native's rendered host view does not expose the composite `disabled` prop directly. The contract verifies the same native-disabled path through suppressed `userEvent` activation and the resulting accessibility state rather than claiming an unavailable host prop.
- The installed matcher set has no generic `toHaveAccessibilityState` matcher, so the reusable helper performs an explicit partial state comparison while retaining built-in role, name, value, disabled, and busy matchers where available.

## Verification

- `npm test -- --runInBand tests/pressable-contract.test.tsx tests/accessibility-contracts.test.tsx tests/primitive-contracts.test.tsx` - 183 tests passed.
- `npm test -- --runInBand` - 9 suites, 274 tests passed.
- `npm run typecheck` - pass.
- `npm run lint` - pass.
- `node scripts/validate-penpot-assets.mjs` - 18 icons and 2 brand lockups valid; controlled rejection and deterministic regeneration passed.
- Package manifests are unchanged and runtime boundary scans found no Penpot, navigation, storage, network, or product imports.

## Known Stubs

None.

## Threat Flags

None. The high-severity blocked-action threat is mitigated by native disabling plus guarded callback suppression from the same predicate, and no dependency state changed.

## User Setup Required

None - no packages, native services, or external configuration changed.

## Next Phase Readiness

- Phase 2 Storybook contracts can demonstrate the shared interaction primitive through the approved taxonomy.
- Phase 3 and 4 interactive component families can inherit one tested state and target contract and reuse the dedicated assertion boundary.
- Native target clipping, focus order, large-text measurement, VoiceOver, and TalkBack remain explicitly deferred to Phase 5.

## Self-Check: PASSED

- All six claimed implementation and test files exist.
- Commits `18f2c6e`, `4c5d302`, `01dfab8`, `59e9d6f`, `15f2534`, and `a99c036` exist.
- Full tests, strict TypeScript, Expo lint, asset validation, package-state, and runtime-boundary checks pass.
- Only the pre-existing GSD runtime files remain untracked.

---
*Phase: 02-primitives-assets-and-component-contracts*
*Completed: 2026-09-18*
