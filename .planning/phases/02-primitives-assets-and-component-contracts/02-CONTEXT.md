# Phase 2: Primitives, Assets, and Component Contracts - Context

**Gathered:** 2026-09-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver the reusable visual assets, token-backed React Native primitives, bounded public contracts, Storybook conventions, shared test harness, and accessibility rules required by later Penpot component phases. This phase does not build product screens, navigation, live data, or the component families assigned to Phases 3 and 4.

</domain>

<decisions>
## Implementation Decisions

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

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/design-system/tokens/index.ts` is the narrow public boundary for all seven immutable foundation categories and their Penpot provenance.
- `design-spec/penpot-foundations.json` contains revision-292 source records for 51 reusable components, including 18 icons and two brand lockups.
- `FoundationFontGate` already supplies the global Storybook font-readiness boundary.
- The existing Jest Expo and React Native Testing Library setup supports native render, semantic, and interaction tests.

### Established Patterns
- Runtime code consumes local immutable exports; Penpot manifests, hashes, captures, and deviation records remain build evidence.
- Public variants are closed unions, unsupported runtime inputs fail explicitly, and source ordering is deterministic.
- Stories use typed CSF metadata, stable taxonomy, bounded controls, and focused render coverage.
- Verification combines value-level tests, controlled rejection cases, strict TypeScript, Expo lint, Expo health, and a bounded web Storybook smoke.

### Integration Points
- New primitives and assets should live beneath `src/design-system/` and consume only the public token barrel.
- Story files remain discoverable through `.rnstorybook/main.ts`'s existing `src/**/*.stories.*` glob.
- Shared Storybook behavior belongs in `.rnstorybook/preview.tsx` without displacing the existing font gate.
- Phase 3 and Phase 4 components will depend on the public primitive, asset, story, test, and accessibility contracts established here.

</code_context>

<specifics>
## Specific Ideas

- Mobile-only and native-first remain non-negotiable; Expo web is a secondary local review lane.
- Penpot is the source of truth. Do not redraw icons, substitute third-party icon packs, invent variants, or recolour brand assets beyond authored options.
- Keep the work independently reviewable in Storybook with no product integration.

</specifics>

<deferred>
## Deferred Ideas

- Concrete action, form, authentication, and navigation component families remain Phase 3.
- Identity, content, feedback, and card component families remain Phase 4.
- Native iOS/Android catalogue acceptance, production exclusion, and full coverage audit remain Phase 5.
- Product screens and game flows remain outside this milestone.

</deferred>
