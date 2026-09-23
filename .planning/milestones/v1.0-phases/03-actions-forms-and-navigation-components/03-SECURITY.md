---
phase: "03"
slug: "actions-forms-and-navigation-components"
status: verified
threats_open: 0
asvs_level: 1
block_on: high
register_authored_at_plan_time: true
created: "2026-09-18"
verified: "2026-09-18"
---

# Phase 03 — Security

> ASVS L1 verification of the threat registers declared by Plans 03-01 through 03-09. Threat IDs are plan-qualified because several plans intentionally reuse local IDs.

## Trust Boundaries

| Boundary | Description | Data crossing |
|---|---|---|
| Committed Penpot archive → build-time evidence | A bounded local parser extracts only the pinned revision-296 records and artwork. | Untrusted archive entries, JSON, SVG, and media bytes. |
| Evidence → generated/runtime modules | Deterministic validators bind retained bytes and records to closed local registries. | Source IDs, hashes, geometry, paints, and normalized component tuples. |
| Consumer props → native controls | Runtime guards reject unsupported keys, values, combinations, and callback types. | Labels, controlled values, callbacks, and accessibility state. |
| Storybook host → component catalogue | Stories may select only source-backed tuples and remain free of router/auth/picker behavior. | Args, actions, and component state. |

## Threat Register

| Plan / Threat | Category | Severity | Disposition | Mitigation evidence | Status |
|---|---|---:|---|---|---|
| 03-01 / T-03-01 | Tampering / DoS | high | mitigate | Bounded archive size/count/decompression, safe paths, header agreement, and CRC in `scripts/penpot-source.mjs`; malformed fixtures pass. | closed |
| 03-01 / T-03-02 | Tampering | high | mitigate | Revision, family/record count, order, uniqueness, hashes, tuples, and deterministic registry regeneration are validated. | closed |
| 03-01 / T-03-04 | Elevation of Privilege | high | mitigate | Shared blocked predicate suppresses disabled/loading callbacks; action tests assert enabled-once and blocked-zero. | closed |
| 03-01 / T-03-05 | Tampering | medium | mitigate | Button rejects unsupported keys, values, combinations, and callback types. | closed |
| 03-01 / T-03-SC | Tampering | high | mitigate | No dependency install; Phase 3 package changes add scripts only. | closed |
| 03-02 / T-03-05 | Tampering / DoS | high | mitigate | Artwork extraction reuses the bounded parser, fixed input/output maps, safe roots, exact inventory, and byte checks. | closed |
| 03-02 / T-03-06 | Spoofing | medium | mitigate | Hard-coded source/media mappings verify the six-reference/five-output mascot relationship and Games→Search reuse. | closed |
| 03-02 / T-03-SC | Tampering | high | mitigate | Extraction owns enumerated local outputs only and adds no dependency. | closed |
| 03-03 / T-03-07 | Tampering | high | mitigate | Manifest identity, SHA-256, deterministic regeneration, export inventory, ordered geometry, and complete vector attributes are validated. | closed |
| 03-03 / T-03-08 | Spoofing / Information Disclosure | medium | mitigate | Validator rejects URLs/network/Penpot access and generalized artwork APIs; exports are local and closed. | closed |
| 03-03 / T-03-SC | Tampering | high | mitigate | Validator forbids shared `IconName`, theme, or caller-controlled artwork expansion. | closed |
| 03-04 / T-03-08 | Elevation of Privilege | high | mitigate | Button, IconButton, and Favourite share blocked activation and once/zero callback tests. | closed |
| 03-04 / T-03-09 | Tampering | medium | mitigate | All action families enforce closed props and callback types at runtime. | closed |
| 03-04 / T-03-10 | Spoofing | medium | mitigate | Non-empty names and outer-control semantics are required; nested artwork is decorative. | closed |
| 03-04 / T-03-SC | Tampering | high | mitigate | No action dependency was added. | closed |
| 03-05 / T-03-11 | Tampering | medium | mitigate | Field validates branch-specific key sets, values, callbacks, and impossible casts. | closed |
| 03-05 / T-03-12 | Elevation of Privilege | high | mitigate | Native editability, read-only/disabled blocking, stepper bounds, and nested action isolation are tested. | closed |
| 03-05 / T-03-13 | Spoofing | medium | mitigate | Labels, values, helper/error content, names, hints, roles, and state remain visible and semantic. | closed |
| 03-05 / T-03-SC | Tampering | high | mitigate | Trigger branches are callback-only; no picker integration or dependency exists. | closed |
| 03-06 / T-03-14 | Tampering | medium | mitigate | ChoiceChip sparse tuples, Checkbox booleans, and DayTimeSelector branches/callbacks are runtime-validated. | closed |
| 03-06 / T-03-15 | Elevation of Privilege | high | mitigate | Controlled selection controls suppress disabled activation and prove once/zero callback behavior. | closed |
| 03-06 / T-03-16 | Spoofing | medium | mitigate | Role/name/checked/disabled behavior and decorative artwork are tested per control. | closed |
| 03-06 / T-03-SC | Tampering | high | mitigate | No form dependency was added. | closed |
| 03-07 / T-03-17 | Information Disclosure | high | mitigate | Authentication-labelled UI has no SDK, fetch, storage, credential, token, or session behavior; static checks enforce this. | closed |
| 03-07 / T-03-18 | Tampering | high | mitigate | Provider artwork is local, hash-validated, zero-argument, and caller-invariant. | closed |
| 03-07 / T-03-19 | Elevation of Privilege | high | mitigate | Callback types and disabled activation are guarded and tested. | closed |
| 03-07 / T-03-SC | Tampering | high | mitigate | No authentication dependency was added. | closed |
| 03-08 / T-03-20 | Tampering | medium | mitigate | Segment cardinality/uniqueness, page-specific header keys, and SectionHeader action pairing are validated. | closed |
| 03-08 / T-03-21 | Elevation of Privilege | high | mitigate | Composite children remain separate controls; callback isolation and blocked segments are tested; router-shaped props reject. | closed |
| 03-08 / T-03-22 | Spoofing | medium | mitigate | Fixed order, headings, visible-action semantics, and decorative mascots are asserted. | closed |
| 03-08 / T-03-SC | Tampering | high | mitigate | No router package or routing behavior was added. | closed |
| 03-09 / T-03-23 | Tampering | high | mitigate | Public exports, story titles/taxonomy/controls, record order, and backstops are covered by the catalogue contract suite. | closed |
| 03-09 / T-03-24 | Spoofing / Repudiation | high | mitigate | Verification validator binds required record text, witness paths, gate commands, validation flags, and deferred-native status. | closed |
| 03-09 / T-03-25 | Denial of Service | medium | mitigate | Web smoke uses loopback-only ports, bounded startup/request timeouts, signal cleanup, and process-tree termination. | closed |
| 03-09 / T-03-SC | Tampering | high | mitigate | Package changes add verification scripts only; dependency versions are unchanged. | closed |

## Accepted Risks Log

No accepted risks. All 35 declared threats were verified closed.

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|---|---:|---:|---:|---|
| 2026-09-18 | 35 | 35 | 0 | `gsd-security-auditor` |

## Verification

`npm run verify:phase3` passed in the audited checkout: 18 suites and 448 tests, typecheck, lint, bounded design-source checks, component/artwork/verification validators, and Storybook web smoke. Later UI-review fixes increased the test total without changing any security disposition.

## Sign-Off

- [x] All threats have a disposition.
- [x] No accepted risk requires logging.
- [x] `threats_open: 0` confirmed at ASVS L1 with a high-severity block threshold.
- [x] `status: verified` set in frontmatter.

**Approval:** verified 2026-09-18
