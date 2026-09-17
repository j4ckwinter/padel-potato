---
phase: "1"
slug: "foundations-storybook"
status: draft
nyquist_compliant: false
wave_0_complete: false
created: "2026-09-17"
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | `jest-expo ~57.0.5` + `@testing-library/react-native 14.0.1` |
| **Config file** | None — Wave 0 creates the Expo/Jest configuration |
| **Quick run command** | `npm test -- --runInBand tests/tokens.test.ts tests/penpot-manifest.test.ts` |
| **Full suite command** | `npm run typecheck && npm run lint && npm test -- --runInBand && npx expo install --check && npx expo-doctor@latest` |
| **Estimated runtime** | ~180 seconds after dependencies are installed |

## Sampling Rate

- **After every task commit:** Run the narrowest affected Jest file plus `npm run typecheck`.
- **After every plan wave:** Run the full suite command.
- **Before `$gsd-verify-work`:** The full suite must be green and the Expo-web Storybook smoke check must pass.
- **Max feedback latency:** 180 seconds for automated checks, excluding the intentionally manual Storybook browser review.

## Per-Requirement Verification Map

| Requirement | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|-------------|-----------------|-----------|-------------------|-------------|--------|
| WORK-01 | Lockfile-backed install does not execute unapproved dependency overrides | install/typecheck | `npm ci && npm run typecheck` | ❌ W0 | ⬜ pending |
| WORK-04 | Storybook is served only from the local Expo development entry | web smoke | `npm run storybook:web` | ❌ W0 | ⬜ pending |
| WORK-06 | Expo compatibility checks report no dependency mismatch | tooling | `npx expo install --check && npx expo-doctor@latest` | ❌ W0 | ⬜ pending |
| PNPT-01 | MCP-derived data is normalized into the fixed `design-spec/` evidence scope | schema/unit | `npm test -- --runInBand tests/penpot-manifest.test.ts` | ❌ W0 | ⬜ pending |
| PNPT-02 | Every exported token has a Penpot source record | unit | `npm test -- --runInBand tests/tokens.test.ts` | ❌ W0 | ⬜ pending |
| PNPT-03 | Each retained reference render is present in the capture ledger | unit/file | `npm test -- --runInBand tests/penpot-manifest.test.ts` | ❌ W0 | ⬜ pending |
| PNPT-04 | Deviations require source, platform, reason, and disposition | schema/unit | `npm test -- --runInBand tests/deviations.test.ts` | ❌ W0 | ⬜ pending |
| FNDT-01 | Exactly 15 source-backed color tokens are exported | unit | `npm test -- --runInBand tests/tokens.test.ts` | ❌ W0 | ⬜ pending |
| FNDT-02 | Exactly 9 source-backed typography styles are exported | unit | `npm test -- --runInBand tests/tokens.test.ts` | ❌ W0 | ⬜ pending |
| FNDT-03 | Spacing, radius, dimension, border, and opacity manifest values are exported | unit | `npm test -- --runInBand tests/tokens.test.ts` | ❌ W0 | ⬜ pending |
| FNDT-04 | Foundation specimens consume token exports rather than unexplained literals | lint/unit | `npm run lint && npm test -- --runInBand tests/tokens.test.ts` | ❌ W0 | ⬜ pending |
| FNDT-05 | Typography waits for fonts and maps every authored family/weight | component | `npm test -- --runInBand tests/typography.test.tsx` | ❌ W0 | ⬜ pending |
| FNDT-06 | Every foundation category has a discoverable, renderable story | component | `npm test -- --runInBand tests/foundations-story.test.tsx` | ❌ W0 | ⬜ pending |

## Wave 0 Requirements

- [ ] Resolve the Expo 57 / Storybook 10.6 peer conflict without `--force`, `--legacy-peer-deps`, or Expo Doctor exclusions.
- [ ] Add Jest Expo and React Native Testing Library configuration.
- [ ] Add `typecheck`, `lint`, `test`, `storybook`, and `storybook:web` scripts.
- [ ] Create `tests/penpot-manifest.test.ts`, `tests/deviations.test.ts`, `tests/tokens.test.ts`, `tests/typography.test.tsx`, and `tests/foundations-story.test.tsx`.
- [ ] Add a deterministic browser smoke procedure for the Expo-web catalogue.
- [ ] Wake the Penpot MCP connection and capture the authoritative manifest and reference renders before token implementation.

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Expo-web Storybook navigation and representative gallery rendering | WORK-04, FNDT-06 | A running browser surface must be visually inspected | Run `npm run storybook:web`, open the printed local URL, navigate through each `Foundations/*` story, and confirm every story renders without an error overlay. |
| Foundations gallery fidelity against the retained Penpot render | PNPT-03, FNDT-05, FNDT-06 | Font metrics and visual arrangement require human comparison | Compare the browser gallery with the exported Penpot reference at the agreed viewport; record every mismatch in `design-spec/deviations.json`. |

## Validation Sign-Off

- [ ] All tasks have an `<automated>` verify command or an explicit Wave 0 dependency.
- [ ] Sampling continuity has no three consecutive tasks without automated verification.
- [ ] Wave 0 covers every currently missing test/configuration artifact.
- [ ] No watch-mode flags are used by automated verification.
- [ ] Automated feedback latency remains under 180 seconds.
- [ ] `nyquist_compliant: true` is set after the validation suite exists and passes.

**Approval:** pending
