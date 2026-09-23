---
phase: 02-primitives-assets-and-component-contracts
verified: 2026-09-18T15:46:00Z
status: passed
score: 15/16 must-haves verified
behavior_unverified: 0
overrides_applied: 0
decision_coverage:
  honored: 0
  total: 0
  not_honored: []
deferred:
  - truth: "Representative primitives remain usable at 200% native text scale and with VoiceOver/TalkBack on real iOS and Android routes."
    addressed_in: "Phase 5"
    evidence: "Phase 5 goal requires the completed catalogue to be native-ready and retain final platform/condition evidence; ROADMAP Phase 5 criteria 1, 3, and 5 cover native launch, platform comparison, and the evidence pack. design-spec/phase-2-verification.md records deferred-to-phase-5 without a native pass claim."
---

# Phase 2: Primitives, Assets, and Component Contracts Verification Report

**Phase Goal:** Developers have the reusable visual assets, primitives, typed states, story conventions, tests, and accessibility rules needed to build Penpot components consistently.
**Verified:** 2026-09-18T15:46:00Z
**Status:** passed
**Re-verification:** No - initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|---|---|---|
| 1 | Developers can compose token-backed text, layout, surface, icon, interaction, and brand primitives from approved Penpot assets. | VERIFIED | `Text`, `Stack`, `Inline`, `Surface`, `Icon`, `Pressable`, `BrandLockup`, and `BrandLockupStacked` are substantive public exports from `src/design-system/index.ts`. Exact token/render contracts pass in the full 297-test run. |
| 2 | Public component contracts express only supported Penpot variants and states. | VERIFIED | Closed token/name/size unions, runtime own-property checks, fixed brand props, style guards, and exact supported-value diagnostics are implemented and tested. `npm run typecheck` and cast/runtime rejection tests pass. |
| 3 | Stories follow one consistent Canonical, Variants, States, Boundaries, Interactive taxonomy. | VERIFIED | `storyContract.ts` fixes the exact order and accounts for all eight exports with either a story or a non-empty inherent-inapplicability reason; story contracts pass. |
| 4 | The shared harness verifies roles, names, values, states, presses, target geometry, tokens, and asset semantics. | VERIFIED | `src/design-system/testing/accessibility.ts` provides explicit RNTL helpers; its self-tests and Pressable contracts pass without snapshots or swallowed failures. |
| 5 | Representative primitives remain usable with large text and native assistive technology. | DEFERRED | Host-level scaling, long-text, semantic-name, and action-reachability contracts are verified. Real 200% native measurement, target clipping, VoiceOver, and TalkBack remain explicitly deferred to Phase 5 and are not claimed as passed here. |
| 6 | Exact revision-292 Penpot assets are retained locally before runtime APIs consume them. | VERIFIED | `penpot-live-observation.json` binds file `c514c1fb-1cda-8125-8008-a606253a77a3`, Components page `482a7222-5a3b-8086-8008-a6073072bbb1`, revision 292, observation time, extraction commit, and all 20 source identities. The independent asset validator passes. |
| 7 | The inventory contains exactly 18 ordered icons and both authored lockups without substitutions. | VERIFIED | Manifest, raw/normalized files, immutable registry, and gallery all contain the exact 18-name order and two lockups. Controlled missing/extra/duplicate/reordered mutations fail. |
| 8 | Unsafe, incompatible, untraceable, stale, or tampered exports fail closed. | VERIFIED | `validate-penpot-assets.mjs` is substantive and independently rerun; it validates fixed roots, hashes, SVG profile, PNG structure/palette/scanlines, source identity, ratios, and deterministic regeneration with controlled rejections. |
| 9 | The limited style escape hatch cannot override token-owned semantics. | VERIFIED | Caller layout styles are applied first and invariant styles last. Development/test guards flatten style arrays/registered styles and reject reserved or unsupported keys; primitive and Pressable bypass tests pass. |
| 10 | Presentational primitives preserve native accessibility props, Unicode content, and font-scaling defaults without inventing roles. | VERIFIED | Primitive tests exercise Unicode, empty/ordered children, caller labels/values/states, `allowFontScaling`, absent default caps, and absent inferred roles. |
| 11 | Icons and lockups are synchronous local modules with inherent-only accessibility behavior. | VERIFIED | Icons render immutable local XML and are decorative unless labelled; lockups require the two retained local PNGs, preserve exact 25:6 and 75:14 ratios, and default to `Padel Potato`. No runtime fetch or Penpot call exists. |
| 12 | Enabled Pressable activates once; disabled/loading states never activate and expose accurate disabled/busy state. | VERIFIED | Full suite includes direct `userEvent` behavior for enabled, disabled, loading, combined states, conflicting aliases, callback suppression, and focus/blur. |
| 13 | The 40, 44, and 48 authored control sizes declare an effective target of at least 44x44. | VERIFIED | `Pressable` derives 2-point symmetric hitSlop for 40 and zero for 44/48; helper and component tests verify exact host geometry. Native parent-bound clipping remains Phase 5 evidence, not a Phase 2 pass claim. |
| 14 | Storybook controls/actions expose only supported combinations and visible Penpot provenance. | VERIFIED | Select options derive from token/icon registries; `Pressable.onPress` is the sole action; Canonical stories render exact file/page/revision/source identity. Story tests cover absence/drift and unsupported controls. |
| 15 | The complete browser-viewable catalogue and all automated Phase 2 gates work without product integration. | VERIFIED | Independent `npm run verify:phase2` passed typecheck, lint, 11 suites/297 tests, foundation/asset/toolchain/native-claim validators, and a fresh Expo-web Storybook bundle/HTTP smoke. Static scans found no product screens, navigation, persistence, backend, or live data imports. |
| 16 | Overflow and long-text backstops preserve required content, accessible names, and reachable actions within the supported host boundary. | VERIFIED | Structured markers and rendered witnesses (`boundary-constrained-width`, `boundary-required-content`, `boundary-long-text-action`) are asserted by `story-contracts.test.tsx`; the evidence schema rejects a false native claim. |

**Score:** 15/16 truths verified; 1 native-only truth explicitly deferred to Phase 5 (0 present-but-behavior-unverified).

### Deferred Items

| # | Item | Addressed In | Evidence |
|---|---|---|---|
| 1 | Real-device 200% text reflow, parent-bound target clipping, focus/reading order, VoiceOver, and TalkBack behavior | Phase 5 | Phase 5 is the native catalogue validation/evidence phase. The structured Phase 2 record lists exact pending checks and says `deferred-to-phase-5`; `scripts/validate-phase-2-verification.mjs` rejects unsupported native-pass language. |

### Required Artifacts

| Artifact | Expected | Status | Details |
|---|---|---|---|
| `design-spec/assets/penpot-live-observation.json` / `penpot-assets.json` | Exact live-source identity, order, dimensions, paths, and hashes | VERIFIED | Revision 292, 20 source records, observation hash, raw/normalized/reference hashes, and fixed paths validate. |
| `design-spec/assets/raw/*` / `normalized/*` | Retained local icon and lockup bytes | VERIFIED | 18 raw and normalized SVGs plus two raw/normalized PNG lockups exist and pass byte/hash/profile validation. |
| `scripts/export-penpot-assets.mjs` / `validate-penpot-assets.mjs` | Deterministic fail-closed generation and validation | VERIFIED | Substantive fixed-map generator and 362-line validator; deterministic regeneration and named tamper cases pass. |
| `src/design-system/assets/generated/iconRegistry.ts` | Immutable complete local registry and `IconName` | VERIFIED | Generated source-ordered registry with local XML, IDs, revision, and hashes; consumed by `Icon`. |
| `src/design-system/primitives/{Text,Stack,Inline,Surface,Pressable}.tsx` | Public token-backed primitive layer | VERIFIED | All exist, are substantive, exported, story-consumed, and behavior/value tested. |
| `src/design-system/assets/{Icon,BrandLockup,BrandLockupStacked}.tsx` | Public local asset APIs | VERIFIED | All exist, exported, rendered by stories/tests, and have closed props and semantics. |
| `src/design-system/testing/accessibility.ts` | Reusable behavior-oriented test helpers | VERIFIED | Explicit helper API is exported through the test-only barrel and exercised against real components. |
| `src/design-system/stories/storyContract.ts` | Taxonomy, applicability, source, and backstop contract | VERIFIED | Immutable contract covers all eight exports, exact taxonomy, source identities, and host/native distinction. |
| Six Phase 2 story files | Browser/native Storybook catalogue groups | VERIFIED | Four primitive groups and two asset groups exist, match the discovery glob, render in tests, and compile in the live web smoke. Generic artifact-query wildcard misses were manually resolved. |
| Five focused Phase 2 test suites | Asset, primitive, Pressable, accessibility, and story proof | VERIFIED | Active suites pass in the independent full run; no skipped/todo tests or snapshots. |
| `design-spec/phase-2-verification.md` | Honest automated outcome and native disposition | VERIFIED | Validator passes and controlled mutations prove only concrete device evidence or explicit deferral is accepted. |

All 22 concrete artifact declarations in Plans 02-01 through 02-04 passed the artifact query. Plan 02-05's two reported misses were glob strings rather than absent files; all six matching story files exist and were compiled by Storybook.

### Key Link Verification

| From | To | Via | Status | Details |
|---|---|---|---|---|
| Live Penpot observation | Asset manifest and local bytes | Exact file/page/revision/source IDs plus hashes | WIRED | Observation hash and every record are checked before generation/validation. |
| Asset manifest/local bytes | Generated icon registry | Source order, normalized XML, SHA-256 | WIRED | Generator emits the immutable registry; asset tests compare manifest and registry records. |
| Primitive modules | Public token barrel | Closed token props and exact lookup | WIRED | Every primitive imports `../tokens`; value-level tests cover complete registries. The generic checker only missed the plan's wildcard source path. |
| `Icon.tsx` | Generated registry / `react-native-svg` | Closed name lookup and `SvgXml` | WIRED | Every registered name renders; runtime rejection and local-only scans pass. |
| Lockup components | Retained normalized PNGs | Static `require` and exact ratio arithmetic | WIRED | Both files resolve in tests and Storybook; no URL/loading branch exists. |
| `Pressable.tsx` | Tokens and native Pressable | One blocked predicate, focus events, min size/hitSlop | WIRED | Direct behavior tests prove activation/state/focus/geometry paths. |
| Testing helpers | RNTL rendered hosts | Role/name/value/state queries and `userEvent.press` | WIRED | Helper self-tests deliberately exercise success and failure propagation. |
| Story contract | Six CSF story files | Exact groups/categories/provenance/backstops | WIRED | Story tests import and render each applicable export; omissions require reasons. |
| `.rnstorybook/main.ts` | Phase 2 stories | `../src/**/*.stories.?(ts|tsx|js|jsx)` | WIRED | Fresh web smoke compiled `.rnstorybook/index.tsx` and 1,471 modules, confirming discovery/render entry. |

### Data-Flow Trace (Level 4)

This phase intentionally has no database, API, product state, or live data. Its source-backed flows are:

| Artifact | Rendered value | Source | Produces real source-backed data | Status |
|---|---|---|---|---|
| `Icon` | SVG geometry and semantic color | Live-observed raw SVG -> validated normalized SVG -> generated registry + public color token | Yes | FLOWING |
| Brand lockups | Authored artwork and ratio | Live-observed/hash-validated local PNGs + fixed authored dimensions | Yes | FLOWING |
| Text/layout/surface/Pressable | RN host styles and semantic state | Public immutable tokens plus caller-supported props | Yes | FLOWING |
| Storybook catalogue | Primitive/asset specimens and provenance | Public exports, immutable story contract, retained source identities | Yes | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|---|---|---|---|
| Complete Phase 2 gate | `npm run verify:phase2` | Exit 0; typecheck/lint passed, 11/11 suites and 297/297 tests passed, zero snapshots | PASS |
| Penpot foundation evidence | included in `verify:phase2` | 15 colors, 9 typography styles, 8 spacing, 6 radii, 4 dimensions, 2 borders, 1 opacity; controlled rejections passed | PASS |
| Penpot asset evidence | included in `verify:phase2` | Live observation, exactly 18 icons and 2 lockups, controlled rejections and deterministic regeneration passed | PASS |
| Toolchain integrity | included in `verify:phase2` | Exact approved 23-package manifest/lockfile and clean Expo/Storybook probe passed | PASS |
| Native-claim honesty | included in `verify:phase2` | `deferred-to-phase-5` record accepted; controlled false-claim rejections passed | PASS |
| Browser catalogue | included in `verify:phase2` | Fresh Expo-web bundle served on a temporary port; Storybook entry confirmed; process cleaned up | PASS |

### Probe Execution

No conventional `scripts/**/tests/probe-*.sh` file or plan-declared shell probe exists. The phase-declared validators and browser smoke were executed above in the verifier's own process.

### Requirements Coverage

| Requirement | Source Plan(s) | Description | Status | Evidence |
|---|---|---|---|---|
| PRIM-01 | 02-02, 02-03 | Token-backed text, layout, surface, and icon primitives | SATISFIED | Public implementations, exact token tests, icon render tests, barrels, and stories pass. |
| PRIM-02 | 02-04 | Consistent press, disabled, loading, focus, accessibility behavior | SATISFIED | Direct state-transition and callback-count tests pass. |
| PRIM-03 | 02-01, 02-03 | Both Penpot brand lockups reusable | SATISFIED | Exact local assets, source IDs/hashes, ratios, components, semantics, and stories verify. |
| PRIM-04 | 02-01, 02-03 | Complete Penpot icon set through typed interface | SATISFIED | Exact 18-name order, generated union, local render, gallery, and controlled rejection pass. |
| QUAL-01 | 02-01..02-04 | Typed props constrained to supported Penpot variants | SATISFIED | Closed unions, narrow barrels, typecheck, and runtime cast rejection pass. |
| QUAL-02 | 02-05 | Canonical/variant/state/boundary story coverage | SATISFIED | Immutable applicability matrix and rendered story tests cover all eight exports. |
| QUAL-03 | 02-05 | Useful bounded controls and actions | SATISFIED | Registry-derived selects and sole real Pressable action are asserted. |
| QUAL-04 | 02-04 | Semantic and interaction tests for interactive components | SATISFIED | Pressable and shared-helper suites directly exercise behavior, not snapshots. |
| QUAL-05 | 02-02..02-04 | Appropriate roles, labels, values, and states | SATISFIED within host contract | Rendered host semantics, pass-through, invariant precedence, decorative/labelled assets, and Unicode are tested; native AT output is deferred. |
| QUAL-06 | 02-04 | Native touch-target rule | SATISFIED within declared host contract | Exact 40/44/48 min-size and hitSlop math passes; physical clipping/overlap evidence is Phase 5. |
| QUAL-07 | 02-02, 02-04, 02-05 | Large-text and assistive usability | SATISFIED for Phase 2 host/story contract; native evidence deferred | Scaling remains enabled, no cap, long content/name/action survives, and structured native review ledger exists. No native pass is claimed. |

All 11 Phase 2 requirements appear in plan frontmatter. No Phase 2 requirement is orphaned. The remaining native evidence requirements are separately mapped to Phase 5 in `REQUIREMENTS.md`.

### Test Quality Audit

| Test / Validator | Linked requirements | Active | Skipped | Circular | Strongest assertion | Verdict |
|---|---|---:|---:|---|---|---|
| `asset-contracts.test.tsx` + asset validator | PRIM-03, PRIM-04, QUAL-01, QUAL-05 | Active | 0 | No | Value, render behavior, provenance, controlled rejection | Strong |
| `primitive-contracts.test.tsx` | PRIM-01, QUAL-01, QUAL-05, QUAL-07 | Active | 0 | No | Exact values, render behavior, rejection | Strong |
| `pressable-contract.test.tsx` | PRIM-02, QUAL-01, QUAL-04, QUAL-05, QUAL-06 | Active | 0 | No | Multi-state behavioral transitions and call counts | Strong |
| `accessibility-contracts.test.tsx` | QUAL-04, QUAL-05, QUAL-06, QUAL-07 | Active | 0 | No | Observable semantics, failure propagation, interaction behavior | Strong |
| `story-contracts.test.tsx` | QUAL-02, QUAL-03, QUAL-07 | Active | 0 | No | Exact taxonomy/options/provenance plus rendered witnesses | Strong |
| `phase-2-verification.test.ts` + evidence validator | QUAL-07 / claim boundary | Active | 0 | No | Schema/value and controlled false-claim rejection | Strong |

**Disabled requirement tests:** 0. **Circular expected-value generation:** 0. **Insufficient assertions:** 0. The independent oracle for asset parity is the retained live Penpot observation/raw evidence and hashes; tests do not rewrite those fixtures.

### Anti-Patterns and Prohibitions

| Check | Result | Severity / impact |
|---|---|---|
| TBD/FIXME/XXX in Phase 2 implementation/tests | None | None |
| Disabled/todo requirement tests | None | None |
| Placeholder renders, empty handlers, console-only implementation | None | None |
| Runtime Penpot/MCP call, remote asset URL, third-party icon source | None | None |
| Handwritten substitute icon/lockup geometry | None observed; generated registry is bound to retained raw/normalized bytes and source identities | None |
| Product screens, app navigation, backend, persistence, or live game data | None | None |
| Unsupported arbitrary controls or asset/style props | Rejected by public types/runtime contracts and story tests | None |
| Web/Jest represented as native acceptance | No; schema and record explicitly prevent it | None |

### Decision Coverage

The deterministic decision-coverage gate reported `no trackable decisions` because the prose `<decisions>` block is not represented in the gate's trackable descriptor format. Manual verification found all three decision groups honored: focused primitives/presentational boundaries; local Penpot-derived icons and two lockups; and exact story/test/accessibility contracts. This warning-only gate has no status impact.

### Human Verification Required

None for Phase 2 closure. The sole plan human-check had an explicit no-route branch; the verifier confirmed the retained record honestly says `deferred-to-phase-5` and enumerates the pending native checks. Those checks are Phase 5 work, not silently accepted Phase 2 proof.

### Disconfirmation Pass

- **Partial requirement sought:** QUAL-07 is only host/story verified. The implementation does not prove real-device reflow or screen-reader output; that portion is explicitly deferred and excluded from the verified score.
- **Potential misleading test sought:** target tests prove declared `minWidth`/`minHeight` and `hitSlop`, not native parent clipping. Both helper comments and evidence records state that limitation.
- **Uncovered error path sought:** live Penpot export could be stale, unsafe, reordered, path-traversing, hash-altered, malformed SVG/PNG, or falsely represented as native evidence. Each has controlled rejection coverage; the remaining unavailable path is physical-device behavior, already deferred.

### Gaps Summary

No actionable Phase 2 gap remains. All implementation, story, test, provenance, safety, and browser-catalogue contracts pass independently. The only unverified outcome is native-device accessibility/layout behavior, which the approved roadmap assigns to Phase 5 and the implementation carefully does not claim.

---

_Verified: 2026-09-18T15:46:00Z_  
_Verifier: the agent (gsd-verifier)_
