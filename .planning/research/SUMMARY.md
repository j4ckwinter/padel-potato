# Project Research Summary

**Project:** Padel Potato
**Domain:** Native-first Expo/React Native design system and Storybook catalogue
**Researched:** 2026-09-17
**Confidence:** MEDIUM

## Executive Summary

Padel Potato's first milestone is not a working padel app. It is a production-ready, Penpot-faithful React Native design system: foundations, primitives, and every reusable component from Penpot's `01 Foundations` and `02 Components` pages, made discoverable in Storybook. Experts build this as a single typed component library in an Expo app, with Penpot metadata and exports retained as review evidence rather than becoming runtime dependencies. Future screens consume the library's deliberate public API; screens, navigation, game flows, persistence, and backend work remain out of scope.

The recommended implementation path is Expo SDK 57 with React Native Storybook v10 as an app entry point through the supported Metro `withStorybook` configuration. Derive raw and semantic tokens from Penpot first; build token-consuming layout, typography, asset, and interaction primitives next; then implement each Penpot component set through a typed variant/state contract and colocated canonical, matrix, and interaction stories. Native iOS and Android Storybook renders, compared under fixed conditions against Penpot references, are the acceptance authority. The local browser catalogue is required for convenient review and smoke testing, but never proves native fidelity or accessibility.

The major risks are unvalidated iOS capacity on Windows, a suspended/unavailable Penpot MCP workflow, asset/font incompatibility, and treating web output as acceptance. Mitigate them at the start: provision a physical iPhone plus development-build/EAS route or a macOS validation owner; extract and version Penpot inventory/reference records before coding; prove font and SVG pipelines with representative samples; and make every component batch close with iOS and Android captures plus a deviation-ledger decision. Do not let product screens become a shortcut for proving components.

## Key Findings

### Recommended Stack

Use one Expo-managed TypeScript application and one shared React Native component source. Expo owns the React Native compatibility matrix, Metro, and the local web target; use `expo install` and `expo-doctor` rather than manually mixing latest native dependencies. Pin the Storybook packages to one matching v10 patch and gate the native workbench using `STORYBOOK_ENABLED` so ordinary app builds exclude it.

**Core technologies:**

- **Node.js 22.13+ LTS**: reproducible local toolchain; record the selected patch in `.nvmrc` or Volta.
- **Expo `~57.0.23`, React Native `0.86.3`, React `19.2.3`, TypeScript `~5.9`**: Expo-aligned mobile runtime with strict component/token contracts.
- **Metro via `expo/metro-config` plus `withStorybook`**: one native app configuration with a conditional Storybook entry point.
- **`@storybook/react-native` and on-device addons `10.6.0`**: authoritative iOS/Android catalogue with Controls, Actions, and Backgrounds; all Storybook packages stay on the same patch.
- **Expo web dependencies (`react-dom`, `react-native-web`, `@expo/metro-runtime`)**: required local browser review path, installed through Expo-aligned resolution.
- **`jest-expo`, React Native Testing Library, Expo lint, Prettier**: type, semantic, interaction, and formatting checks; use RNTL rather than deprecated React test renderer.
- **Penpot MCP plus checked-in manifests, references, and capture ledger**: design provenance and native visual-verification evidence, not app runtime data.

**Prescriptive browser decision:** begin with the Expo/Metro native Storybook configuration and prove `STORYBOOK_ENABLED=true expo start --web` against shared stories in Phase 1. This is the preferred minimal path because the project requires a local Expo-web catalogue, not hosted docs or full browser-addon parity. The research identifies an uncertainty: Storybook's documented full browser framework is `@storybook/react-native-web-vite`, while Expo-native Storybook's basic web route must be proven in the actual locked versions. Do **not** add Vite by default. If the Expo-web proof cannot provide navigable representative shared stories, add a narrowly scoped, separate RN Web/Vite configuration only to meet local browser review; it must consume the same library and story source, never duplicate components or become a native acceptance gate.

### Expected Features

The table-stakes deliverable is complete design-system coverage, not attractive sample screens: a Penpot-to-code foundation mapping; every reusable Penpot component; explicit designed variant/state matrices; stable Storybook taxonomy; component usage documentation; accessibility semantics; interactions; and repeatable native reference comparison. Each interactive API needs role, name, state/value, disabled/busy behavior, usable target size, and representative VoiceOver/TalkBack plus large-text validation.

**Must have (table stakes):**

- **Penpot-derived raw and semantic tokens with a foundation gallery** — prevent component-local literals and establish provenance.
- **Complete reusable component inventory and typed variant/state matrices** — every designed component is exported and navigable; meaningful default, pressed, disabled, selected, loading, error, focus, and content-boundary states are represented.
- **On-device Storybook on iOS and Android** — Controls/Actions aid review, while named native captures establish acceptance.
- **Penpot reference/capture/deviation workflow** — every visual difference is corrected or documented with source ID, story, platform, owner, and disposition.
- **Colocated usage, semantic, unit, and interaction coverage** — downstream screen work can use the system without source archaeology.
- **Local Expo-web browser catalogue** — shared-story discovery/render smoke only; document web-specific deviations.

**Should have (differentiators):**

- **Coverage manifest and token-drift checks** — make missing variants and unmapped Penpot items visible to CI.
- **Labelled native visual-reference pack and platform semantics matrix** — make visual and platform decisions repeatable.
- **Theme-ready semantic boundary** — accommodate later source-backed themes without inventing one now.

**Defer (later milestone):**

- Product screens, navigation, game lifecycle flows, backend, auth, persistence, notifications, and live data.
- Hosted Storybook, pixel-perfect browser parity, and browser-only visual acceptance.
- Automated visual-diff CI until deterministic stories, fonts, devices, and approved reference packs exist.
- Any new design language, arbitrary prop permutations, or themes not represented in Penpot.

### Architecture Approach

Create a one-way, source-backed library: `design-spec records → tokens → primitives → components → stories/tests/verification`. Runtime code must not import Penpot/spec artifacts, components must not import Storybook, and stories use only the curated design-system public exports. Keep `design-spec/` for Penpot IDs, extracted metadata, exports, and deviation ledger; `src/design-system/` for tokens, primitives, components, assets, and the barrel; `.rnstorybook/` for shared native Storybook configuration. Introduce `.storybook/` only if Phase 1 validates that the separate Vite browser adapter is necessary.

**Major components:**

1. **Design-spec records and asset manifest** — source identity, measurements, variants, export paths, and review decisions; read-only evidence.
2. **Token layer** — raw foundations plus semantic aliases for colour, type, spacing, radii, borders, elevation, opacity, motion, and sizing.
3. **Primitives** — token-consuming text, layout, surface, icon/image, Pressable, focus, and safe-area ownership contracts.
4. **Reusable components** — Penpot component-set APIs with explicit variant/state unions, slots, accessibility semantics, and callbacks.
5. **Shared Storybook/testing/verification lanes** — colocated CSF stories and tests; native smoke and visual comparison; a deliberately limited web smoke lane.

### Critical Pitfalls

1. **Coding components before foundations** — extract Penpot tokens first, ban literals outside token/primitives layers, and maintain traceability.
2. **Unproven fonts and SVG assets** — establish one native asset pipeline, inventory font metrics/weights, and gate visual captures on font readiness plus clean iOS/Android builds.
3. **Web mistaken for native Storybook** — prove Metro entry switching, enabled/disabled behavior, story discovery, and native launches before design work; browser output is secondary.
4. **iOS acceptance deferred on Windows** — make a physical-iPhone/EAS or macOS validation route an early prerequisite; Android or web evidence cannot close native acceptance.
5. **Platform/accessibility differences found late** — build safe-area and Pressable/semantic primitives early; require iOS and Android evidence, 48dp-equivalent interaction targets, and assistive-tech checks per component family.
6. **Boolean variant sprawl and informal visual review** — model finite Penpot contracts and close every capture comparison with a correction or versioned deviation decision.
7. **Scope leakage into product screens** — use isolated deterministic stories; defer navigation, data, and flows until the design system is complete.

## Implications for Roadmap

Based on the combined research, use five phases. The sequence resolves setup and authority questions before dependency-heavy design work, then keeps every component batch vertically verifiable.

### Phase 1: Native Workbench and Validation Seams

**Rationale:** Storybook configuration, native entry switching, browser-review feasibility, and iOS capacity are prerequisites. A convincing web demo without a working iOS/Android catalogue is not progress toward the acceptance target.

**Delivers:** Expo TypeScript bootstrap; version-locked native Storybook/Metro `withStorybook`; cross-platform scripts using `STORYBOOK_ENABLED`; a shared sample story; clean Android and iOS Storybook launches; normal-app disabled-path check; physical iPhone/EAS or macOS validation ownership; initial `expo start --web` shared-story proof; provider/decorator baseline; and a compact device/OS capture matrix.

**Addresses:** native catalogue and local browser catalogue table stakes; stable navigation foundations.

**Avoids:** web-as-authority, stale/undiscoverable stories, Windows iOS blind spot, and accidental Storybook inclusion in normal app bundles.

**Decision gate:** keep Expo web as the browser lane if it can browse representative shared stories. Only then decide whether a separate RN Web/Vite adapter is necessary; if added, restrict it to secondary review/smoke and shared source reuse.

### Phase 2: Penpot Provenance, Foundations, Fonts, and Assets

**Rationale:** Components must never be the first place values, fonts, or icons are interpreted. The suspended Penpot integration and native asset differences need explicit early proof.

**Delivers:** read-only Penpot extraction from `01 Foundations` and `02 Components`; component/variant inventory; source and asset manifests; reference-export and deviation-ledger conventions; raw/semantic token modules; font readiness gate and typography specimens; tested SVG/raster pipeline; foundation/token gallery; and base safe-area/layout/typography/surface/icon primitives.

**Addresses:** complete foundation layer, design-fidelity traceability, token showcase, deterministic review fixtures.

**Avoids:** token drift, font fallback, incompatible SVG exports, density errors, and safe-area values baked into controls.

### Phase 3: Interaction, Accessibility, and Component Contract Baseline

**Rationale:** Press, focus, target-size, semantic state, and typed-variant rules are cross-cutting contracts. Establishing them before composites prevents later public API churn.

**Delivers:** Pressable/focus/disabled/loading primitives; accessibility conventions and decorator/checklist; 48dp-equivalent interaction-area rule; platform-specific recipe boundaries; typed component-contract/matrix convention; story taxonomy; test harness; and native evidence for representative primitives.

**Addresses:** accessible component semantics, interaction/state-transition coverage, stable catalogue navigation, and platform semantics.

**Avoids:** accessibility bolted on late, undersized icon actions, boolean-prop sprawl, and uncontained platform conditions.

### Phase 4: Penpot Component Families as Verified Vertical Batches

**Rationale:** This is the core milestone and should proceed by dependency order, not product screens. Every set follows the same extract → component → stories/tests → native comparison loop.

**Delivers:** every reusable Penpot component with curated public API, canonical/variant/state/boundary stories, usage notes, semantic/unit/interaction tests, iOS and Android captures, and resolved deviation-ledger entries. Start with foundational controls (for example buttons and fields) before components that compose them.

**Addresses:** complete component inventory, explicit variant/state coverage, usage documentation, native Storybook acceptance, and Penpot fidelity.

**Avoids:** missing variants, screen-driven APIs, late native divergence, informal visual comparisons, and invented design values.

### Phase 5: Catalogue Coverage and Release-Readiness Review

**Rationale:** After all component batches exist, prove completeness and repeatability rather than starting screens.

**Delivers:** inventory-to-export/story coverage audit; representative native regression sweep; iOS VoiceOver and Android TalkBack checks; large-text and edge/inset checks; local browser smoke review with documented deviations; evidence pack; optional coverage manifest/drift-test foundations; and a clean normal-app/Storybook configuration check.

**Addresses:** navigable catalogue, platform parity evidence, accessible semantics, visual-reference review, and browser compatibility.

**Avoids:** accepting a catalogue with hidden gaps, claims that web a11y proves native a11y, and regressions after shared-token changes.

### Phase Ordering Rationale

- Native iOS/Android launch capacity and the browser-lane decision come first because they determine whether later evidence is valid; they cannot be repaired by component polish.
- Penpot extraction, tokens, fonts, and assets precede primitives and components so source corrections centralize in tokens/recipes rather than cause repo-wide drift.
- Interaction, safe-area, and semantic conventions precede component families because every downstream control inherits them.
- Component work is vertically verified in dependency order, with native evidence immediately after each family; platform parity is not a cleanup phase.
- Completeness/audit is last and still excludes product screens, which remain a future consumer of the stable library.

### Research Flags

Phases likely needing deeper research during planning:

- **Phase 1:** validate the exact Expo 57 + Storybook 10.6 Metro/web behavior in the generated lockfile; resolve the Expo-web versus RN Web/Vite capability decision; verify iOS device/signing/EAS or macOS-runner ownership.
- **Phase 2:** Penpot MCP is currently suspended, so inspect actual component/property/token structure; prove licensed fonts, native font names/weights, and the chosen Expo-compatible SVG pipeline before bulk asset work.
- **Phase 4:** exact Penpot inventory is unavailable until extraction, so plan component-family ordering and matrix size only from the manifest; research any components using complex gestures, overlays, or unusual SVG features.
- **Phase 5:** normalize device, font scale, theme, locale, animation, and capture conditions before committing to visual-diff automation.

Phases with standard patterns (normally skip research-phase):

- **Phase 3:** typed semantic tokens, React Native `Pressable`, `accessibilityRole`/`accessibilityState`, safe-area providers, colocated stories/tests, and RNTL semantic tests are well-documented.
- **Most of Phase 4 after extraction:** component implementation follows established contract/matrix/testing patterns; only exceptional Penpot components need additional research.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM | Official Expo/Storybook sources and registry versions were cross-checked, but peer-version resolution and web behavior need a real lockfile spike. |
| Features | MEDIUM | Strongly aligned to PROJECT.md and official framework guidance; exact Penpot component inventory was unavailable while MCP was suspended. |
| Architecture | MEDIUM | Clear source/dependency boundaries are established; browser adapter choice remains intentionally unresolved pending Phase 1 proof. |
| Pitfalls | MEDIUM | Cross-checked official Expo, React Native, Storybook, Apple, and Android guidance; device and asset realities remain project-specific. |

**Overall confidence:** MEDIUM

### Gaps to Address

- **Penpot inventory and references:** reconnect/focus the configured MCP tab, then extract authoritative token/component/variant records from the two allowed pages before implementation. Do not infer them from product screens.
- **Browser catalogue implementation:** validate Expo web first. Add `@storybook/react-native-web-vite` only if the required local browsing experience cannot be met, preserving a single component and story source and the native acceptance hierarchy.
- **iOS validation route:** nominate the physical device/EAS or macOS runner, signing owner, and supported OS/device matrix before accepting any component as complete.
- **Storybook/Expo peer compatibility:** bootstrap from the official Expo Storybook template or install Storybook then run `npx expo install --fix` and `npx expo-doctor`; do not independently upgrade Reanimated or RN packages.
- **Font, icon, and visual baseline conditions:** validate actual asset licenses/exports and set fixed capture conditions before reference comparisons or screenshot automation.

## Sources

### Primary (official documentation)

- [Expo SDK 57 reference](https://docs.expo.dev/versions/v57.0.0/) — runtime compatibility and Expo-managed dependency guidance.
- [Expo web development](https://docs.expo.dev/workflow/web/) — local web target.
- [Expo fonts](https://docs.expo.dev/develop/user-interface/fonts/) and [safe areas](https://docs.expo.dev/develop/user-interface/safe-areas/) — native initialization and layout guidance.
- [Expo iOS Simulator](https://docs.expo.dev/workflow/ios-simulator/) and [development builds](https://docs.expo.dev/develop/development-builds/use-development-builds/) — Windows/iOS validation constraints.
- [Storybook React Native repository and setup](https://github.com/storybookjs/react-native) — native configuration, CSF, addons, and entry switching.
- [Storybook React Native Web/Vite](https://storybook.js.org/docs/get-started/frameworks/react-native-web-vite) — separate browser-framework path and its capabilities.
- [Penpot MCP](https://help.penpot.app/mcp/), [Penpot variants](https://help.penpot.app/user-guide/design-systems/variants/), and [Penpot design tokens](https://help.penpot.app/user-guide/design-systems/design-tokens/) — source extraction and design contract concepts.
- [React Native accessibility props](https://reactnative.dev/docs/view) and [images/assets](https://reactnative.dev/docs/images) — semantic and asset behavior.
- [Apple design guidance](https://developer.apple.com/design/tips/) and [Android accessibility guidance](https://developer.android.com/design/ui/mobile/guides/foundations/accessibility) — interaction-target baseline.

### Secondary (project research)

- [STACK.md](STACK.md) — version snapshot, peer constraints, tooling alternatives.
- [FEATURES.md](FEATURES.md) — table stakes, differentiators, exclusions, and dependencies.
- [ARCHITECTURE.md](ARCHITECTURE.md) — boundaries, data flow, verification tiers, and build order.
- [PITFALLS.md](PITFALLS.md) — critical implementation and acceptance risks.

---
*Research completed: 2026-09-17*
*Ready for roadmap: yes*
