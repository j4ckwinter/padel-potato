---
phase: 01-foundations-storybook
plan: 07
subsystem: ui-verification
tags: [expo-web, storybook, penpot, evidence, smoke-test]
requires:
  - phase: 01-foundations-storybook-06
    provides: Complete token-driven Foundations catalogue with eight stable stories
provides:
  - Bounded cross-platform Expo-web Storybook readiness smoke with guaranteed cleanup
  - Owner-approved browser review ledger for all eight Foundations stories
  - Complete Phase 1 type, lint, test, evidence, dependency, Expo health, and live bundle closure proof
affects: [phase-02-components, phase-05-native-validation]
actuals:
  tokens: 9203
  tasks: 3
  commits: 4
tech-stack:
  added: []
  patterns: [ephemeral loopback smoke, schema-validated visual review ledger, fail-closed native deferment]
key-files:
  created: [scripts/smoke-storybook-web.mjs, scripts/validate-web-storybook-verification.mjs, design-spec/web-storybook-verification.md]
  modified: [package.json, package-lock.json, design-spec/toolchain-compatibility.json, scripts/validate-toolchain-compatibility.mjs]
key-decisions:
  - "Use a dependency-free Node smoke that selects an available loopback port, verifies the Storybook bundle entry, and always terminates the Expo process tree."
  - "Treat the owner's eight-story browser approval as web evidence only; native iOS and Android acceptance remains deferred to Phase 5."
  - "Apply only the explicitly approved Expo 57.0.24 and @expo/metro-runtime 57.0.16 patch updates when Expo's compatibility matrix advanced."
patterns-established:
  - "Browser review evidence is a strict fenced JSON ledger reconciled against the retained Penpot hash and deviation registry."
  - "Live development-server checks use ephemeral loopback ports, bounded waits, bundle identity assertions, and verified process cleanup."
requirements-completed: [WORK-04, PNPT-04, FNDT-06]
coverage:
  - id: D1
    description: "One repository command proves the Expo-web native Storybook entry is reachable and cleans up its child process."
    requirement: WORK-04
    verification:
      - kind: integration
        ref: "npm run storybook:web:smoke"
        status: pass
    human_judgment: false
  - id: D2
    description: "All eight Foundations stories were reviewed in a browser against the retained Penpot render with no unrecorded deviation."
    requirement: FNDT-06
    verification:
      - kind: manual_procedural
        ref: "design-spec/web-storybook-verification.md#review-scope"
        status: pass
      - kind: integration
        ref: "node scripts/validate-web-storybook-verification.mjs"
        status: pass
    human_judgment: true
    rationale: "The project owner supplied the required visual fidelity judgment; the ledger validator proves completeness but cannot replace that judgment."
  - id: D3
    description: "Phase 1 closed with types, lint, all tests, evidence, dependency health, Expo Doctor, and the live Storybook entry green together."
    requirement: PNPT-04
    verification:
      - kind: integration
        ref: "design-spec/web-storybook-verification.md#phase-final-closure"
        status: pass
    human_judgment: false
duration: 1h 15m
completed: 2026-09-18
status: complete
---

# Phase 01 Plan 07: Browser Verification and Closure Summary

**A bounded Expo-web smoke, owner-approved eight-story Penpot comparison ledger, and fully green Phase 1 closure gate now make the Foundations catalogue reproducibly reviewable in a local browser.**

## Performance

- **Duration:** 1 hour 15 minutes, including two blocking human approvals
- **Completed:** 2026-09-18
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments

- Added a dependency-free, cross-platform smoke that launches Storybook on an available loopback port, confirms the React Native Storybook bundle, reports duration and URL, and leaves no child server running.
- Retained the project owner's approval of `AllFoundations`, `Colors`, `Typography`, `Spacing`, `Radii`, `Dimensions`, `Borders`, and `Opacity` against the SHA-256-pinned Penpot reference.
- Added a strict ledger/deviation validator that rejects malformed metadata, missing or duplicate stories, incomplete specimens, unresolved deviations, reference drift, and any attempt to claim native acceptance early.
- Passed the complete closure gate: strict TypeScript, lint, 5 Jest suites/41 tests, Penpot and browser evidence, exact dependency tree, Expo compatibility, Expo Doctor 21/21, and the live Storybook bundle.

## Task Commits

1. **Task 1: Add bounded Storybook web smoke** — `a8006f9` (feat)
2. **Task 2: Record browser Foundations verification** — `47cbcf0` (docs)
3. **Task 3 deviation: Align approved Expo patch matrix** — `9a23a36` (chore)
4. **Task 3: Record complete phase closure gate** — `e01e051` (docs)

## Files Created/Modified

- `scripts/smoke-storybook-web.mjs` — ephemeral-port Expo-web readiness and Storybook-entry smoke with cross-platform process-tree cleanup.
- `scripts/validate-web-storybook-verification.mjs` — dependency-free ledger, reference-hash, story-completeness, and deviation-reconciliation validator.
- `design-spec/web-storybook-verification.md` — owner review record and complete closure-gate evidence.
- `package.json` — non-watch `storybook:web:smoke` command and approved Expo patch versions.
- `package-lock.json` — lockfile refreshed for the two approved direct Expo patch updates and their resolved transitive patches.
- `design-spec/toolchain-compatibility.json` — exact patch approval and refreshed dependency/Expo health evidence.
- `scripts/validate-toolchain-compatibility.mjs` — enforcement for the updated exact Expo patch matrix and approval scope.

## Decisions Made

- Browser review remains a convenience lane. It cannot be promoted into native iOS or Android acceptance; that work remains explicit Phase 5 scope.
- A story can pass only with an empty deviation list. Any observed mismatch must use `deviations-recorded` and resolve to a complete `web` record with source, reason, disposition, reviewer, and evidence.
- The smoke identifies the served Storybook entry from the returned HTML/application bundle rather than treating an HTTP 200 response alone as success.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Updated the exact Expo patch pair after the compatibility matrix advanced**

- **Found during:** Task 3 phase-final closure gate
- **Issue:** `npx expo install --check` began requiring `expo` 57.0.24 and `@expo/metro-runtime` 57.0.16 instead of the previously approved 57.0.23/57.0.15 pair.
- **Fix:** Paused for human package approval, updated only those two direct packages and their resulting lockfile entries, refreshed exact toolchain evidence, and reran dependency-tree, Expo install, and Expo Doctor checks before the complete closure gate.
- **Files modified:** `package.json`, `package-lock.json`, `design-spec/toolchain-compatibility.json`, `scripts/validate-toolchain-compatibility.mjs`
- **Verification:** `npm ls --all --json`, `npx expo install --check`, `npx expo-doctor@latest`, and the complete phase-final gate passed.
- **Committed in:** `9a23a36`

---

**Total deviations:** 1 auto-fixed blocking compatibility drift with explicit human approval.

**Impact on plan:** The approved patch refresh restored the intended green Expo health gate without changing Storybook, React Native, React, native peers, or architecture.

## Issues Encountered

- The execution environment exposed no browser-automation surface. The local catalogue remained running for the project owner, who completed and approved the planned eight-story visual review; no visual outcome was inferred by the executor.
- The first phase-final run correctly stopped when Expo's supported patch matrix advanced. Closure resumed only after exact package approval.

## Verification

- `npm run typecheck` — passed.
- `npm run lint` — passed.
- `npm test -- --runInBand` — 5 suites and 41 tests passed.
- `node scripts/validate-penpot-evidence.mjs` — passed with exact seven-category counts.
- `node scripts/validate-web-storybook-verification.mjs` — passed for all eight stories and the retained reference hash.
- `node scripts/validate-toolchain-compatibility.mjs` — passed for the exact 23-package approval matrix and patch refresh.
- `npm ls --all --json` — exited cleanly.
- `npx expo install --check` — dependencies are up to date.
- `npx expo-doctor@latest` — 21/21 checks passed.
- `npm run storybook:web:smoke` — Storybook entry confirmed over loopback HTTP; no listener remained.

## Known Stubs

None.

## Threat Review

- The Expo server binds only for local development review, contains no secrets or product state, and is terminated after the bounded smoke.
- The review record is attributable to the project owner and pins the retained Penpot reference by path and SHA-256.
- No network endpoint, authentication path, persistence boundary, hosted catalogue, or browser-specific design override was added.

## User Setup Required

None — the browser catalogue is available through `npm run storybook:web`, and its automated readiness check is `npm run storybook:web:smoke`.

## Next Phase Readiness

- Phase 2 can build reusable primitives against the completed public foundation tokens and browser-reviewable Storybook workbench.
- Native iOS/Android visual acceptance is intentionally still open for Phase 5; this plan makes no native fidelity claim.

## Self-Check: PASSED

- All three created verification artifacts and all four task commits exist.
- The complete phase-final command passed after the approved dependency refresh.
- Browser evidence records all eight exact story names, the retained Penpot hash, and explicit Phase 5 native deferment.

---
*Phase: 01-foundations-storybook*
*Completed: 2026-09-18*
