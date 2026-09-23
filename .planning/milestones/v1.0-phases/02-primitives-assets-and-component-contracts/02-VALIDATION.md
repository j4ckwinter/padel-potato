---
phase: "02"
slug: "primitives-assets-and-component-contracts"
status: validated
nyquist_compliant: true
wave_0_complete: true
created: "2026-09-18"
validated: "2026-09-18"
---

# Phase 02 — Validation Strategy and Audit Record

> Adversarial validation of every Phase 2 requirement, plan task, and automated verify block against executable behavior. Native visual and assistive-technology acceptance remains explicitly deferred to Phase 5.

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | `jest-expo 57.0.5` + `@testing-library/react-native 14.0.1` |
| **Config file** | `package.json` (`preset: jest-expo`) |
| **Focused command** | `npm test -- --runInBand <affected-test-file>` |
| **Full command** | `npm run typecheck && npm run lint && npm test -- --runInBand && node scripts/validate-penpot-evidence.mjs && node scripts/validate-penpot-assets.mjs && node scripts/validate-toolchain-compatibility.mjs && npm run storybook:web:smoke` |
| **Observed result** | 10 suites, 294 tests, zero snapshots; all validators and Storybook web smoke green |

## Requirement Coverage

| Requirement | Observable behavior | Automated evidence | Status |
|-------------|---------------------|--------------------|--------|
| PRIM-01 | Text, Stack, Inline, Surface, and Icon resolve exact token-backed values through narrow public APIs. | `tests/primitive-contracts.test.tsx`, `tests/asset-contracts.test.tsx` | green |
| PRIM-02 | Enabled Pressable activates once; disabled/loading combinations activate zero times with matching semantics, opacity, focus, and target behavior. | `tests/pressable-contract.test.tsx` | green |
| PRIM-03 | Both local brand lockups preserve exact retained media, accessible identity, and 25:6 / 75:14 ratios. | `tests/asset-contracts.test.tsx`, `tests/story-contracts.test.tsx` | green |
| PRIM-04 | Exactly 18 source-ordered icons render through one typed local interface; missing, invalid, reordered, or unsafe evidence fails closed. | `node scripts/validate-penpot-assets.mjs`, `tests/asset-contracts.test.tsx` | green |
| QUAL-01 | Public props are closed over authored token/asset/state unions and cast/runtime violations reject instead of falling back. | Primitive, asset, Pressable, and story contract suites plus `npm run typecheck` | green |
| QUAL-02 | Every public export is covered by Canonical, Variants, States, Boundaries, and Interactive, or a non-empty inherent-inapplicability reason. | `tests/story-contracts.test.tsx` | green |
| QUAL-03 | Controls derive from closed registries and only the real Pressable callback is action-enabled. | `tests/story-contracts.test.tsx` | green |
| QUAL-04 | Interactive semantics, state combinations, activation counts, focus transitions, and blocked behavior are directly exercised. | `tests/pressable-contract.test.tsx`, `tests/accessibility-contracts.test.tsx` | green |
| QUAL-05 | Roles, labels, values, states, decorative exclusion, and Unicode pass-through are observable in rendered host behavior. | Primitive, asset, Pressable, and accessibility contract suites | green |
| QUAL-06 | 40/44/48 authored visual sizes declare an effective target of at least 44 points. | `tests/pressable-contract.test.tsx`, `tests/accessibility-contracts.test.tsx` | green (host contract) |
| QUAL-07 | Long/Unicode text remains uncapped, named, wrappable, queryable, and actionable; native 200% and assistive output remain deferred. | `tests/accessibility-contracts.test.tsx`, `tests/story-contracts.test.tsx` | green host contract; native manual-only |

## Per-Task Verification Map

| Task ID | Requirement | Behavioral witness | Automated command | Status |
|---------|-------------|--------------------|-------------------|--------|
| 02-01-01 | PRIM-03, PRIM-04, QUAL-01 | Exact Add source identity, authored geometry, paint normalization, local render, hashes, and controlled unsafe/stale rejections. | `node scripts/validate-penpot-assets.mjs && npm test -- --runInBand tests/asset-contracts.test.tsx && npm run typecheck` | green |
| 02-01-02 | PRIM-03, PRIM-04, QUAL-01 | Exact 18-icon order and two lockups; missing, extra, duplicate, reordered, null/unknown, and ratio drift reject. | `node scripts/validate-penpot-assets.mjs && npm test -- --runInBand tests/asset-contracts.test.tsx && npm run typecheck` | green |
| 02-01-03 | PRIM-03, PRIM-04, QUAL-01 | SVG/PNG tampering, traversal, altered bytes, malformed structure, palette errors, and nondeterministic generation fail closed. | `node scripts/validate-penpot-assets.mjs && npm test -- --runInBand tests/asset-contracts.test.tsx && npm run lint` | green |
| 02-02-01 | PRIM-01, QUAL-01, QUAL-05, QUAL-07 | Every typography/color token resolves exactly; reserved styles and invalid tokens reject; empty/Unicode/scaling behavior passes through. | `npm test -- --runInBand tests/primitive-contracts.test.tsx && npm run typecheck` | green |
| 02-02-02 | PRIM-01, QUAL-01, QUAL-05 | Stack/Inline resolve all spacing, preserve fixed direction and child order/cardinality, and reject owned-style bypasses. | `npm test -- --runInBand tests/primitive-contracts.test.tsx && npm run typecheck` | green |
| 02-02-03 | PRIM-01, QUAL-01 | Surface resolves exact visual tokens, rejects unsupported semantics, and public barrels preserve identities without exposing guards. | `npm test -- --runInBand tests/primitive-contracts.test.tsx tests/scale-tokens.test.ts tests/color-typography-tokens.test.ts && npm run typecheck && npm run lint` | green |
| 02-03-01 | PRIM-01, PRIM-04, QUAL-01, QUAL-05 | All 18 icon names render local geometry with exact token paint; decorative/labelled behavior and invalid input rejection are exercised. | `node scripts/validate-penpot-assets.mjs && npm test -- --runInBand tests/asset-contracts.test.tsx && npm run typecheck` | green |
| 02-03-02 | PRIM-03, QUAL-01, QUAL-05 | Both lockups derive exact ratios, use fixed local artwork, preserve/override accessible names correctly, and reject unsupported overrides. | `node scripts/validate-penpot-assets.mjs && npm test -- --runInBand tests/asset-contracts.test.tsx && npm run typecheck && npm run lint` | green |
| 02-04-01 | PRIM-02, QUAL-01, QUAL-04, QUAL-05, QUAL-06 | Enabled/disabled/loading combinations, alias precedence, caller state/value preservation, focus/blur, target geometry, and owned-style rejection are exercised. | `npm test -- --runInBand tests/pressable-contract.test.tsx && npm run typecheck` | green |
| 02-04-02 | QUAL-04, QUAL-05, QUAL-06 | Shared helpers fail on wrong role/name/state, assert exact press counts and target/token behavior, and distinguish decorative from labelled icons. | `npm test -- --runInBand tests/pressable-contract.test.tsx tests/accessibility-contracts.test.tsx && npm run typecheck` | green |
| 02-04-03 | PRIM-02, QUAL-05, QUAL-07 | Public interaction/testing boundaries and long Unicode constrained content retain scaling, name, state, and action reachability. | `npm test -- --runInBand tests/pressable-contract.test.tsx tests/accessibility-contracts.test.tsx tests/primitive-contracts.test.tsx && npm run typecheck && npm run lint` | green host contract |
| 02-05-01 | QUAL-02, QUAL-03, QUAL-07 | Exact story taxonomy/grouping, primitive provenance, bounded controls/action, state specimens, and zero/one/many/long-content witnesses render. | `npm test -- --runInBand tests/story-contracts.test.tsx tests/accessibility-contracts.test.tsx && npm run typecheck && npm run lint` | green |
| 02-05-02 | PRIM-03, PRIM-04, QUAL-02, QUAL-03 | Complete ordered icon gallery, both ratio-preserving lockups, exact provenance, decorative/labelled boundaries, and backstop markers render. | `node scripts/validate-penpot-assets.mjs && npm test -- --runInBand tests/story-contracts.test.tsx tests/asset-contracts.test.tsx tests/accessibility-contracts.test.tsx && npm run typecheck` | green |
| 02-05-03 | All Phase 2 IDs | Full static, behavioral, evidence, compatibility, and browser catalogue discovery/render path passes without claiming native proof. | Full command above | green automated; native manual-only |

## Sampling and Wave 0 Disposition

- All Wave 0 artifacts exist and execute: the asset validator plus asset, primitive, Pressable, accessibility, and story contract suites.
- Every task has a focused automated command and no three-task sampling gap exists.
- Commands are non-watch, deterministic, and completed well below the 60-second feedback budget in this audit.
- The active Penpot source checkpoint was execution-time provenance evidence. Current retained bytes are independently hash-, schema-, source-, profile-, and determinism-validated.

## Manual-Only Verifications

| Behavior | Requirement | Disposition | Phase 5 instructions |
|----------|-------------|-------------|----------------------|
| Representative composition at 200% native OS font scale | QUAL-07 | `deferred-to-phase-5` — Jest/web cannot prove native measurement, reflow, clipping, focus order, or reachability. | On real iOS and Android routes, open Boundaries/Interactive stories at 200%, confirm required content reflows without clipping/overlap/loss, and confirm the action remains reachable. Record device, OS, font scale, and capture conditions. |
| VoiceOver/TalkBack reading and focus order | QUAL-05, QUAL-07 | `deferred-to-phase-5` — host trees do not reproduce native assistive output. | Traverse representative stories with VoiceOver and TalkBack; verify order, names, roles, values, disabled/busy states, decorative icon omission, and labelled icon exposure. |
| Parent-bound target clipping and overlapping siblings | QUAL-06 | `deferred-to-phase-5` — host props prove declared geometry, not native hit resolution. | Exercise 40/44/48 targets on device, including constrained parents and adjacent controls; verify reliable activation and no unintended overlap. |

These items are not automated passes and do not constitute Phase 2 native acceptance.

## Audit Trail

| Date | Audit action | Result |
|------|--------------|--------|
| 2026-09-18 | Loaded all five Phase 2 PLANs and SUMMARYs, REQUIREMENTS.md, implementation modules, all ten test files, and the prior validation draft. | 15/15 plan tasks mapped to observable evidence. |
| 2026-09-18 | Ran TypeScript, Expo lint, and the complete Jest suite. | Pass: 10/10 suites, 294/294 tests, zero snapshots. |
| 2026-09-18 | Ran foundation evidence, asset evidence, and exact toolchain validators. | Pass: revision-292 foundations; 18 icons and two lockups; controlled rejections and deterministic regeneration; exact 23-package approval. |
| 2026-09-18 | Ran bounded Expo-web Storybook smoke. | Pass: Storybook entry bundled, discovered, served, and cleaned up. |
| 2026-09-18 | Adversarial gap review across PRIM-01..04, QUAL-01..07, all task behaviors, verify blocks, and fail conditions. | No automated coverage gaps found; no new tests required. Three native-only checks retained as explicit Phase 5 work. |

## Validation Sign-Off

- [x] All 15 tasks have an executable automated verify command.
- [x] All 11 Phase 2 requirements have behavioral automated evidence within the supported host boundary.
- [x] Every generated test was executed; 294/294 tests pass.
- [x] Asset and source-evidence validators fail closed under controlled mutations.
- [x] Storybook browser discovery/render smoke passes.
- [x] No watch-mode flags are used.
- [x] Native 200% font-scale, hit-target clipping, VoiceOver, and TalkBack proof remains manual-only and explicitly deferred to Phase 5.
- [x] `nyquist_compliant: true` accurately reflects automated Phase 2 coverage without overstating native acceptance.

**Approval:** validated
