# Phase 5: Native Catalogue Validation and Coverage Audit - Context

**Gathered:** 2026-09-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Prepare the completed React Native Storybook catalogue for user-led native review, prove catalogue and Penpot coverage through automation, verify that Storybook stays outside production bundles and product navigation, and provide the technical checks needed for the user to decide what happens after manual validation.

</domain>

<decisions>
## Implementation Decisions

### Native Validation Authority
- Manual review in native Storybook is the acceptance authority for visual and interaction quality.
- The user will inspect Storybook themselves and post any issues in the conversation in whatever format is convenient.
- Do not require a formal per-story response, prescribed screenshot set, or structured issue template from the user.
- Automation prepares the catalogue and coverage information but does not substitute for the user's visual judgment.

### Coverage and Release Gates
- Generate an auditable mapping from every Penpot foundation, reusable component, variant, and designed state to its implementation and Storybook coverage.
- Unexplained coverage omissions are failures; intentional omissions or platform differences must be explicitly dispositioned.
- Issues reported by the user during manual validation drive a correction and revalidation loop.
- Prove automatically that production-mode builds exclude Storybook code when Storybook is disabled.

### Manual Review Workflow
- The user controls the review process and will report only the issues they observe.
- Do not impose a family-by-family review ceremony, required screenshots, or mandatory device metadata on the user.
- Fix reported implementation defects, then leave the user to decide whether and how to recheck them.
- Automated checks should still cover catalogue completeness, technical regressions, and the secondary Expo-web smoke lane.

### Completion and Next Steps
- Do not prescribe an approval ceremony or ask the user to commit to a final evidence workflow in advance.
- Prepare the technical validation outputs and a usable native Storybook catalogue, then let the user decide the next steps.
- Retain concise automated audit results and existing source/deviation provenance; screenshots from manual review are optional.
- Keep Storybook isolated from product navigation, product flows, and production bundles.

### the agent's Discretion
- Choose the exact report formats, scripts, test organization, and coverage-manifest structure, provided they are deterministic and easy to inspect.
- Choose representative automated smoke cases without turning browser parity into a native acceptance requirement.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- Existing phase-specific verification scripts already cover Penpot evidence, Storybook web smoke checks, and Phase 2-4 component/source validation.
- Story files exist alongside foundations, primitives, assets, and every Phase 3-4 component family.
- Generated source registries and retained Penpot manifests provide deterministic inputs for a complete coverage audit.

### Established Patterns
- Validation is implemented as dependency-light Node scripts invoked from package scripts and combined with strict TypeScript, Jest, lint, and Expo health checks.
- Native evidence is kept distinct from host or web evidence; Expo web is a secondary discovery and render-smoke lane.
- Penpot revision 296 and the committed local `.penpot` snapshot are the routine design authority.

### Integration Points
- Extend the existing validation scripts rather than introducing a second test or reporting framework.
- Add Phase 5 commands through `package.json` and keep Storybook entry swapping controlled by `STORYBOOK_ENABLED`.
- Build the final coverage view from retained design-source inventories, component registries, story contracts, and existing deviation records.

</code_context>

<specifics>
## Specific Ideas

The user wants to open Storybook, inspect it personally, and post observed issues back into the conversation. Phase 5 should make that loop easy without forcing a heavyweight evidence or sign-off process.

</specifics>

<deferred>
## Deferred Ideas

- The user will decide what follows manual validation; do not select or launch a subsequent product milestone as part of this phase.
- Hosted Storybook, pixel-perfect web parity, product-screen assembly, navigation, backend behavior, and persistent data remain out of scope.

</deferred>
