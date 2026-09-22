---
phase: "05"
slug: "native-catalogue-validation-and-coverage-audit"
status: draft
shadcn_initialized: false
preset: none
created: "2026-09-22"
---

# Phase 05 — UI Design Contract

> Visual and interaction contract for preparing the existing React Native Storybook catalogue for user-led native validation. This phase adds validation and audit affordances; it does not create a new product UI or redesign the catalogue.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | Custom Penpot-derived React Native design system |
| Preset | Not applicable — shadcn is not part of this Expo/React Native stack |
| Component library | Project-owned components in `src/design-system` rendered by React Native Storybook 10.5.0 |
| Icon library | Project-owned typed `Icon` registry generated from Penpot geometry |
| Font | Inter 4.1, bundled as regular 400, semibold 600, and bold 700 static families |
| Design authority | Committed `design-source/padel-potato UI Concepts.penpot`; revision 296 for reusable component families, with retained Phase 1/2 provenance |

Phase 5 must consume the established tokens, components, stories, and source registries unchanged unless manual review reveals a defect. It must not introduce a second component library, a new theme, web-only visual conventions, or product-screen chrome.

---

## Component Inventory

Enumerated by `Get-ChildItem -Path @('src/design-system/assets','src/design-system/primitives','src/design-system/components') -Recurse -Filter '*.tsx' | Where-Object { $_.Name -notmatch '\.stories\.tsx$' -and $_.FullName -notmatch '\\generated\\' } | Measure-Object` — 36 components — `padel-potato@1.0.0` — 2026-09-22.

This table groups the enumerated components for readability. It is a non-exhaustive list of known-good public catalogue surfaces, not a closed allowlist; generated artwork, tokens, foundations, and story-only fixtures are audited separately.

| Component | Import path | Validation use |
|-----------|-------------|----------------|
| `BrandLockup`, `BrandLockupStacked`, `Icon` | `src/design-system/assets` | Review retained brand assets and the complete typed icon set. |
| `Text`, `Stack`, `Inline`, `Surface`, `Pressable` | `src/design-system/primitives` | Review token application, constrained layout, press states, and shared accessibility behavior. |
| `Button`, `IconButton`, `Favourite` | `src/design-system/components/actions` | Review action variants, persistent/transient states, target size, and callbacks. |
| `SocialSignInButton`, `AuthDivider` | `src/design-system/components/authentication` | Review provider variants and static divider content without implying real authentication. |
| `Field`, `ChoiceChip`, `Checkbox`, `DayTimeSelector` | `src/design-system/components/forms` | Review supported form variants, controlled state, validation, boundaries, and interactions. |
| `BottomNavigation`, `SegmentedControl`, `AppHeader`, `SectionHeader` | `src/design-system/components/navigation` | Review authored configurations, ordering, allocation, actions, and long-content behavior. |
| `Avatar`, `AvatarGroup`, `AvatarPicker` | `src/design-system/components/identity` | Review image/initial states, presence, cardinality, and picker actions. |
| `StatusChip` | `src/design-system/components/status` | Review semantic styles and selected/disabled state. |
| `StepProgress` | `src/design-system/components/progress` | Review authored progress values and state treatment. |
| `PlayerItem`, `GameCard`, `NotificationRow`, `SettingsRow`, `StatTile`, `ScoreResultBlock`, `PlayerPreferencesCard` | `src/design-system/components/content` | Review every retained content configuration, read order, boundaries, and applicable interactions. |
| `BannerToast`, `EmptyState` | `src/design-system/components/feedback` | Review feedback types, message hierarchy, actions, and close behavior. |
| `IllustratedCard` | `src/design-system/components/cards` | Review all authored illustration/content/action combinations. |

The catalogue also includes the `Foundations/Overview` and `Foundations/Smoke` story groups. The coverage audit must account for all foundation token categories plus all 36 component implementations and their applicable story contracts.

---

## Spacing Scale

Any validation-only UI introduced by Phase 5 must use this constrained layout scale. These values govern validation summaries or catalogue framing only; they do not replace or extend the public Penpot token API.

| Token | Value | Usage |
|-------|-------|-------|
| Validation 1 | 4px | Tight inline and audit-status gaps |
| Validation 2 | 8px | Compact related-item spacing |
| Validation 3 | 16px | Default validation content and catalogue horizontal padding |
| Validation 4 | 24px | Catalogue vertical padding and section gaps |
| Validation 5 | 32px | Major validation-section separation |
| Validation 6 | 48px | Optional large report-section break |
| Validation 7 | 64px | Optional top-level report separation |

The inherited Penpot values 12px (`space12`), 20px (`space20`), and 40px (`space40`) remain visible in foundation specimens and inside existing source-backed components for audit. They are not permitted as new Phase 5 validation-surface layout spacing. Effective interactive targets may use the established 44-point minimum dimension; that is a dimension/accessibility rule, not spacing.

---

## Typography

Any UI newly introduced for Phase 5 validation is limited to the following four sizes and two weights. It should normally remain technical output rather than adding chrome to Storybook.

| Validation role | Size | Weight | Line Height |
|-----------------|------|--------|-------------|
| Metadata | 11px | 400 | 13.2px |
| Status label | 12px | 600 | 14.4px |
| Body | 14px | 400 | 16.8px |
| Validation heading | 15px | 600 | 18px |

The nine rows below are inherited Penpot typography specimens, not the Phase 5 validation-surface ramp. They remain visible and auditable because FNDT-02 requires the complete source type system; Phase 5 must not remove or restyle them to match the narrower validation ramp.

| Inherited Penpot specimen | Size | Weight | Line Height |
|---------------------------|------|--------|-------------|
| Micro | 10px | 600 | 12px |
| Caption | 11px | 400 | 13.2px |
| Label | 12px | 600 | 14.4px |
| Body | 14px | 400 | 16.8px |
| Body Strong | 15px | 600 | 18px |
| Heading | 18px | 700 | 21.6px |
| Section | 20px | 700 | 24px |
| Title | 25px | 700 | 30px |
| Display | 28px | 700 | 33.6px |

All text uses the matching bundled static Inter family. The catalogue must continue to gate story rendering on font readiness and must show an explicit loading or error state rather than silently falling back to a system font.

---

## Color

The percentages describe hierarchy, not a requirement to measure pixels. Existing semantic tokens remain authoritative.

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | Canvas `#FBF8F0` | Storybook catalogue frame and broad background area |
| Secondary (30%) | Surface `#FFFFFF`, surface muted `#F0F0EB`, deep `#384540` | Component surfaces, subdued regions, and authored high-contrast navigation/content areas |
| Accent (10%) | Accent `#ADE533`, surface accent `#D1F28A` | Authored primary emphasis, selected states, progress/focus treatment, and components whose Penpot source explicitly uses accent |
| Destructive | Danger `#FFD6D6` | Authored destructive/error treatment only |

Accent reserved for: source-backed primary emphasis, selected/active state, progress indication, and visible keyboard/focus treatment. It must not be added to audit reports, catalogue navigation, or every interactive element merely to signal clickability.

---

## Copywriting Contract

Phase 5 adds no review dashboard, sign-off form, or issue-entry UI. Existing component story copy remains source-backed; technical audit output uses concise factual status terms.

| Element | Copy |
|---------|------|
| Primary CTA | Not applicable — the user opens and browses native Storybook using the existing launch commands |
| Empty state heading | Not applicable to the catalogue shell; the existing `Feedback/Empty State` stories retain their authored copy |
| Empty state body | No new catalogue empty state; a coverage report with zero audited records is a technical failure, not a friendly empty state |
| Error state | Font gate alert: `Foundation fonts failed to load. Restart Expo, then reload Storybook.` Audit output: identify the missing source/story mapping and the command to rerun |
| Destructive confirmation | Not applicable — Phase 5 introduces no destructive user action |
| Coverage statuses | `covered`, `dispositioned`, `missing`; every disposition includes a reason, while any unexplained `missing` status fails the audit |

Do not require the user to adopt these audit status terms when reporting visual issues. Plain conversational descriptions are valid; story name, platform, device details, and screenshots are helpful only when the user chooses to provide them.

---

## Validation Surface Contract

### Catalogue presentation

- Preserve the existing Storybook hierarchy and titles: Foundations, Assets, Primitives, Actions, Forms, Authentication, Navigation, Identity, Status, Progress, Content, Feedback, and Cards.
- The currently selected story specimen is the primary visual anchor and receives the available content viewport. Storybook navigation, controls, actions, and backgrounds remain subordinate inspection tools and must not compete with or visually obscure the specimen.
- Preserve the shared token-backed catalogue frame: canvas background, `space16` horizontal padding, and `space24` vertical padding/gap.
- Keep `Canonical`, `Variants`, `States`, `Boundaries`, and `Interactive` as the shared story taxonomy. A category may be absent only when the existing story contract records a non-empty inapplicability reason.
- Every Penpot foundation, public reusable component, variant record, and designed state must resolve to an implementation and Storybook witness or an explicit disposition. Unexplained omissions are failures.
- Do not add a checklist overlay, reviewer wizard, approval banner, mandatory screenshot collector, or product-style navigation around Storybook.

### Native review interaction

- iOS and Android Storybook are the visual and interaction authority. Expo web is a discovery and render-smoke lane only and cannot declare native visual acceptance.
- Controls may change only supported public props. Actions must expose the existing callbacks without adding product behavior, persistence, navigation, network access, or live data.
- Interactive examples must remain resettable by reopening/reloading the story and must not require a prior story to have been visited.
- The user chooses which stories to inspect, what issues to report, whether to attach screenshots, and what happens after review. Phase 5 must not block on a prescribed response format or formal approval ceremony.
- When the user reports a defect, fix the implementation or story witness, rerun applicable automated checks, and return the affected story for optional reinspection. Do not infer acceptance from silence.

### Automated audit presentation

- Produce deterministic, diffable coverage output derived from the retained Penpot manifest/source registries and story contracts, not from a manually maintained prose checklist alone.
- Provide a concise human-readable summary alongside any machine-readable manifest: totals, covered, explicitly dispositioned, and missing.
- Keep native visual judgment separate from automated facts. Automation may prove inventory, source identity, story presence, bundle exclusion, tests, and web smoke; it must not label a component visually approved on the user's behalf.
- Production-exclusion evidence must prove that disabled Storybook entry swapping leaves Storybook code outside the production-mode app bundle and product navigation.
- Retained evidence may record automated commands, environment facts available to the tooling, results, and existing deviations. Manual screenshots and device metadata remain optional.

---

## UI Considerations

Applicable state considerations resolved: 7 covered, 0 backstop, 0 unresolved; 1 dismissed as not applicable.

| Category | Element(s) | Status | Resolution / Reason |
|----------|------------|--------|---------------------|
| Empty / no data | Catalogue shell | Dismissed | Story discovery is a static local catalogue. Zero discovered/audited stories is an automated failure; component-level empty content remains covered by its existing stories. |
| Loading / in-flight | Story render root | Covered | `FoundationFontGate` exposes a labelled busy progress state with `Loading foundation fonts…` until bundled fonts are ready. |
| Error / failure | Story render root and audit output | Covered | Font load failure renders the accessible alert `Foundation fonts failed to load. Restart Expo, then reload Storybook.` Audit failures identify missing mappings and exit unsuccessfully rather than rendering a false completed state. |
| Populated / happy path | Catalogue and coverage report | Covered | The Storybook glob discovers all story files; the audit summary reports deterministic totals and links each audited item to its witness or disposition. |
| Partial / incomplete | Coverage report | Covered | Covered and dispositioned records remain visible while any unexplained missing record makes the audit fail. Partial results are never presented as complete. |
| Overflow / truncation | Boundary stories and catalogue viewport | Covered | Existing `Boundaries` stories provide constrained-width witnesses; the native catalogue remains scrollable and must not hide controls or required content. |
| Zero / one / many | Applicable collection components and audit totals | Covered | Existing source-backed variants preserve authored cardinalities; the audit accounts for every retained record without synthesizing missing members. |
| Long text | Boundary stories and assistive-text review | Covered | Existing boundary witnesses preserve readable content and accessible names. Native review may expose 200% font-scale issues conversationally; no mandatory review form is imposed. |

Open accessibility contract: retain the established 44-point effective target rule, stable semantic roles/names/states, logical focus/read order, and the existing VoiceOver/TalkBack-compatible component semantics. Phase 5 makes these available for native review but does not require the user to submit a per-story accessibility checklist.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| None | None | Not applicable — no shadcn or third-party component registry is introduced |

All validation additions must use the existing local project code and installed dependency set unless separately approved through the project's package-legitimacy process.

---

## Checker Sign-Off

This is the automated UI-SPEC quality gate only; it is not a request for the user to formally approve the Storybook catalogue.

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS
- [ ] Dimension 7 Inventory Provenance: PASS

**Approval:** pending checker verification
