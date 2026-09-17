# Phase 1: Foundations Storybook - Pattern Map

**Mapped:** 2026-09-17
**Files analyzed:** 29 proposed files/artifact groups
**Analogs found:** 0 / 29

## Repository Baseline

This repository is greenfield. `git ls-files` contains `AGENTS.md` and planning artifacts only; there are no tracked application, configuration, component, token, Storybook, or test files to use as implementation analogs. The architecture and conventions sections in `AGENTS.md` also state that patterns have not yet been established.

Consequently, every assignment below is marked **no analog**. Planning documents are cited as implementation guidance, but are not misrepresented as codebase analogs. The first implementation of each role will establish the local convention for later phases.

## File Classification

| New/Modified File | Role | Data Flow | Closest Tracked Code Analog | Match Quality |
|---|---|---|---|---|
| `.nvmrc` | config | batch | none | no analog |
| `package.json` | config | batch | none | no analog |
| `package-lock.json` | config | batch | none | no analog |
| `app.json` | config | batch | none | no analog |
| `tsconfig.json` | config | transform | none | no analog |
| `eslint.config.js` | config | transform | none | no analog |
| `metro.config.js` | config | transform | none | no analog |
| `App.tsx` | component | request-response | none | no analog |
| `.rnstorybook/main.ts` | config | batch | none | no analog |
| `.rnstorybook/preview.tsx` | provider | request-response | none | no analog |
| `.rnstorybook/index.tsx` | config (generated entry) | request-response | none | no analog |
| `design-spec/penpot-foundations.json` | model/config | batch | none | no analog |
| `design-spec/references/foundations/*` | config/evidence | file-I/O | none | no analog |
| `design-spec/deviations.json` | model/config | batch | none | no analog |
| `assets/fonts/*.{otf,ttf}` | config/asset | file-I/O | none | no analog |
| `src/design-system/tokens/colors.ts` | model | transform | none | no analog |
| `src/design-system/tokens/typography.ts` | model | transform | none | no analog |
| `src/design-system/tokens/spacing.ts` | model | transform | none | no analog |
| `src/design-system/tokens/radii.ts` | model | transform | none | no analog |
| `src/design-system/tokens/dimensions.ts` | model | transform | none | no analog |
| `src/design-system/tokens/borders.ts` | model | transform | none | no analog |
| `src/design-system/tokens/opacity.ts` | model | transform | none | no analog |
| `src/design-system/tokens/index.ts` | utility | transform | none | no analog |
| `src/design-system/foundations/FoundationGallery.tsx` | component | transform | none | no analog |
| `src/design-system/foundations/FoundationGallery.stories.tsx` | component | request-response | none | no analog |
| `tests/penpot-manifest.test.ts` | test | batch | none | no analog |
| `tests/deviations.test.ts` | test | batch | none | no analog |
| `tests/tokens.test.ts` | test | batch | none | no analog |
| `tests/foundations-story.test.tsx` / `tests/typography.test.tsx` | test | request-response | none | no analog |

The bootstrap filenames above are inferred from the research's requirement to create an Expo TypeScript project, retain Expo's generated lint configuration, extend `expo/tsconfig.base`, add npm scripts and a committed lockfile, and configure Metro entry swapping. Exact generated filenames should follow the resolved Expo template rather than being invented manually.

## Pattern Assignments

### Bootstrap and toolchain files

**Files:** `.nvmrc`, `package.json`, `package-lock.json`, `app.json`, `tsconfig.json`, `eslint.config.js`, `App.tsx`

**Analog:** None. No tracked Expo project exists.

**Authoritative fallback:** Generate these from the official blank TypeScript Expo template, then promote files individually into the non-empty repository. Preserve `.git`, `.planning`, and `AGENTS.md`. Research lines 106-116 specify the bootstrap sequence; lines 267-271 describe the overwrite hazard.

**Required conventions:**

- Pin the selected Node runtime and commit the dependency lockfile.
- Extend `expo/tsconfig.base` and enable strict TypeScript (research line 82).
- Retain the Expo template ESLint configuration (research line 94).
- Add `typecheck`, `lint`, `test`, `storybook`, and `storybook:web` scripts (research lines 409-414).
- Use `cross-env` for `STORYBOOK_ENABLED` so scripts work in PowerShell and POSIX shells (research lines 89-90).
- Keep `App.tsx` independent of Storybook. Research line 326 explicitly replaces importing Storybook into the app with Metro entry-point swapping.
- Do not accept `--force`, `--legacy-peer-deps`, or Expo Doctor exclusions as a compatibility solution (research lines 215-218 and 344-347).

**Validation pattern:**

```text
npm ci
npm run typecheck
npm run lint
npm test -- --runInBand
npx expo install --check
npx expo-doctor@latest
```

Source: `.planning/phases/01-foundations-storybook/01-RESEARCH.md` lines 376-407.

---

### `metro.config.js` (config, transform)

**Analog:** None.

**Research fallback** (research lines 190-201):

```javascript
const { getDefaultConfig } = require('expo/metro-config');
const { withStorybook } = require('@storybook/react-native/withStorybook');

const config = getDefaultConfig(__dirname);
module.exports = withStorybook(config);
```

Use the resolved Storybook v10 wrapper API and its environment-based entry swap. Do not build a custom Metro resolver or manual story registry. The exact option that gates Storybook must be verified against the selected compatible package patch before implementation.

---

### `.rnstorybook/main.ts` (config, batch)

**Analog:** None.

**Research fallback** (research lines 275-291):

```typescript
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

Keep on-device packages under `deviceAddons`; use stable `Foundations/*` CSF titles. Do not add the deferred Vite Storybook framework.

---

### `.rnstorybook/preview.tsx` (provider, request-response)

**Analog:** None.

**Research fallback:** The proposed structure assigns this file only global background/layout concerns (research lines 161-164). It is also the appropriate single root/decorator boundary for the font readiness gate described at lines 211-213. Keep design values in token modules, not in preview configuration.

The decorator should render no typography specimens while fonts are pending; expose or fail visibly on a font-load error rather than silently accepting fallback fonts.

---

### `.rnstorybook/index.tsx` (generated config, request-response)

**Analog:** None.

**Research fallback:** Treat this as Storybook-generated/native UI entry output. Research line 205 says generated `storybook.requires.ts` must not be edited manually; the same generated-boundary principle applies here. Only commit generated output if required by the selected Storybook setup, and regenerate it through official tooling.

---

### `design-spec/penpot-foundations.json` (model/config, batch)

**Analog:** None.

**Research fallback:** Evidence precedes code. Normalize each source record with the fields identified in research lines 207-209:

```text
name
type
raw value
resolved value
token set/theme
Penpot source ID
file ID
page ID
```

The manifest must be generated from read-only inspection of Penpot file `c514c1fb-1cda-8125-8008-a606253a77a3`, page `482a7222-5a3b-8086-8008-a6072bd7e924`. Validate MCP-returned names, values, and paths as data, and constrain output paths beneath `design-spec/` (research line 426). Do not infer missing values from screenshots.

---

### `design-spec/references/foundations/*` (evidence, file-I/O)

**Analog:** None.

**Research fallback:** Export named page and/or section renders at the same Penpot revision as the manifest. Record stable filenames or hashes in the manifest/capture ledger (research lines 207-209). These files are retained verification evidence, not runtime imports.

---

### `design-spec/deviations.json` (model/config, batch)

**Analog:** None.

**Research fallback:** Every entry must contain the authoritative source, affected platform, reason, and disposition. Keep an empty valid ledger if there are no deviations; never encode an unexplained implementation difference by changing a token silently. The required fields derive from PNPT-04 and the validation map at research line 395.

---

### `assets/fonts/*.{otf,ttf}` and typography font mapping (asset/model, file-I/O/transform)

**Analog:** None.

**Research fallback** (research lines 306-320):

```typescript
import { useFonts } from 'expo-font';

export function FoundationsRoot() {
  const [loaded, error] = useFonts({
    // Exact family-to-file mappings come from the Phase 1 font inventory.
  });

  if (!loaded && !error) return null;
  return null; // Replace with the Storybook decorator child in implementation.
}
```

Inventory licensed local font files and actual family/PostScript names first. Map every authored weight; do not synthesize missing weights. The placeholder return in the research example is illustrative and must be replaced by the decorator child/error UI.

---

### Token modules (model, transform)

**Files:**

- `src/design-system/tokens/colors.ts`
- `src/design-system/tokens/typography.ts`
- `src/design-system/tokens/spacing.ts`
- `src/design-system/tokens/radii.ts`
- `src/design-system/tokens/dimensions.ts`
- `src/design-system/tokens/borders.ts`
- `src/design-system/tokens/opacity.ts`

**Analog:** None for every module.

**Research fallback** (research lines 293-304):

```typescript
export const colors = {
  // semanticName: '#RRGGBB',
} as const;

export type ColorToken = keyof typeof colors;
```

Apply the immutable `as const` export plus derived key type consistently to each category. Actual names and values must come only from the reviewed manifest. Preserve semantic names and source traceability; do not insert sample tokens or unexplained literals. `typography.ts` should export reusable typed React Native text-style objects and exact font mappings rather than only raw strings.

---

### `src/design-system/tokens/index.ts` (utility, transform)

**Analog:** None.

**Research fallback:** Use a narrow barrel that re-exports each category's public values and types. It must not duplicate values or create a second source of truth. Downstream gallery/components import semantic tokens through this public boundary, enabling later phases to reuse the same contract.

---

### `src/design-system/foundations/FoundationGallery.tsx` (component, transform)

**Analog:** None.

**Research fallback:** Render native React Native specimens from token imports. Cover colors, typography, spacing, radii, dimensions, border widths, and opacity. The data flow is one-way:

```text
Penpot evidence -> normalized manifest -> typed tokens -> specimens
```

Do not access Penpot at runtime, embed unexplained color/dimension literals, or make browser-specific styling the authority. Typography specimens must sit behind the shared font readiness gate.

---

### `src/design-system/foundations/FoundationGallery.stories.tsx` (component, request-response)

**Analog:** None.

**Research fallback:** Use CSF stories discovered by `.rnstorybook/main.ts`. Assign stable titles under `Foundations/*`. The exact split is discretionary: one aggregate gallery plus separate category stories is the research recommendation, but the Penpot structure may justify multiple colocated story files. Every required category must remain independently navigable and renderable.

Do not introduce product screens, navigation, backend data, hosted docs, or a separate Vite catalogue.

---

### Manifest and deviation tests (test, batch)

**Files:** `tests/penpot-manifest.test.ts`, `tests/deviations.test.ts`

**Analog:** None.

**Research fallback:** Use `jest-expo`. Assert:

- the manifest includes all foundation categories and source IDs;
- exactly 15 color records and 9 typography records exist;
- reference paths exist and remain inside the evidence directory;
- every record carries file/page/source provenance;
- deviation entries contain source, platform, reason, and disposition;
- malformed MCP-derived data fails validation.

The manifest test validates evidence completeness, not visual fidelity.

---

### `tests/tokens.test.ts` (test, batch)

**Analog:** None.

**Research fallback:** Compare every token-module export to the reviewed manifest. Assert exact category coverage, names, values, and provenance mapping; assert 15 colors and 9 typography styles. Add a focused guard against unexplained design literals outside token modules, using lint/static inspection only where it is deterministic.

---

### Story and typography tests (test, request-response)

**Files:** `tests/foundations-story.test.tsx`, `tests/typography.test.tsx`

**Analog:** None.

**Research fallback:** Use `jest-expo` with `@testing-library/react-native`, not deprecated `react-test-renderer` (research lines 223-231). Render representative specimens and assert accessible text/content, category presence, and font-loading pending/error/ready behavior. Keep the Expo-web discovery/render check as a separate browser smoke procedure because unit tests do not prove Storybook discovery.

## Shared Patterns

### Evidence Before Implementation

**Source:** `.planning/phases/01-foundations-storybook/01-RESEARCH.md` lines 207-213

**Apply to:** manifest, references, every token module, gallery, and tests

No token coding begins until the Penpot manifest and reference exports exist. Runtime code never queries Penpot.

### One-Way Dependency Direction

**Source:** research summary and architecture diagram, lines 51-63 and 139-156

```text
Penpot evidence
  -> normalized manifest
  -> typed token modules
  -> foundation specimens
  -> Storybook stories and completeness tests
```

Reverse imports are prohibited: tokens do not import gallery code, evidence does not depend on runtime modules, and Storybook configuration does not become application navigation.

### Validation and Error Handling

There is no existing application error pattern. For this phase:

- fail extraction/normalization on invalid source data or unsafe output paths;
- fail tests on missing IDs, values, references, or category coverage;
- surface font-load errors instead of silently rendering fallback typography;
- fail dependency validation rather than suppressing Expo health checks;
- record intentional visual/platform differences in `deviations.json`.

### Generated Files

Generated Storybook registries and lockfiles are outputs of official tools. Do not hand-edit `storybook.requires.ts`, manually construct dependency resolution, or copy generated files from an untracked plugin/runtime mirror.

### Scope Boundary

Phase 1 contains the Expo/Storybook workbench, Penpot foundation evidence, typed foundation tokens, foundation specimens/stories, and their tests. Product components, screens, navigation, authentication, backend behavior, persistence, hosted Storybook, Vite Storybook, native acceptance, and pixel-perfect web parity remain out of scope.

## No Analog Found

All proposed files lack a tracked code analog because the repository contains no implementation code yet. The planner should use the cited research patterns and official template/tool output while treating Phase 1 as the convention-establishing phase.

| File Group | Reason |
|---|---|
| Expo/toolchain configuration | No tracked Expo project or config exists |
| Storybook configuration | No tracked Storybook files exist |
| Penpot manifest/references/deviation ledger | No tracked design evidence schema exists |
| Token modules | No tracked TypeScript or design-system source exists |
| Foundation gallery/stories | No tracked React Native components or stories exist |
| Tests | No tracked test configuration or test files exist |

## Metadata

**Analog search scope:** all files returned by `git ls-files` at repository root

**Tracked files scanned:** 19

**Tracked implementation files found:** 0

**Project skill directories:** `.codex/skills/` and `.agents/skills/` absent

**Pattern extraction date:** 2026-09-17

**Primary fallback source:** `.planning/phases/01-foundations-storybook/01-RESEARCH.md`
