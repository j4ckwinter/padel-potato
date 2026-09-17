---
phase: 01-foundations-storybook
plan: 02
subsystem: tooling
tags: [expo, react-native, storybook, metro, jest-expo, react-native-testing-library]
requires:
  - phase: 01-foundations-storybook-01
    provides: Exact approved Expo 57 and Storybook 10.5.0 dependency matrix
provides:
  - Lockfile-backed Expo 57 workspace using the exact approved dependency inventory
  - Environment-gated React Native Storybook entry swapping for native and Expo web
  - Source-backed Foundations/Smoke story with focused jest-expo render coverage
affects: [01-03-penpot-evidence, 01-04-foundation-tokens, phase-01-storybook]
actuals:
  tokens: 169832
  tasks: 2
  commits: 5
tech-stack:
  added: [Expo 57.0.23, React Native 0.86.3, React 19.2.3, Storybook 10.5.0, jest-expo 57.0.5, RNTL 14.0.1]
  patterns: [Metro entry-point swapping, exact dependency inventory validation, jest-expo component tests, generated Storybook registry]
key-files:
  created: [package.json, package-lock.json, metro.config.js, .rnstorybook/main.ts, .rnstorybook/index.tsx, src/design-system/foundations/FoundationsSmoke.stories.tsx, tests/foundations-smoke.test.tsx]
  modified: [tsconfig.json]
key-decisions:
  - "Use storybook:native instead of storybook because Expo Doctor rejects scripts that shadow an installed binary; platform and web launchers retain the required STORYBOOK_ENABLED entry swap."
  - "Keep the human-approved Storybook 10.5.0 inventory when the official initializer proposes unapproved 10.6.0-era packages."
  - "Use RNTL 14's asynchronous render API and import Jest globals explicitly so strict TypeScript passes without adding an unapproved @types/jest dependency."
patterns-established:
  - "Storybook entry switching is build-time only: App.tsx stays independent and withStorybook reacts to STORYBOOK_ENABLED."
  - "Generated storybook.requires.ts is regenerated with sb-rn-get-stories and never edited by hand."
requirements-completed: [WORK-01, WORK-04, WORK-06]
coverage:
  - id: D1
    description: "The Expo workspace clean-installs the exact approved direct dependency inventory with a healthy full dependency tree."
    requirement: WORK-01
    verification:
      - kind: integration
        ref: "npm ci; exact-inventory comparison; npm ls --all --json"
        status: pass
    human_judgment: false
  - id: D2
    description: "The native Storybook entry is exposed through Expo web and serves a bundled Foundations/Smoke catalogue over HTTP."
    requirement: WORK-04
    verification:
      - kind: automated_ui
        ref: "npm run storybook:web; Web Bundled .rnstorybook/index.tsx; HTTP GET localhost:8081 = 200"
        status: pass
      - kind: unit
        ref: "tests/foundations-smoke.test.tsx#renders the stable smoke heading"
        status: pass
    human_judgment: false
  - id: D3
    description: "Expo dependency checking and Expo Doctor accept the locked Expo/Storybook matrix without exclusions or resolution bypasses."
    requirement: WORK-06
    verification:
      - kind: integration
        ref: "npx expo install --check; npx expo-doctor@latest"
        status: pass
    human_judgment: false
duration: 18min
completed: 2026-09-17
status: complete
---

# Phase 01 Plan 02: Expo Storybook Tracer Summary

**Exact Expo 57 and Storybook 10.5.0 workbench with Metro entry swapping, an Expo-web smoke catalogue, and a passing native render regression**

## Performance

- **Duration:** 18 min
- **Started:** 2026-09-17T21:48:14Z
- **Completed:** 2026-09-17T22:05:56Z
- **Tasks:** 2
- **Files modified:** 15

## Accomplishments

- Created a strict Expo TypeScript workspace whose application and development dependencies match the approved compatibility evidence exactly and clean-install without peer bypasses.
- Wired the official Storybook 10.5 entry-point swap so `App.tsx` remains standalone while native and Expo-web catalogue commands select `.rnstorybook/index.tsx` through `STORYBOOK_ENABLED`.
- Added a production React Native `Foundations/Smoke` story, generated discovery registry, and focused `jest-expo`/RNTL render test.
- Proved Expo web bundles the native Storybook entry and responds over HTTP, while Expo install checking and Expo Doctor report healthy results.

## Task Commits

Each implementation gate was committed atomically:

1. **Task 1: Prove clean Expo-to-Storybook-to-browser entry flow** — `2b586c5` (feat)
2. **Task 2 RED: Add failing smoke story render test** — `d1140cf` (test)
3. **Task 2 GREEN: Configure passing Expo smoke render gate** — `84b1f0b` (feat)
4. **Task 2 verification fix: Retain Expo-managed TypeScript includes** — `86760e4` (fix)

## Files Created/Modified

- `.nvmrc` — Records the approved Node 22.13 baseline.
- `package.json` / `package-lock.json` — Exact approved dependencies, cross-platform workbench scripts, and Jest Expo configuration.
- `app.json`, `App.tsx`, `tsconfig.json`, `eslint.config.js` — Standalone Expo application and strict template-derived tooling.
- `metro.config.js` — Wraps Expo Metro with the Storybook entry-swap integration.
- `.rnstorybook/main.ts`, `.rnstorybook/preview.tsx`, `.rnstorybook/index.tsx` — Native Storybook discovery, preview, and Expo entry.
- `.rnstorybook/storybook.requires.ts` — Officially generated registry for the source story glob and on-device addons.
- `src/design-system/foundations/FoundationsSmoke.stories.tsx` — Neutral native tracer story with directly renderable `Smoke` export.
- `tests/foundations-smoke.test.tsx` — Focused component-render regression.

## Decisions Made

- Used `storybook:native` for the generic native launcher because Expo Doctor treats a `storybook` script as a collision with the installed Storybook binary. `storybook:web`, `storybook:ios`, and `storybook:android` remain explicit platform launchers.
- Preserved the approved exact inventory after Storybook's initializer proposed 10.6.0-era additions, then regenerated the source registry using the installed 10.5.0 generator.
- Disabled story selection persistence in the entry rather than introducing the unapproved AsyncStorage package proposed by the initializer.
- Used RNTL 14's Promise-returning `render` contract and `@jest/globals` types already supplied by Jest, avoiding an unapproved direct dependency.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Removed unapproved packages proposed by the official Storybook initializer**
- **Found during:** Task 1 Storybook entry generation
- **Issue:** The installed Storybook 10.5.0 initializer proposed caret-ranged 10.6.0 addons, UI Lite, and AsyncStorage, which were outside the human-approved inventory.
- **Fix:** Retained the initializer's generated structure, restored the exact approved dependency maps, disabled persistence, and regenerated the registry with the installed 10.5.0 generator.
- **Files modified:** `package.json`, `.rnstorybook/index.tsx`, `.rnstorybook/main.ts`, `.rnstorybook/storybook.requires.ts`
- **Verification:** Exact-inventory comparison passed; `npm ls --all --json` exited zero.
- **Committed in:** `2b586c5`

**2. [Rule 3 - Blocking] Renamed the generic Storybook launcher to satisfy Expo Doctor**
- **Found during:** Task 1 health verification
- **Issue:** Expo Doctor rejects a `storybook` npm script because it shadows the installed `storybook` binary, making that script name incompatible with the required 21/21 health result.
- **Fix:** Renamed the generic command to `storybook:native`; retained the required `storybook:web` and explicit iOS/Android launchers.
- **Files modified:** `package.json`
- **Verification:** Expo Doctor passed 21/21 checks without exclusions.
- **Committed in:** `2b586c5`

**3. [Rule 1 - Bug] Accepted Expo's normalized TypeScript include list**
- **Found during:** Plan-level Expo web verification
- **Issue:** Expo startup rewrote a hand-expanded include list to the tool-managed source globs, leaving an uncommitted generated change after every catalogue start.
- **Fix:** Committed the Expo-normalized include list while preserving strict mode and the Expo base configuration.
- **Files modified:** `tsconfig.json`
- **Verification:** `npm run typecheck` and the full final gate passed.
- **Committed in:** `86760e4`

---

**Total deviations:** 3 auto-fixed (1 bug, 2 blocking)
**Impact on plan:** The fixes preserve the approved package boundary and required health gates without expanding product scope.

## Issues Encountered

- The approved lockfile currently reports 14 moderate transitive audit findings. `npm audit --audit-level=high` passes; the automated fixes would either downgrade Expo to 46 or move Storybook to the unapproved 10.6.0 line, so no incompatible mutation was applied.
- RNTL 14 uses an asynchronous `render` API. The focused test awaits it and passes under strict TypeScript.

## Authentication Gates

None.

## Known Stubs

None.

## User Setup Required

None — no external service configuration is required.

## Next Phase Readiness

- Later foundation plans can add source stories under `src/**/*.stories.tsx`; the generated registry and native/web workbench already discover that path.
- Jest Expo and RNTL are configured for focused native component tests.
- The exact package boundary, clean lockfile, browser tracer, and Expo health gates are all green.

## Self-Check: PASSED

- All 15 created or modified implementation files exist.
- Task commits `2b586c5`, `d1140cf`, `84b1f0b`, and `86760e4` exist in repository history.
- Clean install, exact inventory, full dependency tree, typecheck, lint, focused Jest, high-severity audit gate, Expo install check, Expo Doctor, and Expo-web HTTP checks passed.

---
*Phase: 01-foundations-storybook*
*Completed: 2026-09-17*
