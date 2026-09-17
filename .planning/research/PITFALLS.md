# Domain Pitfalls

**Domain:** React Native/Expo design system delivered through native Storybook
**Researched:** 2026-09-17
**Evidence confidence:** MEDIUM — findings are cross-checked against current official Expo, React Native, Storybook, Apple, and Android documentation. The GSD confidence classifier rates the available web/documentation route MEDIUM.

## Critical Pitfalls

### Pitfall 1: Token drift begins before a token layer exists

**What goes wrong:** Components encode Penpot values directly (`#hex`, spacing numbers, font sizes, radii) or create local aliases. Similar components then visibly diverge and later global theme changes become a rewrite.

**Why it happens:** Teams start with the most attractive components, treat design exports as implementation values, and do not distinguish raw foundation tokens from semantic, component-facing tokens.

**Consequences:** A change to a brand colour, spacing scale, state colour, or type role must be found-and-replaced across stories. Storybook can look complete while no reusable contract exists.

**Warning signs:**
- Literal colour, spacing, typography, border, shadow, or icon-size values occur outside the token/primitives package.
- Two components define their own `primary`, `disabled`, or `card` values.
- A Penpot correction requires editing several component files.
- Stories demonstrate the default only because the token/state matrix is undefined.

**Prevention:** Extract Penpot foundations first into one versioned token module: raw scale tokens only where needed, semantic tokens for consumption (`content.primary`, `surface.default`, `action.primary.pressed`), and typed component recipes that reference those tokens. Ban literals in component styles with review/lint conventions. Maintain a token-to-Penpot-spec traceability table and make intentional deviations explicit.

**Detection:** A repository search finds component-local literals or a design correction touches more than the token/recipe layer.

**Phase/build-order implication:** Foundation extraction and a token gallery are a hard prerequisite for any reusable component. Do not begin component implementation from screenshots.

### Pitfall 2: Fonts load late, fall back silently, or are used without typographic metrics

**What goes wrong:** Stories render with a system fallback initially or on one target, then shift after the custom font loads; a chosen family/weight is missing; line height, letter spacing, and font scaling are not verified.

**Why it happens:** Font files are treated like a visual asset rather than a runtime dependency. Expo documents local assets as the safest approach and supports runtime `useFonts`; native font integration can instead require a development build, which changes validation needs.

**Consequences:** Text wraps differently from Penpot, controls resize, baselines drift, and an apparently pixel-correct web preview fails on a device.

**Warning signs:**
- `fontFamily` is used before an explicit loading/ready gate.
- Only regular weight exists but stories request medium, semibold, or bold.
- Typography stories omit long strings, dynamic type/font scale, and each supported weight.
- Screenshots are taken while text visibly reflows after launch.

**Prevention:** Inventory licensed font files and their exact PostScript/family/weight mapping before component work. Load local fonts through a single application/Storybook bootstrap gate; expose the actual names as typography tokens; define line-height and tracking with every type token; test fallback/loading, max-scale behaviour, and representative long content on native devices. Use an Expo development build whenever the selected integration needs native embedding, then rebuild after adding/changing native dependencies.

**Detection:** Native story snapshot taken before and after font readiness differs, requested weights synthesize, or text clips/wraps at non-default system font scale.

**Phase/build-order implication:** Asset/font registration and a typography specimen phase must precede controls with text. Font readiness is a release gate for visual comparison.

### Pitfall 3: SVG/icon exports are assumed to work identically everywhere

**What goes wrong:** Penpot SVGs are copied into `Image`, rely on unsupported SVG features, embed fixed fills, or mix multiple icon pipelines. They render in web Storybook but fail, tint incorrectly, blur, or size differently in native builds.

**Why it happens:** SVG is browser-native, whereas React Native needs an intentional native SVG implementation. Raster assets have density conventions, and Android native drawable packaging has compile-time constraints; neither fact makes arbitrary Penpot export portable.

**Consequences:** Missing icons, unthemeable assets, inconsistent intrinsic sizing, broken state colours, and platform-only build failures.

**Warning signs:**
- `Image` is given a `.svg` asset without a tested native pipeline.
- Icons carry hard-coded brand colours instead of accepting semantic `color`.
- Exports include masks, filters, CSS, embedded fonts, or IDs but have not been exercised on iOS and Android.
- The repository mixes inline SVG, PNG icons, platform drawables, and an icon-font library without ownership rules.

**Prevention:** Choose one supported RN SVG pipeline for all vector component icons and verify it in the chosen Expo/Storybook versions before importing the library. Normalize Penpot exports to a constrained, viewBox-based icon format; keep decorative illustrations separate; make icon size and colour semantic props/tokens; retain density variants for raster assets; add an icon gallery story on light/dark and disabled/selected backgrounds. Test every distinct SVG feature on both native targets, not just web.

**Detection:** A clean Android/iOS development build plus icon catalogue exposes missing/tinted/overflowing assets; visual diffs show baseline or stroke mismatch.

**Phase/build-order implication:** Establish and prove the asset pipeline with a small representative icon set before producing the full icon catalogue or icon-bearing components.

### Pitfall 4: Storybook is mistaken for a browser site instead of a native app entry point

**What goes wrong:** The catalogue works in Expo web or a developer's default app entry but stories are undiscoverable, stale, unavailable in production/dev configuration, or broken in the on-device Storybook bundle.

**Why it happens:** React Native Storybook runs in the native app and current setup relies on Metro configuration/entry-point switching. React Native Web Storybook is a separate target with its own configuration and transpilation concerns.

**Consequences:** The milestone proves the least authoritative surface; story generation/configuration breaks after changes; a web-only workaround infects native primitives.

**Warning signs:**
- Success is demonstrated only with `expo start --web`.
- `metro.config` is hand-merged without a documented `withStorybook` pattern and enabled/disabled behaviour.
- Newly added stories do not appear until a mysterious manual change.
- Storybook-only code ships in normal app bundles unintentionally, or normal entry-point validation no longer works.

**Prevention:** Pin Expo-compatible Storybook packages and use the current supported Metro `withStorybook` configuration with an explicit, cross-platform environment switch. Define canonical scripts for native Storybook, normal app, Android, iOS, and local web review. Keep native and web Storybook configuration intentionally separate; test that Storybook is enabled when expected and absent when disabled. Include one story-discovery smoke test and maintain the story glob/generation procedure.

**Detection:** Clean checkout smoke runs prove each script opens the intended entry point and lists a newly added story on Android, iOS, and web.

**Phase/build-order implication:** Bootstrap and validate the workbench before token or component implementation. Configuration is a foundation deliverable, not end-of-project plumbing.

### Pitfall 5: Native platform differences are deferred until the component catalogue is “finished”

**What goes wrong:** A component is tuned in a single simulator or web browser; iOS/Android differences in font rendering, elevation/shadows, system insets, keyboard behaviour, text metrics, and accessibility semantics are discovered only after every component depends on the same primitive.

**Why it happens:** The first target is faster to run, and shared JSX creates an illusion of identical rendering. React Native maps views to native equivalents and explicitly supports platform-specific code where differences are real.

**Consequences:** Large late-stage recipe changes, exceptions spread through components, and unreliable acceptance evidence.

**Warning signs:**
- A PR includes iOS screenshots only, Android screenshots only, or browser screenshots only.
- Platform conditions appear ad hoc inside leaf components rather than at documented recipe boundaries.
- Shadow, typography, press, modal, or inset values are accepted without side-by-side native comparison.

**Prevention:** Treat iOS and Android as required acceptance targets from the first primitive. Define a compact device/OS matrix and capture the same story/variant/state on both. Share tokens and public APIs; use `Platform.select` or `.ios`/`.android` only where a documented native difference is necessary, localised, and visual-reference-tested. Never “fix” native mismatches by degrading the native component to imitate web.

**Detection:** A review matrix has no evidence for a platform, or the same reference story has unexplained platform diffs.

**Phase/build-order implication:** Every component phase includes two-native-target evidence; do not schedule platform parity as a final cleanup phase.

### Pitfall 6: Windows development makes iOS validation optional by accident

**What goes wrong:** The team uses a Windows workstation and cannot run an iOS Simulator locally, so iOS is marked implicitly as “later” or inferred from Android/web output.

**Why it happens:** Expo documents that iOS Simulator is macOS-only; on Windows/Linux, a physical iOS device is required for iOS development validation. Device development builds additionally need proper signing and, on iOS 16+, Developer Mode.

**Consequences:** Native iOS bugs survive until handoff; visual acceptance has a permanent blind spot; a late validation setup creates needless credential/device delays.

**Warning signs:**
- Roadmap says “iOS support” but identifies no physical device, macOS executor, build profile, or owner.
- There is no installable iOS development-build path or device registration plan.
- iOS proof consists of static Penpot export, browser output, or assertion that React Native is cross-platform.

**Prevention:** Make iOS validation capacity a Phase 0 prerequisite. Choose and document either a physical registered iPhone with an EAS development build or a macOS validation runner/simulator; establish the Apple account/signing/device registration and Developer Mode path before components. Record the actual device/OS used with review captures. EAS cloud builds can create an installable device build but do not remove the need to inspect it.

**Detection:** Attempt an iOS Storybook launch from a clean Windows workflow before accepting the workbench.

**Phase/build-order implication:** Block native-authoritative component acceptance until an iOS validation route is operating. Android/web progress can continue, but cannot close the milestone.

### Pitfall 7: Safe areas are applied inconsistently or baked into reusable controls

**What goes wrong:** Content is obscured by a notch, status bar, rounded corner, or home indicator; alternatively, every component adds its own inset and screens later double-pad content.

**Why it happens:** Safe areas are device/OS context, not a fixed Penpot margin. Expo recommends `react-native-safe-area-context` and requires a provider when it is not already supplied by the app framework.

**Consequences:** A catalogue looks fine on a rectangular emulator but fails at top/bottom edges and becomes difficult to compose into future screens.

**Warning signs:**
- Inset numbers are copied from one device into tokens.
- Buttons, cards, fields, and icons independently consume `useSafeAreaInsets`.
- Edge-to-edge stories are absent.
- Provider availability varies between Storybook and the eventual app.

**Prevention:** Put `SafeAreaProvider` in the common root/Storybook decorator. Keep generic primitives inset-agnostic. Offer explicitly named layout/screen-shell primitives for safe-area ownership, with edge options where the Penpot composition needs them. Test representative top and bottom edge compositions on notched iOS and gesture-navigation Android devices.

**Detection:** A story rendered with simulated/real insets reveals clipping or double padding; consuming the same component inside two layouts changes its size unexpectedly.

**Phase/build-order implication:** Set up shared root providers before stories; build layout primitives after foundations but before any future screen assembly.

### Pitfall 8: Visual size is confused with the interactive target

**What goes wrong:** Icon-only buttons faithfully render at 20–24 units but expose the same small hit box. Pressed, disabled, selected, focus, and loading affordances are inconsistent or inaccessible.

**Why it happens:** Penpot often specifies visual geometry rather than a native hit slop/interaction contract. Apple recommends 44×44 pt hit targets; Android recommends at least 48×48 dp. Those requirements can be satisfied with padding around a smaller visual icon.

**Consequences:** Poor touch reliability, failed accessibility review, and late geometry changes to every action component.

**Warning signs:**
- Icon dimensions equal pressable dimensions.
- A component has `onPress` but no role, accessible label, disabled state, or pressed-state story.
- Gesture-only actions have no discoverable alternative.
- Tests only tap the centre point.

**Prevention:** Define a cross-platform minimum interactive-area token/contract that meets both target guidelines (48dp-equivalent layout minimum is the practical common baseline), while preserving the Penpot visual icon inside it. Build Pressable-based primitives with semantic accessibility role, label/hint where necessary, state propagation, visible press/focus/disabled states, and non-gesture access. Catalogue every action in default, pressed, disabled, selected, loading, and focused states.

**Detection:** Accessibility inspection and manual edge-of-target taps fail; component dimensions show smaller than the accepted target.

**Phase/build-order implication:** Interaction/accessibility primitives precede buttons, icon actions, selectors, chips, and inputs; state stories are an acceptance requirement, not documentation polish.

### Pitfall 9: Accessibility is bolted on after visual components “ship”

**What goes wrong:** Custom visual wrappers omit roles, labels, values, selected/disabled/expanded state, live updates, meaningful focus order, or scalable text behaviour. The visual screenshot passes but VoiceOver/TalkBack communicates the wrong control.

**Why it happens:** React Native can infer some labels from nested Text, but custom components change the accessible surface. Android and iOS need platform-aware semantics; one inferred string does not replace an explicit component contract.

**Consequences:** Whole component APIs must change late to carry accessible names and state; users cannot operate controls reliably; tests cannot assert semantics.

**Warning signs:**
- Stories use icon-only controls without an `accessibilityLabel`.
- Component props offer visual `variant` but no semantic role/state model.
- Decorative imagery is focusable, or meaningful imagery has no label.
- No VoiceOver/TalkBack or large-font walkthrough is part of review.

**Prevention:** Specify accessibility as part of each public component API: role, name, hint where action is unclear, state/value, disabled semantics, and decorative-image policy. Use React Native `accessibilityRole` and `accessibilityState` rather than visual conventions alone. Include a Storybook accessibility decorator/preset props and a native assistive-technology review checklist for representative stories. Test content at larger system text sizes and ensure no essential operation needs a gesture alone.

**Detection:** Native screen-reader walkthrough disagrees with the visible state, or no automated/manual check can identify the role/name/state of every interactive story.

**Phase/build-order implication:** Write accessibility contracts alongside token and component requirements. Do not defer to product-screen work, because product screens inherit the component API.

### Pitfall 10: Variant APIs become boolean combinations rather than a finite design contract

**What goes wrong:** Components accrete props such as `primary`, `compact`, `danger`, `isLoading`, `outlined`, and custom style overrides. Some combinations have no Penpot counterpart and no Storybook evidence.

**Why it happens:** Implementers optimise for short-term flexibility instead of modelling Penpot component properties and states as a finite, typed matrix.

**Consequences:** Unreviewable APIs, duplicate style branches, invalid combinations, missed states, and consumer-created visual drift.

**Warning signs:**
- More booleans than named variant/state unions.
- A catch-all `style` prop is the normal way to alter a component's appearance.
- Story names do not map one-to-one to Penpot variants/states.
- “Secondary destructive loading selected” has undefined visual rules.

**Prevention:** Translate the Penpot component property table into discriminated, typed props: semantic variant, size, state, and content slots. Generate or enumerate stories for every valid matrix row and reject impossible combinations in the type/API design. Permit layout composition deliberately, but reserve visual recipe ownership to the design-system component. Document intentional omissions/deviations against Penpot.

**Detection:** A prop combination cannot be located in Penpot or a corresponding story; code contains mutually interacting boolean style branches.

**Phase/build-order implication:** Inventory components and their property/state matrices before implementation. Component delivery is complete only when its matrix is represented in native Storybook.

### Pitfall 11: Visual comparison is informal and cannot catch regressions

**What goes wrong:** Developers compare from memory, at arbitrary simulator scale, after themes/fonts have changed, or only against browser output. Tiny but cumulative mismatches in type, spacing, radius, icon stroke, shadows, and state colour are accepted.

**Why it happens:** Penpot specs and runtime renders are inspected separately. No canonical capture conditions or deviation log exists.

**Consequences:** The claimed design authority is unenforceable; late review becomes subjective; fixes reintroduce drift into other variants.

**Warning signs:**
- “Looks right” is the acceptance evidence.
- Reference exports lack source page/node/property identifiers.
- Captures differ in device, viewport, font scale, theme, or state.
- Known deviations are kept in chat rather than versioned documentation.

**Prevention:** Define a visual-validation protocol before components: export/reference each Penpot foundation/component; render the matching named story at a fixed device/OS, theme, font scale, locale, and state; capture iOS and Android; compare side by side or by overlay/diff; log each intentional deviation with rationale, owner, and source node. Re-run the representative matrix after changes to tokens, fonts, asset tooling, or shared primitives.

**Detection:** A reviewer cannot reproduce a comparison or determine whether a difference is intentional.

**Phase/build-order implication:** Build the capture/traceability harness alongside Storybook bootstrap. Require evidence for the foundation gallery first, then each component family.

### Pitfall 12: Product screens are started as a shortcut to prove components

**What goes wrong:** The team builds Home, onboarding, Create Game, navigation, or data-like screen state to make components feel real. Screen-specific exceptions then drive primitives, while unimplemented component variants hide behind the one happy path.

**Why it happens:** Screen work is emotionally rewarding and can look like rapid progress. The Penpot file includes screens, which makes scope leakage easy.

**Consequences:** The milestone expands into navigation and app behaviour, reusable APIs calcify around one composition, and foundation/component verification is deferred.

**Warning signs:**
- New navigation, backend, persistence, or feature-flow dependencies appear in a design-system PR.
- A component has only one screen-driven story and lacks standalone variants/states.
- Screen-specific spacing/colours get added to shared tokens to match one composition.

**Prevention:** Enforce the milestone boundary: Penpot foundations and reusable component pages are the implementation inventory; product-screen pages are reference-only context. Use isolated Storybook compositions only to demonstrate component interaction, never app navigation or working flows. Track screen requests as deferred follow-up work and require a component-matrix gap analysis before admitting any exception.

**Detection:** Scope review finds a product route, screen, API, persistence, or navigation dependency; work cannot be demonstrated through independent stories.

**Phase/build-order implication:** Finish and validate foundations, primitives, components, and the native catalogue before scheduling product-screen assembly in a later milestone.

## Moderate Pitfalls

### Pitfall 1: Platform-system colours or shadows leak into a supposedly fixed Penpot token system

**What goes wrong:** `PlatformColor` or native defaults silently vary with platform theme/high-contrast settings, or elevation/shadow is copied from one platform.

**Prevention:** Use Penpot semantic tokens for design-authoritative components; introduce platform-native tokens only by explicit decision and native comparison. Keep shadow recipes platform-aware and test against references.

### Pitfall 2: Native dependency changes are not followed by a development-build rebuild

**What goes wrong:** A library with native code is installed, but testing continues in an old client, creating false “works locally” or missing-module conclusions.

**Prevention:** Record the native dependency/build relationship in setup docs and require a rebuilt development client after such dependency changes, as Expo documents.

### Pitfall 3: Static asset resizing and density are ignored

**What goes wrong:** Reference exports are used as a single PNG size, then blur on high-density screens or distort because intended aspect ratio is not retained.

**Prevention:** Prefer the tested vector pipeline for icons; for raster imagery retain aspect ratio and supply density-aware assets or deliberate dimensions. Include high-density native capture in review.

### Pitfall 4: Web compatibility becomes a second implementation path

**What goes wrong:** Native primitives are compromised or forked to obtain pixel-perfect browser parity even though browser Storybook is only a convenience target.

**Prevention:** Keep browser smoke/review support, document known practical compatibility deviations, and prioritise iOS/Android evidence whenever targets conflict.

## Minor Pitfalls

### Pitfall 1: Story names and taxonomy drift from Penpot

**What goes wrong:** Reviewers cannot locate a Penpot component/variant in Storybook.

**Prevention:** Use a stable folder and story naming convention based on Penpot foundation/component taxonomy, including variant/state labels.

### Pitfall 2: Stories use unrealistic placeholder content only

**What goes wrong:** Long names, localisation, empty states, error text, and dynamic type reveal overflow later.

**Prevention:** Add representative short/long content and boundary cases to each text-bearing component story.

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Workbench bootstrap | Web preview is accepted as native Storybook | Prove clean native iOS and Android launches, story discovery, enabled/disabled switching, and web convenience separately. |
| iOS validation setup | Windows has no local simulator path | Before acceptance work, provision a physical iPhone + EAS development build or a macOS runner; record device/OS and signing ownership. |
| Penpot extraction | Literal values become component-local styles | Produce raw and semantic tokens, a traceability table, and a token gallery before components. |
| Fonts/assets | Fallback fonts or untested SVG exports change layout | Complete font/asset inventory and native pipeline proof; gate captures on font readiness and clean development builds. |
| Primitives | Safe-area ownership and interactive target sizing are ambiguous | Root provider/decorator owns insets; layout primitives own edges; Pressable primitives meet target size and expose semantic state. |
| Component families | Boolean prop growth misses designed variants | Model a typed variant/state matrix from Penpot and cover every valid row in Storybook. |
| Accessibility | Semantics are deferred to screens | Make role/name/state/value and large-text/assistive-tech checks component acceptance criteria. |
| Native validation | Late platform-only visual fixes spread exceptions | Compare fixed-condition iOS and Android captures against the exact Penpot reference after each component family. |
| Scope management | Screen/navigation work consumes the milestone | Keep product screens out of implementation; use isolated stories and defer flows to the next milestone. |

## Sources

- [Expo: Safe areas](https://docs.expo.dev/develop/user-interface/safe-areas/) — MEDIUM (current official documentation via verified web route)
- [Expo: Fonts](https://docs.expo.dev/develop/user-interface/fonts/) — MEDIUM
- [Expo: iOS Simulator](https://docs.expo.dev/workflow/ios-simulator/) — MEDIUM
- [Expo: Development builds](https://docs.expo.dev/develop/development-builds/use-development-builds/) — MEDIUM
- [Storybook: React Native configuration](https://storybook.js.org/addons/%40storybook/addon-ondevice-actions) — MEDIUM
- [Storybook: React Native Web](https://storybook.js.org/docs/get-started/frameworks/react-native-web-vite) — MEDIUM
- [React Native: View accessibility props](https://reactnative.dev/docs/view) — MEDIUM
- [React Native: Images and static assets](https://reactnative.dev/docs/images) — MEDIUM
- [Apple: UI design hit targets](https://developer.apple.com/design/tips/) — MEDIUM
- [Android: Mobile accessibility guidance](https://developer.android.com/design/ui/mobile/guides/foundations/accessibility) — MEDIUM
