---
phase: 02-primitives-assets-and-component-contracts
plan: 03
subsystem: design-system
tags: [react-native, assets, icons, brand, accessibility, tdd]
requires:
  - phase: 02-01
    provides: Validated revision-292 icon registry and retained local brand artwork
provides:
  - Closed token-coloured Icon API for all 18 retained Penpot icons
  - Exact-ratio horizontal and stacked Padel Potato lockup components
  - Narrow asset and root design-system exports with inherent accessibility semantics
affects: [02-04, 02-05, phase-03-components, phase-04-components]
actuals:
  tokens: 3824
  tasks: 2
  commits: 4
tech-stack:
  added: []
  patterns: [closed local asset lookup, exact authored ratio sizing, inherent asset semantics]
key-files:
  created:
    - src/design-system/assets/Icon.tsx
    - src/design-system/assets/BrandLockup.tsx
    - src/design-system/assets/BrandLockupStacked.tsx
    - src/design-system/assets/index.ts
  modified:
    - src/design-system/index.ts
    - tests/asset-contracts.test.tsx
key-decisions:
  - "Icon accepts only the generated IconName union, ColorToken, and the sole authored iconSize20 size; runtime cast violations fail with the standard supported-values diagnostic."
  - "Unlabelled icons are excluded from the accessibility tree, while explicitly labelled icons expose the image role and preserve the supplied label unchanged."
  - "Brand lockups render the exact retained local PNGs, derive height arithmetically from 25:6 and 75:14, and expose no content, colour, image, height, or style override."
requirements-completed: [PRIM-01, PRIM-03, PRIM-04, QUAL-01, QUAL-05]
coverage:
  - id: D1
    description: Every retained icon renders from its distinct immutable registry record with exact token paint and authored size.
    requirement: PRIM-01
    verification:
      - kind: unit
        ref: tests/asset-contracts.test.tsx#Icon asset contract
        status: pass
    human_judgment: false
  - id: D2
    description: Both authored lockups preserve exact source ratios and fixed local content.
    requirement: PRIM-03
    verification:
      - kind: unit
        ref: tests/asset-contracts.test.tsx#brand lockup asset contracts
        status: pass
    human_judgment: false
  - id: D3
    description: Asset unions, ordering, invalid-value rejection, public exports, and local-only runtime boundaries remain closed.
    requirement: QUAL-01
    verification:
      - kind: integration
        ref: node scripts/validate-penpot-assets.mjs
        status: pass
      - kind: unit
        ref: tests/asset-contracts.test.tsx
        status: pass
    human_judgment: false
  - id: D4
    description: Decorative icons stay absent from accessibility queries and semantic assets preserve authored or contextual names.
    requirement: QUAL-05
    verification:
      - kind: unit
        ref: tests/asset-contracts.test.tsx#is decorative by default and becomes an image only with an explicit label
        status: pass
    human_judgment: false
duration: 10min
completed: 2026-09-18
status: complete
---

# Phase 02 Plan 03: Strict Local Asset Components Summary

**All 18 revision-292 icons and both authored Padel Potato lockups now render through closed, synchronous, accessible React Native APIs backed only by retained local evidence.**

## Performance

- **Duration:** 10 minutes
- **Completed:** 2026-09-18
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Published one `Icon` component that resolves every exact generated `IconName`, semantic `ColorToken`, and the sole authored `iconSize20` dimension without aliases, fallbacks, or runtime network access.
- Established deterministic icon semantics: decorative by default, image role only when explicitly labelled, and unchanged Unicode label pass-through.
- Published horizontal and stacked lockups from the retained local PNGs with exact 25:6 and 75:14 height derivation, fixed artwork, and inherent `Padel Potato` accessible names.
- Proved unsupported names, colours, dimensions, geometry, styles, lockup widths, content, colourways, and media overrides fail explicitly.
- Exposed only the components and prop types through narrow asset and root design-system barrels.

## Task Commits

1. **Task 1 RED: Add failing Icon asset contracts** - `b848c24`
2. **Task 1 GREEN: Publish closed Icon asset API** - `6523b2e`
3. **Task 2 RED: Add failing brand lockup contracts** - `574395f`
4. **Task 2 GREEN: Publish authored brand lockups** - `80686af`

## Files Created/Modified

- `src/design-system/assets/Icon.tsx` - Closed generated-registry lookup, token paint, authored size, and decorative/labelled accessibility behavior.
- `src/design-system/assets/BrandLockup.tsx` - Exact horizontal local artwork with 25:6 sizing and fixed identity.
- `src/design-system/assets/BrandLockupStacked.tsx` - Exact stacked local artwork with 75:14 sizing and fixed identity.
- `src/design-system/assets/index.ts` - Narrow component and prop-type exports.
- `src/design-system/index.ts` - Root asset re-export boundary.
- `tests/asset-contracts.test.tsx` - Complete rendering, rejection, semantics, ratio, local-only, and barrel coverage.

## Decisions Made

- Kept icon geometry private behind `SvgXml`; consumers can select only an authored name, token colour, and the single authored size.
- Used explicit inherent accessibility props to ensure decorative SVGs are hidden and labelled SVGs are discoverable as images on React Native.
- Rendered lockups as React Native `Image` components using the exact retained normalized PNG files; no visible brand content is reconstructed or made configurable.
- Limited lockup props to finite positive width, optional contextual label, and test ID so independent composition and recolouring cannot enter the supported contract.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Queried hidden decorative SVGs through the correct test boundary**
- **Found during:** Task 1 GREEN
- **Issue:** React Native Testing Library correctly excludes accessibility-hidden nodes from its default test-ID query, and this installed version does not expose the older unsafe component-type query.
- **Fix:** Queried decorative SVG hosts with `includeHiddenElements` and asserted rendered dimensions/paint while retaining registry-level exact geometry assertions.
- **Files modified:** `tests/asset-contracts.test.tsx`
- **Commit:** `6523b2e`

**Total deviations:** 1 auto-fixed test-harness issue.
**Impact on plan:** No public contract changed; the correction verifies the intended hidden semantics instead of bypassing them.

## Issues Encountered

None in runtime implementation. All retained assets were available locally from Plan 02-01; no Penpot or network access was required.

## Verification

- `node scripts/validate-penpot-assets.mjs` - pass; 18 icons and 2 lockups, controlled rejection and deterministic regeneration.
- `npm test -- --runInBand tests/asset-contracts.test.tsx` - 50 tests passed.
- `npm test -- --runInBand` - 7 suites, 244 tests passed.
- `npm run typecheck` - pass.
- `npm run lint` - pass.
- `package.json` and `package-lock.json` unchanged.
- Runtime source scan found no network or build-manifest imports in the authored component modules; generated provenance paths remain immutable registry metadata from Plan 02-01.

## Known Stubs

None.

## User Setup Required

None - all assets are synchronous local modules and no package or service configuration changed.

## Threat Flags

None. The public prop boundary performs closed membership and finite-dimension validation, no remote lookup exists, and package state did not change.

## Next Phase Readiness

- Later component families can consume exact icons and lockups from the root design-system boundary without handling geometry or evidence files.
- Phase 02 story and interaction plans can catalogue these assets with the same closed contracts.

## Self-Check: PASSED

- All six claimed implementation/test artifacts exist.
- Commits `b848c24`, `6523b2e`, `574395f`, and `80686af` exist.
- Full tests, asset validation, strict TypeScript, Expo lint, package-state, and runtime-boundary checks pass.
- Only the pre-existing GSD runtime files remain untracked.

---
*Phase: 02-primitives-assets-and-component-contracts*
*Completed: 2026-09-18*
