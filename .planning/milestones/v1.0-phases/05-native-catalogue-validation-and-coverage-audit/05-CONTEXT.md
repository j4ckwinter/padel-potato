# Phase 5: Native Catalogue Validation and Coverage Audit - Context

**Gathered:** 2026-09-22
**Status:** Ready for planning

## Phase Boundary

Prepare the standalone React Native Storybook catalogue for user-led review, verify public component and story coverage, and prove Storybook remains isolated from normal application bundles and navigation.

## Decisions

- Manual Storybook review is the authority for visual and interaction quality.
- The user will inspect the catalogue and report only issues they observe; no prescribed screenshots or sign-off ceremony are required.
- Automated checks cover types, lint, behavior, accessibility, catalogue taxonomy, web startup, and enabled/disabled native bundles.
- Coverage is based on public component exports, explicit supported configurations, and story contracts.
- Components, tokens, icons, and artwork are standalone runtime assets. No design-tool archive, extraction pipeline, evidence manifest, or source-record identifier is required.
- Reported defects drive a correction and revalidation loop; the user decides subsequent product work.

## Existing Code

- Stories exist beside foundations, primitives, assets, and all public component families.
- `src/design-system/stories/fixtures/` contains typed, component-focused Storybook configuration fixtures.
- `npm run verify` is the unified automated verification entry point.
- Storybook entry swapping remains controlled by `STORYBOOK_ENABLED`.

## Deferred

Hosted Storybook, pixel-perfect web parity, product screens, navigation, backend behavior, and persistent data remain out of scope.
