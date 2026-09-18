# Phase 2: Primitives, Assets, and Component Contracts - Research

**Researched:** 2026-09-18
**Domain:** Expo/React Native primitive APIs, Penpot-sourced SVG assets, Storybook contracts, and accessibility test infrastructure
**Confidence:** HIGH for the existing stack and primitive/test architecture; MEDIUM for asset generation until the Penpot exports are captured

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

### Primitive Architecture
- Publish focused `Text`, `Stack`, `Inline`, `Surface`, `Icon`, and `Pressable` primitives rather than a generic Box-style prop surface.
- Expose semantic token props with a limited React Native `style` escape hatch; authored visual semantics remain token-backed.
- Pass through standard React Native accessibility props and provide safe defaults only where semantics are inherent to the primitive.
- Keep primitives presentational: no navigation, data access, persistence, or product-aware behavior.

### Icons and Brand Assets
- Export authoritative SVG geometry through the Penpot MCP and retain source IDs, revision, hashes, and reference evidence.
- Expose the complete Penpot icon set through one typed `Icon` API with a closed name union, semantic color, and token-backed sizes.
- Expose the horizontal and stacked brand lockups as dedicated components with fixed aspect ratios and only Penpot-supported colourways.
- Store assets locally; Penpot remains build-time evidence and is never a runtime dependency.

### Stories, Tests, and Accessibility
- Use the story taxonomy `Canonical`, `Variants`, `States`, `Boundaries`, and `Interactive`; Storybook controls may expose only supported combinations.
- Provide shared test helpers for roles, labels, values, disabled/loading states, press behavior, and token usage rather than snapshot-heavy coverage.
- Preserve Penpot's authored 40, 44, and 48 visual control sizes while guaranteeing at least a 44x44 interactive hit area.
- Exercise representative primitives and stories under large font scale, long content, and screen-reader semantics; clipping or lost actions fail acceptance.

### the agent's Discretion
- Exact file organization, helper naming, and internal composition are flexible where they preserve the approved public contracts and existing repository conventions.
- The agent may choose the smallest maintainable mechanism for SVG code generation and accessibility test setup, provided it remains deterministic, source-traceable, and dependency-legitimate.

### Deferred Ideas (OUT OF SCOPE)

- Concrete action, form, authentication, and navigation component families remain Phase 3.
- Identity, content, feedback, and card component families remain Phase 4.
- Native iOS/Android catalogue acceptance, production exclusion, and full coverage audit remain Phase 5.
- Product screens and game flows remain outside this milestone.
</user_constraints>

<phase_requirements>
## Phase Requirements

The descriptions below are quoted verbatim from `.planning/REQUIREMENTS.md`. [VERIFIED: `.planning/REQUIREMENTS.md:35-38`, `.planning/REQUIREMENTS.md:85-91`]

| ID | Description | Research Support |
|----|-------------|------------------|
| PRIM-01 | Developer can build components from token-backed text, layout, surface, and icon primitives. | Focused native wrappers consume only the existing public token barrel and protect token-owned style keys. |
| PRIM-02 | Interactive primitives provide consistent press, disabled, loading, focus, and accessibility behavior. | A small `Pressable` state contract merges native accessibility state, suppresses activation when disabled/loading, and enforces target geometry. |
| PRIM-03 | Developer can use both Penpot brand lockups as reusable assets. | A Penpot-export gate captures both source records, hashes, ratios, and compatible local runtime representations. |
| PRIM-04 | Developer can use the complete Penpot icon set through a consistent typed interface. | A generated closed registry exposes all 18 source-ordered icons through one `Icon` component. |
| QUAL-01 | Every public component has typed props constrained to its supported Penpot variants. | Token-name unions, `IconName`, and explicit runtime guards prevent silent fallbacks. |
| QUAL-02 | Every component has canonical, variant, state, and relevant content-boundary stories. | A shared coverage table enforces the approved five-story taxonomy or a documented inapplicability reason. |
| QUAL-03 | Interactive stories expose useful controls and actions without inventing unsupported prop combinations. | CSF `argTypes` use closed options and action logging; fixed stories cover invalid combinations without exposing arbitrary controls. |
| QUAL-04 | Every interactive component has semantic and interaction tests. | RNTL 14 role/name queries, built-in accessibility matchers, and `userEvent.press` form the reusable harness. |
| QUAL-05 | Components expose appropriate React Native roles, labels, values, and states. | Native accessibility props pass through; only icons and brand lockups receive inherent semantic defaults. |
| QUAL-06 | Interactive targets meet the project's native touch-target rule. | The 40/44/48 token contract maps to effective target sizes of at least 44, with parent-bound hit-area caveats tested and documented. |
| QUAL-07 | Representative components remain usable with large text and native assistive technology. | Automated tests prove scaling/semantics remain enabled; a boundary story plus native review proves layout and assistive behavior that Jest cannot simulate. |
</phase_requirements>

## Summary

Plan Phase 2 as two converging dependency chains: `Penpot asset evidence -> deterministic local asset registry -> Icon/brand components`, and `verified Phase 1 tokens -> focused primitives -> shared accessibility/test/story contracts`. Runtime code must depend only on local immutable tokens and local assets. Penpot manifests, raw exports, normalized exports, hashes, and comparison renders remain build evidence. [VERIFIED: `.planning/phases/02-primitives-assets-and-component-contracts/02-CONTEXT.md:43-59`; CITED: https://help.penpot.app/mcp/]

The existing repository already contains the complete compatible runtime and test stack: Expo `57.0.24`, React Native `0.86.3`, `react-native-svg` `15.15.4`, the exact Storybook `10.5.0` family, RNTL `14.0.1`, and `jest-expo` `57.0.5`. These values are quoted verbatim from `package.json`; no new runtime package is required for this phase. [VERIFIED: `package.json:20-57`]

The main uncertainty is asset geometry, not architecture. The retained manifest proves revision `292`, the two brand records, and the 18 icon records and source IDs, but it contains no SVG path data. [VERIFIED: `design-spec/penpot-foundations.json:1-13`, `design-spec/penpot-foundations.json:1099-1120`, `design-spec/penpot-foundations.json:1716-1929`] A read-only MCP call confirmed the expected file and 51-component local library during this research, but the following geometry inspection failed because the browser suspended the Penpot plugin tab. [VERIFIED: Penpot MCP read-only probe, 2026-09-18] Therefore the first asset execution task must export and validate every asset and must stop if file/page/revision, source identity, SVG compatibility, or hashing cannot be proven.

**Primary recommendation:** establish failing asset/contract tests first, run the Penpot export-and-hash gate second, then implement static primitives/assets and finish with bounded stories plus a clearly separated native manual check for 200% text and assistive behavior.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Primitive rendering and public props | Browser / Client (React Native runtime) | — | These are local presentational wrappers over React Native core components and immutable tokens. [VERIFIED: `.planning/phases/02-primitives-assets-and-component-contracts/02-CONTEXT.md:16-20`] |
| Icon and brand rendering | Browser / Client | CDN / Static (repository assets) | `react-native-svg` renders checked-in local content; there is no runtime Penpot or network boundary. [VERIFIED: `.planning/phases/02-primitives-assets-and-component-contracts/02-UI-SPEC.md:204-230`] |
| Penpot extraction and normalization | Build tooling / evidence | Repository storage | MCP operates on the active design file; normalized outputs and hashes become reviewed source evidence. [CITED: https://help.penpot.app/mcp/] |
| Story catalogue | Browser / Client | Expo web | Native Storybook renders the same CSF stories on native and the secondary web lane. [CITED: https://storybookjs.github.io/react-native/docs/intro/] |
| Semantic and interaction verification | Test tooling | Native manual review | Jest/RNTL proves the JavaScript/host contract; native focus, layout, font scaling, VoiceOver, and TalkBack require a device/runtime. [CITED: https://oss.callstack.com/react-native-testing-library/docs/advanced/testing-env] |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `react-native` | `0.86.3` | `Text`, `View`, `Pressable`, accessibility props, StyleSheet | Already Expo-aligned and version locked. [VERIFIED: `package.json:25-34`] |
| `react-native-svg` | `15.15.4` | Local SVG parsing/rendering and SVG primitives | Already installed; its official API supports XML strings, inherited color/currentColor, and path/stroke properties. [VERIFIED: npm registry; CITED: https://github.com/software-mansion/react-native-svg/blob/main/USAGE.md] |
| Foundation token barrel | current repository source | All public semantic values | The barrel re-exports the seven immutable token categories rather than copying values. [VERIFIED: `src/design-system/tokens/index.ts:1-18`] |
| `@storybook/react-native` plus on-device controls/actions | exact `10.5.0` family | CSF catalogue, bounded controls, interaction logs | Phase 1 verified this exact family with Expo 57; official docs support typed CSF, select controls, conditional controls, and action argTypes. [VERIFIED: `package.json:38-55`; CITED: https://storybookjs.github.io/react-native/docs/intro/writing-stories/; CITED: https://storybookjs.github.io/react-native/docs/intro/addons/] |
| `jest-expo` | `57.0.5` | Expo-aware Jest preset | Already configured as the project preset. [VERIFIED: `package.json:52-60`; CITED: https://docs.expo.dev/develop/unit-testing/] |
| `@testing-library/react-native` | `14.0.1` | Host-level semantic and interaction tests | RNTL 14 provides role/name/state/value queries, built-in accessibility matchers, and realistic `userEvent` interactions. [VERIFIED: `package.json:47`; CITED: https://oss.callstack.com/react-native-testing-library/docs/api/queries; CITED: https://oss.callstack.com/react-native-testing-library/docs/api/events/user-event] |
| Node `crypto` | Node `24.20.0` installed; project minimum remains `.nvmrc` | SHA-256 evidence hashes | Built-in cryptography avoids a new dependency and must be used instead of custom hashing. [VERIFIED: local environment probe, 2026-09-18] |

### Supporting

| Facility | Purpose | When to Use |
|----------|---------|-------------|
| Penpot MCP `export_shape` | Authoritative SVG/PNG export | Build-time evidence capture only, after validating the active file/page/source IDs. [CITED: https://help.penpot.app/mcp/] |
| `StyleSheet.flatten` | Development/test inspection of escape-hatch styles | Reject token-owned keys and test the resolved host style; token-owned styles are also applied last so they cannot be overridden. [ASSUMED] |
| Existing `FoundationFontGate` | One global font-readiness boundary | Keep it as the outer Storybook decorator; do not add a second font loader. [VERIFIED: `.rnstorybook/preview.tsx:1-23`] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Local normalized XML registry rendered by `SvgXml` | Generated JSX per icon | JSX avoids runtime XML parsing, but requires a more invasive SVG-to-JSX compiler or another package. Use normalized XML because the installed renderer officially supports it and this phase needs no new dependency. [CITED: https://github.com/software-mansion/react-native-svg/blob/main/USAGE.md] |
| Strict allowlisted primitive wrappers | One generic `Box` | A generic prop surface weakens the locked semantic-token and direction contracts, so it is prohibited. [VERIFIED: `.planning/phases/02-primitives-assets-and-component-contracts/02-CONTEXT.md:16-20`] |
| Behavior/value tests | Snapshot-first coverage | Snapshots do not prove roles, values, press suppression, source hashes, or native layout and are explicitly secondary. [VERIFIED: `.planning/phases/02-primitives-assets-and-component-contracts/02-UI-SPEC.md:285-300`; CITED: https://docs.expo.dev/develop/unit-testing/] |

**Installation:** none. Use the versions already locked in `package.json` and `package-lock.json`; do not update the Storybook family or add an SVG transformer/parser package in this phase. [VERIFIED: `package.json:20-57`]

### Version Verification

Registry checks on 2026-09-18 confirmed the installed releases were published as follows: `react-native-svg@15.15.4` on 2026-03-18, Storybook RN/control/action `10.5.0` on 2026-07-11, RNTL `14.0.1` on 2026-06-23, and `jest-expo@57.0.5` on 2026-08-26. None declares a postinstall script. [VERIFIED: npm registry]

## Package Legitimacy Audit

This phase adds no external package. The table records only existing locked dependencies that execution will reuse. [VERIFIED: `package.json:20-57`]

| Package | Registry | Source Repo | Seam Verdict | Disposition |
|---------|----------|-------------|--------------|-------------|
| `react-native-svg@15.15.4` | npm | `software-mansion/react-native-svg` | OK | Retain; officially documented and already installed. |
| `@testing-library/react-native@14.0.1` | npm | `callstack/react-native-testing-library` | OK | Retain; officially documented and already installed. |
| `@storybook/react-native@10.5.0` and on-device addons | npm | `storybookjs/react-native` | SUS (`too-new` signal on the latest release) | Retain exact previously approved `10.5.0`; do not install/update. |
| `jest-expo@57.0.5` | npm | `expo/expo` | SUS (`too-new` signal on the latest release) | Retain exact Expo-aligned installed version; do not install/update. |

**Packages removed due to SLOP verdict:** none.
**Packages flagged as suspicious `[SUS]`:** existing `@storybook/react-native@10.5.0` family and `jest-expo@57.0.5` received the seam's age-based `too-new` signal. They are already installed, officially sourced, Phase-1-approved versions, so this phase retains them without an install checkpoint. Any installation, update, or substitution must stop for a new legitimacy check and human approval.

## Architecture Patterns

### System Architecture Diagram

```text
Penpot active Components page (read-only)
  -> validate file/page/revision + manifest source IDs
  -> export each icon/lockup + reference render
  -> reject unsupported/unsafe SVG or missing image data
  -> normalize deterministic bytes
  -> SHA-256 raw + normalized outputs
  -> checked-in design-spec asset manifest/evidence
  -> generated local runtime registry
       -> Icon / BrandLockup components
       -> asset stories + asset contract tests

Phase 1 public token barrel
  -> Text / Stack / Inline / Surface / Pressable
  -> shared semantic + interaction test helpers
  -> typed CSF stories with bounded controls/actions
  -> Expo native Storybook (authority) + Expo web (secondary smoke)
```

### Recommended Project Structure

```text
design-spec/
├── assets/                         # source IDs, revisions, raw/normalized hashes
└── references/components/          # retained Penpot exports/renders
scripts/
├── export-penpot-assets.mjs        # deterministic build-time generator
└── validate-penpot-assets.mjs      # schema/hash/order/compatibility checks
src/design-system/
├── primitives/                     # Text, Stack, Inline, Surface, Pressable
├── assets/                         # Icon, lockups, generated local registry
├── stories/                        # optional shared story coverage metadata
├── testing/                        # reusable semantic/interaction assertions
└── index.ts                        # narrow public design-system barrel
tests/
├── asset-contracts.test.tsx
├── primitive-contracts.test.tsx
├── pressable-contract.test.tsx
├── story-contracts.test.tsx
└── accessibility-contracts.test.tsx
```

The exact paths are an implementation recommendation under the agent's discretion. [ASSUMED]

### Pattern 1: Evidence-first asset generation

Use the existing manifest order as the expected inventory, but never treat it as geometry. For every record, verify active file/page identity, export the exact `sourceNodeId`, retain the raw export, and write a generated record containing `designName`, `sourceId`, `sourceNodeId`, file ID, page ID, revision, raw SHA-256, normalized SHA-256, and generator version. [VERIFIED: `.planning/phases/02-primitives-assets-and-component-contracts/02-UI-SPEC.md:200-230`]

Normalization should be deliberately narrow:

1. Convert line endings to LF and remove only XML declarations/comments/irrelevant export metadata.
2. Preserve `viewBox`, path data, primitive geometry, stroke width, caps, joins, fill rules, transforms, and child order exactly.
3. For icons only, first prove the authored paint is the single expected semantic paint, then replace that paint with `currentColor`; pass the token-resolved color to the root SVG. `react-native-svg` officially supports inherited paint and `currentColor`. [CITED: https://github.com/software-mansion/react-native-svg/blob/main/USAGE.md]
4. Reject scripts, event-handler attributes, `<foreignObject>`, external `href`/URLs, remote images, CSS blocks, unsupported tags, duplicate IDs, missing viewBox, wrong canvas, unexpected paints, and non-finite numbers. [ASSUMED]
5. Parse/render every normalized result through the installed `react-native-svg` path in Jest and compare raw/normalized hashes to retained evidence. [ASSUMED]

Do not collapse curves, round coordinates, reorder path commands, or run generic SVG optimization: those operations can alter geometry and invalidate the source hash. [ASSUMED]

The exact icon names are quoted verbatim: `add`, `back`, `calendar`, `check`, `chevron`, `clock`, `close`, `court`, `eye`, `filter`, `home`, `location`, `notification`, `overflow`, `players`, `profile`, `search`, `warning`. [VERIFIED: `.planning/phases/02-primitives-assets-and-component-contracts/02-UI-SPEC.md:200-202`] The generator must derive this closed union from checked-in output and must reject missing, extra, duplicate, or reordered records.

Brand extraction needs a deterministic evidence branch rather than an assumption. Export both source nodes, inspect their descendants, and:

- if the export is entirely supported SVG, retain and render it locally at the fixed ratio;
- if it includes an authored raster fill, export that fill separately, hash it, store it locally, and compose only from MCP-proven geometry/text metrics;
- if text-to-path, raster extraction, or element compatibility cannot be proven, stop rather than redraw or substitute.

The two records are quoted verbatim as `Brand Lockup` / source `482a7222-5a3b-8086-8008-a61e9426c83d` and `Brand Lockup Stacked` / source `482a7222-5a3b-8086-8008-a62b8a2c0f47`. [VERIFIED: `design-spec/penpot-foundations.json:1099-1120`] The fixed authored ratios are `300×72` (`25:6`) and `300×56` (`75:14`). [VERIFIED: `.planning/phases/02-primitives-assets-and-component-contracts/02-UI-SPEC.md:216-223`]

### Pattern 2: Token-owned styles always win

Define each public `style` as an allowlist (`Pick<TextStyle, ...>` or `Pick<ViewStyle, ...>`), not `Omit`, and perform a development/test runtime check after `StyleSheet.flatten`. Apply the escape-hatch style first and token/computed styles last. This combination prevents a broad pre-created style or cast value from silently overriding authored semantics. [ASSUMED]

The repository's token names and values are already discrete source-of-truth values. For example, dimensions are quoted verbatim as `controlHeight40: 40`, `controlHeight44: 44`, `controlHeight48: 48`, and `iconSize20: 20`. [VERIFIED: `src/design-system/tokens/dimensions.ts:10-17`] The disabled/focus values are quoted verbatim as `opacityDisabled: 0.4`, `focusRing: '#ADE533'`, and `focusRingWidth: 2`. [VERIFIED: `src/design-system/tokens/opacity.ts:10-14`; `src/design-system/tokens/colors.ts:10-28`; `src/design-system/tokens/borders.ts:10-15`]

Primitive responsibilities:

| Primitive | Native base | Token-owned props | Allowed escape-hatch examples |
|-----------|-------------|-------------------|-------------------------------|
| `Text` | RN `Text` | typography variant, color | flex/alignment/margin only; never font metrics or color |
| `Stack` | RN `View` | gap, padding | flex grow/shrink, width/height, margin; direction fixed column |
| `Inline` | RN `View` | gap, padding, wrap | flex grow/shrink, width/height, margin; direction fixed row |
| `Surface` | RN `View` | background, radius, border color/width | layout/size/margin; never visual surface or shadow keys |
| `Icon` | `SvgXml`/`Svg` | closed name, `iconSize20`, semantic color | accessibility props only; no raw geometry or paint |
| `Pressable` | RN `Pressable` | control size, state opacity/focus/target contract | layout positioning that cannot shrink the target |

### Pattern 3: Accessibility state is merged, then invariants override

React Native defines `accessibilityState` fields `disabled`, `selected`, `checked`, `busy`, and `expanded`, and `accessibilityValue` fields `min`, `max`, `now`, and `text`. [CITED: https://reactnative.dev/docs/0.86/accessibility] Preserve caller-supplied selected/checked/expanded/value state, then force `disabled=true` when `disabled || loading` and `busy=true` when loading. Pass `disabled={disabled || loading}` to native `Pressable` and guard the callback as defense in depth. Do not infer `button`, link, selected, checked, or navigation semantics; the composed component owns them. [VERIFIED: `.planning/phases/02-primitives-assets-and-component-contracts/02-UI-SPEC.md:238-250`]

Use a closed size prop constrained to the existing control dimensions. A 40-point visual target receives symmetric `hitSlop=2`; 44 and 48 need no expansion for the project's minimum. React Native documents that hitSlop never extends past parent bounds and sibling z-order wins, so boundary stories need at least two points of clear parent space and overlapping hit areas must be prohibited. [CITED: https://reactnative.dev/docs/0.86/pressable]

Apple recommends at least 44×44 points, matching the locked project rule. [CITED: https://developer.apple.com/design/tips/] Android recommends 48×48dp, so the project's 44-point cross-platform floor is below Android's recommendation for controls that choose the 44 token. [CITED: https://developer.android.com/guide/topics/ui/accessibility/views/apps-views] This is not authority to change the locked rule; prefer the authored 48 token for Android-facing controls where Penpot permits it and retain the policy difference for Phase 5 review. [ASSUMED]

Focus deserves a platform caveat. The installed RN type surface passes `onFocus`/`onBlur`, but RNTL does not execute native focus state and native focus behavior differs by platform/input. [VERIFIED: `node_modules/react-native/Libraries/Components/Pressable/Pressable.d.ts:74-90`; CITED: https://oss.callstack.com/react-native-testing-library/docs/advanced/testing-env] Track focus only from native callbacks, expose a visible token-backed ring while focused, and use a story-only harness to present the state; never add a persistent public `focused` semantic state to production props. [ASSUMED]

### Pattern 4: Story taxonomy is data, not convention-by-memory

Create one shared ordered constant containing `Canonical`, `Variants`, `States`, `Boundaries`, `Interactive`, plus an applicability matrix for each public export. The story-coverage test should require every applicable export and require a reason for every omitted category. [VERIFIED: `.planning/phases/02-primitives-assets-and-component-contracts/02-UI-SPEC.md:254-277`]

Use typed CSF (`Meta`, `StoryObj`). Expose token/name/state unions as `select` options and callbacks as action argTypes. Do not expose color pickers, raw text/SVG geometry, arbitrary numbers, or object controls for design semantics. Official Storybook RN docs support action argTypes and closed/conditional controls. [CITED: https://storybookjs.github.io/react-native/docs/intro/addons/; CITED: https://storybookjs.github.io/react-native/docs/intro/addons/controls/]

### Pattern 5: Shared helpers assert user-observable host contracts

RNTL 14 role queries can filter by accessible name, disabled, selected, checked, busy, expanded, and value; its built-in matchers include `toBeDisabled`, `toBeBusy`, `toHaveAccessibilityValue`, and `toHaveAccessibleName`. [CITED: https://oss.callstack.com/react-native-testing-library/docs/api/queries; CITED: https://oss.callstack.com/react-native-testing-library/docs/api/jest-matchers] Prefer `userEvent.press` to `fireEvent.press` for supported interactions because it emits the realistic host event sequence. [CITED: https://oss.callstack.com/react-native-testing-library/docs/api/events/user-event]

Keep helpers as ordinary functions rather than adding custom Jest matcher augmentation. Recommended contracts:

- `expectRoleAndName(element, role, name)`
- `expectAccessibilityValue(element, value)`
- `expectAccessibilityState(element, expected)`
- `expectPressContract(renderCase)` — enabled invokes once; disabled and loading invoke zero times
- `expectTouchTargetContract(element, visualSize)` — checks min dimensions plus declared hitSlop; explicitly not a native layout proof
- `expectDecorativeIconHidden(renderCase)` and `expectLabelledIconImage(renderCase)`
- `expectTokenStyle(element, expected)` and `expectReservedStyleRejected(renderCase)`

### Anti-Patterns to Avoid

- **`Omit<TextStyle, ...>` as the only protection:** broad objects, arrays, registered styles, and casts can bypass the intended boundary; allowlist, runtime-check, and apply token styles last. [ASSUMED]
- **Hashing only normalized SVG:** a normalizer could hide a changed raw export. Retain both raw and normalized SHA-256. [ASSUMED]
- **Hashing only raw SVG:** insignificant exporter metadata/line-ending drift can obscure whether runtime geometry changed. Retain both hashes and compare normalized output. [ASSUMED]
- **Generic SVG optimization:** coordinate rounding/path rewriting can alter geometry; use the narrow normalizer only. [ASSUMED]
- **Runtime MCP/network asset access:** violates the locked local-asset boundary and makes stories nondeterministic. [VERIFIED: `.planning/phases/02-primitives-assets-and-component-contracts/02-CONTEXT.md:22-26`] 
- **Assuming Jest proves touch size, font reflow, or focus:** RNTL runs a JavaScript Test Renderer without the mobile OS/native renderer. [CITED: https://oss.callstack.com/react-native-testing-library/docs/advanced/testing-env]
- **Making every icon accessible:** decorative icons should be hidden; labelled standalone icons become image semantics. [VERIFIED: `.planning/phases/02-primitives-assets-and-component-contracts/02-UI-SPEC.md:204-214`]
- **Adding a second font gate or catalogue:** retain the existing global decorator and same native CSF source. [VERIFIED: `.rnstorybook/preview.tsx:1-23`]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Press gesture state machine | custom responder handlers | React Native `Pressable` | Native Pressability already models press-in/out, long press, disabled, retention, and hitSlop. [CITED: https://reactnative.dev/docs/0.86/pressable] |
| SVG renderer | Canvas/path interpreter or redrawn icons | installed `react-native-svg` | It supports the required SVG primitives, XML strings, strokes, inherited paint, and currentColor. [CITED: https://github.com/software-mansion/react-native-svg/blob/main/USAGE.md] |
| Icon source | third-party icon pack | Penpot exports and generated closed registry | Substitution is expressly prohibited. [VERIFIED: `.planning/phases/02-primitives-assets-and-component-contracts/02-CONTEXT.md:63-68`] |
| Cryptographic digest | custom checksum | Node `crypto.createHash('sha256')` | Standard implementation and deterministic evidence format. [ASSUMED] |
| Accessibility query logic | recursive tree traversal | RNTL role/name/state/value queries and matchers | Host-level queries better match user semantics and avoid implementation coupling. [CITED: https://oss.callstack.com/react-native-testing-library/docs/api/queries] |
| Native layout/focus emulation | elaborate Jest mocks | Storybook on an actual device/runtime | RNTL does not execute native code or unmanaged focus/layout. [CITED: https://oss.callstack.com/react-native-testing-library/docs/advanced/testing-env] |

**Key insight:** custom code should encode Padel Potato's bounded contracts and evidence checks; React Native, `react-native-svg`, Storybook, RNTL, and Node should continue owning gestures, rendering, story plumbing, testing semantics, and hashing.

## Common Pitfalls

### Pitfall 1: Exporting the wrong active Penpot page

**What goes wrong:** MCP operates on the currently focused page/tab, not merely the file URL. [CITED: https://help.penpot.app/mcp/]

**How to avoid:** validate file ID, Components page ID, revision, component source ID, and source node ID immediately before every batch; export by exact node ID; abort on drift.

**Warning signs:** current page is `01 Foundations`; missing source nodes; record count not exactly 18 icons plus 2 lockups; a suspended-tab heartbeat. The first read-only probe in this session found `01 Foundations`, and the next geometry probe failed due suspension. [VERIFIED: Penpot MCP probe, 2026-09-18]

### Pitfall 2: Treating the manifest as geometry

**What goes wrong:** the manifest proves names/IDs/order but contains no SVG path data. [VERIFIED: `design-spec/penpot-foundations.json:939-2020`]

**How to avoid:** make raw export files and hashes prerequisites for `Icon`/brand implementation; do not enter path strings by hand.

### Pitfall 3: Style escape hatch defeats tokens

**What goes wrong:** a caller supplies `fontSize`, `color`, padding, border, `flexDirection`, or `minWidth` through an array/registered style and silently overrides the contract. [ASSUMED]

**How to avoid:** whitelist allowed keys, flatten-and-reject in development/tests, and order token/invariant styles last.

### Pitfall 4: `hitSlop` appears correct but is clipped

**What goes wrong:** a 40-point control with two-point hitSlop sits flush against a parent, so React Native clips the expanded area. [CITED: https://reactnative.dev/docs/0.86/pressable]

**How to avoid:** reserve surrounding space in stories/compositions, prohibit overlapping targets, assert props in Jest, and verify actual hit behavior natively later.

### Pitfall 5: Loading looks disabled but still fires

**What goes wrong:** opacity/busy state is applied without setting native `disabled`, or a wrapper still calls the original callback. [ASSUMED]

**How to avoid:** compute one `blocked = disabled || loading`; use it for native `disabled`, accessibility disabled state, and callback suppression; set busy only for loading.

### Pitfall 6: Font scaling is visually faked in Jest

**What goes wrong:** multiplying font sizes in a test creates a different style rather than exercising OS font scaling. [ASSUMED]

**How to avoid:** unit-test `allowFontScaling=true`, absence of a default cap, wrapping defaults, long accessible names, and action reachability; use the `Boundaries` story at an actual 200% system font scale for clipping/reflow acceptance. React Native defaults `allowFontScaling` to true and leaves `maxFontSizeMultiplier` undefined. [CITED: https://reactnative.dev/docs/0.86/text]

### Pitfall 7: Story controls invent invalid designs

**What goes wrong:** color/number/object controls produce values that public types and Penpot do not support. [ASSUMED]

**How to avoid:** use select options from closed unions, fixed boundary examples, conditional controls only for valid combinations, and a coverage test over named stories.

## Code Examples

The following are implementation skeletons, not copied project code. Discrete values used here are quoted from the repository: `body`, `ink`, `controlHeight40`, `controlHeight44`, `controlHeight48`, `iconSize20`, `opacityDisabled`, `focusRing`, and `focusRingWidth`. [VERIFIED: `src/design-system/tokens/typography.ts:35-110`; `src/design-system/tokens/colors.ts:10-28`; `src/design-system/tokens/dimensions.ts:10-17`; `src/design-system/tokens/opacity.ts:10-14`; `src/design-system/tokens/borders.ts:10-15`]

### Token-backed text with protected style ordering

```typescript
// Project pattern; native scaling behavior: https://reactnative.dev/docs/0.86/text
type TextEscapeStyle = Pick<TextStyle, 'alignSelf' | 'flex' | 'margin' | 'maxWidth'>;

type DesignTextProps = Omit<NativeTextProps, 'style'> & {
  variant: TypographyToken;
  color?: ColorToken;
  style?: StyleProp<TextEscapeStyle>;
};

export function Text({ variant, color = 'ink', style, ...props }: DesignTextProps) {
  assertNoReservedTextStyle(style); // development/test guard
  return (
    <NativeText
      {...props}
      allowFontScaling={props.allowFontScaling ?? true}
      style={[style, typography[variant], { color: colors[color] }]}
    />
  );
}
```

### Pressable invariant merge

```typescript
// Native API: https://reactnative.dev/docs/0.86/pressable
const hitSlopBySize = {
  controlHeight40: 2,
  controlHeight44: 0,
  controlHeight48: 0,
} as const;

const blocked = disabled || loading;
const accessibilityState = {
  ...callerAccessibilityState,
  disabled: blocked,
  ...(loading ? { busy: true } : null),
};

<NativePressable
  disabled={blocked}
  hitSlop={hitSlopBySize[size]}
  accessibilityState={accessibilityState}
  onPress={blocked ? undefined : onPress}
/>;
```

### Bounded icon story controls

```typescript
// Storybook patterns: https://storybookjs.github.io/react-native/docs/intro/writing-stories/
const meta = {
  title: 'Assets/Icons',
  component: Icon,
  argTypes: {
    name: { control: 'select', options: iconNames },
    color: { control: 'select', options: Object.keys(colors) },
    size: { control: 'select', options: ['iconSize20'] },
  },
} satisfies Meta<typeof Icon>;
```

### Semantic interaction helper

```typescript
// RNTL APIs: https://oss.callstack.com/react-native-testing-library/docs/api/queries
// and https://oss.callstack.com/react-native-testing-library/docs/api/events/user-event
export async function expectPressContract(renderCase: (state: 'enabled' | 'disabled' | 'loading') => void) {
  const user = userEvent.setup();
  // Render/query by role + accessible name, then assert 1 / 0 / 0 calls.
  // Keep concrete fixtures in the consuming test so helpers do not hide failures.
}
```

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| `react-test-renderer` package | RNTL 14 Test Renderer and host-only queries | React 19-compatible tests focus on user-observable host output. [CITED: https://docs.expo.dev/develop/unit-testing/; CITED: https://oss.callstack.com/react-native-testing-library/docs/advanced/testing-env] |
| `fireEvent.press` for all interactions | `userEvent.press` where supported | More realistic host event sequence; retain fireEvent only for unsupported/native callback simulation. [CITED: https://oss.callstack.com/react-native-testing-library/docs/api/events/user-event] |
| Free-form Storybook playgrounds | typed CSF with closed/conditional controls | Prevents catalogue states that do not exist in Penpot. [CITED: https://storybookjs.github.io/react-native/docs/intro/addons/controls/] |
| Runtime/remote SVG fetch | checked-in normalized XML/geometry registry | Deterministic, offline, source-hashed assets consistent with the locked architecture. [VERIFIED: `.planning/phases/02-primitives-assets-and-component-contracts/02-CONTEXT.md:22-26`] |

**Deprecated/outdated:** `react-test-renderer` as a direct test dependency for new coverage; third-party icon packs; a separate Vite Storybook; snapshot-only semantic coverage. [CITED: https://docs.expo.dev/develop/unit-testing/; VERIFIED: `.planning/phases/02-primitives-assets-and-component-contracts/02-UI-SPEC.md:298-300`]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The recommended directory/file organization is the smallest clear extension of the current repository. | Project Structure | Low; planner may rename while preserving boundaries. |
| A2 | A narrowly normalized local XML registry rendered by `SvgXml` is preferable to adding an SVG-to-JSX build dependency. | Standard Stack / Assets | Medium; actual Penpot exports may reveal unsupported markup or performance concerns. The export gate must decide fail-closed. |
| A3 | Strict tag/attribute/value allowlisting can reject unsafe or incompatible Penpot SVG constructs without another parser dependency. | Asset generation / Security | Medium; if the actual export needs a stronger parser, execution must stop and request package approval. |
| A4 | Parsing/rendering every normalized asset in Jest and retaining both raw and normalized SHA-256 is the smallest adequate drift-detection scheme. Generic path optimization must remain prohibited. | Asset generation / Pitfalls | Medium; a renderer or exporter limitation may require a revised evidence format, but not weaker traceability. |
| A5 | `StyleSheet.flatten`, an explicit `Pick` allowlist, and token-owned styles applied last together form an adequate bounded style escape hatch. | Standard Stack / Primitive architecture / Pitfalls | Medium; registered or platform-specific styles may expose another bypass that tests must catch. |
| A6 | A closed Pressable size prop is the cleanest way to calculate the 40/44/48 target contract. | Accessibility pattern | Medium; planner may choose an equivalent non-visual wrapper while retaining the same public invariant. |
| A7 | Android controls may prefer the authored 48 token where Penpot permits it. | Accessibility pattern | Low; component-specific sizes remain Penpot-controlled. |
| A8 | Focus should be driven only by native focus/blur callbacks, with a story harness rather than a public persistent `focused` prop. | Accessibility pattern | Medium; native device checks may require a platform-specific refinement. |
| A9 | Ordinary shared assertion functions are preferable to custom Jest matcher augmentation for the initial semantic test toolkit. | Test helpers | Low; either mechanism can preserve the same observable contracts. |
| A10 | A single `blocked = disabled || loading` predicate should drive native disabled state, semantic disabled/busy state, and callback suppression. | Interaction / Security / Pitfalls | Low; implementation shape can vary, but the invariant and zero-call tests cannot. |
| A11 | Automated tests should verify scaling remains enabled rather than multiply font sizes, and bounded Storybook controls must exclude arbitrary design values. | Font scaling / Story pitfalls | Medium; only a native runtime can validate resulting reflow and control usability. |
| A12 | Node SHA-256 is evidence integrity rather than authentication; fixed filename mapping, fail-closed SVG validation, and no remote asset fetch are the appropriate build-input threat controls. | Don't Hand-Roll / Security | Medium; the actual export syntax may demand additional parser-level controls. |
| A13 | Native 200% text review can be scheduled through a physical device or later Phase 5 route. | Validation | High; no Android CLI/emulator or local iOS simulator is available on this Windows machine. |

## Open Questions

1. **Are all 18 icon exports compatible with the constrained SVG profile?**
   - What we know: their names/source IDs/order are retained; the approved contract expects a 20×20 canvas and 1.75 stroke. [VERIFIED: `.planning/phases/02-primitives-assets-and-component-contracts/02-UI-SPEC.md:200-214`]
   - What's unclear: actual path/primitive markup, paints, transforms, IDs, and unsupported elements could not be inspected because the Penpot tab suspended.
   - Recommendation: make this a blocking execution gate; export, validate, hash, and render all 18 before implementing the public registry.

2. **How are the mascot and lockup text represented in exported SVG?**
   - What we know: fixed source IDs, ratios, visible copy, and colorway are locked. [VERIFIED: `.planning/phases/02-primitives-assets-and-component-contracts/02-UI-SPEC.md:216-230`]
   - What's unclear: whether the mascot is an image fill, SVG geometry, or embedded data, and whether text exports as text or paths.
   - Recommendation: branch only on inspected MCP evidence as described above; no redrawing or substitution.

3. **Which native route will perform the Phase 2 large-text/assistive spot check?**
   - What we know: local Windows has no `adb`, Android emulator, or Java; RNTL cannot prove native layout/focus; full native catalogue acceptance remains Phase 5. [VERIFIED: local environment probe; VERIFIED: `.planning/phases/02-primitives-assets-and-component-contracts/02-CONTEXT.md:73-78`]
   - What's unclear: availability of a physical Expo Go device or remote runner during Phase 2.
   - Recommendation: plan automated contract tests plus a boundary story now; add an end-of-phase human checkpoint for one available native route, while reserving complete iOS/Android evidence for Phase 5.

## Environment Availability

| Dependency | Required By | Available | Version / State | Fallback |
|------------|-------------|-----------|-----------------|----------|
| Node.js | generation/tests | ✓ | `24.20.0` | Project `.nvmrc` remains authoritative for supported development. |
| npm | locked scripts | ✓ | `11.19.0` | — |
| Git | evidence/versioning | ✓ | `2.30.0.windows.2` | — |
| Expo CLI | Storybook scripts | ✓ project-local | `57.0.26` CLI reported | use package scripts only |
| Penpot MCP | asset export | partial | One read-only inventory call succeeded; next call failed with suspended-tab heartbeat | Focus/wake the exact tab and retry; no geometry fallback |
| Android SDK / `adb` / emulator / Java | native spot check | ✗ | unavailable on this machine | physical Android with Expo Go, remote runner, or defer full platform evidence to Phase 5 |
| iOS Simulator | native spot check | ✗ on Windows | unavailable | physical iPhone / remote macOS route |

**Missing dependencies with no fallback:** active Penpot Components page connection during asset extraction. Asset work must stop until it is available.

**Missing dependencies with fallback:** local native emulators. Automated semantic contracts and Expo-web stories can proceed; native rendering/assistive verification needs a physical or remote route and must not be falsely claimed by Jest.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | `jest-expo 57.0.5` + `@testing-library/react-native 14.0.1` |
| Config file | `package.json` (`preset: jest-expo`) [VERIFIED: `package.json:52-60`] |
| Quick run command | `npm test -- --runInBand <affected-test-file>` |
| Full suite command | `npm run typecheck && npm run lint && npm test -- --runInBand && node scripts/validate-penpot-assets.mjs && npm run storybook:web:smoke` |
| Existing baseline | 5 suites / 41 tests passed on 2026-09-18 [VERIFIED: local Jest run] |

### Test layers

1. **Evidence/schema tests:** fixed file/page/revision; exact source IDs; 18 icons and 2 lockups; no duplicates/extras; raw and normalized SHA-256; stable generator version/order; retained reference files.
2. **Asset compatibility tests:** every icon parses/renders; exact 20×20 viewBox/canvas and 1.75 stroke evidence; no unsupported/external content; `currentColor` substitution only after authored-paint validation; lockup ratios and accessible labels.
3. **Primitive value tests:** every token prop resolves to the exact existing token object/value; reserved style keys throw in development/test; unsupported runtime values throw; no unexplained literals.
4. **Semantic host tests:** roles, names, values, disabled/busy/selected/checked/expanded pass-through; decorative icons stay outside default accessibility queries; labelled icons expose image semantics.
5. **Interaction tests:** `userEvent.press` invokes once when enabled and never when disabled/loading; loading preserves name and stable content layout contract; focus callbacks/ring logic tested as JavaScript only.
6. **Story contract tests:** exact titles/groups, approved taxonomy, bounded argTypes/options, action argType, complete inventory order, and explicit inapplicability reasons.
7. **Runtime/manual tests:** bounded Expo-web smoke; one native 200% font-scale/assistive spot check if a device route is available; complete platform evidence remains Phase 5.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PRIM-01 | Text/layout/surface/icon primitives resolve exact tokens and protect semantics | unit/component | `npm test -- --runInBand tests/primitive-contracts.test.tsx` | ❌ Wave 0 |
| PRIM-02 | Pressed/focused/disabled/loading/semantic contract | component/interaction | `npm test -- --runInBand tests/pressable-contract.test.tsx` | ❌ Wave 0 |
| PRIM-03 | Both lockups, ratios, labels, local assets, source hashes | evidence/component | `node scripts/validate-penpot-assets.mjs && npm test -- --runInBand tests/asset-contracts.test.tsx` | ❌ Wave 0 |
| PRIM-04 | Exact 18-icon union/order/source/geometry interface | evidence/component | same asset commands | ❌ Wave 0 |
| QUAL-01 | Closed unions and runtime rejection | typecheck/unit | `npm run typecheck && npm test -- --runInBand tests/primitive-contracts.test.tsx` | ❌ Wave 0 |
| QUAL-02 | Approved taxonomy or explicit omission reason for every export | story contract | `npm test -- --runInBand tests/story-contracts.test.tsx` | ❌ Wave 0 |
| QUAL-03 | Only valid controls/actions | story contract | `npm test -- --runInBand tests/story-contracts.test.tsx` | ❌ Wave 0 |
| QUAL-04 | Shared semantic/interaction helpers cover interactive primitive | component/interaction | `npm test -- --runInBand tests/pressable-contract.test.tsx tests/accessibility-contracts.test.tsx` | ❌ Wave 0 |
| QUAL-05 | Roles, labels, values, states pass through correctly | semantic | `npm test -- --runInBand tests/accessibility-contracts.test.tsx` | ❌ Wave 0 |
| QUAL-06 | Effective declared target ≥44 for 40/44/48 | unit + native follow-up | `npm test -- --runInBand tests/pressable-contract.test.tsx` | ❌ Wave 0 |
| QUAL-07 | Scaling remains enabled; long text/action semantics survive; native layout reviewed | unit/story/manual native | `npm test -- --runInBand tests/accessibility-contracts.test.tsx tests/story-contracts.test.tsx` plus checkpoint | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** typecheck plus the affected test file; asset tasks also run `validate-penpot-assets.mjs`.
- **Per wave merge:** `npm run typecheck && npm run lint && npm test -- --runInBand`.
- **Phase gate:** full command green, asset evidence complete and source-bound, every public export accounted for by story coverage, web smoke green, and the large-text/native checkpoint either completed or explicitly left to the already-scoped Phase 5 acceptance without claiming native proof.

### Wave 0 Gaps

- [ ] `scripts/validate-penpot-assets.mjs` — failing schema/hash/compatibility validator before exports exist.
- [ ] `tests/asset-contracts.test.tsx` — icon/lockup inventory, hashes, geometry contract, ratios, accessibility.
- [ ] `tests/primitive-contracts.test.tsx` — token resolution, style guard, explicit rejection.
- [ ] `tests/pressable-contract.test.tsx` — press suppression, state merge, focus logic, 40/44/48 target mapping.
- [ ] `tests/story-contracts.test.tsx` — taxonomy, grouping, valid argTypes, coverage/inapplicability reasons.
- [ ] `tests/accessibility-contracts.test.tsx` — reusable role/name/value/state/icon/large-text contract helpers.
- [ ] Penpot active-tab checkpoint before the generator writes any asset geometry.

### Recommended Execution Ordering

| Wave | Work | Dependency / stop rule |
|------|------|------------------------|
| 0 | Add failing validators/tests and evidence schemas | No design implementation yet. |
| 1 | Wake Components page; export, normalize, hash, and retain 18 icons + 2 lockups | Blocking. Stop on page/revision/source/compatibility/hash uncertainty. |
| 2 | Implement `Text`, `Stack`, `Inline`, `Surface` and protected style helpers | Depends only on verified Phase 1 tokens; can begin after Wave 0. |
| 3 | Implement generated `Icon` registry and two lockup components | Depends on Wave 1 evidence. |
| 4 | Implement `Pressable`, shared accessibility assertions, and interaction tests | Depends on Wave 0 and token contracts; must precede Phase 3 components. |
| 5 | Publish all bounded stories and story-coverage matrix | Depends on Waves 2–4. |
| 6 | Full gates, web smoke, evidence reconciliation, and native large-text/assistive checkpoint | Do not claim full iOS/Android acceptance; that remains Phase 5. |

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | No auth or account behavior in phase. [VERIFIED: `.planning/phases/02-primitives-assets-and-component-contracts/02-CONTEXT.md:73-78`] |
| V3 Session Management | no | No application session. |
| V4 Access Control | no | No backend/resource authorization. |
| V5 Input Validation | yes | Treat MCP/SVG text as untrusted build input; exact source allowlist, strict tag/attribute/content checks, finite numbers, fixed output roots, and controlled failures. [CITED: https://help.penpot.app/mcp/] |
| V6 Cryptography | limited | SHA-256 is evidence integrity, not authentication; use Node `crypto`, never custom cryptography. [ASSUMED] |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Malicious/unsupported SVG (`script`, event attrs, foreignObject, external URL/image) | Tampering / Information Disclosure | Strict allowlist and fail-closed generator; no remote/runtime fetch; checked-in reviewed output. [ASSUMED] |
| Output path traversal from design names | Tampering | Never derive filesystem paths directly from Penpot names; map the exact closed name union to fixed filenames under one resolved directory. [ASSUMED] |
| Source ID/revision mismatch | Spoofing / Repudiation | Validate fixed file/page/source IDs, revision, raw and normalized hashes, capture timestamp, and generator version. [VERIFIED: `.planning/phases/02-primitives-assets-and-component-contracts/02-UI-SPEC.md:225-230`] |
| MCP token/key leakage | Information Disclosure | Never log/server-URL/token data or commit it; Penpot docs treat the MCP key as a password. [CITED: https://help.penpot.app/mcp/] |
| Dependency substitution | Tampering | No new packages; retain lockfile; re-run legitimacy and request approval for any change. [VERIFIED: `package.json:20-57`] |
| Interactive control remains operable while visually disabled/loading | Elevation of privilege (UI action bypass) | One blocked predicate controls native disabled state, semantic state, and callback guard; interaction tests assert zero calls. [ASSUMED] |

## Project Constraints (from AGENTS.md)

- Target mobile iOS and Android; native behavior is authoritative. [VERIFIED: `AGENTS.md` Project Constraints]
- Use React Native with Expo and React Native Storybook; web is a secondary local catalogue only. [VERIFIED: `AGENTS.md` Project Constraints]
- Penpot foundations/components are authoritative; never invent or silently substitute values. [VERIFIED: `AGENTS.md` Project Constraints]
- Penpot MCP specs/reference renders must ultimately be compared with native Storybook output; source inspection alone is insufficient. [VERIFIED: `AGENTS.md` Project Constraints]
- Preserve the exact Storybook `10.5.0` family already proven for Expo 57 even though the inherited stack table still mentions `10.6.0`. [VERIFIED: `.planning/STATE.md` accumulated decisions; VERIFIED: `package.json:38-55`]
- Use the existing Expo lint/TypeScript/Jest setup and introduce no database, product navigation, backend, persistence, or screen integration. [VERIFIED: `AGENTS.md` Technology Stack and Project scope]
- No project-specific skills exist. [VERIFIED: `AGENTS.md` Project Skills]
- Repository edits must occur through GSD workflow; this research write is the requested GSD phase-research output. [VERIFIED: `AGENTS.md` GSD Workflow Enforcement]

## Sources

### Primary (HIGH/MEDIUM confidence)

- [React Native 0.86 Pressable](https://reactnative.dev/docs/0.86/pressable) — event sequence, disabled, hitSlop, parent-bound target caveat.
- [React Native 0.86 Accessibility](https://reactnative.dev/docs/0.86/accessibility) — roles, labels, state, value, assistive APIs.
- [React Native 0.86 Text](https://reactnative.dev/docs/0.86/text) — font scaling, multiplier, wrapping/truncation behavior.
- [React Native SVG official usage](https://github.com/software-mansion/react-native-svg/blob/main/USAGE.md) — XML strings, currentColor/inheritance, supported geometry/stroke props.
- [React Native Storybook writing stories](https://storybookjs.github.io/react-native/docs/intro/writing-stories/) — CSF and args.
- [React Native Storybook addons](https://storybookjs.github.io/react-native/docs/intro/addons/) and [controls](https://storybookjs.github.io/react-native/docs/intro/addons/controls/) — action argTypes and bounded/conditional controls.
- [RNTL 14 queries](https://oss.callstack.com/react-native-testing-library/docs/api/queries), [matchers](https://oss.callstack.com/react-native-testing-library/docs/api/jest-matchers), [userEvent](https://oss.callstack.com/react-native-testing-library/docs/api/events/user-event), and [testing environment](https://oss.callstack.com/react-native-testing-library/docs/advanced/testing-env) — semantic test APIs and native-runtime limitations.
- [Expo unit testing](https://docs.expo.dev/develop/unit-testing/) — `jest-expo` and RNTL setup.
- [Penpot MCP](https://help.penpot.app/mcp/) — active page/tab model, read-only inspection, export capability, suspended-tab behavior, and key safety.
- Repository sources opened this session: `02-CONTEXT.md`, `02-UI-SPEC.md`, `REQUIREMENTS.md`, `ROADMAP.md`, `STATE.md`, `PROJECT.md`, Phase 1 research/verification, `design-spec/penpot-foundations.json`, token modules, stories/tests, and `package.json`.

### Secondary (MEDIUM confidence)

- [Apple UI design tips](https://developer.apple.com/design/tips/) — 44×44-point hit target recommendation.
- [Android accessibility guidance](https://developer.android.com/guide/topics/ui/accessibility/views/apps-views) — 48×48dp target recommendation.
- [WCAG 2.2 target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) — web minimum/spacing context; the project uses the stricter locked 44-point rule.
- npm registry metadata and GSD package-legitimacy seam — publish dates, repository identities, postinstall status, and verdicts.

### Tertiary (LOW confidence)

- None used as authoritative evidence. All unverified project-specific recommendations are marked `[ASSUMED]` and listed in the Assumptions Log.

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — exact installed versions and existing passing Phase 1 suite were inspected; official docs match the recommended APIs.
- Primitive architecture: HIGH — locked UI/phase contracts align directly with React Native core APIs and existing immutable tokens.
- Story/test architecture: HIGH — existing repository patterns and current official Storybook/RNTL 14 docs agree.
- Asset generation: MEDIUM — source inventory is verified, but live geometry/export compatibility remains deliberately unverified until the Penpot tab is active.
- Native accessibility/layout validation: MEDIUM — standards and limitations are clear, but this Windows environment currently has no native emulator tooling.

**Research date:** 2026-09-18
**Valid until:** 2026-10-18 for architecture; recheck package/docs versions before any dependency change.
