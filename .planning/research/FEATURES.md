# Feature Landscape

**Domain:** React Native/Expo mobile design-system catalogue in Storybook
**Researched:** 2026-09-17
**Evidence confidence:** MEDIUM (official primary documentation retrieved via verified web search; live Penpot inspection was unavailable because its plugin tab was suspended)

## Table Stakes

Features required for this milestone to be a usable, production-grade component-system handoff. Native iOS and Android Storybook are the acceptance targets; browser Storybook is a convenient secondary review surface.

| Feature | Why Expected | Complexity | Notes and acceptance evidence |
|---|---|---:|---|
| Complete foundation layer | Components cannot remain faithful or maintainable if they duplicate literal colors, spacing, type, radii, borders, shadows, or opacity. | Med | Implement named token modules and typed primitives for every authored Penpot foundation. Maintain a Penpot-token → code-token mapping, including resolved values and intentional omissions. A token showcase story displays each semantic group. |
| Complete reusable-component inventory | The specified milestone is a component library, not a sample set of attractive controls. Missing one reusable Penpot component makes later screens invent their own. | High | Keep a component inventory derived from Penpot `02 Components`; every component has an exported public API and a discoverable Storybook entry. Do not build product screens to demonstrate it. |
| Explicit variant and state matrix | Variant axes in Penpot are property/value combinations; a single default story cannot demonstrate that implementation preserves the design contract. | High | For each component, enumerate Penpot axes (for example size, hierarchy, icon placement, selected, status) and runtime states: default, pressed, disabled, selected/checked, loading, error, focus where applicable, plus empty/populated content states. Provide a story per meaningful combination or a matrix/gallery story plus canonical individual states. Test impossible combinations out of the public API. |
| Native Storybook on both platforms | React Native Storybook runs in the actual native app; platform behavior and rendering cannot be accepted from browser output alone. | Med | A repeatable command launches the catalogue in iOS and Android simulators/devices. Review evidence records platform, OS, Storybook version, component/story name, and result. Use on-device Controls and Actions so props and emitted events can be explored without code changes. |
| Local desktop-browser catalogue | Reviewers need quick navigation and documentation without booting a simulator. | Med | Start a React Native Web Storybook/Expo-web review target locally. It must browse all catalogue entries and render representative stories. Record known web-only deviations; do not require browser pixel parity. |
| Usage documentation colocated with every component | A future screen team needs the import, purpose, supported props/variants, composition rules, and state ownership—not source archaeology. | Med | Each component has a Storybook description/notes (or MDX where browser tooling is used) covering API, accessibility contract, intended/forbidden use, token dependencies, and one canonical example. Global catalogue docs explain naming and versioning conventions. |
| Accessible component semantics | React Native requires accessible labels, roles, state, hints and actions to drive VoiceOver/TalkBack; matching the visual design alone is insufficient. | High | Interactive components expose `accessibilityRole`; selected, checked, expanded, busy, and disabled conditions are represented through `accessibilityState`; non-obvious actions provide labels/hints. Stories demonstrate these semantic states. Manually inspect at least representative controls with iOS VoiceOver and Android TalkBack. |
| Interaction and state-transition coverage | Controls that only render are not proven reusable. | Med | Add interaction stories/tests for press/callback emission, controlled selection/checked changes, text entry and validation/error presentation, loading/disabled guards, and overlays where designed. Use the action logger or spies for callbacks. Favor portable component tests; native device interaction smoke checks remain necessary. |
| Design-fidelity verification through Penpot MCP | The project has an explicit authoritative source. Code review and inspecting properties alone do not prove runtime output. | High | For each foundation/component, retain a source record: Penpot page/node or component name, variant properties, token values, and reference export. Compare that reference with native Storybook output on iOS and Android; log intentional deviations with reason, affected platform, approver/date, and follow-up disposition. |
| Stable catalogue navigation and review fixtures | A reviewer must locate what changed and repeat a comparison. | Low | Use consistent hierarchy: Foundations → Tokens/Primitives; Components → category → component → canonical state. Give stories durable descriptive names and deterministic mock content. |

## Differentiators

These make the library reliably reviewable and reduce downstream implementation cost. They are valuable after the table-stakes catalogue is present—not substitutes for it.

| Feature | Value Proposition | Complexity | Notes |
|---|---|---:|---|
| Automated coverage manifest | Detects both missing Penpot variants and missing stories before review. | Med | Generate or maintain a checked-in matrix mapping each Penpot component/variant/state to exported component, story IDs, supported platforms, verification date, and deviation record. Fail CI for unmapped required entries. |
| Token provenance and drift tests | Turns design fidelity from a subjective visual claim into a fast, repeatable contract. | High | Extract Penpot tokens/variant metadata with MCP when the plugin is active; compare normalized values to code tokens. Snapshot the extracted manifest. Treat unit conversion and font-availability differences as explicit mappings, never silent substitutions. |
| Visual-reference review pack | Makes native fidelity auditable across revisions. | High | Capture labelled iOS and Android Storybook screenshots for canonical component states beside exported Penpot references. Use tolerance-based visual diff only after normalizing device scale, font loading, safe area, and dynamic content. Human review resolves meaningful differences. |
| Platform semantics matrix | Prevents one platform from becoming a second-class implementation. | Med | For every interactive primitive, document iOS/Android behavior for press feedback, focus/accessibility semantics, disabled state, touch target, and platform-only implementation differences. Add a browser-compatibility note when RN Web differs. |
| Story-level test status | Lets reviewers spot unverified states in the catalogue rather than interpreting a green app as full coverage. | Med | Surface render, interaction, and browser-accessibility test status where supported; label native-only manual checks clearly instead of pretending DOM tooling validates VoiceOver/TalkBack. |
| Theme/readiness boundary | Makes the system easier to extend without claiming a dark mode that Penpot has not designed. | Low | Keep semantic token names and a theme provider boundary now; implement only themes present in Penpot. This avoids later rewrites while preserving source fidelity. |

## Anti-Features

| Anti-Feature | Why Avoid | What to Do Instead |
|---|---|---|
| Product screens, navigation, or end-to-end game flows | They obscure component gaps, invent app behavior, and are explicitly deferred. | Use isolated stories with deterministic fixtures and minimal decorators. |
| Backend, authentication, persistence, notifications, or live data | No design-system acceptance criterion requires them and they introduce unrelated failure modes. | Model states locally with explicit story args/mocks. |
| Pixel-perfect browser parity or hosted Storybook | Native is authoritative, and web is only local review support for this milestone. | Verify functional browser rendering and log web differences; prioritize iOS/Android fixes. |
| A custom design language or “helpful” tokens absent from Penpot | It silently changes the source-of-truth contract and creates design debt. | Add only source-backed tokens/components; record requested additions as design decisions for Penpot first. |
| A story for every arbitrary prop permutation | The Cartesian product becomes unreadable and unmaintainable. | Cover each designed variant/state, use controls for exploration, and add a curated gallery for combinations. |
| Claiming automated web a11y scans prove native accessibility | DOM/axe checks are useful on the web target but do not replace VoiceOver/TalkBack validation of React Native components. | Combine browser a11y scans with code-level semantic assertions and representative manual native screen-reader checks. |
| Heavy screenshot-diff infrastructure before stable fixtures | Uncontrolled fonts, device scale, animations, and dynamic content create noisy failures. | First establish deterministic stories and a reviewed reference pack; automate diffs only once comparisons are stable. |

## Feature Dependencies

```text
Penpot MCP specification + reference exports → inventory and token/variant manifests
Penpot token manifest → typed token layer + primitives → reusable components
Component public API → canonical stories + controls/actions + usage documentation
Variant/state matrix → interaction stories/tests + native accessibility checks
Canonical native stories → iOS/Android visual-reference comparison → deviation log
Stable React Native components → local React Native Web catalogue (secondary compatibility)
```

## MVP Recommendation

Prioritize:

1. **Penpot-derived inventory, token manifest, and foundation stories** — establishes source traceability before components hard-code values.
2. **All reusable components with an explicit designed-variant/state coverage matrix** — the core deliverable; ship in dependency order from primitives to composite controls.
3. **Native iOS/Android Storybook with accessibility contracts and a documented visual comparison pass** — proves real-runtime behavior rather than source-level intent.
4. **Local browser catalogue with clear native-authority limits** — enables convenient review without widening native acceptance scope.

Defer: automated visual-diff CI, multi-theme support, hosted Storybook, and product-screen assembly. Add them only when stable canonical stories and an approved source-of-truth workflow exist.

## Sources

- [React Native Storybook current setup, CSF, on-device controls/actions/notes, and Expo entry-point behavior](https://storybook.js.org/addons/%40storybook/addon-ondevice-actions) — MEDIUM (verified official source).
- [Storybook: React Native vs React Native Web, including native fidelity and web documentation/testing strengths](https://storybook.js.org/docs/9/get-started/frameworks/react-native-web-vite) — MEDIUM (verified official source).
- [Storybook interaction tests](https://storybook.js.org/docs/writing-tests/interaction-testing) and [testing overview](https://storybook.js.org/docs/writing-tests) — MEDIUM (verified official source).
- [React Native accessibility props](https://reactnative.dev/docs/Text) — MEDIUM (verified official source).
- [Penpot variants: properties and values](https://help.penpot.app/user-guide/design-systems/variants/) and [Penpot design tokens](https://help.penpot.app/user-guide/design-systems/design-tokens/) — MEDIUM (verified official sources).

## Research Notes / Gaps

- The connected Penpot MCP plugin was suspended during live inspection, so this report does not assert the exact component inventory or exact property names. Make MCP extraction and reference export the first implementation/research task once the Penpot tab is focused.
- Storybook’s web test and a11y integrations are valuable for the browser catalogue, but their current documentation does not make them evidence of native assistive-technology behavior. Retain the native manual check requirement.
