---
phase: "02"
slug: "primitives-assets-and-component-contracts"
status: draft
nyquist_compliant: false
wave_0_complete: false
created: "2026-09-18"
---

# Phase 02 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | `jest-expo 57.0.5` + `@testing-library/react-native 14.0.1` |
| **Config file** | `package.json` (`preset: jest-expo`) |
| **Quick run command** | `npm test -- --runInBand <affected-test-file>` |
| **Full suite command** | `npm run typecheck && npm run lint && npm test -- --runInBand && node scripts/validate-penpot-assets.mjs && npm run storybook:web:smoke` |
| **Estimated runtime** | ~30 seconds after asset extraction is available |

---

## Sampling Rate

- **After every task commit:** Run TypeScript plus the affected test file; asset tasks also run `node scripts/validate-penpot-assets.mjs`.
- **After every plan wave:** Run `npm run typecheck && npm run lint && npm test -- --runInBand`.
- **Before `$gsd-verify-work`:** The full suite, asset validator, Storybook web smoke, and evidence reconciliation must be green.
- **Max feedback latency:** 60 seconds for automated gates; native/manual checks are explicit checkpoints.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-W0-01 | TBD | 0 | PRIM-03, PRIM-04 | T-02-01, T-02-02 | SVG input and output paths fail closed | evidence/schema | `node scripts/validate-penpot-assets.mjs` | ❌ W0 | ⬜ pending |
| 02-W0-02 | TBD | 0 | PRIM-01, QUAL-01 | — | Unsupported values and reserved style keys reject | unit/component | `npm test -- --runInBand tests/primitive-contracts.test.tsx` | ❌ W0 | ⬜ pending |
| 02-W0-03 | TBD | 0 | PRIM-02, QUAL-04, QUAL-06 | T-02-03 | Disabled/loading interaction cannot invoke actions | interaction | `npm test -- --runInBand tests/pressable-contract.test.tsx` | ❌ W0 | ⬜ pending |
| 02-W0-04 | TBD | 0 | QUAL-02, QUAL-03 | — | Story controls cannot form unsupported combinations | story contract | `npm test -- --runInBand tests/story-contracts.test.tsx` | ❌ W0 | ⬜ pending |
| 02-W0-05 | TBD | 0 | QUAL-05, QUAL-07 | — | Semantics and large-text behavior remain observable | component/accessibility | `npm test -- --runInBand tests/accessibility-contracts.test.tsx` | ❌ W0 | ⬜ pending |
| 02-ASSET | TBD | 1+ | PRIM-03, PRIM-04 | T-02-01, T-02-02 | Only the exact 18 icons and two lockups are emitted locally | evidence/component | `node scripts/validate-penpot-assets.mjs && npm test -- --runInBand tests/asset-contracts.test.tsx` | ❌ W0 | ⬜ pending |
| 02-CLOSE | TBD | final | All Phase 2 IDs | all | Full phase boundary remains source-traced and local | integration | `npm run typecheck && npm run lint && npm test -- --runInBand && node scripts/validate-penpot-assets.mjs && npm run storybook:web:smoke` | partial | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `scripts/validate-penpot-assets.mjs` — failing schema, source, hash, path, and SVG-profile validator before generated assets exist.
- [ ] `tests/asset-contracts.test.tsx` — icon/lockup inventory, geometry, hashes, ratios, labels, and render contract.
- [ ] `tests/primitive-contracts.test.tsx` — token resolution, protected style properties, and explicit runtime rejection.
- [ ] `tests/pressable-contract.test.tsx` — activation suppression, state merge, focus behavior, and 40/44/48 effective-target mapping.
- [ ] `tests/story-contracts.test.tsx` — taxonomy, grouping, bounded controls/actions, coverage, and explicit inapplicability reasons.
- [ ] `tests/accessibility-contracts.test.tsx` — reusable role, name, value, state, icon, and large-text assertions.
- [ ] Active Penpot Components-tab checkpoint before any asset geometry is written.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Representative primitive composition at 200% native font scale | QUAL-07 | Jest cannot prove native text measurement, clipping, focus order, or assistive output | On an available physical/remote native route, open the Boundaries story, set 200% font scale, confirm text reflows with no clipped content or unreachable action, and record platform/device/conditions. If no route exists, record the explicit Phase 5 deferral without claiming native proof. |
| Screen-reader reading order and labelled/decorative icon distinction | QUAL-05, QUAL-07 | Native assistive-technology behavior is not reproduced by the Jest host tree | Enable VoiceOver or TalkBack on the available route, traverse the representative stories, confirm decorative icons are skipped and labelled icons/Pressable expose the intended role, name, value, and states. Otherwise record the Phase 5 deferral. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies.
- [ ] Sampling continuity: no three consecutive tasks without automated verification.
- [ ] Wave 0 covers all MISSING references.
- [ ] No watch-mode flags.
- [ ] Feedback latency is under 60 seconds for automated gates.
- [ ] `nyquist_compliant: true` is set in frontmatter after validation evidence exists.

**Approval:** pending
