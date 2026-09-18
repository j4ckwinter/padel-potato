---
phase: "02"
slug: "primitives-assets-and-component-contracts"
status: verified
threats_open: 0
asvs_level: 1
block_on: high
created: "2026-09-18"
verified: "2026-09-18"
---

# Phase 02 — Security

> ASVS Level 1 verification of the threat registers authored in the five Phase 2 plans.

## Trust Boundaries

| Boundary | Description | Data crossing |
|----------|-------------|---------------|
| Penpot live source → retained evidence | Exact file, page, revision, source identities, geometry, and observation provenance enter the repository | Design-source evidence |
| Retained evidence → local runtime assets | Generator and validator normalize only allowlisted SVG/PNG inputs under fixed repository roots | Untrusted build input |
| Consumer props → primitives/assets | Token, style, accessibility, interaction, and asset-name inputs enter React Native hosts | Caller-controlled component props |
| Storybook controls → public APIs | Catalogue controls and actions exercise only supported public combinations | Reviewer-controlled arguments |
| Automated/web evidence → native acceptance record | Non-native results must not be represented as native accessibility or layout proof | Verification claims |

## Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-02-01 | Spoofing / Repudiation | Penpot source evidence | high | mitigate | Retained live observation binds exact file/page/revision, all 20 source IDs, observation time, and extraction commit; generation validates it before writing | closed |
| T-02-02 | Tampering / Information Disclosure | SVG/PNG inputs | high | mitigate | Strict per-tag SVG/XML profile and structural, palette, decompression, scanline, and sample validation for PNG | closed |
| T-02-03 | Tampering | Asset paths | high | mitigate | Canonical fixed-root containment, traversal, absolute-path, and extension rejection | closed |
| T-02-04 | Denial of Service | Asset batch | medium | mitigate | Exact bounded 18-icon/2-lockup inventory with fail-fast identity, ordering, dimensions, profile, and hash checks | closed |
| T-02-05 | Tampering | Primitive styles | high | mitigate | Explicit style allowlists, flattened reserved-key rejection, and invariant styles applied last | closed |
| T-02-06 | Spoofing | Token resolution | medium | mitigate | Own-property membership and explicit rejection without fallback | closed |
| T-02-07 | Information Disclosure | Primitive runtime imports | low | accept | Static contracts prohibit network, persistence, credentials, product-model, and runtime Penpot imports | closed |
| T-02-08 | Tampering | Icon registry | high | mitigate | Closed generated name union, own-property validation, and immutable local XML only | closed |
| T-02-09 | Spoofing | Brand lockups | medium | mitigate | Fixed local sources, authored ratios, inherent semantics, and closed props | closed |
| T-02-10 | Information Disclosure | Runtime asset loading | low | accept | Checked-in synchronous local assets only; no remote URLs, credentials, user-controlled locations, or runtime manifest access | closed |
| T-02-11 | Elevation of Privilege | Pressable state | high | mitigate | One blocked predicate gates callback, disabled state, accessibility invariants, opacity, and target behavior | closed |
| T-02-12 | Spoofing | Accessibility state | medium | mitigate | Caller state is preserved while owned busy/disabled invariants and aliases win | closed |
| T-02-13 | Repudiation | Test helpers | medium | mitigate | Explicit observable expectations, call-delta checks, and propagating failures | closed |
| T-02-14 | Tampering | Storybook controls | high | mitigate | Closed registry-derived controls and only real supported actions | closed |
| T-02-15 | Repudiation | Boundary evidence | medium | mitigate | Structured rendered/action witnesses and explicit native-review disposition | closed |
| T-02-16 | Spoofing | Native acceptance claim | high | mitigate | Executable schema permits only evidence-backed device verification or explicit Phase 5 deferral and rejects unsupported pass language | closed |
| T-02-17 | Denial of Service | Web smoke process | medium | mitigate | Bounded startup/fetch timeouts and verified process-tree cleanup | closed |
| T-02-SC | Tampering | Dependency state | high | mitigate | Exact approved 23-package manifest/lockfile validation | closed |

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-02-01 | T-02-07 | Phase 2 primitives are presentational and receive only caller-supplied local props/content. Residual risk is that a future product consumer could pass sensitive content through ordinary children or accessibility labels; reassess if a primitive gains network, storage, authentication, product-model, or runtime Penpot access. | User (`accept`) | 2026-09-18 |
| AR-02-02 | T-02-10 | Assets are bundled local SVG/PNG data. Residual disclosure is limited to artwork already visible in the application; reassess if remote, authenticated, downloaded, or user-supplied assets are introduced. | User (`accept`) | 2026-09-18 |

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open at/above high | Run By |
|------------|---------------|--------|--------------------|--------|
| 2026-09-18 | 18 | 18 | 0 | gsd-security-auditor + Codex orchestrator |

Verification evidence: `npm run verify:phase2` passes TypeScript, lint, 11 Jest suites/295 tests, Penpot foundation and asset validators, exact toolchain validation, native-claim validation, and Storybook web smoke.

## Sign-Off

- [x] All threats have a disposition
- [x] Accepted risks are documented
- [x] `threats_open: 0` confirmed at the configured high threshold
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-09-18
