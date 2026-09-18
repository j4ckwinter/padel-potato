---
phase: 03-actions-forms-and-navigation-components
plan: 02
subsystem: ui
tags: [penpot, assets, svg, webp, react-native]

requires:
  - phase: 03-01
    provides: Revision-296 Phase 3 family registry and bounded Penpot archive reader
provides:
  - Three exact family-owned Phase 3 SVG assets for heart, Google, and Apple artwork
  - Five exact local mascot WebP files with fixed source and media identity
  - Deterministic offline extractor validating six App Header references over five media outputs
affects: [03-03, actions, authentication, navigation, app-header]

actuals:
  tokens: 116705
  tasks: 3
  commits: 3

tech-stack:
  added: []
  patterns:
    - Bounded Penpot archive traversal with fixed source, descendant, media, and destination IDs
    - Exact retained SVG path serialization and byte-for-byte local WebP extraction

key-files:
  created:
    - scripts/extract-phase-3-artwork.mjs
    - design-spec/assets/phase-3/heart.svg
    - design-spec/assets/phase-3/google.svg
    - design-spec/assets/phase-3/apple.svg
    - design-spec/assets/phase-3/mascot-wave.webp
    - design-spec/assets/phase-3/mascot-search.webp
    - design-spec/assets/phase-3/mascot-create.webp
    - design-spec/assets/phase-3/mascot-players.webp
    - design-spec/assets/phase-3/mascot-profile.webp
  modified: []

key-decisions:
  - "Keep source path coordinates byte-exact and use each authored 20-point group's global bounds as its SVG viewBox."
  - "Model the six App Header references from the product-screen instances, with both Games screens explicitly resolving to the one Search mascot output."
  - "Expose only fixed extraction constants and enumerated outputs; do not extend IconName, tokens, themes, packages, or runtime APIs."

patterns-established:
  - "Artwork extraction boundary: revision-296 archive -> fixed IDs and profiles -> exact enumerated local bytes."
  - "Reuse relationships are explicit source records, not inferred from filenames or duplicated output files."

requirements-completed: [ACTN-03, AUTH-01, NAVG-03]

coverage:
  - id: D1
    description: Exact source-traced heart and Google/Apple vector evidence retained at fixed local paths
    requirement: ACTN-03
    verification:
      - kind: integration
        ref: node scripts/extract-phase-3-artwork.mjs --check-vectors
        status: pass
    human_judgment: false
  - id: D2
    description: Exact local provider artwork extraction remains fixed, offline, and outside shared icon or theme registries
    requirement: AUTH-01
    verification:
      - kind: integration
        ref: node scripts/extract-phase-3-artwork.mjs --check
        status: pass
      - kind: other
        ref: npm run lint && npm run typecheck
        status: pass
    human_judgment: false
  - id: D3
    description: Six source App Header instances deterministically resolve to five retained mascot files with explicit Games-to-Search reuse
    requirement: NAVG-03
    verification:
      - kind: integration
        ref: node scripts/extract-phase-3-artwork.mjs --check-mascots-a && node scripts/extract-phase-3-artwork.mjs --check
        status: pass
    human_judgment: false

duration: 8min
completed: 2026-09-18
status: complete
---

# Phase 03 Plan 02: Exact Phase 3 Artwork Extraction Summary

**Revision-296 heart, provider, and mascot artwork retained as eight deterministic local files with fixed source IDs, byte hashes, and explicit six-to-five App Header reuse.**

## Performance

- **Duration:** 8 min
- **Started:** 2026-09-18T17:56:00Z
- **Completed:** 2026-09-18T18:04:09Z
- **Tasks:** 3
- **Files modified:** 9

## Accomplishments

- Retained the exact authored 20-point heart plus Google four-colour and Apple two-path geometry without rounding, redrawing, or remote references.
- Copied five unique WebP objects directly from the bounded Penpot archive and pinned every component, descendant, media-record, object, and output identity.
- Validated the six product-screen App Header references, including the two Games instances that intentionally reuse one Search mascot file.

## Task Commits

Each task was committed atomically:

1. **Task 1: Extract exact heart and provider vectors** - `74e2c15` (feat)
2. **Task 2: Extract wave, search, and create mascot media** - `11d98d1` (feat)
3. **Task 3: Extract players and profile media and close full extraction** - `b450ac6` (feat)

## Files Created/Modified

- `scripts/extract-phase-3-artwork.mjs` - Fixed-ID, fixed-destination vector/media extractor with subset and aggregate byte checks.
- `design-spec/assets/phase-3/heart.svg` - Exact retained default heart path and stroke.
- `design-spec/assets/phase-3/google.svg` - Exact four authored provider paths and paints.
- `design-spec/assets/phase-3/apple.svg` - Exact two authored provider paths and ink paint.
- `design-spec/assets/phase-3/mascot-wave.webp` - Exact Home/Wave media object.
- `design-spec/assets/phase-3/mascot-search.webp` - Exact Search media object reused by both Games source instances.
- `design-spec/assets/phase-3/mascot-create.webp` - Exact Create media object.
- `design-spec/assets/phase-3/mascot-players.webp` - Exact Players media object.
- `design-spec/assets/phase-3/mascot-profile.webp` - Exact Profile media object.

## Decisions Made

- Preserved every source path string unchanged and represented its authored coordinate space through the SVG viewBox, avoiding any geometry transform or rounding.
- Grounded the six-to-five relationship in the six actual Product Screens App Header instances rather than inventing aliases: Games/Discover and Games/My games both reference the Search descendant and media record.
- Kept extraction build-time-only and dependency-free; runtime generation and manifest ownership remain in Plan 03-03.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Verification Results

- `npm run validate:design-source` - passed, including controlled malformed-archive rejections.
- `node scripts/extract-phase-3-artwork.mjs --check-vectors` - passed for the exact three-file SVG inventory.
- `node scripts/extract-phase-3-artwork.mjs --check-mascots-a` - passed for Wave, Search, and Create source mappings and bytes.
- `node scripts/extract-phase-3-artwork.mjs --check` - passed for all eight files, exact inventory, five unique WebPs, and six App Header references.
- `npm run typecheck` - passed.
- `npm run lint` - passed.

## Next Phase Readiness

- Plan 03-03 can generate the closed runtime module and exact artwork manifest directly from exported extractor constants and retained bytes.
- No runtime Penpot dependency, remote URL, generalized artwork selector, token entry, IconName, or package dependency was introduced.

## Known Stubs

None.

## Self-Check: PASSED

All nine implementation artifacts and all three task commits were verified on disk and in git history.

---
*Phase: 03-actions-forms-and-navigation-components*
*Completed: 2026-09-18*
