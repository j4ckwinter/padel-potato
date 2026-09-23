# Phase 3: Actions, Forms, and Navigation Components - Context

**Gathered:** 2026-09-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver the Penpot-designed action, form, authentication, and navigation component families as reusable React Native components with bounded typed APIs, complete Storybook coverage, semantic interaction tests, and deterministic source traceability. Product screens, routing integration, backend authentication, and complete picker flows remain outside this phase.

</domain>

<decisions>
## Implementation Decisions

### Public API and Penpot Fidelity
- Model Penpot variant axes with closed discriminated props so unsupported combinations are not representable.
- Allow labels, values, and callbacks to be customized while keeping geometry and visual semantics component-owned.
- Normalize only clear Penpot authoring defects, such as generic `Property 1` or `Value 2` labels, and retain an explicit source mapping or deviation record.
- Retain Phase 3 component/source registries at canonical family or component-set level, pinned to the committed local Penpot revision 296.

### State and Interaction Ownership
- Components expose controlled values and selections; interactive stories provide local harness state rather than making components product-state owners.
- Derive transient focus and pressed visuals from native events; public props represent persistent supported states rather than simulated transient states.
- Use native `TextInput` behavior for text fields; select, date, and time variants remain trigger components without implementing product-level picker overlays.
- Navigation components emit destination or action callbacks without owning routing or importing a navigation framework.

### Accessibility and Native Semantics
- Use control-specific native roles and checked or selected accessibility values rather than generic button semantics everywhere.
- Expose each destination and segment in composite navigation controls as an individually named control with selected state.
- Associate field labels, hints, required state, and errors semantically while retaining the visible Penpot content.
- Reuse the Phase 2 `Pressable` contract and preserve at least 44x44 effective touch targets, including compact visual controls.

### Storybook, Tests, and Delivery Structure
- Deliver dependency-ordered vertical families: actions first, forms and authentication second, then navigation and headers.
- Group stories under `Actions`, `Forms`, `Authentication`, and `Navigation` while using the established `Canonical`, `Variants`, `States`, `Boundaries`, and `Interactive` taxonomy.
- Test callbacks, blocked states, controlled changes, accessibility state, and field editing; real routing and product-level picker flows remain out of scope.
- Retain deterministic Penpot references and web/runtime checks during implementation; authoritative iOS and Android visual comparison remains assigned to Phase 5.

### the agent's Discretion
- Exact internal module boundaries, shared style helpers, and test fixture organization may follow the closest Phase 2 patterns as long as public contracts remain bounded and source-traceable.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Text`, `Stack`, `Inline`, `Surface`, `Icon`, and `Pressable` provide the token-backed primitive layer for every Phase 3 family.
- The generated icon registry supplies the closed icon-name surface needed by icon buttons, fields, headers, and navigation.
- Shared accessibility test helpers already cover roles, names, values, states, press suppression, touch targets, token styles, and decorative icons.

### Established Patterns
- Runtime props and design values are closed and validated; visual escape hatches are limited to layout-only style keys.
- Disabled and loading behavior is centralized through `Pressable`, including callback suppression, busy/disabled semantics, focus treatment, and effective touch targets.
- Every public export accounts for all five story categories, with a non-empty reason when a category is genuinely inapplicable.
- Canonical stories retain exact Penpot file, page, revision, and source identity, while native visual proof is recorded separately from host and web evidence.

### Integration Points
- New families belong under `src/design-system/` and must be re-exported through the public design-system barrel.
- Story contracts and source mappings extend the existing `src/design-system/stories/storyContract.ts` boundary or a compatible phase-specific successor.
- Tests use React Native Testing Library with the Expo Jest preset and the shared helpers in `src/design-system/testing`.
- Design queries and retained evidence use `npm run design:inspect` against `design-source/padel-potato UI Concepts.penpot` revision 296.

</code_context>

<specifics>
## Specific Ideas

- Preserve Penpot-authored component names, variant meaning, content hierarchy, and visible states while converting generic Penpot property labels into intentional public API names.
- Keep this milestone independently reviewable in Storybook; no product screen or navigation framework should be required to exercise the components.

</specifics>

<deferred>
## Deferred Ideas

- Product routing, application navigation state, authentication services, and complete date/time/select picker workflows remain deferred to later product milestones.
- Authoritative iOS and Android visual comparison remains in Phase 5.

</deferred>
