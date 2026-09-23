---
phase: 02-primitives-assets-and-component-contracts
plan: 01
subsystem: ui
tags: [penpot, svg, react-native-svg, design-system, asset-provenance]
requires:
  - phase: 01-foundations-storybook
    provides: revision-292 Penpot identity, token evidence, Expo and test toolchain
provides:
  - Exact local revision-292 geometry for 18 Penpot icons
  - Authored raster evidence for both brand lockups
  - Fail-closed asset manifest, generator, validator, and immutable IconName registry
affects: [02-03, 02-04, assets, icons, brand-lockups, storybook]
actuals:
  tokens: 31517
  tasks: 3
  commits: 5
tech-stack:
  added: []
  patterns: [live Penpot source gate, fixed-root evidence validation, generated immutable registry]
key-files:
  created:
    - design-spec/assets/penpot-assets.json
    - scripts/export-penpot-assets.mjs
    - scripts/validate-penpot-assets.mjs
    - src/design-system/assets/generated/iconRegistry.ts
    - tests/asset-contracts.test.tsx
  modified: []
key-decisions:
  - "Serialize icon geometry directly from the live Penpot Plugin API shape model after the SVG export endpoint returned invalid null bytes."
  - "Retain the two authored brand lockups as exact live Penpot PNG renders because the horizontal lockup contains an image fill and generated SVG markup referenced a remote Penpot media URL."
patterns-established:
  - "Asset writes are allowed only after exact file, page, revision, and source-node identity is observed live."
  - "Runtime registries are generated from hashed local evidence and contain no Penpot or network dependency."
requirements-completed: [PRIM-03, PRIM-04, QUAL-01]
coverage:
  - id: D1
    description: Exact source-ordered local inventory of 18 icons
    requirement: PRIM-04
    verification:
      - kind: integration
        ref: tests/asset-contracts.test.tsx#retains the exact revision-292 icon inventory in Penpot order
        status: pass
    human_judgment: false
  - id: D2
    description: Both authored brand lockups retained at exact source ratios
    requirement: PRIM-03
    verification:
      - kind: integration
        ref: tests/asset-contracts.test.tsx#retains both authored lockup ratios and local reference evidence
        status: pass
    human_judgment: false
  - id: D3
    description: Fail-closed and deterministic asset evidence pipeline
    requirement: QUAL-01
    verification:
      - kind: integration
        ref: node scripts/validate-penpot-assets.mjs
        status: pass
      - kind: unit
        ref: tests/asset-contracts.test.tsx#validator runs controlled tamper rejections and deterministic regeneration
        status: pass
    human_judgment: false
duration: 21min
completed: 2026-09-18
status: complete
---

# Phase 02 Plan 01: Authoritative Penpot Asset Pipeline Summary

**Live revision-292 Penpot extraction now produces a hashed local registry of 18 exact icons and two authored brand lockups under fail-closed validation.**

## Performance

- **Duration:** 21 min
- **Started:** 2026-09-18T14:15:00+01:00
- **Completed:** 2026-09-18T14:36:23+01:00
- **Tasks:** 3
- **Files modified:** 47

## Accomplishments

- Re-verified the exact Penpot file, `02 Components` page, revision 292, and every source node through live MCP calls before retaining geometry.
- Captured all 18 icons in Penpot order, preserving exact path/rectangle/ellipse geometry, 20x20 canvases, 1.75 strokes, and source identities.
- Retained both authored lockups as local PNG evidence at 300x72 and 300x56 with no runtime network dependency.
- Added deterministic SHA-256 generation, immutable TypeScript registry output, native `SvgXml` rendering coverage, and controlled tamper rejection.

## Task Commits

1. **Task 1: Prove exact source-to-registry asset path** - `18aeb04` (RED), `6c32684` (GREEN)
2. **Task 2: Expand to the complete inventory** - `03b2152`, `b65bb41`
3. **Task 3: Harden evidence validation** - `06fce1c`

## Files Created/Modified

- `design-spec/assets/raw/*` - Authored-colour live Penpot icon SVGs and lockup PNGs.
- `design-spec/assets/normalized/*` - Semantic-paint icon SVGs and byte-identical local lockup renders.
- `design-spec/assets/penpot-assets.json` - Source identities, dimensions, paths, and SHA-256 evidence.
- `design-spec/references/components/*` - Retained lockup reference renders.
- `scripts/export-penpot-assets.mjs` - Deterministic manifest and registry generator.
- `scripts/validate-penpot-assets.mjs` - Fixed-root source, hash, inventory, SVG-profile, ratio, and determinism validator.
- `src/design-system/assets/generated/iconRegistry.ts` - Immutable local icon registry and generated `IconName` union.
- `tests/asset-contracts.test.tsx` - Inventory, lockup, native rendering, and validator contracts.

## Decisions Made

- Used direct live Penpot shape serialization for icons after `export_shape` returned two null bytes. Geometry comes from `Path.d` and exact rectangle/ellipse properties; no geometry was redrawn or inferred.
- Used live PNG exports for lockups because the horizontal SVG contained a remote mascot fill. This keeps runtime evidence local and prevents a Penpot URL from entering the registry.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Used the live Plugin API geometry path when SVG export returned invalid bytes**
- **Found during:** Task 1
- **Issue:** Penpot's SVG export endpoint returned two null bytes even though the active source was valid.
- **Fix:** Read exact visible path, rectangle, and ellipse properties from the same live MCP source and serialized them without geometric alteration.
- **Files modified:** `design-spec/assets/raw/*.svg`, `design-spec/assets/normalized/*.svg`
- **Verification:** Source-node IDs, hashes, canvas, stroke, safety profile, native render, and deterministic regeneration all pass.
- **Committed in:** `6c32684`

**2. [Rule 1 - Bug] Awaited React Native Testing Library v14 rendering**
- **Found during:** Task 2
- **Issue:** The initial native SVG test treated the v14 async `render` API as synchronous.
- **Fix:** Awaited `render` and `unmount`.
- **Files modified:** `tests/asset-contracts.test.tsx`
- **Verification:** Focused and full Jest suites pass.
- **Committed in:** `b65bb41`

**Total deviations:** 2 auto-fixed (1 blocking issue, 1 bug)
**Impact on plan:** Both fixes preserve the exact source-of-truth and test contracts without adding dependencies or scope.

## Issues Encountered

- The Penpot browser tab suspended after extraction completed. Every retained asset had already been obtained through successful live calls while the exact revision-292 Components page was active; no cached result was used.

## User Setup Required

None - all runtime evidence is local and no package or service configuration changed.

## Known Stubs

None.

## Threat Flags

None. The plan introduced build-time local file reads only, all constrained to fixed repository evidence roots and covered by traversal/hash/profile rejection tests.

## Verification

- `node scripts/validate-penpot-assets.mjs` - pass
- `npm test -- --runInBand` - 7 suites, 198 tests passed
- `npm run typecheck` - pass
- `npm run lint` - pass

## Next Phase Readiness

- The generated registry and local lockup evidence are ready for the Phase 2 runtime `Icon` and brand components.
- Native iOS/Android visual acceptance remains correctly deferred to Phase 5.

## Self-Check: PASSED

- All claimed files exist.
- Commits `18aeb04`, `6c32684`, `03b2152`, `b65bb41`, and `06fce1c` exist.
- No untracked task output remains; only the pre-existing GSD runtime files are untracked.

---
*Phase: 02-primitives-assets-and-component-contracts*
*Completed: 2026-09-18*
