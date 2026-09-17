---
phase: 01-foundations-storybook
plan: 01
subsystem: tooling
tags: [expo, react-native, storybook, dependency-validation, supply-chain]
requires: []
provides:
  - Human-approved exact 23-package Expo, Storybook, and native-peer matrix
  - Machine-checkable clean-room install and Expo compatibility evidence
  - Storybook 10.5.0 implementation baseline superseding inherited 10.6.0 guidance
affects: [01-02-expo-storybook-scaffold, WORK-06, phase-01]
actuals:
  tokens: 6094
  tasks: 2
  commits: 3
tech-stack:
  added: [Expo 57.0.23 compatibility evidence, Storybook 10.5.0 matrix]
  patterns: [exact-version approval matrix, dependency-free evidence validator, disposable clean-room probe]
key-files:
  created: [design-spec/toolchain-compatibility.json, scripts/validate-toolchain-compatibility.mjs]
  modified: [.planning/PROJECT.md]
key-decisions:
  - "The complete exact Storybook 10.5.0 family supersedes inherited Storybook 10.6.0 guidance for Expo 57 implementation."
  - "Package legitimacy approval applies only to the exact 23 package/version rows and excludes substitutions, caret drift, Storybook 10.6.x, Vite Storybook, and expo-template-storybook."
  - "Current Expo 57 template tooling uses TypeScript 6.0.3 and @types/react 19.2.4; test-renderer 1.2.0 is pinned to preserve a clean React 19.2.3 dependency tree."
patterns-established:
  - "Compatibility evidence must capture exact direct inventories, successful command assertions, and explicit absence of resolution bypasses."
requirements-completed: [WORK-06]
coverage:
  - id: D1
    description: "The exact 23-package SUS matrix received explicit human legitimacy approval before any repository dependency install."
    requirement: WORK-06
    verification:
      - kind: manual_procedural
        ref: "User response: approved; design-spec/toolchain-compatibility.json#approval"
        status: pass
    human_judgment: true
    rationale: "Package legitimacy is a blocking-human supply-chain decision and cannot be auto-approved."
  - id: D2
    description: "The Expo 57, React Native 0.86.3, React 19.2.3, and complete Storybook 10.5.0 matrix has deterministic clean-probe evidence."
    requirement: WORK-06
    verification:
      - kind: integration
        ref: "node scripts/validate-toolchain-compatibility.mjs"
        status: pass
      - kind: integration
        ref: "Disposable probe: npm ls --all --json; npx expo install --check; npx expo-doctor@latest"
        status: pass
    human_judgment: false
duration: 12min
completed: 2026-09-17
status: complete
---

# Phase 01 Plan 01: Toolchain Compatibility Evidence Summary

**Exact Expo 57 and Storybook 10.5.0 package matrix with explicit human approval, a clean dependency tree, and Expo Doctor 21/21 evidence**

## Performance

- **Duration:** 12 min
- **Started:** 2026-09-17T21:33:19Z
- **Completed:** 2026-09-17T21:45:13Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Recorded explicit human approval for exactly 23 package/version rows: 7 application/test packages, 9 Storybook packages, and 7 Expo-aligned native peers.
- Reproduced the complete application and development inventory in a disposable clean-room probe using normal npm resolution, with no force, legacy-peer, override, Doctor-exclusion, or unresolved-dependency mechanism.
- Proved a clean `npm ls --all --json`, `Dependencies are up to date` from Expo install checking, and `21/21 checks passed. No issues detected!` from Expo Doctor.
- Added a dependency-free validator and recorded Storybook 10.5.0 as the implementation baseline that supersedes inherited 10.6.0 guidance.

## Task Commits

Each implementation gate was committed atomically:

1. **Task 1: Approve package legitimacy for the Expo and Storybook families** — blocking-human checkpoint approved; approval is durably captured in Task 2 evidence and this summary.
2. **Task 2 RED: Add failing compatibility validator** — `9aba88e` (test)
3. **Task 2 GREEN: Persist successful clean-room evidence and decision** — `df71c93` (feat)

## Files Created/Modified

- `design-spec/toolchain-compatibility.json` — Exact approval dossier, direct inventories, clean-probe results, and safeguard declarations.
- `scripts/validate-toolchain-compatibility.mjs` — Deterministic validation of the approval set, versions, dependency tree, Expo results, and forbidden bypasses.
- `.planning/PROJECT.md` — Durable Storybook 10.5.0 superseding decision.
- `.planning/phases/01-foundations-storybook/01-01-SUMMARY.md` — Execution record and downstream handoff.

## Decisions Made

- Approval authorizes only the exact 23 package/version rows. It does not authorize `@storybook/react-native-web-vite`, `expo-template-storybook`, Storybook 10.6.x, caret drift, or substituted native peers.
- Storybook 10.5.0 is the sole Phase 1 implementation baseline because the complete family and Expo-aligned peers pass the Expo 57 health contract; 10.6.0 does not.
- The current Expo 57 template-resolved TypeScript and React type versions are recorded in the reproducible direct inventory rather than preserving stale research snapshot values.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Updated template tooling to current Expo 57 expectations**
- **Found during:** Task 2 clean-room verification
- **Issue:** The live Expo 57 manifest expects TypeScript 6.0.3 and `@types/react` 19.2.4; the older research snapshot produced Expo check and Doctor failures.
- **Fix:** Recorded the current Expo-template-resolved exact versions in the direct development inventory.
- **Files modified:** `design-spec/toolchain-compatibility.json`
- **Verification:** Expo install check passed and Expo Doctor returned 21/21.
- **Committed in:** `df71c93`

**2. [Rule 3 - Blocking] Pinned the React-19.2-compatible RNTL renderer peer**
- **Found during:** Task 2 clean-room dependency-tree verification
- **Issue:** RNTL 14.0.1's broad `test-renderer` peer now resolves 1.3.0, whose reconciler requires React 19.3 and makes `npm ls` fail against approved React 19.2.3.
- **Fix:** Added exact `test-renderer@1.2.0`, whose reconciler supports React 19.2.3, to the complete direct development inventory.
- **Files modified:** `design-spec/toolchain-compatibility.json`
- **Verification:** Normal clean install completed without ERESOLVE and `npm ls --all --json` exited zero.
- **Committed in:** `df71c93`

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both fixes preserve the approved 23-package matrix and are necessary to reproduce the required clean install and Expo 21/21 evidence with current registry metadata.

## Issues Encountered

- The first temporary probe used PowerShell's BOM-emitting JSON write and was rejected by Expo's JSON parser. A fresh disposable probe wrote BOM-free JSON and completed cleanly; no repository application dependencies were installed.

## Authentication Gates

None.

## Known Stubs

None.

## User Setup Required

None — no external service configuration is required.

## Next Phase Readiness

- Plan 01-02 can reproduce `directDependencies` and `directDevDependencies` exactly from the validated evidence.
- The package-legitimacy gate is closed for the exact matrix, and the deterministic precondition command passes.
- No unresolved peer-health exception or Storybook patch ambiguity remains.

## Self-Check: PASSED

- All four plan output files exist.
- Task commits `9aba88e` and `df71c93` exist in repository history.
- `node scripts/validate-toolchain-compatibility.mjs` passes.

---
*Phase: 01-foundations-storybook*
*Completed: 2026-09-17*
