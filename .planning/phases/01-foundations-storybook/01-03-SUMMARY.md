---
phase: 01-foundations-storybook
plan: 03
subsystem: design-evidence
tags: [penpot, design-tokens, provenance, visual-reference, validation]
requires:
  - phase: 01-foundations-storybook-01
    provides: Approved toolchain boundary and dependency-free validation pattern
provides:
  - Revision-locked Penpot foundation manifest with source IDs and component inventory
  - Authoritative 1120x760 Foundations reference render with SHA-256 provenance
  - Fail-closed evidence validator with controlled malformed-input checks
affects: [01-04-foundation-tokens, 01-05-scale-tokens, 01-06-foundation-gallery, PNPT-01, PNPT-03, PNPT-04]
actuals:
  tokens: 39488
  tasks: 2
  commits: 4
tech-stack:
  added: []
  patterns: [read-only Penpot MCP extraction, evidence-before-code, deterministic code-point sorting, canonical path containment]
key-files:
  created: [design-spec/penpot-foundations.json, design-spec/deviations.json, design-spec/references/foundations/foundations-page.png, design-spec/references/foundations/capture.json, scripts/validate-penpot-evidence.mjs]
  modified: []
key-decisions:
  - "Penpot revision 292 is the source revision for Phase 1 foundation implementation and its retained reference render."
  - "Foundation records use code-point ordering rather than locale-dependent sorting so browser and Node runtimes validate identically."
  - "The component library inventory is evidence only and remains outside runtime application dependencies."
patterns-established:
  - "All foundation implementation must flow from validated design-spec evidence; runtime modules never query Penpot."
  - "Retained references carry exact file, page, node, revision, dimensions, byte length, and SHA-256 provenance."
requirements-completed: [PNPT-01, PNPT-03, PNPT-04]
coverage:
  - id: D1
    description: "The live authoritative Penpot file and Foundations page are normalized into a deterministic manifest with 15 colors, 9 typography styles, all scale categories, and source-backed component inventory."
    requirement: PNPT-01
    verification:
      - kind: integration
        ref: "node scripts/validate-penpot-evidence.mjs"
        status: pass
    human_judgment: false
  - id: D2
    description: "The revision-292 Foundations board is retained as a 1120x760 PNG with matching capture metadata and SHA-256."
    requirement: PNPT-03
    verification:
      - kind: integration
        ref: "scripts/validate-penpot-evidence.mjs#validateCapture"
        status: pass
    human_judgment: false
  - id: D3
    description: "The deviations ledger enforces source, platform, reason, and disposition while malformed controlled copies are rejected."
    requirement: PNPT-04
    verification:
      - kind: unit
        ref: "scripts/validate-penpot-evidence.mjs#runControlledRejections"
        status: pass
    human_judgment: false
duration: 15min
completed: 2026-09-18
status: complete
---

# Phase 01 Plan 03: Penpot Foundation Evidence Summary

**Revision-locked Penpot foundations manifest and page render with source provenance, deterministic ordering, and fail-closed validation**

## Performance

- **Duration:** 15 min active execution, excluding the Penpot wake checkpoint
- **Started:** 2026-09-18T07:01:00Z
- **Completed:** 2026-09-18T07:16:10Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Verified the live Penpot file `c514c1fb-1cda-8125-8008-a606253a77a3` and `01 Foundations` page `482a7222-5a3b-8086-8008-a6072bd7e924` before recording any design values.
- Captured revision 292 with exactly 15 colors, 9 typography styles, 8 spacing values, 6 radii, 4 dimensions, 2 border widths, 1 opacity, and 51 reusable component-family inventory records.
- Retained the authoritative 1120x760 Foundations render with file/page/node IDs, timestamp, dimensions, byte length, and SHA-256.
- Added a dependency-free validator that rejects incorrect counts, empty categories, duplicate names/IDs, unstable ordering, unsafe paths, hash mismatches, and incomplete deviation entries.

## Task Commits

1. **Task 1: Wake Penpot and capture authoritative foundation evidence** — `a285d28` (feat)
2. **Task 2 RED: Add failing evidence validator** — `fd5b26d` (test)
3. **Task 2 GREEN: Enforce evidence invariants and controlled rejections** — `b169ec8` (feat)

## Files Created/Modified

- `design-spec/penpot-foundations.json` — Normalized foundation categories plus reusable component, variant-axis, state, and source inventory.
- `design-spec/deviations.json` — Empty valid deviation ledger with the required entry-field contract.
- `design-spec/references/foundations/foundations-page.png` — Authoritative Penpot Foundations board export.
- `design-spec/references/foundations/capture.json` — Revision, dimensions, byte length, path, and content-hash provenance.
- `scripts/validate-penpot-evidence.mjs` — Dependency-free schema, ordering, provenance, path, PNG, hash, and controlled-rejection gate.

## Decisions Made

- Revision 292 is the Phase 1 source revision because both the manifest read and retained board export were captured from that verified live file state.
- Code-point ordering is the serialized contract. Locale-aware sorting differed between the Penpot browser runtime and Node, so it cannot provide cross-runtime determinism.
- Component inventory records retain family IDs, main-node IDs, variant IDs, axes, and states, but remain design evidence rather than executable component code.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Replaced locale-dependent normalization with code-point ordering**
- **Found during:** Task 2 validator implementation
- **Issue:** Browser and Node ICU collation disagreed on component keys containing nested library paths, so an apparently sorted live extraction was not deterministic across runtimes.
- **Fix:** Defined and enforced a code-point comparator for category names, component path/name keys, variant source IDs, and axis values.
- **Files modified:** `scripts/validate-penpot-evidence.mjs`
- **Verification:** The valid manifest and all controlled rejection cases pass consistently under Node.
- **Committed in:** `b169ec8`

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** The fix strengthens the required deterministic evidence contract without changing any Penpot-derived value.

## Issues Encountered

- The Penpot plugin tab was initially suspended. Execution paused at a blocking-human checkpoint and resumed only after the user woke the tab; no values were inferred while disconnected.
- Exporting the special `page` identifier timed out on Penpot's zero-sized root frame. Exporting the page's sole `Foundations` board by verified source ID produced the required complete 1120x760 render at the same revision.

## Authentication Gates

- **Task 1:** Human wake action was required for the suspended Penpot plugin tab. The resumed read verified the exact file/page IDs before extraction.

## Known Stubs

None.

## User Setup Required

None — the temporary Penpot wake action is complete and no runtime service or credential is required.

## Next Phase Readiness

- Plans 01-04 and 01-05 can implement typed foundation tokens exclusively from the validated manifest.
- Plan 01-06 can compare its Storybook gallery against the retained revision-292 render.
- The evidence gate is green; there are no unresolved source-data or reference-integrity blockers.

## Self-Check: PASSED

- All five plan output files exist.
- Task commits `a285d28`, `fd5b26d`, and `b169ec8` exist in repository history.
- The evidence validator, controlled rejection cases, TypeScript check, and Expo lint all pass.

---
*Phase: 01-foundations-storybook*
*Completed: 2026-09-18*
