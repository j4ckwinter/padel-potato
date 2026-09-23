# Phase 5 Research: Standalone Catalogue Validation

## Implementation Guidance

- Treat exported component types and explicit component-owned configuration maps as the supported runtime contract.
- Derive catalogue coverage from public exports and static Storybook contracts, not external evidence records.
- Keep automated verification deterministic: typecheck, lint, Jest behavior tests, Storybook web smoke, and enabled/disabled native export checks.
- Keep native visual review manual. Automation can prove renderability, behavior, accessibility, and coverage, but not visual taste or platform fidelity.
- Keep Storybook conditional so disabled application bundles do not include catalogue modules.

## Risks and Controls

| Risk | Control |
|---|---|
| A supported variant disappears | Behavior tests plus explicit story fixtures and controls |
| Runtime reaches outside the design system | Standalone boundary test scans active design-system sources |
| Storybook-only code leaks into the app | Enabled/disabled Expo bundle checks |
| Web success is mistaken for native acceptance | Document web as smoke-only and retain user-led native review |

## Verification Target

The phase is technically ready when `npm run verify` passes, native bundles export in both Storybook modes as expected, every public family is represented in the catalogue, and the user can perform manual review without any design archive or extraction tooling.
