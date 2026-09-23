---
phase: "03"
slug: "actions-forms-and-navigation-components"
status: warnings
audited: "2026-09-18"
baseline: "03-UI-SPEC.md"
implementation_baseline: "7cdfddd"
screenshots: "not-captured-no-running-dev-server"
overall_score: 20
max_score: 24
blockers: 0
warnings: 2
needs_human_review: true
---

# Phase 3 — UI Review

**Audited:** 2026-09-18  
**Baseline:** Approved `03-UI-SPEC.md` at commit `7cdfddd`  
**Implementation baseline:** commits `1e4a9f7`, `ba3dd8f`, `66eab1e`, and `7cdfddd`  
**Screenshots:** Not captured — no running server responded on ports 3000, 5173, or 8080 when the screenshot gate ran.  
**Automated verification:** `npm run verify:phase3` passed during this re-audit: TypeScript, Expo lint, 18 Jest suites/448 tests, design-source/component/artwork/verification validators, and bounded Expo-web Storybook smoke.  
**Native disposition:** `needs_human_review: true`. iOS/Android visual comparison, real 200% OS text/layout behavior, parent-bound hit testing, VoiceOver, and TalkBack remain Phase 5 obligations. Code, host-renderer, and Expo-web evidence are not treated as native visual or assistive-technology proof.

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 4/4 | Primary, field, validation, provider, and SectionHeader copy now agree with the approved source-backed contract, including `See all ›`. |
| 2. Visuals | 3/4 | Source geometry, hierarchy, artwork, and focus treatment are code-verified; screenshots and native Penpot comparison remain unavailable. |
| 3. Color | 4/4 | Semantic token use matches the approved roles, and ChoiceChip/Checkbox now render one shared two-point accent focus indicator. |
| 4. Typography | 2/4 | Canonical Inter metrics match retained evidence, but boundary stories still describe rather than execute real 200% text scaling across fixed-height controls. |
| 5. Spacing | 4/4 | Canonical dimensions now match the contract, including SectionHeader's 350×28 visual row inside the 354×44 interaction-clearance wrapper. |
| 6. Experience Design | 3/4 | Host-level controlled state, validation, semantics, and target declarations are strong; native target behavior and assistive-technology output remain unverified. |

**Overall: 20/24**

No host-tested implementation blocker remains. UIR-03-02, UIR-03-03, UIR-03-04, and UIR-03-05 are resolved. The two remaining warnings are deliberately not averaged upward: large-text behavior and native visual/target/assistive-technology acceptance still require evidence.

---

## Top 3 Priority Fixes

1. **Exercise real 200% text scaling in the native Storybook boundary catalogue** — run every text-bearing Boundary story with OS text scaling, capture the result, and correct any clipping, overlap, or unreachable action while preserving canonical source metrics.
2. **Capture representative iOS and Android visual comparisons** — compare all 13 families and key states with retained revision-296 references, recording intentional platform deviations rather than treating Expo web as visual authority.
3. **Complete physical target and assistive-technology review** — verify parent-bound hit areas and adjacent controls on-device, then record VoiceOver/TalkBack names, values, states, reading order, and focus order.

---

## Re-audit Resolution Matrix

| Finding | Status | Evidence |
|---------|--------|----------|
| UIR-03-02 — SectionHeader geometry | **Resolved** | `SectionHeader.tsx:85-106` renders a 350×28 `visualRow` inside a 354×44 `clearanceWrapper`; `tests/navigation-components.test.tsx:436-477` asserts both layers and the effective target. UI-SPEC records the same split at lines 106 and 231. |
| UIR-03-03 — duplicate focus indicator | **Resolved** | ChoiceChip and Checkbox no longer keep family-local focus state or change their inner border on focus; both retain a one-point neutral border (`ChoiceChip.tsx:111-126`; `Checkbox.tsx:68-83`) while shared `Pressable` owns the two-point focus outline (`primitives/Pressable.tsx:217-227`). Regression coverage was expanded in `tests/form-components.test.tsx`. |
| UIR-03-04 — blank Field trigger | **Resolved** | Trigger validation rejects empty/whitespace values without a nonblank placeholder (`Field.tsx:161-185`), rendering uses the controlled value or validated placeholder (`Field.tsx:336-368`), and tests cover announced placeholder plus failure directions (`tests/form-components.test.tsx:279-320`). |
| UIR-03-05 — SectionHeader CTA copy | **Resolved** | The approved copy and source contract now specify exact revision-296 `See all ›` (`03-UI-SPEC.md:176,209`), matching the immutable registry, canonical story, and tests. |

---

## Detailed Findings

### Pillar 1: Copywriting (4/4)

- **Pass — the approved copy contract and retained source now agree.** The secondary CTA is explicitly `See all ›` as exact revision-296 copy (`03-UI-SPEC.md:176,209`), matching `sourceRegistry.ts:5963`, `SectionHeader.stories.tsx:28-32`, and the interaction tests.
- **Pass — primary, field, validation, and provider copy remains specific and actionable.** Canonical Button uses `Create game`; Field uses `Enter game name`, `Looks good`, and `Check this value`; provider actions are fixed to `Continue with Google`/`Continue with Apple`; AuthDivider defaults to `or`.
- **Pass — validation and required information remains visible as well as semantic.** Field displays required, helper, success, and error copy and mirrors relevant context into its accessible name/hint (`Field.tsx:206-220,240-267`). Unsupported runtime values use actionable diagnostics rather than silent substitution.
- The generic `Button label` strings are retained Penpot variant evidence, not product CTA recommendations. No generic `Submit`, `Click Here`, `OK`, `Cancel`, `Save`, invented collection empty state, or component-owned destructive confirmation was found.

### Pillar 2: Visuals (3/4)

- **Pass — source hierarchy and artwork retention remain strong.** The immutable evidence contains exactly 13 families/75 records at revision 296. The closed artwork manifest pins three vectors and five mascot WebPs by source identity and hash. AppHeader preserves mascot/title/subtitle/action hierarchy, BottomNavigation preserves fixed visual order, and nested artwork remains decorative.
- **Pass — focus rendering has one owner.** ChoiceChip and Checkbox now retain a neutral one-point inner border in every state and rely on shared `Pressable` for the two-point accent focus outline. The prior simultaneous inner border plus outer outline is gone.
- **Pass — SectionHeader distinguishes visual geometry from interaction clearance.** The source-authored 350×28 row is centered within a 354×44 wrapper, preserving section rhythm while containing the 40-point action and two-point expansion on each edge (`SectionHeader.tsx:85-106`).
- **WARNING UIR-03-06 — independent rendered visual evidence remains unavailable.** No server was running at the screenshot step. The successful Expo-web smoke proves bundle/startup and Storybook entry discovery, not component appearance or native fidelity. `needs_human_review: true` for brand feel, state differentiation, text pressure, and Penpot-to-native comparison.

### Pillar 3: Color (4/4)

- **Pass — semantic color distribution follows the approved roles.** Canvas is used for AppHeader/ghost context; surface and surfaceMuted carry controls; accent/surfaceAccent are bounded to primary, selected, active, pressed, and focus states; danger remains confined to destructive Button and Field error.
- **Pass — focus accent is no longer doubled.** The shared two-point outline is the sole focus indicator for ChoiceChip and Checkbox (`Pressable.tsx:224-226`; `ChoiceChip.tsx:120-121`; `Checkbox.tsx:77-78`).
- **Pass — provider colors remain fixed local artwork.** Google and Apple geometry/paints are hash-pinned and caller-invariant (`design-spec/assets/phase-3/artwork-manifest.json`; `generated/phase3Artwork.tsx`).
- Button's disabled surface still uses the tested family-local alpha composition required to reach the authored 0.32 final fill under shared 0.4 disabled opacity. It is an explicit traced exception, not decorative accent spread.

### Pillar 4: Typography (2/4)

- **Pass — canonical metrics match retained evidence.** Button/ChoiceChip/SegmentedControl use 12/600, DayTimeSelector and SocialSignIn use retained 15/600 and 11/400 treatments, BottomNavigation uses 10/600, and headers use 18/700 over 14/400. Runtime Inter assets are explicit and font scaling is not disabled.
- **WARNING UIR-03-01 — the required 200% behavior remains an unexecuted acceptance obligation.** Boundary stories contain long content and clearly disclose the Phase 5 requirement, while `phase3Backstops.nativeReview.fontScale200` remains `deferred-to-phase-5` (`storyContract.ts:300-329`; `tests/phase3-story-contracts.test.tsx:69-81`). They do not apply actual OS text scaling or an equivalent native layout condition.
- **Risk remains concentrated in compact fixed-height text regions.** Field's label row is 18 points and its control clips overflow; AppHeader is 112 points; AuthDivider is 24 points; SegmentedControl is 48 points with hidden overflow. These values are correct for canonical specimens, but native Boundary evidence must prove the large-text disposition rather than inferring it from accessible names or prose.
- `needs_human_review: true` for iOS/Android font metrics, wrapping/truncation, non-overlap, and required-action reachability at 200% OS text.

### Pillar 5: Spacing (4/4)

- **Pass — canonical component dimensions match the approved source contract.** Button is 160×40/48; IconButton is 40/44; Favourite is 44; ChoiceChip is 148×40 with 12-point inset; day/time selectors are 104×72 and 112×56; auth actions are 352×48; BottomNavigation is 390×76; SegmentedControl is 350×48; and AppHeader is 390×112.
- **Pass — UIR-03-02 is closed without sacrificing the target.** SectionHeader now exposes the exact 350×28 visual row inside a 354×44 wrapper. The wrapper supplies two points of clearance around the 40-point action so the shared two-point expansion fits without altering the authored visual row (`03-UI-SPEC.md:106,231`; `SectionHeader.tsx:85-106`).
- **Pass — family-local geometry stays private.** Source-specific 6-, 12-, and 22-point measurements remain fixed implementation geometry rather than new public spacing tokens or caller-selectable values.
- Native parent-bound hit-area behavior remains Phase 5 evidence, but no remaining code-level spacing deviation was found.

### Pillar 6: Experience Design (3/4)

- **Pass — Field triggers cannot be blank.** An empty or whitespace-only trigger value now requires a nonblank placeholder, and the same resolved string is visible and exposed through `accessibilityValue.text` (`Field.tsx:179-185,336-368`). The new Boundary story and failure-direction tests cover the corrected contract.
- **Pass — state and activation coverage is comprehensive at host level.** The 448 passing tests cover controlled values, next-value callbacks, blocked activation, loading/busy state, read-only editing, nested action isolation, exact composite order/cardinality, runtime rejection, visual geometry, and public-barrel closure.
- **Pass — semantic ownership is deliberate.** Controls own role/name/state/value; nested icons, hearts, provider marks, mascots, and divider rules remain decorative. Navigation items and segments remain individual tabs in visual order.
- **WARNING UIR-03-06 — native acceptance remains open.** Host tests can prove declared hitSlop and semantic props, but not parent clipping, physical adjacent-target behavior, VoiceOver/TalkBack announcements, or native focus/reading order. `design-spec/phase-3-verification.md` correctly retains these as `deferred-to-phase-5`; `needs_human_review: true`.

---

## Evidence Boundary

| Evidence type | What it proves | What it does not prove |
|---------------|----------------|------------------------|
| Revision-296 JSON/artwork manifests and validators | Exact family/record identity, geometry/typography metadata, local artwork bytes, deterministic order | Runtime native rendering fidelity |
| Jest/RNTL host tests | API closure, roles/names/states, callbacks, validation, declared styles and target expansion | Native layout, font metrics, parent-clipped hit areas, VoiceOver/TalkBack output |
| Expo-web Storybook smoke | Bundle starts and Storybook entry is discoverable | Pixel fidelity, interaction feel, mobile target behavior, native accessibility |
| Phase 5 iOS/Android review | Required future authority for visual, text-scale, physical target, and AT acceptance | Not yet performed |

Registry audit was skipped: `components.json` is absent, `shadcn_initialized` is false, and `03-UI-SPEC.md` lists no third-party component registry.

---

## Files Audited

- `AGENTS.md`
- All Phase 3 plans/summaries and `03-CONTEXT.md`, `03-RESEARCH.md`, `03-PATTERNS.md`, `03-VALIDATION.md`, `03-REVIEW.md`, `03-REVIEW-FIX.md`, and approved `03-UI-SPEC.md`
- Fix commits `1e4a9f7`, `ba3dd8f`, `66eab1e`, and `7cdfddd`
- All 13 Phase 3 component implementations, stories, barrels, generated artwork, source registry, and story contract under `src/design-system/`
- Consumed primitives and all color, typography, spacing, dimension, radius, border, and opacity token modules
- `tests/action-components.test.tsx`, `form-components.test.tsx`, `authentication-components.test.tsx`, `navigation-components.test.tsx`, `phase3-source-registry.test.ts`, `phase3-artwork.test.tsx`, and `phase3-story-contracts.test.tsx`
- `design-spec/components/phase-3-components.json`, `design-spec/assets/phase-3/`, and `design-spec/phase-3-verification.md`

---

## UI REVIEW COMPLETE

**Phase:** 03 — Actions, Forms, and Navigation Components  
**Overall Score:** 20/24  
**Screenshots:** Not captured; code/retained-evidence re-audit plus successful host/web verification  
**Resolved findings:** 4 (`UIR-03-02`, `UIR-03-03`, `UIR-03-04`, `UIR-03-05`)  
**Remaining warnings:** 2 (`UIR-03-01`, `UIR-03-06`)  
**Native disposition:** `needs_human_review: true` — Phase 5 must provide iOS/Android visual, real 200% text/layout, physical target, VoiceOver, and TalkBack evidence
