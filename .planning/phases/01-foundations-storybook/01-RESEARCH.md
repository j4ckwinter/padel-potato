# Phase 1: Foundations Storybook - Research

**Researched:** 2026-09-17
**Domain:** Expo/React Native Storybook foundation-token catalogue with Penpot provenance
**Confidence:** MEDIUM

## User Constraints

No phase `CONTEXT.md` exists. The following project constraints are therefore controlling.

### Locked Decisions

- Mobile-only, native-first iOS and Android; React Native with Expo; React Native Storybook as the independently reviewable workbench. [VERIFIED: `AGENTS.md:15-20`]
- Penpot foundations and component libraries are the design authority; implementation may not invent or silently substitute values. [VERIFIED: `AGENTS.md:18-19`]
- Provide a locally browser-accessible catalogue through Expo web, but native behavior remains authoritative and pixel-perfect browser parity is out of scope. [VERIFIED: `AGENTS.md:19-20`]
- Use Expo SDK `~57.0.23`, React Native `0.86.3`, React `19.2.3`, TypeScript `~5.9`, and Storybook packages `10.6.0`; do not add `@storybook/react-native-web-vite` in this milestone. [VERIFIED: `AGENTS.md:34-51`]
- No database, product screens, navigation, backend behavior, persistence, or runtime app integration belongs in this phase. [VERIFIED: `AGENTS.md:57`; `.planning/ROADMAP.md:24-32`]

### the agent's Discretion

- File naming beneath `design-spec/` and `src/design-system/`, test-file granularity, manifest serialization details, and the exact Storybook story split are implementation choices provided they preserve traceability and the complete foundation catalogue. [ASSUMED]

### Deferred Ideas (OUT OF SCOPE)

- Native iOS and Android catalogue acceptance, production Storybook exclusion, product screens, navigation, backend behavior, persistence, hosted Storybook, pixel-perfect web parity, and automated visual-diff CI. [VERIFIED: `.planning/REQUIREMENTS.md:11-15`; `.planning/PROJECT.md:33-37`]

<phase_requirements>
## Phase Requirements

The phase requirement IDs and descriptions below are quoted verbatim from the project source of truth. [VERIFIED: `.planning/REQUIREMENTS.md:10-31`]

DATA_P4D3L901_START

| ID | Description | Research Support |
|----|-------------|------------------|
| WORK-01 | Developer can install and run the version-locked Expo/React Native TypeScript project. | Use the Expo-owned version matrix, a committed lockfile, pinned Node, and a root bootstrap that preserves `.planning/`. |
| WORK-04 | Developer can browse the shared Storybook stories locally through Expo web. | Run the native Storybook entry through Expo web first; do not create a second Vite catalogue. |
| WORK-06 | Developer can validate dependency compatibility through automated Expo health checks. | Gate all implementation behind `expo install --check` and `expo-doctor`; see the blocking Storybook peer conflict below. |
| PNPT-01 | Developer can generate a versioned manifest of Penpot foundations, components, variant axes, states, and source IDs through the Penpot MCP. | Add a read-only extraction task and checked-in normalized manifest. |
| PNPT-02 | Every implemented token and component is traceable to its authoritative Penpot source. | Preserve file/page/source IDs alongside each normalized token. |
| PNPT-03 | Developer can export and retain Penpot reference renders used for visual verification. | Export the page and/or section boards and store named references beside a capture ledger. |
| PNPT-04 | Every intentional implementation difference is recorded with its source, platform, reason, and disposition. | Define a deviation ledger schema before implementation. |
| FNDT-01 | Developer can use all 15 Penpot colors through named design tokens. | Extraction and tests must assert exactly 15 source-backed color records. |
| FNDT-02 | Developer can use all 9 Penpot typography styles through reusable typed styles. | Extraction and tests must assert exactly 9 source-backed typography records. |
| FNDT-03 | Developer can use all Penpot spacing, radius, dimension, border-width, and opacity values through named tokens. | Generate typed modules for every category and compare them to the manifest. |
| FNDT-04 | Components consume semantic tokens rather than embedding unexplained design literals. | Keep raw values in token modules; lint/test source for unexplained literals outside tokens. |
| FNDT-05 | Fonts render with the intended families, weights, and metrics on iOS and Android. | Inventory font files and names, then gate Storybook rendering on font readiness. |
| FNDT-06 | Storybook contains navigable foundation stories showing colors, typography, spacing, radii, dimensions, borders, and opacity. | Use stable `Foundations/*` CSF titles and a complete category story set. |

DATA_P4D3L901_END
</phase_requirements>

## Summary

Plan this as three sequential gates: (1) establish an Expo 57/Storybook lockfile that passes health checks, (2) wake and read the authoritative Penpot page into versioned evidence, then (3) implement typed tokens and a Storybook-only gallery with automated completeness tests. The one-way dependency direction should be `Penpot evidence -> normalized manifest -> typed tokens -> foundation specimens -> stories/tests`; runtime code must never query Penpot. [VERIFIED: `.planning/ROADMAP.md:23-32`; CITED: https://help.penpot.app/mcp/]

The current locked dependency set is not installable while also satisfying Expo's compatibility check. `@storybook/react-native@10.6.0` declares `react-native-safe-area-context@5.8.0`, while Expo `57.0.23` expects `~5.7.0`. A clean lockfile probe with `~5.7.0` failed `ERESOLVE`; a full install with `5.8.0` completed, but `expo-doctor` reported `19/21` checks and the minor-version mismatch. [VERIFIED: npm registry metadata + local `npm install`/`expo-doctor` probes, 2026-09-17] Do not hide this using `--force`, `--legacy-peer-deps`, or `expo.install.exclude`; the planner needs a Wave 0 human decision to change one locked version or accept a documented exception. [ASSUMED]

Penpot MCP was callable but the connected browser tab was suspended (`no heartbeat for 58s`), so live token values and reference renders could not be retrieved. The authoritative scope that can be stated now is: file `c514c1fb-1cda-8125-8008-a606253a77a3`, page `482a7222-5a3b-8086-8008-a6072bd7e924` (`01 Foundations`), exactly 15 colors, exactly 9 typography styles, and all authored spacing, radius, dimension, border-width, and opacity values. [VERIFIED: `.planning/PROJECT.md:44-48`; `.planning/REQUIREMENTS.md:26-31`] Live read-only extraction is therefore the first design task, not a later polish task.

**Primary recommendation:** Make Plan 01 a dependency/Penpot evidence gate and Plan 02 the typed-token plus Storybook gallery implementation; begin no design-value coding until both the dependency health gate and Penpot manifest gate pass.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Expo/Storybook bootstrap | Browser / Client | Frontend tooling | Metro swaps the app entry to Storybook and Expo web renders the same React Native source. [CITED: https://storybookjs.github.io/react-native/docs/intro/getting-started/] |
| Penpot extraction and reference export | Design tooling / evidence | Repository storage | MCP reads pages, styles, tokens, and shapes; checked-in artifacts are evidence, not runtime dependencies. [CITED: https://help.penpot.app/mcp/] |
| Typed foundation tokens | Browser / Client | — | React Native style consumers require static local values and types. [VERIFIED: project architecture decision in `.planning/research/SUMMARY.md`] |
| Foundation gallery | Browser / Client | Expo web | CSF stories render native components through the Storybook entry; web is a secondary review surface. [CITED: https://storybookjs.github.io/react-native/docs/intro/] |
| Completeness/traceability checks | Test/tooling | Repository evidence | Tests compare the manifest and exported token/category surface without involving product runtime. [ASSUMED] |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Node.js | `>=22.13.x` (use installed `24.20.0` or pin a Node 22 LTS patch) | Toolchain | Expo 57's compatibility table sets Node `22.13.x` as the minimum. [CITED: https://docs.expo.dev/versions/latest/] |
| `expo` | `~57.0.23` | Runtime, CLI, Metro, web | Project lock; npm confirmed `57.0.23`. [VERIFIED: npm registry; `AGENTS.md:34-39`] [WARNING: legitimacy seam flags latest release as too new — checkpoint required.] |
| `react-native` / `react` | `0.86.3` / `19.2.3` | Native renderer/component model | Expo 57 owns this compatibility pair. [CITED: https://docs.expo.dev/versions/latest/] [WARNING: legitimacy seam flags latest releases as too new — checkpoint required.] |
| TypeScript | Expo-resolved `~5.9` | Typed token/style contracts | Extend `expo/tsconfig.base` with `strict: true`. [VERIFIED: `AGENTS.md:38`] |
| `@storybook/react-native` / `storybook` | Locked `10.6.0`, **blocked pending Wave 0 resolution** | Story discovery and native catalogue | Official v10 setup supports Expo, entry-point swapping, and basic web. [CITED: https://storybookjs.github.io/react-native/docs/intro/getting-started/] [WARNING: SUS/peer conflict — human verification required.] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `react-dom`, `react-native-web`, `@expo/metro-runtime` | `19.2.3`, `~0.21.0`, `~57.0.15` | Expo web | Install through `expo install`; launch with `expo start --web`. [CITED: https://docs.expo.dev/workflow/web/] |
| `cross-env` | `10.1.0` | Cross-platform `STORYBOOK_ENABLED` script | Required because development occurs on Windows and scripts must also work on POSIX. [VERIFIED: npm registry; `AGENTS.md:51`] |
| on-device controls/actions/backgrounds | `10.6.0` locked | Catalogue UI | List under `deviceAddons`, not generic `addons`. [CITED: https://storybookjs.github.io/react-native/docs/intro/configuration/] [WARNING: SUS — checkpoint required.] |
| `expo-font` | Expo-resolved `~57.0.4` | Cross-platform local font loading | Prefer `useFonts` for this phase because it supports Expo Go and web; do not render specimens until loaded/error is settled. [CITED: https://docs.expo.dev/develop/user-interface/fonts/] [WARNING: SUS — checkpoint required.] |
| `jest-expo`, `@testing-library/react-native` | `~57.0.5`, `14.0.1` | Unit/component tests | Use for manifest completeness, token exports, and rendered specimen semantics. [CITED: https://docs.expo.dev/develop/unit-testing/] |
| ESLint / `eslint-config-expo` | template-aligned | Static checks | Keep the Expo template configuration. [VERIFIED: `AGENTS.md:75`] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native Storybook through Expo web | `@storybook/react-native-web-vite` | Provides fuller browser Storybook features but creates a second configuration; explicitly deferred. [VERIFIED: `AGENTS.md:50`; CITED: https://storybookjs.github.io/react-native/docs/intro/] |
| Runtime `useFonts` | `expo-font` config plugin | Fonts are immediately native-available, but the plugin needs a development build and does not embed web fonts; premature for Phase 1's Expo Go/web lane. [CITED: https://docs.expo.dev/develop/user-interface/fonts/] |
| Source-backed tokens | NativeWind/UI kit/CSS-in-JS | Adds an abstraction and design language not authorized by Penpot. [VERIFIED: `AGENTS.md:87`] |

**Installation sequence (after the Wave 0 version decision):**

```bash
# Bootstrap a blank TypeScript Expo app in a temporary child directory because the repo root is non-empty.
npx create-expo-app@latest .expo-bootstrap --template blank-typescript --no-install

# Promote generated app files deliberately, preserving .git, .planning, and AGENTS.md; then install.
npm install
npx expo install react-dom react-native-web @expo/metro-runtime expo-font
npm create storybook@latest
npx expo install --check
npx expo-doctor@latest
```

The generated app-file promotion procedure is repository-specific and must be spelled out in the plan; do not recursively overwrite the root. [ASSUMED]

## Package Legitimacy Audit

The seam checked registry existence, age, downloads, source repository, deprecation, and postinstall metadata on 2026-09-17. No checked package exposed a registry `postinstall` script; the transitive `esbuild` package did report one during the probe and must remain lockfile/audit controlled. [VERIFIED: npm registry + local install probe]

| Package group | Registry | Downloads/week | Source Repo | Verdict | Disposition |
|---------------|----------|----------------|-------------|---------|-------------|
| `create-expo-app` | npm | 59,577 | `github.com/expo/expo` | OK | Approved [VERIFIED: npm registry] |
| `expo`, `react`, `react-native`, `react-dom`, `@expo/metro-runtime`, `expo-font`, `jest-expo` | npm | 2.2M–128M | Official Expo/React repos | SUS (`too-new`) | Flagged — planner adds human verification before install |
| `storybook`, `@storybook/react-native`, on-device addons | npm | 126K–15.9M | Official Storybook repos | SUS (`too-new`) | Flagged — planner adds human verification; peer conflict must be resolved |
| `cross-env`, `react-native-web`, TypeScript, RNTL | npm | 2.9M–203M | Established source repos | OK | Approved [VERIFIED: npm registry] |
| Storybook native peers | npm | 1M–7.1M | Established RN community repos | Mixed: one OK, six SUS (`too-new`) | Install only Expo-aligned versions through `expo install`; checkpoint required |
| `expo-template-storybook` | npm | 39 | none | SUS (`low-downloads`, `no-repository`) | Do not use; registry contents target Expo 54 and include Vite, contrary to this phase |

**Packages removed due to SLOP verdict:** none.

**Packages flagged as suspicious (SUS):** Expo/React current releases, Storybook 10.6 packages, Expo-managed native peers, Prettier 3.9.7, and `expo-template-storybook`; the planner must insert `checkpoint:human-verify` before installation.

## Architecture Patterns

### System Architecture Diagram

```text
Penpot file/page (read-only MCP)
        |
        +--> normalized manifest + source IDs ----> typed token modules
        |                    |                           |
        +--> reference PNGs  +--> deviation ledger      v
                                               foundation specimen components
                                                          |
                                                          v
                                              colocated CSF stories
                                                          |
                                      +-------------------+------------------+
                                      v                                      v
                         Metro native Storybook                    Expo web Storybook
                         (future native authority)                 (Phase 1 smoke/review)
```

### Recommended Project Structure

```text
.rnstorybook/
├── main.ts                 # story globs + deviceAddons
├── preview.tsx             # global background/layout only
└── index.tsx               # generated/native Storybook UI entry
design-spec/
├── penpot-foundations.json # normalized source IDs and resolved values
├── references/foundations/ # exported authoritative renders
└── deviations.json         # source/platform/reason/disposition ledger
src/design-system/
├── tokens/
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   ├── radii.ts
│   ├── dimensions.ts
│   ├── borders.ts
│   ├── opacity.ts
│   └── index.ts
└── foundations/
    ├── FoundationGallery.tsx
    └── FoundationGallery.stories.tsx
tests/
├── penpot-manifest.test.ts
├── tokens.test.ts
└── foundations-story.test.tsx
```

This structure is a phase-specific recommendation, not an existing repository fact. [ASSUMED]

### Pattern 1: Entry-point swapping

**What:** Wrap Expo's Metro config using the bundler-agnostic Storybook wrapper. With `STORYBOOK_ENABLED=true`, it swaps to Storybook; otherwise it is a no-op. [CITED: https://storybookjs.github.io/react-native/docs/intro/getting-started/]

```javascript
// Source: official React Native Storybook configuration docs
const { getDefaultConfig } = require('expo/metro-config');
const { withStorybook } = require('@storybook/react-native/withStorybook');

const config = getDefaultConfig(__dirname);
module.exports = withStorybook(config);
```

### Pattern 2: Stable foundation taxonomy

**What:** Discover colocated stories with `.rnstorybook/main.ts`, use `deviceAddons`, and assign stable titles such as `Foundations/Colors` and `Foundations/Typography`. The generated `storybook.requires.ts` must not be edited manually. [CITED: https://storybookjs.github.io/react-native/docs/intro/configuration/]

### Pattern 3: Evidence before code

**What:** Extract `name`, `type`, raw value, resolved value, token set/theme, Penpot source ID, file ID, and page ID into a normalized manifest; then transcribe/codegen typed modules from that reviewed artifact. Export reference images at the same revision and record hashes or stable filenames. [CITED: https://help.penpot.app/mcp/; CITED: https://help.penpot.app/user-guide/design-systems/design-tokens/]

### Pattern 4: Font readiness gate

**What:** Load local OTF/TTF files once at the Storybook root/decorator and render no typography specimens while `useFonts` is pending. Verify actual family/PostScript names and every authored weight; do not synthesize unavailable weights. [CITED: https://docs.expo.dev/develop/user-interface/fonts/]

### Anti-Patterns to Avoid

- **Bypassing the peer conflict:** `--force`, `--legacy-peer-deps`, or doctor exclusions make WORK-06 untrustworthy. [VERIFIED: failing compatibility probe]
- **Using the Storybook Expo template:** current registry template is Expo 54 and includes a Vite Storybook; it conflicts with Expo 57 and the deferred-Vite decision. [VERIFIED: npm registry metadata]
- **Runtime Penpot access:** evidence is build/review input, never an application dependency. [VERIFIED: project research architecture]
- **Literal values in gallery code:** all visual literals belong in the source-backed token layer; gallery components consume semantic exports. [VERIFIED: `.planning/REQUIREMENTS.md:28-30`]
- **One giant screenshot as coverage:** retain structured manifest assertions and separate navigable category stories; a visual reference alone cannot prove token completeness. [ASSUMED]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Expo/RN version selection | Custom compatibility matrix | `expo install`, `expo install --check`, `expo-doctor` | Expo owns SDK-native dependency alignment. [CITED: https://docs.expo.dev/develop/tools/] |
| Story discovery/entry switching | Custom Metro resolver and manual story registry | `withStorybook` and generated `storybook.requires.ts` | Official wrapper handles entry swapping, resolver behavior, generation, and web/native paths. [CITED: https://storybookjs.github.io/react-native/docs/intro/configuration/metro-configuration/] |
| Cross-platform font loader | Ad-hoc asset promises | `expo-font` `useFonts` | Official loader supports Android, iOS, web, and Expo Go. [CITED: https://docs.expo.dev/develop/user-interface/fonts/] |
| Design token exchange | Scraped screenshots or invented schema | Penpot MCP/token APIs plus normalized checked-in manifest | Penpot exposes tokens/styles and DTCG-compatible export concepts. [CITED: https://help.penpot.app/mcp/; CITED: https://help.penpot.app/user-guide/design-systems/design-tokens/] |
| React Native component rendering tests | `react-test-renderer` | React Native Testing Library + `jest-expo` | Expo documents the former as deprecated for React 19+. [CITED: https://docs.expo.dev/develop/unit-testing/] |

**Key insight:** the hard parts are provenance, dependency alignment, font metrics, and repeatable evidence—not rendering colored rectangles—so reuse official seams and spend custom code only on the Padel Potato token contract and gallery.

## Common Pitfalls

### Pitfall 1: Treating a successful npm install as compatibility

**What goes wrong:** npm can install Storybook 10.6 with safe-area 5.8, but Expo Doctor rejects that package against SDK 57. [VERIFIED: local probe]

**How to avoid:** require a clean install, `npm ls`, `npx expo install --check`, `npx expo-doctor@latest`, typecheck, and web launch before token work.

**Warning signs:** peer overrides, doctor exclusions, mixed Storybook patches, or a lockfile containing multiple Storybook UI package patches.

### Pitfall 2: MCP values inferred from a screenshot

**What goes wrong:** counts may look correct while names, aliases, resolved values, IDs, or font metadata are wrong. [ASSUMED]

**How to avoid:** wake the Penpot tab, verify the active file/page IDs, inspect read-only, save a versioned structured manifest, and export references before coding.

**Warning signs:** tokens without source IDs; unexplained hex/numeric values; manifest authored by hand without an MCP capture record.

### Pitfall 3: Font fallback accepted as fidelity

**What goes wrong:** asynchronous loading or wrong family names changes wrap, line height, and specimen metrics. Expo documents platform-specific naming behavior. [CITED: https://docs.expo.dev/develop/user-interface/fonts/]

**How to avoid:** keep licensed local OTF/TTF files, map actual family/weight names, gate rendering, and capture both native platforms later.

**Warning signs:** specimen shift after initial load, synthesized bold, clipped descenders, or browser/native line breaks that differ without a logged disposition.

### Pitfall 4: Web catalogue becomes a second product

**What goes wrong:** adding Vite, docs infrastructure, or browser-specific styling creates two catalogues and undermines native-first decisions. [VERIFIED: `AGENTS.md:50`; `.planning/PROJECT.md:37`]

**How to avoid:** first prove `cross-env STORYBOOK_ENABLED=true expo start --web`; accept platform rendering differences and log only relevant deviations.

### Pitfall 5: Bootstrap overwrites planning artifacts

**What goes wrong:** `create-expo-app` is aimed at a project directory, while this root already contains `.git`, `.planning`, and `AGENTS.md`. [VERIFIED: repository inventory]

**How to avoid:** scaffold in a temporary child directory and explicitly promote only application files; review `git status` before install/commit.

## Code Examples

### Story discovery with device addons

```typescript
// Source: https://storybookjs.github.io/react-native/docs/intro/configuration/
import type { StorybookConfig } from '@storybook/react-native';

const main: StorybookConfig = {
  stories: ['../src/**/*.stories.?(ts|tsx|js|jsx)'],
  deviceAddons: [
    '@storybook/addon-ondevice-controls',
    '@storybook/addon-ondevice-backgrounds',
    '@storybook/addon-ondevice-actions',
  ],
};

export default main;
```

### Typed immutable token module

```typescript
// Project-specific pattern; values must come from the reviewed Penpot manifest.
export const colors = {
  // semanticName: '#RRGGBB',
} as const;

export type ColorToken = keyof typeof colors;
```

The empty example is deliberate because live Penpot values were unavailable; inserting sample names or values would violate the design-authority constraint. [VERIFIED: `AGENTS.md:18`]

### Runtime font gate

```typescript
// Source pattern: https://docs.expo.dev/develop/user-interface/fonts/
import { useFonts } from 'expo-font';

export function FoundationsRoot() {
  const [loaded, error] = useFonts({
    // Exact family-to-file mappings come from the Phase 1 font inventory.
  });

  if (!loaded && !error) return null;
  return null; // Replace with the Storybook decorator child in implementation.
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Import Storybook UI into `App.tsx`/navigation | Bundler entry-point swapping with `withStorybook` | Storybook React Native v10 docs | Storybook remains isolated and is omitted when disabled. [CITED: https://storybookjs.github.io/react-native/docs/intro/getting-started/] |
| On-device addons under generic `addons` | `deviceAddons` | Current v10 configuration | Prevents device-only packages from being evaluated as core presets. [CITED: https://storybookjs.github.io/react-native/docs/intro/configuration/] |
| `react-test-renderer` | React Native Testing Library | React 19 era | Expo marks the old renderer deprecated for React 19+. [CITED: https://docs.expo.dev/develop/unit-testing/] |
| Screenshot-derived tokens | Penpot token/MCP extraction and DTCG-shaped evidence | Current Penpot docs | Preserves names, aliases, values, and source traceability. [CITED: https://help.penpot.app/user-guide/design-systems/design-tokens/] |

**Deprecated/outdated:** `react-test-renderer` for this React 19 stack; in-app Storybook navigation for this phase; `expo-template-storybook@7.0.0` for this Expo 57 project. [CITED: https://docs.expo.dev/develop/unit-testing/; VERIFIED: npm registry]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Proposed repository paths and story/test split are suitable for the greenfield root. | Architecture Patterns | Low; planner can rename while preserving boundaries. |
| A2 | The phase can use runtime `useFonts` rather than requiring native embedding. | Standard Stack | Medium; a Penpot font or licensing constraint may require a development build. |
| A3 | Separate category stories plus an aggregate gallery best represent the supplied foundation screen. | Architecture Patterns | Low; live Penpot structure may suggest a different story split. |
| A4 | `--force`, legacy peer resolution, and doctor exclusions are unacceptable ways to claim WORK-06. | Summary | High; a project owner could explicitly approve a documented exception. |

## Open Questions

1. **Which locked version changes to resolve Expo 57 / Storybook 10.6?**
   - What we know: exact pins produce `ERESOLVE` with safe-area 5.7; safe-area 5.8 installs but fails Expo Doctor. [VERIFIED: local probes]
   - What's unclear: whether the owner prefers a vetted earlier Storybook patch, a later compatible Expo SDK, or an explicit Expo validation exclusion.
   - Recommendation: Wave 0 human checkpoint; select a combination that installs without peer overrides and yields all Expo Doctor checks passing before implementation.

2. **What are the exact Penpot token names/values and font assets?**
   - What we know: authoritative file/page IDs and counts of 15 colors and 9 typography styles. [VERIFIED: `.planning/PROJECT.md:44-48`; `.planning/REQUIREMENTS.md:26-31`]
   - What's unclear: actual names, values, aliases, remaining category counts, source-node IDs, font files, and metrics because the MCP tab was suspended.
   - Recommendation: execution begins by waking/focusing Penpot and saving the read-only extraction plus reference exports; do not estimate.

3. **Does the native Storybook entry provide sufficient Expo-web navigation in the final resolved versions?**
   - What we know: official Storybook docs support running native Storybook directly on web. [CITED: https://storybookjs.github.io/react-native/docs/intro/]
   - What's unclear: this exact unresolved Expo/Storybook lockfile has not been launched.
   - Recommendation: make a representative `Foundations/Smoke` story the first web acceptance probe; do not add Vite unless the locked project decision is revisited.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node.js | Expo/Storybook | ✓ | `24.20.0` | Pin Node 22 LTS if team tooling rejects Node 24 |
| npm | package install | ✓ | `11.19.0` | — |
| Expo CLI | Expo commands | ✓ through `npx` | `57.0.25` CLI reported | project-local Expo CLI after install |
| Git | source control | ✓ | `2.30.0.windows.2` | — |
| Penpot MCP tools | provenance | ✓, but active tab unavailable | plugin heartbeat suspended | execution-time wake/focus; no value-inference fallback |
| iOS Simulator | later native validation | ✗ on Windows | — | physical iPhone/EAS or macOS runner, Phase 5 |

**Missing dependencies with no fallback:** active Penpot page connection for authoritative token values and reference exports.

**Missing dependencies with fallback:** local iOS simulator is not required to close this web-focused phase; native acceptance is mapped to Phase 5. [VERIFIED: `.planning/REQUIREMENTS.md:11-12`]

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | `jest-expo ~57.0.5` + `@testing-library/react-native 14.0.1` |
| Config file | none — create in Wave 0 |
| Quick run command | `npm test -- --runInBand tests/tokens.test.ts tests/penpot-manifest.test.ts` |
| Full suite command | `npm run typecheck && npm run lint && npm test -- --runInBand && npx expo install --check && npx expo-doctor@latest` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| WORK-01 | Locked Expo/RN project installs and typechecks | smoke | `npm ci && npm run typecheck` | ❌ Wave 0 |
| WORK-04 | Expo web serves and discovers foundation stories | smoke/manual browser | `npm run storybook:web` plus browser check | ❌ Wave 0 |
| WORK-06 | Dependency set passes Expo validation | tooling | `npx expo install --check && npx expo-doctor@latest` | ❌ Wave 0 |
| PNPT-01 | Versioned manifest contains foundation categories/source IDs | schema/unit | `npm test -- penpot-manifest.test.ts` | ❌ Wave 0 |
| PNPT-02 | Every code token maps to a source record | unit | `npm test -- tokens.test.ts` | ❌ Wave 0 |
| PNPT-03 | Reference render paths exist and are recorded | unit/file | `npm test -- penpot-manifest.test.ts` | ❌ Wave 0 |
| PNPT-04 | Deviation entries contain source/platform/reason/disposition | schema/unit | `npm test -- deviations.test.ts` | ❌ Wave 0 |
| FNDT-01 | Exactly 15 color records export through named tokens | unit | `npm test -- tokens.test.ts` | ❌ Wave 0 |
| FNDT-02 | Exactly 9 typography records export through typed styles | unit | `npm test -- tokens.test.ts` | ❌ Wave 0 |
| FNDT-03 | Every manifest category value is exported | unit | `npm test -- tokens.test.ts` | ❌ Wave 0 |
| FNDT-04 | Gallery imports semantic tokens and has no unexplained literals | lint/unit | `npm run lint && npm test -- tokens.test.ts` | ❌ Wave 0 |
| FNDT-05 | Font gate and all authored family/weight mappings render | component/manual native follow-up | `npm test -- typography.test.tsx` | ❌ Wave 0 |
| FNDT-06 | Every foundation category is discoverable/renderable | component/web smoke | `npm test -- foundations-story.test.tsx` plus browser check | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `npm run typecheck && npm test -- --runInBand <affected test>`
- **Per wave merge:** full suite command above.
- **Phase gate:** full suite green, Expo web catalogue manually browsed, Penpot evidence present, and every difference closed or logged before `$gsd-verify-work`.

### Wave 0 Gaps

- [ ] Resolve the Expo 57 / Storybook 10.6 peer conflict and commit a clean lockfile.
- [ ] Add Jest Expo/RNTL config and the manifest/token/story test files listed above.
- [ ] Add `typecheck`, `lint`, `test`, `storybook`, and `storybook:web` scripts.
- [ ] Add a deterministic browser smoke procedure (start server, open catalogue, verify story index and representative story render).
- [ ] Wake Penpot MCP and generate the authoritative manifest/references before token implementation.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | No auth or remote account workflow in phase. [VERIFIED: `.planning/ROADMAP.md:32`] |
| V3 Session Management | no | No application session exists. [VERIFIED: `.planning/ROADMAP.md:32`] |
| V4 Access Control | no | No backend/resource authorization exists. [VERIFIED: `.planning/ROADMAP.md:32`] |
| V5 Input Validation | yes | Treat MCP-returned names/values/paths as data; schema-validate normalized JSON and constrain output paths inside `design-spec/`. [CITED: https://devguide.owasp.org/en/06-verification/01-guides/03-asvs/] |
| V6 Cryptography | no | No secrets or cryptographic functions are introduced. [VERIFIED: phase scope] |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Dependency substitution/unsafe fresh package | Tampering | Commit lockfile; use official CLI/docs; run legitimacy, audit, `expo-doctor`, and human checkpoint for SUS packages. [CITED: https://scvs.owasp.org/scvs/using-scvs/] |
| MCP data writes outside evidence scope | Tampering | Read-only Penpot operations; fixed file/page IDs; schema validation; explicit output allowlist. [CITED: https://help.penpot.app/mcp/] |
| Unreviewed generated artifact changes | Repudiation | Commit versioned manifests/references/deviation ledger with source IDs and review metadata. [ASSUMED] |

## Project Constraints (from AGENTS.md)

- Target iOS and Android only; preserve native-first behavior. [VERIFIED: `AGENTS.md:15-16`]
- Use React Native with Expo and React Native Storybook. [VERIFIED: `AGENTS.md:16-17`]
- Penpot is authoritative; do not invent or silently substitute design values. [VERIFIED: `AGENTS.md:18`]
- Compare Penpot MCP specs/reference renders with native Storybook output; source inspection alone is insufficient for eventual native fidelity. [VERIFIED: `AGENTS.md:19`]
- Supply a local Expo-web catalogue without compromising native behavior or pursuing pixel-perfect web parity. [VERIFIED: `AGENTS.md:20`]
- Retain the Expo template lint config, strict TypeScript, Metro through `expo/metro-config`, exact Storybook patch alignment, and no database. [VERIFIED: `AGENTS.md:34-57`; `AGENTS.md:72-76`]
- No project skills are defined; repository conventions/architecture are not yet established. [VERIFIED: `AGENTS.md:116-125`]
- This research write is performed through the orchestrated GSD phase-research workflow; execution edits must later use `$gsd-execute-phase`. [VERIFIED: `AGENTS.md` workflow section]

## Sources

### Primary (HIGH/MEDIUM confidence)

- [Expo SDK compatibility table](https://docs.expo.dev/versions/latest/) — SDK/RN/React/RNW/Node matrix.
- [Expo web](https://docs.expo.dev/workflow/web/) — web dependencies and launch command.
- [Expo development tools](https://docs.expo.dev/develop/tools/) — Expo Doctor behavior.
- [Expo fonts](https://docs.expo.dev/develop/user-interface/fonts/) — local font formats, config plugin, and runtime `useFonts` gate.
- [Expo unit testing](https://docs.expo.dev/develop/unit-testing/) — Jest Expo and RNTL guidance.
- [React Native Storybook getting started](https://storybookjs.github.io/react-native/docs/intro/getting-started/) — CLI setup and entry swapping.
- [React Native Storybook configuration](https://storybookjs.github.io/react-native/docs/intro/configuration/) — file roles, globs, device addons, generated file.
- [React Native Storybook Metro configuration](https://storybookjs.github.io/react-native/docs/intro/configuration/metro-configuration/) — wrapper and production behavior.
- [Penpot MCP](https://help.penpot.app/mcp/) — connection model, read/write capabilities, exports, and read-only safety.
- [Penpot design tokens](https://help.penpot.app/user-guide/design-systems/design-tokens/) — token types and DTCG export.
- npm registry metadata and local clean-room npm/Expo Doctor probes — exact versions, peer dependencies, legitimacy signals, and the Expo/Storybook conflict.

### Secondary (MEDIUM confidence)

- [OWASP ASVS guide](https://devguide.owasp.org/en/06-verification/01-guides/03-asvs/) — applicable category mapping.
- [OWASP SCVS](https://scvs.owasp.org/scvs/using-scvs/) — package-management and provenance controls.

### Tertiary (LOW confidence)

- None used as authoritative evidence; all `[ASSUMED]` items are listed in the Assumptions Log.

## Metadata

**Confidence breakdown:**

- Standard stack: MEDIUM — official docs and registry verified, but the locked Expo/Storybook versions conflict.
- Architecture: MEDIUM — official framework patterns are clear; repository structure is a greenfield recommendation.
- Penpot values: LOW — connector exists, but the active tab was suspended; only project-recorded IDs/counts are verified.
- Pitfalls: HIGH for dependency conflict, MEDIUM for design/font workflow.

**Research date:** 2026-09-17
**Valid until:** 2026-09-24 for dependency versions; 2026-10-17 for stable architecture patterns.
