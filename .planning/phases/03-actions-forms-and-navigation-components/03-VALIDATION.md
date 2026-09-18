---
phase: "03"
slug: "actions-forms-and-navigation-components"
status: draft
nyquist_compliant: false
wave_0_complete: false
created: "2026-09-18"
---

# Phase 03 — Validation Strategy

> Per-phase validation contract for source evidence, controlled React Native behavior, Storybook coverage, and fast execution feedback. Native visual and assistive-technology acceptance remains assigned to Phase 5.

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest `29.7.0`, `jest-expo` `57.0.5`, React Native Testing Library `14.0.1` |
| **Config file** | `package.json` (`jest.preset = jest-expo`) |
| **Quick run command** | `npm test -- --runInBand <affected-test-file> && npm run typecheck` |
| **Full suite command** | `npm run typecheck && npm run lint && npm test -- --runInBand && npm run validate:design-source && node scripts/validate-phase-3-components.mjs && npm run storybook:web:smoke` |
| **Estimated runtime** | Focused checks under 30 seconds; full gate under 120 seconds |

## Sampling Rate

- **After every task commit:** Run the owning focused test file plus `npm run typecheck`.
- **After every plan wave:** Run all Phase 3 test files, `npm run lint`, and `npm run validate:design-source`.
- **Before `$gsd-verify-work`:** The full suite command must be green.
- **Max focused feedback latency:** 30 seconds.

## Requirement Verification Map

| Requirement | Behavior | Test Type | Automated Command | File Exists | Status |
|-------------|----------|-----------|-------------------|-------------|--------|
| ACTN-01 | Button exact sparse records, variants, blocked/loading activation, semantics, and geometry | component + source | `npm test -- --runInBand tests/action-components.test.tsx` | ❌ Wave 0 | ⬜ pending |
| ACTN-02 | IconButton authored sizes/icons/states, required accessible name, and target contract | component | `npm test -- --runInBand tests/action-components.test.tsx` | ❌ Wave 0 | ⬜ pending |
| ACTN-03 | Favourite controlled next-value callback and both authored states | component | `npm test -- --runInBand tests/action-components.test.tsx` | ❌ Wave 0 | ⬜ pending |
| FORM-01 | Field editable, trigger, and stepper branches plus validation/read-only states | component | `npm test -- --runInBand tests/form-components.test.tsx` | ❌ Wave 0 | ⬜ pending |
| FORM-02 | ChoiceChip sparse option/filter/icon states with radio/checkbox semantics | component | `npm test -- --runInBand tests/form-components.test.tsx` | ❌ Wave 0 | ⬜ pending |
| FORM-03 | Checkbox controlled checked state and blocked behavior | component | `npm test -- --runInBand tests/form-components.test.tsx` | ❌ Wave 0 | ⬜ pending |
| FORM-04 | Day/time geometry, controlled radio selection, and disabled behavior | component | `npm test -- --runInBand tests/form-components.test.tsx` | ❌ Wave 0 | ⬜ pending |
| AUTH-01 | Google/Apple source records, local artwork, states, and callback-only behavior | component + asset | `npm test -- --runInBand tests/authentication-components.test.tsx` | ❌ Wave 0 | ⬜ pending |
| AUTH-02 | Auth Divider readable text and decorative rule semantics | component | `npm test -- --runInBand tests/authentication-components.test.tsx` | ❌ Wave 0 | ⬜ pending |
| NAVG-01 | Five ordered destinations, selected semantics, and destination callback | component | `npm test -- --runInBand tests/navigation-components.test.tsx` | ❌ Wave 0 | ⬜ pending |
| NAVG-02 | Exactly 2/3/4 controlled segments, selection, and blocked state | component | `npm test -- --runInBand tests/navigation-components.test.tsx` | ❌ Wave 0 | ⬜ pending |
| NAVG-03 | Nine AppHeader configurations with exact visible/absent actions and callbacks | component + source | `npm test -- --runInBand tests/navigation-components.test.tsx` | ❌ Wave 0 | ⬜ pending |
| NAVG-04 | SectionHeader heading and conditional action/callback pair | component | `npm test -- --runInBand tests/navigation-components.test.tsx` | ❌ Wave 0 | ⬜ pending |
| All | Exact revision 296 identity, 13 families, 75 records, order, normalizations, and asset hashes | source contract | `node scripts/validate-phase-3-components.mjs && npm test -- --runInBand tests/phase3-source-registry.test.ts` | ❌ Wave 0 | ⬜ pending |
| All | Required titles, five-category applicability, bounded controls, provenance, and record coverage | story contract | `npm test -- --runInBand tests/phase3-story-contracts.test.tsx` | ❌ Wave 0 | ⬜ pending |

## Wave 0 Requirements

- [ ] `design-spec/components/phase-3-components.json` — normalized revision-296 evidence for all 75 active records.
- [ ] `scripts/extract-phase-3-components.mjs` and `scripts/validate-phase-3-components.mjs` — deterministic extraction and fail-closed validation.
- [ ] Retained local heart, provider, and mascot assets plus generated runtime modules.
- [ ] `src/design-system/components/sourceRegistry.ts` — immutable family, record, normalization, and source mapping.
- [ ] `tests/phase3-source-registry.test.ts` — exact identity/count/order/axis/normalization/asset proof.
- [ ] `tests/action-components.test.tsx` — ACTN-01 through ACTN-03.
- [ ] `tests/form-components.test.tsx` — FORM-01 through FORM-04.
- [ ] `tests/authentication-components.test.tsx` — AUTH-01 through AUTH-02.
- [ ] `tests/navigation-components.test.tsx` — NAVG-01 through NAVG-04.
- [ ] `tests/phase3-story-contracts.test.tsx` — taxonomy, titles, bounded controls, provenance, and retained-record coverage.
- [ ] Phase 3 verification record/validator and `verify:phase3` script analogous to Phase 2.

## Security Verification

| Threat | Secure behavior | Automated witness |
|--------|-----------------|-------------------|
| Malformed, traversal, oversized, or tampered Penpot archive input | Reuse bounded archive parsing and reject unsafe or identity-drifted evidence | `node scripts/validate-phase-3-components.mjs` controlled rejection cases |
| Runtime/network asset substitution | Runtime imports only retained local hashed assets; no Penpot or provider fetch | Source registry/asset tests and static validator |
| Unsupported JavaScript values bypass TypeScript | Closed registries and runtime validators reject with actionable diagnostics | Component/source contract tests |
| Blocked or nested controls fire the wrong callback | Disabled/loading emits zero; enabled target emits once; nested target invokes only its handler | RNTL interaction suites |
| Authentication scope creep | Social controls remain callback-only with no SDK, network, token, or persistence behavior | Dependency/static scan plus component tests |

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Phase 5 instructions |
|----------|-------------|------------|----------------------|
| Penpot-to-native visual fidelity on representative iOS and Android devices | All Phase 3 IDs | Jest/web cannot prove native pixels, measurement, or rendering | Capture canonical/state stories on both platforms and compare against retained revision-296 references. |
| VoiceOver/TalkBack names, values, checked/selected state, and focus order | All interactive IDs | Host semantics do not reproduce native assistive output | Traverse representative Interactive stories with both screen readers and record device/OS/results. |
| 200% native font scale, hit-target clipping, and adjacent target behavior | All interactive IDs | Host props cannot prove native reflow or hit resolution | Exercise Boundary stories at 200% and constrained parents on iOS/Android; record reachability and clipping. |

These are explicit deferred Phase 5 acceptance items, not automated Phase 3 passes.

## Validation Sign-Off

- [ ] Every planned task has an `<automated>` verify command or a Wave 0 dependency.
- [ ] Sampling continuity has no three consecutive tasks without automated verification.
- [ ] Wave 0 creates every missing test, source registry, asset, and validator referenced above.
- [ ] Every runnable command has an observable failing direction and uses no watch mode.
- [ ] Full host/web gate is green without claiming native acceptance.
- [ ] `nyquist_compliant: true` is set only after validation evidence exists.

**Approval:** pending
