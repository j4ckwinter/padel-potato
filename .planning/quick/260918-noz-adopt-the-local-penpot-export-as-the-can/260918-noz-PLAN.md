---
quick_id: 260918-noz
phase: quick-local-penpot-source
plan: "01"
type: execute
wave: 1
depends_on: []
status: planned
description: Adopt the local Penpot export as the canonical design source and replace routine MCP-dependent workflow checks with deterministic local validation
files_modified:
  - .gitattributes
  - design-source/padel-potato UI Concepts.penpot
  - design-source/README.md
  - design-spec/penpot-source.json
  - scripts/penpot-source.mjs
  - scripts/inspect-penpot-source.mjs
  - package.json
  - .planning/PROJECT.md
  - .planning/research/STACK.md
  - AGENTS.md
autonomous: true
estimate:
  tokens: 24000
  raw_tokens: 24000
  tasks: 2
  confidence: low
must_haves:
  truths:
    - "Future design-system work reads the committed local .penpot snapshot as its default authority without requiring a live Penpot connection."
    - "A single local command detects a missing, malformed, unsafe, or silently replaced design snapshot and reports its identity, revision, and checksum."
    - "Developers can deterministically inspect the foundations, components, product-screen pages, and individual source records from the local archive."
    - "Live Penpot MCP access is documented only as an optional freshness comparison, while completed phase provenance remains unchanged."
  artifacts:
    - path: "design-source/padel-potato UI Concepts.penpot"
      provides: "Canonical Penpot design snapshot at revision 296"
    - path: "scripts/penpot-source.mjs"
      provides: "Dependency-free, bounded Penpot ZIP reader and normalized source-index contract"
    - path: "scripts/inspect-penpot-source.mjs"
      provides: "Inspection, refresh, validation, and controlled-rejection CLI"
    - path: "design-spec/penpot-source.json"
      provides: "Deterministic source identity, revision, page inventory, and SHA-256 evidence"
    - path: "design-source/README.md"
      provides: "Snapshot replacement and optional MCP freshness workflow"
  key_links:
    - from: "scripts/inspect-penpot-source.mjs"
      to: "design-source/padel-potato UI Concepts.penpot"
      via: "fixed repository-relative canonical source path"
      pattern: "design-source.*padel-potato UI Concepts\\.penpot"
    - from: "scripts/inspect-penpot-source.mjs"
      to: "design-spec/penpot-source.json"
      via: "deterministic refresh and byte-for-byte check modes"
      pattern: "penpot-source\\.json"
    - from: "package.json"
      to: "scripts/inspect-penpot-source.mjs"
      via: "design-source inspection, refresh, and validation scripts"
      pattern: "inspect-penpot-source\\.mjs"
---

<objective>
Make `design-source/padel-potato UI Concepts.penpot` the canonical, versioned design snapshot used by future component phases, with deterministic local inspection and validation replacing routine Penpot MCP reads.

Purpose: Component implementation must remain grounded in the exact Penpot design while becoming reproducible offline and reviewable from repository state alone. Live MCP access remains useful only to decide whether a newer export should replace the snapshot.

Output: Git-LFS-tracked Penpot snapshot, safe local archive tooling, pinned revision/checksum evidence, package commands, and updated active project guidance.
</objective>

<execution_context>
@C:/Users/jackw/.codex/gsd-core/workflows/execute-plan.md
@C:/Users/jackw/.codex/gsd-core/templates/summary.md
</execution_context>

<context>
@AGENTS.md
@.planning/PROJECT.md
@.planning/STATE.md
@package.json
@scripts/validate-penpot-evidence.mjs
@scripts/export-penpot-assets.mjs
@design-spec/assets/penpot-live-observation.json

Live planning observation (2026-09-18):
- `design-source/padel-potato UI Concepts.penpot` exists as an untracked 9,367,660-byte structured Penpot ZIP export.
- SHA-256 is `c0559548f953bc175be160b30f4769ede1167d05ef1677f6f1422ecdac2a1562`.
- Root file identity is `c514c1fb-1cda-8125-8008-a606253a77a3`, revision `296`, modified at `2026-09-18T15:20:34.851374Z`, with `hasMediaTrimmed: false`.
- Required pages are `01 Foundations` (`482a7222-5a3b-8086-8008-a6072bd7e924`), `02 Components` (`482a7222-5a3b-8086-8008-a6073072bbb1`), and `03 Product Screens` (`482a7222-5a3b-8086-8008-a608ebaf11cd`); the archive also contains `00 Mascots`.
- Git LFS 2.13.2 is available. The unrelated untracked `.gsd/` directory is outside this plan and must remain untouched.
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: Prove the canonical snapshot through a safe local inspect-and-validate path</name>
  <files>.gitattributes, design-source/padel-potato UI Concepts.penpot, scripts/penpot-source.mjs, scripts/inspect-penpot-source.mjs, design-spec/penpot-source.json</files>
  <behavior>
    - The canonical archive produces file ID `c514c1fb-1cda-8125-8008-a606253a77a3`, revision 296, byte length 9367660, SHA-256 `c0559548f953bc175be160b30f4769ede1167d05ef1677f6f1422ecdac2a1562`, and the required page IDs/names.
    - Re-running refresh on unchanged bytes produces byte-identical `design-spec/penpot-source.json`; volatile generation timestamps and machine-specific absolute paths are excluded.
    - Check mode rejects checksum drift, revision drift, missing required pages, duplicate ZIP paths, path traversal entries, unsupported compression, truncated headers, out-of-bounds offsets, and configured compressed/uncompressed size or entry-count limits.
    - Inspection can list pages and locate a page/shape/component by exact UUID or exact design name, returning stable JSON from archive records without extracting the archive to disk.
  </behavior>
  <action>Preserve the existing export bytes and add `design-source/*.penpot filter=lfs diff=lfs merge=lfs -text` to `.gitattributes` so the canonical binary is versioned through the already-installed Git LFS. Implement `scripts/penpot-source.mjs` using Node built-ins (`fs`, `crypto`, `zlib`) to parse the ZIP central directory in memory, validate every archive path and byte range before reading, bound entry count and compressed/uncompressed sizes to prevent archive abuse, support only the compression methods actually present, and expose pure functions for source identity/index generation and exact record lookup. Implement `scripts/inspect-penpot-source.mjs` with human-readable inspect/list/query modes plus `--write`, `--check`, and `--self-test`: `--write` deterministically regenerates `design-spec/penpot-source.json`; `--check` compares the current archive-derived manifest byte-for-byte with the committed evidence; `--self-test` uses in-memory controlled corruptions to prove the rejection behavior listed above. The evidence manifest must retain the archive path, file metadata, revision, modified timestamp, byte length, whole-file SHA-256, Penpot format/features, media-trimmed status, stable page inventory, and deterministic counts useful to later foundation/component/screen work. Do not add an unzip dependency, shell out to `tar`, write temporary extraction trees, or edit the existing Phase 1/2 MCP manifests and scripts: those are historical evidence for the source used at the time.</action>
  <verify>
    <automated>node scripts/inspect-penpot-source.mjs --write &amp;&amp; node scripts/inspect-penpot-source.mjs --check --self-test &amp;&amp; git check-attr filter -- "design-source/padel-potato UI Concepts.penpot"</automated>
  </verify>
  <done>The current export is tracked by the declared LFS rule; local inspection reports revision 296 and the pinned SHA-256; the committed manifest is reproducible; safe-reader controlled rejections pass; and no completed-phase evidence file has been rewritten.</done>
</task>

<task type="auto">
  <name>Task 2: Make the local snapshot the active workflow authority</name>
  <files>package.json, design-source/README.md, .planning/PROJECT.md, .planning/research/STACK.md, AGENTS.md</files>
  <action>Add package scripts with clear roles: `design:inspect` for local human/agent queries, `design:refresh` for deliberately accepting replacement export bytes into the committed manifest, and `validate:design-source` for non-mutating checksum/structure/self-test validation. Write `design-source/README.md` with the canonical filename, refresh/validate commands, replacement procedure, revision/checksum semantics, and the rule that MCP may be used to check whether live Penpot is newer but is not required for routine extraction, planning, implementation, or verification. Update the active requirement, context, decision, constraint, infrastructure, and visual-verification wording in `.planning/PROJECT.md` and `.planning/research/STACK.md`; mirror their managed sections in `AGENTS.md` so future agents receive the new policy immediately. Preserve native Storybook visual comparison as the acceptance authority and preserve all completed Phase 1/2 files and their truthful MCP provenance. Do not claim that the local source snapshot itself proves native runtime fidelity.</action>
  <verify>
    <automated>npm run validate:design-source &amp;&amp; npm run typecheck &amp;&amp; npm run lint &amp;&amp; npm test -- --runInBand &amp;&amp; npm run validate:phase2-verification</automated>
  </verify>
  <done>Package commands work from the repository root; active project and agent guidance names the local export as canonical and MCP as optional freshness checking; native Storybook comparison remains required; and the existing Phase 2 validation still passes unchanged.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Penpot export file -> local parser | A replaceable binary archive crosses into repository tooling and may be malformed or malicious. |
| Canonical snapshot -> generated evidence | Snapshot identity and design metadata must not drift without an explicit evidence refresh. |
| Local design data -> future implementation | Agents must distinguish source inspection from native runtime visual acceptance. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-Q-NOZ-01 | Tampering | `.penpot` snapshot and evidence manifest | high | mitigate | Pin SHA-256, byte length, file ID, revision, required page identities, and byte-for-byte deterministic manifest validation. |
| T-Q-NOZ-02 | Denial of Service | ZIP parser | high | mitigate | Bound archive size, entry count, per-entry sizes, aggregate inflation, compression methods, offsets, and headers before decompression. |
| T-Q-NOZ-03 | Elevation of Privilege | Archive entry paths | high | mitigate | Never extract to disk; reject absolute, traversal, duplicate, NUL-bearing, and separator-confused entry paths. |
| T-Q-NOZ-04 | Repudiation | Snapshot replacement | medium | mitigate | Commit the LFS pointer and deterministic manifest together; require explicit `design:refresh` after replacement and retain revision/checksum evidence. |
| T-Q-NOZ-05 | Information Disclosure | Local inspection output | low | accept | The export is intentional project design material and inspection is local; do not emit unrelated environment data or absolute machine paths. |
</threat_model>

<verification>
1. `npm run validate:design-source` succeeds without Penpot MCP, network access, temporary extraction, or modifying tracked files.
2. `npm run design:inspect` identifies the canonical revision/checksum and supports exact local lookup of component source records.
3. A second `npm run design:refresh` leaves `design-spec/penpot-source.json` unchanged.
4. `git check-attr filter -- "design-source/padel-potato UI Concepts.penpot"` reports `lfs`, and the committed object is represented by Git LFS.
5. Existing type, lint, Jest, and Phase 2 verification commands pass, demonstrating that historical evidence remains intact.
6. `rg -n "Penpot MCP|MCP" .planning/PROJECT.md .planning/research/STACK.md AGENTS.md design-source/README.md` shows MCP only as optional freshness checking or truthful historical context, never as a routine prerequisite.
</verification>

<success_criteria>
- The local Penpot export is committed as the canonical snapshot under Git LFS without changing its working-tree bytes.
- Revision 296 and SHA-256 `c0559548f953bc175be160b30f4769ede1167d05ef1677f6f1422ecdac2a1562` are reproducibly derived and checked locally.
- Future component phases can inspect exact Penpot records from the archive using repository commands.
- Routine design-source validation is deterministic, offline, safe against malformed archives, and wired into package scripts.
- Active guidance consistently demotes live MCP to an optional freshness check while retaining native Storybook visual verification and completed-phase provenance.
</success_criteria>

## Source Coverage Audit

| Source | ID | Feature/Requirement | Task | Status | Notes |
|--------|----|---------------------|------|--------|-------|
| GOAL | quick description | Adopt local export as canonical and replace routine MCP-dependent checks | 1, 2 | COVERED | Local tooling, evidence, scripts, and guidance are all included. |
| REQ | explicit constraint | Preserve the existing untracked export and authorize scope from the live tree | 1 | COVERED | Current bytes, size, revision, checksum, and page identities were observed during planning. |
| REQ | explicit constraint | Add deterministic inspection/validation with revision and checksum evidence | 1 | COVERED | Manifest, safe parser, query CLI, check, and self-test are specified. |
| REQ | explicit constraint | Update package scripts and active workflow guidance | 2 | COVERED | Package, project, stack, agent, and source README changes are specified. |
| REQ | explicit constraint | Demote MCP to optional freshness checking without rewriting history | 1, 2 | COVERED | Historical artifacts are explicitly excluded from edits; active policy is updated. |
| RESEARCH | none | No research phase requested | - | EXCLUDED | Existing code and archive patterns are sufficient. |
| CONTEXT | none | No separate CONTEXT.md decisions | - | EXCLUDED | The user's current request is captured directly in the goal and constraints. |

<output>
Create `.planning/quick/260918-noz-adopt-the-local-penpot-export-as-the-can/260918-noz-SUMMARY.md` with `status: complete` when execution finishes.
</output>
