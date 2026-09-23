# Phase 4: Identity, Content, and Feedback Components - Context

**Gathered:** 2026-09-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver every remaining Penpot-designed identity, status, progress, content, feedback, and illustrated-card family as reusable React Native components with bounded typed APIs, complete Storybook coverage, semantic interaction tests, and deterministic source traceability. Product screens, routing, live data, remote services, and authoritative native catalogue acceptance remain outside this phase.

</domain>

<decisions>
## Implementation Decisions

### Public Contracts and Composition
- Model Penpot variant axes as closed discriminated unions matching only authored tuples; unsupported combinations must not be representable or silently accepted.
- Allow callers to supply names, dates, scores, labels, image sources, and callbacks while keeping layout and visual semantics component-owned.
- Publish one public component per named Penpot family, using tightly typed nested data only where compound content requires it rather than exposing generic render slots or a catch-all card.
- Image-bearing components accept local or React Native image sources, use deterministic story fixtures, and expose fallback states only where the committed Penpot source authors them.

### State and Interaction Ownership
- Components remain controlled; interactive stories own local state and rerender components after callbacks.
- Content rows and cards expose specific callbacks for authored actions without owning navigation, routing, persistence, or other product behavior.
- Unread, selected, result, and progress states use explicit semantic props or discriminated branches grounded in authored Penpot records rather than being inferred from display content.
- Disabled and read-only states suppress callbacks, expose the appropriate native accessibility state, and preserve the authored visual treatment.

### Delivery, Stories, and Verification
- Deliver dependency-ordered vertical batches: identity, status, and progress first; content rows and cards second; feedback and illustrated content last.
- Group stories under `Identity`, `Status`, `Progress`, `Content`, `Feedback`, and `Cards`, using the established `Canonical`, `Variants`, `States`, `Boundaries`, and `Interactive` taxonomy.
- Tests prove typed tuple rejection, semantics, callbacks, controlled states, content boundaries, and complete revision-296 source traceability rather than relying on broad snapshots.
- Retain deterministic Penpot references and host/web checks during Phase 4; authoritative iOS and Android visual comparison remains assigned to Phase 5.

### the agent's Discretion
- Exact internal module boundaries, shared family helpers, fixture organization, and implementation batching may follow the closest Phase 2 and Phase 3 patterns as long as the approved public contracts remain bounded and source-traceable.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Text`, `Stack`, `Inline`, `Surface`, `Icon`, and `Pressable` provide the token-backed primitive layer for Phase 4 families.
- The generated icon registry and Phase 3 private artwork patterns provide deterministic local assets without introducing runtime Penpot or network dependencies.
- Shared accessibility helpers cover roles, names, values, states, callback suppression, touch targets, token styles, and decorative children.

### Established Patterns
- `src/design-system/components/sourceRegistry.ts` deep-freezes generated revision-296 family evidence, retains source order, and separates runtime code from the Penpot archive.
- Public props are closed, runtime-validated contracts; transient press and focus visuals come from native interaction while persistent state remains controlled.
- Every public export accounts for all five story categories, with a non-empty inapplicability reason where a category has no authored behavior.
- Canonical stories display exact Penpot provenance; tests validate source records and host-level contracts without claiming native acceptance.

### Integration Points
- New component families belong beneath `src/design-system/components/` and are re-exported through the narrow component and root barrels.
- Phase 4 source evidence should be generated from `design-source/padel-potato UI Concepts.penpot` revision 296 using the local inspection workflow.
- Phase 4 story contracts should extend the existing story-contract boundary with exact family records, controls, actions, and native-review deferrals.
- Jest Expo, React Native Testing Library, Expo lint/type checks, design-source validation, and the bounded Storybook web smoke form the existing verification pipeline.

</code_context>

<specifics>
## Specific Ideas

- Preserve Penpot-authored family names, variant meaning, content hierarchy, and visible states while translating generic property labels into intentional public API names with explicit source mappings.
- Keep every family independently reviewable in Storybook with deterministic local fixtures and no product screen, navigation framework, backend, or live data requirement.

</specifics>

<deferred>
## Deferred Ideas

- Product screens, application routing, live notifications, remote images, backend data, and persistent game or player state remain deferred to later milestones.
- Authoritative iOS and Android visual comparison, assistive-technology review, production exclusion, and the final catalogue coverage audit remain in Phase 5.

</deferred>
