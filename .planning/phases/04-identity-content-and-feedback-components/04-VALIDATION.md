---
phase: "04"
slug: "identity-content-and-feedback-components"
status: draft
nyquist_compliant: false
wave_0_complete: false
created: "2026-09-18"
---

# Phase 04 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest `29.7.0` + `jest-expo` `57.0.5` + React Native Testing Library `14.0.1` |
| **Config file** | `package.json` (`jest.preset = "jest-expo"`) |
| **Quick run command** | `npm test -- --runInBand tests/<target>.test.tsx` |
| **Full suite command** | `npm run verify:phase4` (created in Wave 0) |
| **Estimated runtime** | ~180 seconds |

---

## Sampling Rate

- **After every task commit:** Run the targeted family test plus `npm run typecheck`.
- **After every plan wave:** Run `npm run lint && npm test -- --runInBand && npm run validate:design-source` plus the relevant Phase 4 validator.
- **Before `$gsd-verify-work`:** `npm run verify:phase4` and the bounded Storybook web smoke must be green.
- **Max feedback latency:** 180 seconds.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 04-W0-01 | TBD | 0 | All Phase 4 IDs | T-04-01 / T-04-02 / T-04-05 | Exact active revision-296 evidence, safe paths, and byte identity | registry | `npm test -- --runInBand tests/phase4-source-registry.test.ts` | ❌ W0 | ⬜ pending |
| 04-W0-02 | TBD | 0 | FDBK-01, FDBK-02, CARD-01 | T-04-02 / T-04-03 | Local fixed artwork with validated hashes and placements | artwork | `npm test -- --runInBand tests/phase4-artwork.test.tsx` | ❌ W0 | ⬜ pending |
| 04-ISP-01 | TBD | TBD | IDEN-01, IDEN-02, IDEN-03, STAT-01, PROG-01 | T-04-04 | Closed tuples, controlled state, callback suppression, semantics | unit + registry | `npm test -- --runInBand tests/identity-status-progress-components.test.tsx tests/phase4-source-registry.test.ts` | ❌ W0 | ⬜ pending |
| 04-CONT-01 | TBD | TBD | CONT-01, CONT-02, CONT-03, CONT-04, CONT-05, CONT-06, CONT-07 | T-04-04 | Named intent callbacks and explicit state without product behavior | unit + interaction | `npm test -- --runInBand tests/content-components.test.tsx` | ❌ W0 | ⬜ pending |
| 04-FDBK-01 | TBD | TBD | FDBK-01, FDBK-02, CARD-01 | T-04-03 / T-04-04 | Local deterministic media and authored callback branches | unit + artwork | `npm test -- --runInBand tests/feedback-card-components.test.tsx tests/phase4-artwork.test.tsx` | ❌ W0 | ⬜ pending |
| 04-STORY-01 | TBD | TBD | All Phase 4 IDs | T-04-05 | Complete 15-family/76-record provenance and bounded controls/actions | contract | `npm test -- --runInBand tests/phase4-story-contracts.test.tsx` | ❌ W0 | ⬜ pending |
| 04-TYPE-01 | TBD | TBD | All Phase 4 IDs | T-04-04 | Impossible tuples rejected at compile time | typecheck fixture | `npm run typecheck` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `scripts/extract-phase-4-components.mjs` and `scripts/validate-phase-4-components.mjs` — exact 15-family/76-record source proof.
- [ ] `scripts/extract-phase-4-artwork.mjs` and `scripts/validate-phase-4-artwork.mjs` — six-media/seven-placement proof and three new local WebPs.
- [ ] `tests/phase4-source-registry.test.ts` — immutable registry, normalization, active-record exclusion, geometry, and byte identity.
- [ ] `tests/phase4-artwork.test.tsx` — hashes, static paths, decorative semantics, and placement mapping.
- [ ] `tests/identity-status-progress-components.test.tsx`, `tests/content-components.test.tsx`, and `tests/feedback-card-components.test.tsx` — family behavior and interaction coverage.
- [ ] `tests/types/phase4-component-contracts.typecheck.tsx` — compile-time negative fixtures.
- [ ] `tests/phase4-story-contracts.test.tsx` and `scripts/validate-phase-4-verification.mjs` — catalogue and evidence closure.
- [ ] `verify:phase4` and `validate:phase4-verification` package scripts.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Final approved Empty State body and CTA copy | FDBK-02 | Canonical revision 296 contains generic copy that conflicts with the UI quality gate | Resolve the design/product copy decision, update the canonical source or record an approved deviation, then confirm the exact visible and accessible strings in Storybook. |
| Native visual and assistive-technology acceptance | Phase 5 VRFY-01, VRFY-02, VRFY-05 | iOS/Android rendering and VoiceOver/TalkBack require native devices or runners | Deferred to Phase 5; Phase 4 must retain deterministic references and explicit deferral metadata. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies.
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify.
- [ ] Wave 0 covers all MISSING references.
- [ ] No watch-mode flags.
- [ ] Feedback latency < 180 seconds.
- [ ] `nyquist_compliant: true` set in frontmatter.

**Approval:** pending
