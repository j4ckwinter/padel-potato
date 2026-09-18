---
phase: quick-local-penpot-source
plan: "01"
subsystem: design-tooling
tags: [penpot, git-lfs, zip, provenance, validation]
requires:
  - phase: 02-primitives-assets-and-component-contracts
    provides: Historical Penpot MCP evidence and native Storybook verification contracts
provides:
  - Canonical Git-LFS-tracked Penpot revision 296 snapshot
  - Dependency-free bounded ZIP inspection and exact-record query tooling
  - Deterministic revision, checksum, page, and inventory evidence
  - Offline-first design-source workflow with optional MCP freshness checking
affects: [phase-03, components, storybook, design-verification]
actuals:
  tokens: 11983
  tasks: 2
  commits: 5
tech-stack:
  added: [Git LFS design snapshot]
  patterns: [bounded in-memory archive parsing, deterministic source manifest, exact local design-record queries]
key-files:
  created:
    - design-source/padel-potato UI Concepts.penpot
    - design-source/README.md
    - design-spec/penpot-source.json
    - scripts/penpot-source.mjs
    - scripts/inspect-penpot-source.mjs
  modified:
    - .gitattributes
    - package.json
    - .planning/PROJECT.md
    - .planning/research/STACK.md
    - AGENTS.md
key-decisions:
  - "Use the committed local Penpot export as the routine design authority; reserve live MCP access for optional freshness checks."
  - "Treat source inspection and native rendering acceptance as separate proofs: local archive validation cannot replace iOS and Android Storybook comparison."
patterns-established:
  - "Design source refresh: replace the exact canonical filename, inspect it, regenerate the deterministic manifest, validate, and commit snapshot plus manifest together."
  - "Archive safety: validate paths, methods, headers, offsets, sizes, entry counts, CRCs, and required Penpot identities before consuming records."
requirements-completed: []
coverage:
  - id: D1
    description: Canonical revision 296 Penpot snapshot is tracked through Git LFS with deterministic identity evidence.
    verification:
      - kind: integration
        ref: npm run validate:design-source
        status: pass
      - kind: other
        ref: git check-attr filter -- "design-source/padel-potato UI Concepts.penpot"
        status: pass
    human_judgment: false
  - id: D2
    description: Local tooling safely inspects pages and exact component or shape records without extraction or network access.
    verification:
      - kind: integration
        ref: npm run design:inspect -- --component Button
        status: pass
      - kind: integration
        ref: node scripts/inspect-penpot-source.mjs --check --self-test
        status: pass
    human_judgment: false
  - id: D3
    description: Active workflow guidance makes the local snapshot canonical while retaining native Storybook visual acceptance.
    verification:
      - kind: other
        ref: rg -n "Penpot MCP|MCP" .planning/PROJECT.md .planning/research/STACK.md AGENTS.md design-source/README.md
        status: pass
      - kind: integration
        ref: npm run validate:phase2-verification
        status: pass
    human_judgment: false
duration: 10min
completed: 2026-09-18
status: complete
---

# Quick Task 260918-noz: Local Penpot Source Workflow Summary

**Revision 296 is now a reproducible offline design authority, backed by a bounded ZIP reader, deterministic SHA-256 manifest, exact-record queries, and Git LFS storage.**

## Performance

- **Duration:** 10 min
- **Started:** 2026-09-18T17:06:00+01:00
- **Completed:** 2026-09-18T17:16:00+01:00
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments

- Preserved the 9,367,660-byte export exactly and tracked it through Git LFS with SHA-256 `c0559548f953bc175be160b30f4769ede1167d05ef1677f6f1422ecdac2a1562`.
- Added dependency-free, bounded in-memory Penpot ZIP parsing, deterministic manifest generation, exact UUID/name lookup, and controlled malformed-archive rejection tests.
- Added repository commands and guidance for offline inspection, explicit snapshot refresh, validation, and optional live MCP freshness checking.
- Preserved all historical Phase 1/2 evidence and retained native Storybook comparison as the rendering-fidelity authority.

## Task Commits

1. **Task 1 RED: Define local Penpot source contract** - `c720552` (test)
2. **Task 1 GREEN: Adopt canonical local Penpot snapshot** - `7348695` (feat)
3. **Task 1: Allow deliberate snapshot refreshes** - `9b32684` (fix)
4. **Task 1: Retain component page provenance** - `f58524a` (fix)
5. **Task 2: Use local design source workflow** - `42bf053` (chore)

The orchestrator owns the final planning-document commit.

## Files Created/Modified

- `.gitattributes` - Routes Penpot snapshots through Git LFS.
- `design-source/padel-potato UI Concepts.penpot` - Canonical Penpot revision 296 snapshot.
- `design-source/README.md` - Inspection, validation, and replacement workflow.
- `design-spec/penpot-source.json` - Deterministic source identity and inventory.
- `scripts/penpot-source.mjs` - Safe bounded ZIP reader and source index.
- `scripts/inspect-penpot-source.mjs` - Inspect, query, refresh, check, and self-test CLI.
- `package.json` - `design:inspect`, `design:refresh`, and `validate:design-source` commands.
- `.planning/PROJECT.md` - Active design-authority requirement, context, constraint, and decision.
- `.planning/research/STACK.md` - Local snapshot infrastructure and native visual-acceptance guidance.
- `AGENTS.md` - Immediate local-source instructions for future agents.

## Decisions Made

- The checked-in export, not a live connection, is the routine authority because it makes design work reproducible from repository state.
- Snapshot replacement is explicit: checksum/revision drift fails validation until `design:refresh` regenerates the manifest.
- Live MCP remains useful only to determine whether a newer export should be taken.
- Native iOS/Android Storybook evidence remains necessary because archive correctness does not prove runtime rendering fidelity.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Kept deliberate future snapshot refreshes possible**
- **Found during:** Task 1
- **Issue:** Hard-pinning revision 296 inside the generator would reject every legitimate future export before `design:refresh` could accept it.
- **Fix:** Validate a positive archive-derived revision and use byte-for-byte committed-manifest comparison to detect revision drift.
- **Files modified:** `scripts/penpot-source.mjs`
- **Verification:** `npm run validate:design-source`
- **Committed in:** `9b32684`

**2. [Rule 1 - Bug] Retained owning-page provenance for component queries**
- **Found during:** Task 2 verification
- **Issue:** Component records reported a null page even though Penpot supplies `mainInstancePage`.
- **Fix:** Resolve component records to the indexed main-instance page.
- **Files modified:** `scripts/penpot-source.mjs`
- **Verification:** `npm run design:inspect -- --component Button`
- **Committed in:** `f58524a`

**Total deviations:** 2 auto-fixed (1 missing critical functionality, 1 bug)
**Impact on plan:** Both fixes preserve the intended refresh workflow and stable source provenance; no scope expansion.

## Issues Encountered

- The controlled duplicate-path fixture initially selected a uniquely sized root path. It now deterministically locates any equal-length central-directory pair before mutation.

## Known Stubs

None. Nullable `id`, `name`, and `pageId` fields in the generic archive-record index represent absent Penpot record metadata and do not flow to product UI.

## Verification

- `npm run validate:design-source` — passed.
- `npm run design:inspect -- --component Button` — passed with exact variants and Components-page provenance.
- `npm run typecheck` — passed.
- `npm run lint` — passed.
- `npm test -- --runInBand` — 11 suites and 297 tests passed.
- `npm run validate:phase2-verification` — passed without modifying historical evidence.
- Repeated `design:refresh` produced byte-identical `design-spec/penpot-source.json`.
- Working-tree export SHA-256 remained unchanged after Git LFS staging and commit.

## User Setup Required

Git LFS must be available when cloning the repository so the canonical `.penpot` object is materialized. No network service or Penpot MCP connection is required for routine use after checkout.

## Next Phase Readiness

- Phase 3 planning and component implementation can query the canonical local source directly.
- Native platform visual and assistive-technology evidence remains deferred to the established Phase 5 acceptance route.

## Self-Check: PASSED

- All five implementation commits exist.
- Every planned artifact exists, the source checksum is preserved, and the required validation suite passes.
- No historical Phase 1/2 Penpot evidence file changed.

---
*Quick task: 260918-noz*
*Completed: 2026-09-18*
