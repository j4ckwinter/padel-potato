---
phase: 01-foundations-storybook
plan: 04
subsystem: design-system
tags: [react-native, expo-font, penpot, design-tokens, inter, storybook]
requires:
  - phase: 01-foundations-storybook-02
    provides: Expo 57 Storybook workbench and Jest/RNTL test infrastructure
  - phase: 01-foundations-storybook-03
    provides: Revision-292 Penpot manifest with validated source provenance
provides:
  - Immutable 15-color and 9-style React Native token contracts with Penpot provenance
  - Licensed static Inter 4.1 assets for weights 400, 600, and 700 with binary integrity evidence
  - Shared Storybook font readiness boundary with accessible pending and error states
affects: [01-05-scale-tokens, 01-06-foundation-gallery, phase-02-components]
actuals:
  tokens: 319329
  tasks: 2
  commits: 4
tech-stack:
  added: [Inter 4.1 static TTF assets under SIL OFL 1.1]
  patterns: [immutable source-backed tokens, explicit runtime font aliases, global fail-closed font gate]
key-files:
  created: [src/design-system/tokens/colors.ts, src/design-system/tokens/typography.ts, src/design-system/fonts/FoundationFontGate.tsx, assets/fonts/inter-4.1.provenance.json, tests/color-typography-tokens.test.ts, tests/typography.test.tsx]
  modified: [.rnstorybook/preview.tsx]
key-decisions:
  - "Map the three authored Inter weights to separate runtime families so native platforms use exact static files instead of synthesizing weights."
  - "Convert Penpot's 1.2 line-height multiplier to React Native absolute line heights without changing the authored metric."
  - "Apply one fail-closed font gate at the Storybook preview boundary; system-font-only catalogues bypass asynchronous loading deterministically."
patterns-established:
  - "Every executable token export has a parallel frozen provenance record keyed by the same semantic name."
  - "Local font assets retain upstream release, license, hashes, PostScript names, and embedded weight verification."
requirements-completed: [PNPT-02, FNDT-01, FNDT-02, FNDT-05]
coverage:
  - id: D1
    description: "Exactly 15 immutable semantic colors match the reviewed Penpot manifest in order, value, and source provenance."
    requirement: FNDT-01
    verification:
      - kind: unit
        ref: "tests/color-typography-tokens.test.ts#Penpot color contract"
        status: pass
    human_judgment: false
  - id: D2
    description: "Exactly 9 native typography styles map the authored Inter family, weights, sizes, line heights, letter spacing, and Penpot source IDs to verified local assets."
    requirement: FNDT-02
    verification:
      - kind: unit
        ref: "tests/color-typography-tokens.test.ts#Penpot typography contract"
        status: pass
      - kind: integration
        ref: "SHA-256, OS/2 weight, PostScript name, license, and strict TypeScript checks"
        status: pass
    human_judgment: false
  - id: D3
    description: "The shared Storybook boundary withholds story children until authoritative fonts load and exposes accessible pending and failure diagnostics."
    requirement: FNDT-05
    verification:
      - kind: unit
        ref: "tests/typography.test.tsx#FoundationFontGate"
        status: pass
    human_judgment: false
duration: 1h 59m elapsed including the font approval checkpoint
completed: 2026-09-18
status: complete
---

# Phase 01 Plan 04: Color, Typography, and Font Gate Summary

**Revision-292 color and typography contracts backed by verified Inter 4.1 files and a global fail-closed Storybook font boundary**

## Performance

- **Duration:** 1h 59m elapsed, including the blocking font-license approval checkpoint
- **Started:** 2026-09-18T07:18:41Z
- **Completed:** 2026-09-18T09:17:41Z
- **Tasks:** 2
- **Files modified:** 11 implementation/test files plus 2 planning records

## Accomplishments

- Published the exact 15-color and 9-style contracts from the validated Penpot manifest, with immutable values and one-to-one frozen source records.
- Retained official Inter 4.1 Regular, SemiBold, and Bold static TTF files, the full SIL OFL 1.1 license, upstream URLs, release hash, file hashes, PostScript names, and embedded weight evidence.
- Wrapped every Storybook story in an accessible font gate that never exposes typography specimens during pending or failed local-font loading.

## Task Commits

1. **Task 1 RED: Add failing color and typography contract tests** — `48e2908` (test)
2. **Task 1 GREEN: Publish exact color and typography contracts** — `9980b54` (feat)
3. **Task 2 RED: Add failing font readiness gate tests** — `fb74e10` (test)
4. **Task 2 GREEN: Gate Storybook on font readiness** — `50e93f5` (feat)

## Files Created/Modified

- `src/design-system/tokens/colors.ts` — 15 semantic colors and parallel Penpot provenance.
- `src/design-system/tokens/typography.ts` — 9 typed React Native styles, exact runtime font mapping, and font provenance.
- `src/design-system/fonts/FoundationFontGate.tsx` — pending, ready, error, and system-font-only rendering paths.
- `.rnstorybook/preview.tsx` — single shared font-gate decorator.
- `assets/fonts/Inter-{Regular,SemiBold,Bold}.ttf` — authoritative static Inter 4.1 files for every authored weight.
- `assets/fonts/OFL.txt` — complete upstream SIL Open Font License 1.1.
- `assets/fonts/inter-4.1.provenance.json` — official sources, release hash, individual hashes, runtime families, PostScript names, and weights.
- `tests/color-typography-tokens.test.ts` — exact manifest contract and binary-integrity regression suite.
- `tests/typography.test.tsx` — font-gate state and shared decorator regression suite.

## Decisions Made

- Separate Expo runtime families (`Inter_400Regular`, `Inter_600SemiBold`, `Inter_700Bold`) bind each authored weight to its exact static file; the design provenance continues to name the source family as `Inter`.
- Penpot's unitless `1.2` line-height values are represented as the equivalent React Native absolute line heights (`fontSize × 1.2`).
- Error diagnostics include the font-loader message in development while story children remain unavailable; production does not echo the underlying message.
- The exact previously approved dependency lockfile remains unchanged despite a newer live Expo patch recommendation.

## Deviations from Plan

None — the plan executed as specified after its font-authority precondition received explicit approval.

## Issues Encountered

- Task 1 initially stopped because `Inter` is not a guaranteed iOS/Android platform family and no licensed local files were present. Execution resumed only after approval to obtain official Inter assets under the upstream SIL OFL 1.1 terms.
- RNTL 14 does not expose a `toHaveAccessibilityState` matcher in this Jest setup, so the same accessibility state is asserted directly from the rendered native element props.
- `npx expo install --check` now recommends `expo ~57.0.24` and `@expo/metro-runtime ~57.0.16`. This is external patch drift from the exact human-approved Phase 1 matrix, not a change caused by this plan; it is recorded in `deferred-items.md` for a separately approved toolchain update.

## Verification

- 13 focused tests pass across both plan suites.
- The full 14-test repository suite passes.
- Strict TypeScript and Expo lint pass.
- Penpot evidence validation passes with exactly 15 colors and 9 typography records.
- Font binaries match retained SHA-256 values, PostScript names, and OS/2 weights 400, 600, and 700.

## Known Stubs

None.

## User Setup Required

None — fonts are repository-local and load through the shared Expo Storybook boundary.

## Next Phase Readiness

- Plan 01-05 can add the remaining scale tokens beside these immutable contracts.
- Plan 01-06 can render color and typography specimens knowing the shared preview boundary enforces exact font readiness.
- Toolchain patch recommendations remain deferred until the exact dependency matrix receives separate approval.

## Self-Check: PASSED

- All 11 implementation and test artifacts exist.
- Task commits `48e2908`, `9980b54`, `fb74e10`, and `50e93f5` exist in repository history.
- Focused and full tests, strict TypeScript, lint, Penpot evidence validation, and font binary-integrity checks pass.

---
*Phase: 01-foundations-storybook*
*Completed: 2026-09-18*
