# Phase 5: Native Catalogue Validation and Coverage Audit - Research

**Researched:** 2026-09-22
**Domain:** React Native Storybook catalogue auditing, Expo native bundle readiness, and production exclusion
**Confidence:** HIGH for repository architecture and executable probes; MEDIUM for current external platform guidance

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

### Native Validation Authority
- Manual review in native Storybook is the acceptance authority for visual and interaction quality.
- The user will inspect Storybook themselves and post any issues in the conversation in whatever format is convenient.
- Do not require a formal per-story response, prescribed screenshot set, or structured issue template from the user.
- Automation prepares the catalogue and coverage information but does not substitute for the user's visual judgment.

### Coverage and Release Gates
- Generate an auditable mapping from every Penpot foundation, reusable component, variant, and designed state to its implementation and Storybook coverage.
- Unexplained coverage omissions are failures; intentional omissions or platform differences must be explicitly dispositioned.
- Issues reported by the user during manual validation drive a correction and revalidation loop.
- Prove automatically that production-mode builds exclude Storybook code when Storybook is disabled.

### Manual Review Workflow
- The user controls the review process and will report only the issues they observe.
- Do not impose a family-by-family review ceremony, required screenshots, or mandatory device metadata on the user.
- Fix reported implementation defects, then leave the user to decide whether and how to recheck them.
- Automated checks should still cover catalogue completeness, technical regressions, and the secondary Expo-web smoke lane.

### Completion and Next Steps
- Do not prescribe an approval ceremony or ask the user to commit to a final evidence workflow in advance.
- Prepare the technical validation outputs and a usable native Storybook catalogue, then let the user decide the next steps.
- Retain concise automated audit results and existing source/deviation provenance; screenshots from manual review are optional.
- Keep Storybook isolated from product navigation, product flows, and production bundles.

### the agent's Discretion
- Choose the exact report formats, scripts, test organization, and coverage-manifest structure, provided they are deterministic and easy to inspect.
- Choose representative automated smoke cases without turning browser parity into a native acceptance requirement.

### Deferred Ideas (OUT OF SCOPE)
- The user will decide what follows manual validation; do not select or launch a subsequent product milestone as part of this phase.
- Hosted Storybook, pixel-perfect web parity, product-screen assembly, navigation, backend behavior, and persistent data remain out of scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| WORK-02 | Developer can launch the component catalogue in native Storybook on iOS. | Preserve the existing Storybook entry-point swap and provide a physical-iOS launch route through the normal Expo development server; actual visual review remains user-controlled. |
| WORK-03 | Developer can launch the component catalogue in native Storybook on Android. | Preserve the existing native and Android launch commands; add a non-interactive native bundle-readiness check before handing the catalogue to the user. |
| WORK-05 | Production-mode app builds exclude Storybook code. | Export analyzable production native bundles with Storybook disabled and fail if either source map contains `.rnstorybook`, `*.stories.*`, `storybook.requires`, `@storybook`, or `storybook` package sources. |
| VRFY-01 | Every component family is visually compared with Penpot references on iOS. | This is a manual-only acceptance lane owned by the user. Automation may expose coverage and source identity but must not claim the comparison occurred. |
| VRFY-02 | Every component family is visually compared with Penpot references on Android. | This is a manual-only acceptance lane owned by the user. Automation may expose coverage and source identity but must not claim the comparison occurred. |
| VRFY-03 | Shared stories pass a local Expo-web discovery and render smoke check. | Reuse the existing bounded loopback `storybook:web:smoke` process and include it in the Phase 5 aggregate command. |
| VRFY-04 | A coverage audit proves every Penpot foundation, reusable component, variant, and designed state is implemented or explicitly dispositioned. | Generate a deterministic record-level manifest from the retained foundation inventory, Phase 3/4 extractor outputs, public exports, and story contracts; validate all witnesses and fail on `missing`. |
| VRFY-05 | The final evidence pack records platforms, devices, capture conditions, results, and approved deviations. | Retain automated platform/command/result facts and existing deviation provenance. Do not require the user to supply device metadata, screenshots, or an approval record; manual facts are recorded only if voluntarily provided. |
</phase_requirements>

## Summary

Phase 5 should be planned as a verification-and-handoff phase, not as another component implementation phase. The catalogue is already present: the repository has the native Storybook launch scripts, a Storybook glob covering `src/**/*.stories.*`, a font-gated shared preview, 36 story files, source registries for 28 Phase 3/4 families, and contract tests that already bind 151 retained component records to Storybook families. The missing work is to aggregate these separate proofs into one deterministic catalogue audit, add a direct production-bundle exclusion probe, add native bundle-readiness checks, and retain concise outputs without claiming the user's visual judgment. [VERIFIED: package.json:23-27; .rnstorybook/main.ts:4-9; src/design-system/stories/storyContract.ts:4-470; local `Get-ChildItem src -Recurse -Filter '*.stories.tsx'` inventory, 2026-09-22]

The production-exclusion seam is especially strong. The installed `@storybook/react-native` 10.5.0 bundler-agnostic wrapper is a no-op unless `STORYBOOK_ENABLED=true`; when enabled it swaps Expo's application entry point for `.rnstorybook/index.tsx`. The repository already uses that wrapper. [VERIFIED: metro.config.js:1-6; node_modules/@storybook/react-native/dist/withStorybook.js, opened 2026-09-22] The official React Native Storybook documentation describes the same entry-point-swapping behavior and says the normal bundle contains no Storybook code when the variable is unset. [CITED: https://github.com/storybookjs/react-native/blob/next/docs/docs/intro/getting-started/index.md] A local falsification probe succeeded: the disabled Android production export contained 585 source-map sources and zero Storybook paths, while an enabled control export contained 233 Storybook-path sources. This makes a source-map scanner an implementation-ready proof rather than a speculative technique. [VERIFIED: local `npx expo export --platform android --source-maps --no-bytecode` probes, 2026-09-22]

Manual validation must remain outside the automated pass/fail vocabulary. Phase 5 can prove that iOS and Android Storybook bundles compile, that launch commands are wired, that the web catalogue starts, that all source records have witnesses, and that production bundles exclude Storybook. It cannot mark VRFY-01 or VRFY-02 visually accepted unless the user actually performs and reports that judgment. The technical phase should end by handing the user the working launch command and audit summary, then allow the user to decide what happens next.

**Primary recommendation:** Build one dependency-free Phase 5 audit pipeline that generates and validates a record-level coverage manifest, exports enabled native bundles for readiness, exports disabled native bundles for exclusion inspection, reuses the existing Expo-web smoke, and reports manual iOS/Android visual acceptance as user-controlled rather than inferred.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Penpot-to-catalogue coverage inventory | Build/validation tooling | Client catalogue | Node scripts own deterministic extraction and comparison; Storybook provides the witness titles and exports. |
| Native Storybook launch/readiness | Mobile client | Expo/Metro build tooling | The catalogue renders in React Native; Metro entry swapping and Expo bundling make it launchable. |
| Expo-web smoke | Client catalogue | Build/validation tooling | A local browser requests the real Expo bundle; the bounded Node launcher owns startup and cleanup. |
| Production Storybook exclusion | Expo/Metro build tooling | Mobile client | The wrapper decides the entry point and module graph; exported source maps provide inspectable evidence. |
| Manual Penpot comparison | User/native device | Storybook catalogue | Visual and interaction judgment belongs to the user on iOS/Android, not to a script. |
| Retained audit evidence | Repository documentation | Build/validation tooling | Deterministic JSON and concise verification markdown preserve what automation established. |

## Project Constraints (from AGENTS.md)

- Target mobile iOS and Android only; native behavior is authoritative.
- Use React Native with Expo and React Native Storybook. Do not introduce product screens, navigation, backend behavior, or persistence.
- Treat `design-source/padel-potato UI Concepts.penpot` as the routine design authority; run `npm run validate:design-source` before final verification.
- Compare native Storybook output with retained design references; source inspection alone is not visual proof.
- Preserve completed Phase 1/2 MCP evidence as historical provenance.
- Expo web is a local secondary catalogue only; do not spend effort on pixel-perfect web parity.
- Use the established `StyleSheet`/typed token approach; do not introduce NativeWind, a UI kit, CSS-in-JS, or a second Storybook framework.
- Keep exact approved package versions. The live repository quotes `"expo": "57.0.24"`, `"@storybook/react-native": "10.5.0"`, and `"jest-expo": "57.0.5"`. [VERIFIED: package.json:30-69]
- Run work through the active GSD workflow and preserve unrelated user changes.

## Standard Stack

### Core

| Library/tool | Version | Purpose | Why Standard Here |
|--------------|---------|---------|-------------------|
| Expo | `57.0.24` | Development server and production JS export | Already approved and locked; `expo export` produces platform bundles/source maps without requiring a signed native build. [VERIFIED: package.json:34] |
| React Native | `0.86.3` | Native catalogue runtime | Existing project runtime; no migration belongs in this phase. [VERIFIED: package.json:39] |
| `@storybook/react-native` | `10.5.0` | On-device catalogue and entry-point swapping | Existing exact patch; the project uses `@storybook/react-native/withStorybook`. [VERIFIED: package.json:52; metro.config.js:2] |
| Jest + `jest-expo` | `29.7.0` + `57.0.5` | Coverage-manifest and story-contract verification | Existing harness already validates Storybook contracts and component semantics. [VERIFIED: package.json:61-69] |
| Node.js scripts | pinned `22.13.1` | Deterministic reports, export orchestration, source-map inspection | Matches the repository runtime pin and existing dependency-light validation style. [VERIFIED: .nvmrc:1] |

### Supporting

| Tool/data | Version/identity | Purpose | When to Use |
|-----------|------------------|---------|-------------|
| TypeScript compiler API | `6.0.3` already installed | Parse story modules deterministically if the audit needs structural discovery beyond existing contracts | Use only as an installed parser; do not add a new AST package. [VERIFIED: package.json:66] |
| `scripts/smoke-storybook-web.mjs` | repository implementation | Bounded Expo-web startup, bundle-marker check, and process cleanup | Reuse unchanged or extend minimally for VRFY-03. [VERIFIED: scripts/smoke-storybook-web.mjs:182-306] |
| Local Penpot reader/extractors | revision `296` archive | Recompute source inventories without live MCP | Use for every coverage generation/validation run. The canonical manifest quotes `"revision": 296`. [VERIFIED: design-spec/penpot-source.json:15] |
| Existing story contracts | taxonomy `Canonical`, `Variants`, `States`, `Boundaries`, `Interactive` | Family, record, state, control, action, and inapplicability witnesses | Treat as the catalogue-side coverage source of truth. [VERIFIED: src/design-system/stories/storyContract.ts:4-10, quoted taxonomy verbatim] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Existing Node/Jest validation stack | New coverage/reporting package | Rejected: adds dependency and approval cost without solving a problem the existing scripts and compiler API cannot solve. |
| Expo production export + source-map inspection | Signed EAS/iOS/Android release builds | Signed builds add credentials, remote state, and platform tooling; use them only if the user later asks. JS export is sufficient to prove the Metro module graph exclusion. |
| Existing Expo web smoke | Vite Storybook or browser visual diff service | Rejected by project scope; web is a secondary smoke lane, not native visual authority. |
| Generated machine-readable manifest | Prose checklist | Prose alone drifts and cannot fail deterministically on missing records. |

**Installation:** None. Phase 5 should install no packages.

## Package Legitimacy Audit

No external packages are required or recommended. The project UI-SPEC explicitly requires the installed dependency set unless separately approved, so the package-legitimacy gate is not triggered for this phase.

| Package | Registry | Verdict | Disposition |
|---------|----------|---------|-------------|
| None | — | — | Use existing locked dependencies only |

**Packages removed due to SLOP verdict:** none  
**Packages flagged as suspicious:** none

## Architecture Patterns

### System Architecture Diagram

```text
Committed Penpot archive
        |
        +--> validate:design-source --> deterministic source identity/inventory
        |
        +--> Phase 3/4 extractors --> family + record inventories (151 records)
        |
Foundation inventory (45 entries) ----+
                                      |
Public exports + story contracts -----+--> catalogue coverage generator
Story files / generated requires -----+           |
                                                  +--> catalogue-coverage.json
                                                  +--> concise totals/report
                                                  +--> FAIL if any missing or reasonless disposition

STORYBOOK_ENABLED=true  --> Expo export iOS/Android --> enabled entry/source-map readiness check
STORYBOOK_ENABLED=true  --> bounded Expo web server --> existing discovery/render smoke
STORYBOOK_ENABLED unset --> Expo export iOS/Android --> source-map exclusion scan

User opens native Storybook --> user-led visual/interaction review --> conversational issues
                                                                  --> targeted fixes/checks only if reported
```

### Recommended Project Structure

```text
scripts/
├── generate-catalogue-coverage.mjs      # deterministic manifest generation
├── validate-catalogue-coverage.mjs      # schema, witness, totals, mutation self-tests
├── verify-storybook-native-bundles.mjs  # enabled readiness + disabled exclusion exports
└── smoke-storybook-web.mjs              # existing bounded web lane
tests/
└── catalogue-coverage.test.tsx           # imports real contracts/stories/public barrel
design-spec/
├── catalogue-coverage.json              # generated, diffable record-level audit
└── phase-5-verification.md               # concise automated facts; no inferred visual approval
.planning/phases/05-.../
└── 05-VALIDATION.md                     # Nyquist command/test map
```

Names are recommendations within the agent's discretion; preserve the separation of generated data, its validator, and the retained human-readable summary.

### Pattern 1: Generate from authoritative inputs, validate against runtime witnesses

**What:** Recompute source inventory from the archive and existing extractors, then validate it against imported Storybook contracts and story modules in Jest. Do not make a hand-edited JSON file the authority.

**When to use:** VRFY-04 and any future addition/removal of a component record or story.

The source inventory is already discrete and checkable: Phase 3 quotes `"familyCount": 13` and `"recordCount": 75`; Phase 4 quotes `"familyCount": 15` and `"recordCount": 76`. [VERIFIED: src/design-system/components/sourceRegistry.ts:32-33; src/design-system/components/phase4SourceRegistry.ts:45-46] The foundations artifact quotes the seven ordered categories `"borderWidths"`, `"colors"`, `"dimensions"`, `"opacities"`, `"radii"`, `"spacing"`, and `"typography"`, containing 45 entries in total. [VERIFIED: design-spec/penpot-foundations.json:14-24,56-899]

Recommended audit levels:

1. Foundation entry: source category/key -> token export -> `Foundations/Overview` category story.
2. Public family: source ID/export -> public barrel -> canonical story title.
3. Variant/designed-state record: record ID and source order -> owning contract `recordIds` -> `Variants`/`States` witness.
4. Story taxonomy: each family/category -> real named story or non-empty inherent inapplicability reason.
5. Disposition: only `covered`, `dispositioned`, or `missing`; `missing` exits non-zero, and `dispositioned` requires a reason.

### Pattern 2: Source maps as production-exclusion evidence

**What:** Spawn `expo export` in a unique temporary directory with `STORYBOOK_ENABLED` removed and `STORYBOOK_SERVER=false`; include `--source-maps --no-bytecode` so the script can parse the native source maps. Fail if any source matches Storybook paths. Always clean up the exact verified temporary directory in `finally`.

**When to use:** WORK-05 and the final Phase 5 gate.

```javascript
// Source: https://docs.expo.dev/guides/analyzing-bundles/
const forbiddenSource = /(?:^|[/\\])(?:\.rnstorybook|[^/\\]+\.stories\.)|[/\\]@storybook[/\\]|[/\\]storybook[/\\]|storybook\.requires/u;

for (const platform of ['ios', 'android']) {
  // spawn: npx expo export --platform <platform> --source-maps --no-bytecode --output-dir <temp>
  // parse every *.map and require zero forbidden sources
}
```

Use source-map `sources` entries as the primary signal; searching only minified bundle text is weaker because names may be transformed. Add a controlled self-test that supplies a synthetic map containing `/.rnstorybook/index.tsx` and proves the scanner rejects it. The enabled export may be checked separately for `.rnstorybook/index.tsx` to prove the native Storybook entry compiles.

Expo's official bundle-analysis guide documents production exports with source maps and `--no-bytecode` for analyzable native bundles. [CITED: https://docs.expo.dev/guides/analyzing-bundles/]

### Pattern 3: Separate native readiness from native acceptance

**What:** Automation proves both enabled iOS and Android bundles compile and resolve `.rnstorybook/index.tsx`; the user proves visual and interaction quality by opening Storybook.

**When to use:** WORK-02/03 versus VRFY-01/02.

The existing scripts quote `"storybook:native": "cross-env STORYBOOK_ENABLED=true expo start"`, `"storybook:ios": "cross-env STORYBOOK_ENABLED=true expo start --ios"`, and `"storybook:android": "cross-env STORYBOOK_ENABLED=true expo start --android"`. [VERIFIED: package.json:23-27, quoted verbatim] On Windows, hand the user `npm run storybook:native` for QR-based physical-device access; `storybook:android` is useful only when a configured emulator/device is available, and `storybook:ios` requires macOS simulator tooling. Official Expo guidance supports opening the development server on physical Android/iOS devices by QR code. [CITED: https://docs.expo.dev/tutorial/create-your-first-app/]

Do not write `ios: passed` or `android: passed` merely because export succeeded. Use precise states such as `bundle-ready`, `launch-command-ready`, and `manual-review-user-controlled`.

### Pattern 4: One aggregate command, small focused commands beneath it

**What:** Add focused scripts for coverage, native bundles, web smoke, and retained verification, then combine them in `verify:phase5` with the established typecheck/lint/Jest/design-source gates.

**When to use:** Task-level verification and final phase closure.

Recommended order:

```text
typecheck
lint
focused/full Jest
validate:design-source
validate:catalogue-coverage
verify:storybook-native-bundles
storybook:web:smoke
validate:phase5-verification
```

Place bundle exports after cheap static/unit checks so failures surface quickly. Keep the web smoke last because it starts a child server and exercises cleanup.

### Anti-Patterns to Avoid

- **Marking visual review complete from automation:** bundle compilation, story discovery, screenshots, or source coverage cannot express the user's visual judgment.
- **A mandatory reviewer checklist:** conflicts with the locked conversational, user-led workflow.
- **A hand-maintained prose-only coverage table:** it will drift from record IDs and story exports.
- **Scanning `node_modules` or package.json instead of the exported module graph:** installed Storybook packages may legitimately remain dev dependencies; WORK-05 concerns production bundle inclusion.
- **Checking only Android and assuming iOS output:** export and inspect both native platform maps; no device is needed for this build-graph proof.
- **Leaving `STORYBOOK_ENABLED=false` as a string:** the safest disabled proof removes the variable entirely because the wrapper's activation contract is `true` only.
- **Running the enabled control export on every fast unit-test invocation:** keep expensive Metro exports in integration/phase gates.
- **Writing platform/device facts the tooling did not observe:** absent device metadata is not a failure under the locked decision.
- **Rewriting historical Phase 1/2 evidence to revision 296:** preserve provenance; represent current Phase 3/4 record coverage separately.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Story discovery | A second story index parser/runtime | `.rnstorybook/main.ts`, generated `storybook.requires.ts`, and real story-module imports | These are the actual Storybook discovery paths. |
| Penpot ZIP parsing | Another archive reader | `scripts/penpot-source.mjs` and phase extractors | Existing reader already enforces size, traversal, CRC, identity, and deterministic manifest checks. |
| Native bundle creation | Custom Metro invocation | `npx expo export` | Expo owns its Metro configuration and platform bundle format. |
| Production exclusion | Package-uninstall or grep of source tree | Disabled export + source-map graph scan | Dev dependencies may stay installed while still being absent from production. |
| Browser process lifecycle | Another server runner | Existing `scripts/smoke-storybook-web.mjs` | It already reserves a loopback port, checks the bundle, and proves cleanup. |
| Visual approval | Screenshot heuristics or an AI score | User-led native Storybook review | This is a locked product decision and the only accepted visual authority. |

**Key insight:** Phase 5 should integrate existing truths into one fail-closed audit; it should not create a parallel catalogue, testing framework, or review ceremony.

## Common Pitfalls

### Pitfall 1: Coverage counts pass while individual records are missing
**What goes wrong:** A family total still matches after a duplicate replaces a missing record.  
**Why it happens:** Totals are checked without uniqueness, order, and source ID equality.  
**How to avoid:** Compare exact ordered record-ID arrays, assert set uniqueness, and require every source record to have one owning family/story witness.  
**Warning signs:** Correct total count but duplicate IDs, reordered variants, or an unreferenced source ID.

### Pitfall 2: Story presence is confused with state coverage
**What goes wrong:** A `States` export exists but does not cover the designed source tuples.  
**Why it happens:** File/export discovery is shallower than record-level mapping.  
**How to avoid:** Keep both checks: named taxonomy export/inapplicability and source-record-to-contract mapping. Phase 3/4 contracts already carry `recordIds`; use them.

### Pitfall 3: Production exclusion is asserted from Metro configuration only
**What goes wrong:** A later direct import or wrapper change reintroduces Storybook even though `metro.config.js` still looks correct.  
**Why it happens:** Static configuration is treated as runtime output.  
**How to avoid:** Inspect the actual disabled production export source maps and test the scanner with a deliberately contaminated fixture.

### Pitfall 4: Windows launch commands imply an iOS simulator exists
**What goes wrong:** `expo start --ios` attempts tooling unavailable on Windows.  
**Why it happens:** Platform convenience scripts are confused with the physical-device workflow.  
**How to avoid:** Use `npm run storybook:native`, then let the user open the QR code on a physical iPhone. Keep iOS simulator validation optional and external. [CITED: https://docs.expo.dev/get-started/set-up-your-environment/?device=physical&mode=expo-go&platform=ios]

### Pitfall 5: Evidence overclaims manual acceptance
**What goes wrong:** An automated `pass` is recorded for VRFY-01/02 or VoiceOver/TalkBack without user review.  
**Why it happens:** One aggregate status collapses technical readiness and human judgment.  
**How to avoid:** Split facts into `automated` and `manual/user-controlled` sections; never infer acceptance from silence.

### Pitfall 6: Nondeterministic evidence churn
**What goes wrong:** Timestamps, absolute temp paths, randomized bundle hashes, and device-local values make committed output change every run.  
**Why it happens:** Raw command output is committed instead of normalized facts.  
**How to avoid:** Commit stable identities, counts, commands, relative witness paths, and content hashes. Print transient paths/timestamps to the console only.

### Pitfall 7: Using the current shell runtime instead of the repository pin
**What goes wrong:** The developer machine currently reports Node `v24.20.0`, while `.nvmrc` quotes `22.13.1`.  
**Why it happens:** A globally installed runtime silently replaces the approved environment.  
**How to avoid:** Execute the final retained verification under Node 22.13.1 even though the research probes succeeded on Node 24. [VERIFIED: local environment probe and .nvmrc:1]

## Code Examples

### Fail-closed coverage status validation

```javascript
const allowedStatuses = new Set(['covered', 'dispositioned', 'missing']);

for (const item of manifest.items) {
  assert(allowedStatuses.has(item.status), `unsupported status: ${item.status}`);
  if (item.status === 'covered') assertFile(item.implementation);
  if (item.status === 'dispositioned') assert(item.reason?.trim(), `reason required: ${item.id}`);
  if (item.status === 'missing') missing.push(item.id);
}

assert(missing.length === 0, `unexplained catalogue omissions: ${missing.join(', ')}`);
```

The exact status values `covered`, `dispositioned`, and `missing` come from the Phase 5 UI contract. [VERIFIED: .planning/phases/05-native-catalogue-validation-and-coverage-audit/05-UI-SPEC.md:129, quoted verbatim above]

### Spawn an export without leaking the enabled environment

```javascript
const env = { ...process.env, STORYBOOK_SERVER: 'false' };
delete env.STORYBOOK_ENABLED;

await spawnChecked(process.execPath, [
  npmCliPath,
  'exec', '--', 'expo', 'export',
  '--platform', platform,
  '--source-maps',
  '--no-bytecode',
  '--output-dir', outputDir,
], { env });
```

Use `process.execPath` plus `npm_execpath`/the platform-safe npm invocation pattern already established by the web smoke rather than shell interpolation. [VERIFIED: scripts/smoke-storybook-web.mjs:223-255]

### Concise human-readable summary

```text
Catalogue coverage: 45 foundation entries; 36 public families; 151 Phase 3/4 records
Statuses: 232 covered; 0 dispositioned; 0 missing
Native bundle readiness: iOS bundle-ready; Android bundle-ready
Production exclusion: iOS 0 forbidden sources; Android 0 forbidden sources
Expo web smoke: passed
Manual visual review: user-controlled; no acceptance inferred
```

The exact final totals must be computed by the implementation; the sample `232` is illustrative because family and record units may overlap depending on the chosen schema. Do not hard-code that aggregate.

## State of the Art

| Old/local approach | Current Phase 5 approach | Impact |
|--------------------|--------------------------|--------|
| Separate phase verification documents | One aggregate, record-level coverage manifest with retained concise summary | Reviewers can trace a missing source record directly to a witness. |
| Static confidence in Metro configuration | Inspect actual disabled native production exports | WORK-05 becomes executable and regression-resistant. |
| Native lanes broadly deferred to Phase 5 | Bundle readiness automated; visual acceptance explicitly user-controlled | Technical work can finish without inventing user approval. |
| Browser smoke as general catalogue proof | Browser smoke remains secondary; native Storybook remains authority | Prevents web success from being misreported as native fidelity. |

**Deprecated/outdated for this project:**

- Storybook 10.6.x guidance in the original stack research: superseded by the project's approved and installed exact 10.5.0 family.
- Vite React Native web Storybook: deferred and not needed.
- In-app Storybook route/toggle: entry-point swapping is already implemented and keeps product navigation isolated.
- Mandatory screenshot evidence: explicitly rejected by the user for this phase.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | [ASSUMED] The user has or will choose access to a suitable physical iPhone and Android device/emulator when they decide to review. | Environment Availability | Manual VRFY-01/02 cannot be completed yet, but automated readiness work remains valid. |

## Open Questions

1. **When will the user perform native visual review?**
   - What we know: The user will inspect Storybook themselves and report issues conversationally.
   - What's unclear: Device availability and timing are intentionally not prescribed.
   - Recommendation: Finish the technical audit and provide the launch command; do not block implementation on advance scheduling or metadata.

2. **Should a later user-reported issue update retained evidence?**
   - What we know: Reported implementation defects must be fixed and applicable automated checks rerun.
   - What's unclear: The user may or may not want the conversational issue retained as a formal deviation.
   - Recommendation: Fix first; add a deviation record only when the user explicitly treats the difference as intentional/accepted.

## Environment Availability

All CLI/runtime availability rows below were verified by local probes on 2026-09-22; physical-device availability is explicitly marked unknown/[ASSUMED].

| Dependency | Required By | Available | Version/state | Fallback |
|------------|-------------|-----------|---------------|----------|
| Node.js | All Phase 5 scripts | Yes, but wrong final-verification version | Current `v24.20.0`; repository pin `22.13.1` | Switch to pinned Node before retaining final results |
| npm | Scripts | Yes | `11.19.0` | Use project/package-lock workflow |
| Expo CLI | Exports and dev server | Yes | project reports `57.0.26` CLI; Expo package `57.0.24` | Invoke through project `npx expo` |
| Git LFS | Canonical Penpot snapshot | Yes | `2.13.2` | None needed |
| Android SDK/ADB | Automatic Android device launch | No | `adb` missing; `ANDROID_HOME` unset | User may use a physical Android device via QR; bundle export needs neither |
| Xcode/xcrun | iOS simulator launch | No, Windows host | unavailable | Physical iPhone via Expo development server, or optional external macOS runner |
| Java/JDK | Local Android release binary | No | missing | Not required for Metro bundle readiness/exclusion; use EAS only if later requested |
| Physical iOS/Android device | User manual review | Unknown | user-controlled | Technical phase can complete readiness and wait for user decision |

**Missing dependencies with no fallback:** none for the automated Phase 5 audit.  
**Missing dependencies with fallback:** Android SDK/ADB, Xcode/xcrun, and JDK are absent; use platform-independent Expo bundle exports and user-selected physical-device review.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Jest `29.7.0` with `jest-expo` `57.0.5`, plus dependency-free Node integration scripts |
| Config file | `package.json` (`"preset": "jest-expo"`) |
| Quick run command | `npm test -- --runInBand tests/catalogue-coverage.test.tsx` |
| Full suite command | `npm run verify:phase5` |

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| WORK-02 | Storybook-enabled iOS entry compiles and resolves catalogue entry; physical launch is available to the user | integration + manual launch | `npm run verify:storybook-native-bundles` then `npm run storybook:native` | No - Wave 0 for integration script; launch command exists |
| WORK-03 | Storybook-enabled Android entry compiles and resolves catalogue entry; physical/emulator launch is available | integration + manual launch | `npm run verify:storybook-native-bundles` then `npm run storybook:native` or `npm run storybook:android` | No - Wave 0 for integration script; launch commands exist |
| WORK-05 | Disabled iOS/Android production source maps contain zero forbidden Storybook modules | integration | `npm run verify:storybook-production-exclusion` | No - Wave 0 |
| VRFY-01 | User visually compares native iOS catalogue | manual-only | none; user controls review and reports issues if desired | N/A by locked decision |
| VRFY-02 | User visually compares native Android catalogue | manual-only | none; user controls review and reports issues if desired | N/A by locked decision |
| VRFY-03 | Local Expo-web server discovers and serves Storybook entry | integration smoke | `npm run storybook:web:smoke` | Yes |
| VRFY-04 | Every foundation/family/record/state has a story witness or explicit disposition; missing fails | unit + deterministic integration | `npm run validate:catalogue-coverage` | No - Wave 0 |
| VRFY-05 | Retained report contains honest automated platform/conditions/results and deviation references | contract validation | `npm run validate:phase5-verification` | No - Wave 0 |

### Sampling Rate

- **Per task commit:** focused new Jest suite or individual Node validator/self-test relevant to the task.
- **Per wave merge:** `npm run typecheck && npm run lint && npm test -- --runInBand` plus the completed Wave's validators.
- **Phase gate:** pinned Node 22.13.1, `npm run validate:design-source`, full Jest, coverage audit, enabled iOS/Android export readiness, disabled iOS/Android exclusion scan, existing Expo-web smoke, and retained-evidence validator.
- **Manual lane:** hand the user `npm run storybook:native`; do not generate a pass/fail result unless the user provides one.

### Wave 0 Gaps

- [ ] `tests/catalogue-coverage.test.tsx` - verifies public exports, story modules, exact taxonomy, ordered record IDs, dispositions, and missing failure.
- [ ] `scripts/generate-catalogue-coverage.mjs` - derives deterministic JSON from retained source inputs.
- [ ] `scripts/validate-catalogue-coverage.mjs` - validates schema/witness paths and rejects duplicate, missing, reasonless, zero-result, and stale records.
- [ ] `scripts/verify-storybook-native-bundles.mjs` - enabled native bundle readiness and disabled native production exclusion; safe temp cleanup and controlled scanner rejection.
- [ ] `scripts/validate-phase-5-verification.mjs` - ensures retained evidence matches live artifacts and never overclaims manual native acceptance.
- [ ] `design-spec/catalogue-coverage.json` - generated machine-readable audit.
- [ ] `design-spec/phase-5-verification.md` - concise automated result summary with manual status kept user-controlled.
- [ ] Package scripts for focused commands and `verify:phase5`.

Existing infrastructure already covers the Storybook web smoke, full component tests, source validation, source extractors, and Phase 2-4 contract tests. A focused research run passed the three existing story-contract suites: 3 suites and 40 tests. [VERIFIED: local Jest run, 2026-09-22]

## Security Domain

`security_enforcement` is enabled at ASVS level 1. This phase adds no network service, credentials, authentication, storage, or product data. Its meaningful security boundary is local untrusted artifact/config parsing and safe child-process/temp-directory handling.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | No authentication surface in the catalogue/audit |
| V3 Session Management | No | No sessions |
| V4 Access Control | No | Local developer tooling only |
| V5 Input Validation | Yes | Fail-closed JSON/schema checks; exact status unions; bounded Penpot parser; safe resolved paths |
| V6 Cryptography | No | Use existing SHA-256 integrity evidence; do not add cryptographic logic |

### Known Threat Patterns for This Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Path traversal or archive bomb in `.penpot` input | Tampering / Denial of Service | Reuse `penpot-source.mjs`, which quotes limits `maxArchiveBytes: 64 * 1024 * 1024`, `maxEntries: 10_000`, and rejects absolute/traversal ZIP paths. [VERIFIED: scripts/penpot-source.mjs:12-18,58-64] |
| Shell injection through output paths or environment values | Tampering | Use `spawn` argument arrays, fixed commands, unique `mkdtemp` paths, and no shell interpolation. |
| Recursive deletion of an unintended path | Tampering / Denial of Service | Delete only the exact path returned by `mkdtemp` inside `finally`; validate it is beneath `os.tmpdir()` and has the Phase 5 prefix. |
| False evidence from stale/tampered report files | Spoofing | Regenerate or validate against live source hashes, exact record IDs, current package scripts, and controlled mutation self-tests. |
| Storybook accidentally included in production | Information Disclosure / Tampering | Inspect actual disabled iOS and Android export source maps; fail on any Storybook source. |
| Orphaned dev server/process | Denial of Service | Reuse bounded timeouts and proven process-tree cleanup from the web smoke script. |

## Sources

### Primary (HIGH confidence)

- Repository source files cited inline: `package.json`, `metro.config.js`, `.rnstorybook/*`, `storyContract.ts`, source registries, Penpot manifests, tests, and validation scripts.
- Installed `@storybook/react-native@10.5.0` implementation and README, inspected directly in `node_modules`.
- Executed local disabled/enabled Expo production export probes and focused Jest contract tests on 2026-09-22.

### Secondary (MEDIUM confidence)

- https://github.com/storybookjs/react-native/blob/next/docs/docs/intro/getting-started/index.md - entry-point swapping and Windows `cross-env` guidance.
- https://docs.expo.dev/guides/analyzing-bundles/ - source-map production exports for bundle analysis.
- https://docs.expo.dev/tutorial/create-your-first-app/ - physical-device QR launch workflow.
- https://docs.expo.dev/get-started/set-up-your-environment/?device=physical&mode=expo-go&platform=ios - physical iOS environment/account workflow.

### Tertiary (LOW confidence)

- None used for prescriptions.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - exact installed manifest, lock-era project decisions, and local implementation inspected.
- Architecture: HIGH - extends existing extractors, contracts, tests, export commands, and verified smoke patterns.
- Production exclusion: HIGH - official approach cross-checked with installed code and positive/negative local export probes.
- Native physical launch: MEDIUM - official current Expo guidance, but actual device/account availability is user-controlled and unobserved.
- Pitfalls: HIGH for repository-specific risks; MEDIUM for external device workflow constraints.

**Research date:** 2026-09-22  
**Valid until:** 2026-10-22 for repository architecture; re-check Expo/Storybook device guidance if execution occurs later.
