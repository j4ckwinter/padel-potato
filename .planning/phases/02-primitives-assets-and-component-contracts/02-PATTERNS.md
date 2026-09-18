# Phase 2: Primitives, Assets, and Component Contracts - Pattern Map

**Mapped:** 2026-09-18
**Files analyzed:** 29 proposed files/artifact groups
**Analogs found:** 27 / 29

## Repository Baseline

Phase 1 established the repository's implementation conventions. The strongest tracked analogs are:

1. `scripts/validate-penpot-evidence.mjs` — fail-closed schemas, safe paths, deterministic order, and controlled rejection checks.
2. `src/design-system/tokens/colors.ts` — immutable source-backed registries with public types derived from values.
3. `src/design-system/foundations/FoundationGallery.tsx` — token-barrel consumption, native React Native composition, accessibility, and explicit runtime rejection.
4. `src/design-system/foundations/FoundationGallery.stories.tsx` — typed CSF metadata and bounded select controls.
5. `tests/foundations-story.test.tsx` — RNTL role/content queries, parameterized coverage, story contract assertions, and unsupported-value tests.

Every analog above was checked with `git ls-files -- <path>` and is tracked source. No install/runtime mirror paths are used below. Phase 1's pattern map is historical context only; its earlier greenfield conclusion no longer applies now that Phase 1 code is tracked.

## File Classification

The exact split remains planner discretion, but these are the smallest files/artifact groups implied by `02-CONTEXT.md`, `02-UI-SPEC.md`, `02-RESEARCH.md`, and `02-VALIDATION.md`.

| New/Modified File | Role | Data Flow | Closest Tracked Analog | Match Quality |
|---|---|---|---|---|
| `design-spec/assets/penpot-assets.json` | model/config | batch | `design-spec/penpot-foundations.json` + validator contract | role-match |
| `design-spec/assets/raw/*.svg` | asset/evidence | file-I/O | `design-spec/references/foundations/foundations-page.png` | role-match |
| `design-spec/assets/normalized/*.svg` | asset/evidence | transform/file-I/O | `design-spec/references/foundations/foundations-page.png` | partial |
| `design-spec/references/components/*` | evidence | file-I/O | `design-spec/references/foundations/*` | exact-role |
| `scripts/export-penpot-assets.mjs` | utility/generator | file-I/O/batch | `scripts/validate-penpot-evidence.mjs` | role-match |
| `scripts/validate-penpot-assets.mjs` | utility/validator | file-I/O/batch | `scripts/validate-penpot-evidence.mjs` | exact-role |
| `src/design-system/primitives/styleGuards.ts` | utility | transform | `FoundationGallery` runtime category guard | partial |
| `src/design-system/primitives/Text.tsx` | component | transform/request-response | `FoundationGallery.tsx` | role-match |
| `src/design-system/primitives/Stack.tsx` | component | transform/request-response | `FoundationGallery.tsx` | role-match |
| `src/design-system/primitives/Inline.tsx` | component | transform/request-response | `FoundationGallery.tsx` | role-match |
| `src/design-system/primitives/Surface.tsx` | component | transform/request-response | `FoundationGallery.tsx` | role-match |
| `src/design-system/primitives/Pressable.tsx` | component | event-driven | `FoundationGallery.tsx` | partial |
| `src/design-system/primitives/index.ts` | utility/public API | transform | `src/design-system/tokens/index.ts` | exact-role |
| `src/design-system/assets/generated/iconRegistry.ts` | model/generated registry | transform | `src/design-system/tokens/colors.ts` | role-match |
| `src/design-system/assets/Icon.tsx` | component | transform/request-response | `FoundationGallery.tsx` | role-match |
| `src/design-system/assets/BrandLockup.tsx` | component | transform/request-response | `FoundationGallery.tsx` | role-match |
| `src/design-system/assets/BrandLockupStacked.tsx` | component | transform/request-response | `FoundationGallery.tsx` | role-match |
| `src/design-system/assets/index.ts` | utility/public API | transform | `src/design-system/tokens/index.ts` | exact-role |
| `src/design-system/stories/storyContract.ts` | model/config | transform | `FoundationGallery.tsx` category registry | role-match |
| `src/design-system/testing/accessibility.ts` | test utility | request-response | parameterized helpers in `tests/foundations-story.test.tsx` | partial |
| `src/design-system/index.ts` | utility/public API | transform | `src/design-system/tokens/index.ts` | exact-role |
| `src/design-system/primitives/*.stories.tsx` | story component | request-response/event-driven | `FoundationGallery.stories.tsx` | exact-role |
| `src/design-system/assets/*.stories.tsx` | story component | request-response | `FoundationGallery.stories.tsx` | exact-role |
| `.rnstorybook/preview.tsx` | provider/config | request-response | existing file | exact, modify only if required |
| `tests/asset-contracts.test.tsx` | test | file-I/O/request-response | `tests/foundations-story.test.tsx` | role-match |
| `tests/primitive-contracts.test.tsx` | test | request-response/transform | `tests/foundations-story.test.tsx` | exact-role |
| `tests/pressable-contract.test.tsx` | test | event-driven | `tests/foundations-story.test.tsx` | partial |
| `tests/story-contracts.test.tsx` | test | batch/request-response | story assertions in `tests/foundations-story.test.tsx` | exact-role |
| `tests/accessibility-contracts.test.tsx` | test | request-response/event-driven | role assertions in `tests/foundations-story.test.tsx` | role-match |

## Pattern Assignments

### Asset evidence and generation

**Files:**

- `design-spec/assets/penpot-assets.json`
- `design-spec/assets/raw/*.svg`
- `design-spec/assets/normalized/*.svg`
- `design-spec/references/components/*`
- `scripts/export-penpot-assets.mjs`
- `scripts/validate-penpot-assets.mjs`

**Analog:** `scripts/validate-penpot-evidence.mjs`

**Fail-closed assertion and deterministic inventory pattern** (lines 19-40):

```javascript
function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertSorted(values, label) {
  for (let index = 1; index < values.length; index += 1) {
    assert(
      compare(values[index - 1], values[index]) <= 0,
      `${label} is not deterministically sorted at "${values[index]}"`,
    );
  }
}

function assertUnique(records, field, label) {
  const seen = new Set();
  for (const record of records) {
    const value = record[field];
    assert(isNonEmptyString(value), `${label} has an empty ${field}`);
    assert(!seen.has(value), `${label} has duplicate ${field} "${value}"`);
    seen.add(value);
  }
}
```

Apply the same shape to the exact source-ordered inventory of 18 icons and two lockups. Validate names, `sourceId`, `sourceNodeId`, file ID, Components page ID, revision 292, raw SHA-256, normalized SHA-256, generator version, retained evidence paths, and fixed output filename mapping. Do not sort away the Penpot record order; compare the produced order with the expected manifest order.

**Safe output-root pattern** (lines 43-52):

```javascript
const allowedRoot = path.resolve(repoRoot, 'design-spec/references/foundations');
const resolved = path.resolve(repoRoot, referencePath);
const relative = path.relative(allowedRoot, resolved);
assert(
  relative !== '' &&
    !relative.startsWith(`..${path.sep}`) &&
    relative !== '..' &&
    !path.isAbsolute(relative),
  `capture reference path is outside design-spec/references/foundations/: ${referencePath}`,
);
```

Repeat this with fixed Phase 2 roots. Never derive paths directly from Penpot names. The exporter must map the closed asset names to known filenames and reject absolute paths, `..`, unexpected extensions, and destinations outside the asset/evidence directories.

**Source identity pattern** (lines 87-112):

```javascript
assert(inventory?.pageId === COMPONENTS_PAGE_ID, 'component inventory has invalid pageId');
assertUnique(inventory.records, 'sourceId', 'component inventory');
assertUnique(inventory.records, 'sourceNodeId', 'component inventory');

for (const record of inventory.records) {
  const label = `component "${record.name}"`;
  assert(record.kind === 'component', `${label} has invalid kind`);
  assert(record.fileId === FILE_ID, `${label} has invalid fileId`);
  assert(record.pageId === COMPONENTS_PAGE_ID, `${label} has invalid pageId`);
}
```

The Phase 2 validator should additionally reject unsafe SVG tags/attributes, scripts, event handlers, `foreignObject`, CSS blocks, remote/external references, non-finite numbers, wrong view boxes, unexpected paint, duplicate IDs, unsupported primitives, and missing hashes. Preserve geometry, transforms, command order, stroke width/caps/joins, fill rules, and child order. Do not run a generic optimizer.

**Controlled rejection pattern** (lines 174-209):

```javascript
function expectFailure(label, mutate, evidence, pattern) {
  const copy = structuredClone(evidence);
  mutate(copy);
  let message = '';
  try {
    validateEvidence(copy);
  } catch (error) {
    message = error instanceof Error ? error.message : String(error);
  }
  assert(
    message && pattern.test(message),
    `controlled rejection "${label}" did not fail as expected; received: ${message || 'no error'}`,
  );
}
```

Add controlled rejections for traversal, duplicate/missing/reordered icons, altered raw bytes, altered normalized bytes, wrong revision/source/page, malformed hash, unsafe SVG, wrong 20×20 icon canvas, non-1.75 authored stroke, and incorrect 300×72 / 300×56 lockup ratios.

`export-penpot-assets.mjs` has no exact local generator analog. Keep it narrower than the validator: receive or consume MCP-retained exports, normalize deterministically, hash with Node `crypto.createHash('sha256')`, and write only fixed destinations. It must stop before writing runtime geometry if active Penpot file/page/revision/source identity cannot be proved.

---

### Immutable generated icon registry

**File:** `src/design-system/assets/generated/iconRegistry.ts`

**Analog:** `src/design-system/tokens/colors.ts`

**Immutable value/type/provenance pattern** (lines 10-30):

```typescript
export const colors = Object.freeze({
  accent: '#ade533',
  // ...source-ordered values
} as const);

export type ColorToken = keyof typeof colors;

export const colorSources = Object.freeze({
  accent: source('color.accent', '482a7222-5a3b-8086-8008-a6072ba51242'),
  // ...one source record per value
} as const satisfies Readonly<Record<ColorToken, ReturnType<typeof source>>>);
```

Use the same convention for `iconRegistry`, `iconNames`, `IconName`, and per-asset provenance. Generate the closed type from the immutable registry; do not maintain a separate handwritten union. Keep icon order identical to the retained Penpot inventory. Runtime records should contain only local render data and source traceability—never MCP credentials, URLs to fetch, or runtime Penpot access.

The public icon API must accept only `IconName`, `ColorToken`, and the sole authored `iconSize20` size. An unsupported cast/runtime value must throw the standard `Unsupported design-system value: {value}` diagnostic rather than selecting a fallback.

---

### Token-backed `Text`, `Stack`, `Inline`, and `Surface`

**Files:**

- `src/design-system/primitives/styleGuards.ts`
- `src/design-system/primitives/Text.tsx`
- `src/design-system/primitives/Stack.tsx`
- `src/design-system/primitives/Inline.tsx`
- `src/design-system/primitives/Surface.tsx`

**Analog:** `src/design-system/foundations/FoundationGallery.tsx`

**Import and one-way dependency pattern** (lines 1-26):

```typescript
import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type TextStyle, type ViewStyle } from 'react-native';

import {
  borders,
  colors,
  dimensions,
  opacity,
  radii,
  spacing,
  typography,
} from '../tokens';
```

Primitives should import semantic values and token types through `../tokens`, not from evidence JSON and not through Storybook. Use native React Native bases and `StyleSheet`/style objects. Preserve standard native and accessibility props except where a narrowed public contract deliberately replaces `style` or a token-owned property.

**Closed registry plus explicit runtime rejection pattern** (lines 47-55 and 298-303):

```typescript
export const foundationCategories = Object.freeze([
  'colors',
  'typography',
  'spacing',
] as const satisfies readonly FoundationCategory[]);

if (category !== undefined && !foundationCategories.includes(category)) {
  throw new Error(`Unsupported foundation category: "${String(category)}"`);
}
```

Each token prop should validate against its immutable registry at runtime in development/tests. `styleGuards.ts` should flatten styles and reject reserved keys. Public style types should be `Pick` allowlists, not broad `Omit` types. Apply caller escape-hatch styles first and token-owned styles last.

Reserved keys:

- `Text`: font family/size/weight/style, line height, letter spacing, and color.
- `Stack` / `Inline`: gap, padding variants, and fixed flex direction.
- `Surface`: background, border color/width/radius, elevation, and shadow.
- `Pressable`: minimum dimensions, state opacity, focus ring, and disabled/loading behavior.

`Text` defaults `color="ink"`, requires a `TypographyToken` variant, leaves scaling enabled, and does not impose `maxFontSizeMultiplier`. `Stack` fixes column direction. `Inline` fixes row direction and exposes explicit token-bounded wrapping. `Surface` adds no elevation/shadow because Penpot has not evidenced it.

---

### `Pressable` state behavior

**File:** `src/design-system/primitives/Pressable.tsx`

**Closest analog:** `FoundationGallery.tsx` for token consumption and explicit rejection; there is no tracked event-driven primitive analog.

Follow the component conventions above, then implement the research/UI contract exactly:

```typescript
const hitSlopBySize = {
  controlHeight40: 2,
  controlHeight44: 0,
  controlHeight48: 0,
} as const;

const blocked = disabled || loading;
const mergedAccessibilityState = {
  ...accessibilityState,
  disabled: blocked,
  ...(loading ? { busy: true } : null),
};

<NativePressable
  disabled={blocked}
  hitSlop={hitSlopBySize[size]}
  accessibilityState={mergedAccessibilityState}
  onPress={blocked ? undefined : onPress}
/>
```

Use one `blocked` predicate for native `disabled`, semantic disabled/busy state, visual opacity, and callback suppression. Preserve caller `selected`, `checked`, `expanded`, and `accessibilityValue`. Do not infer button/link/toggle/navigation semantics. Drive focus visuals only from native `onFocus`/`onBlur`, using `colors.focusRing` and `borders.focusRingWidth`; do not add a persistent production `focused` prop. A 40-point visual gets symmetric two-point hit expansion, while 44/48 need none. Document that parent bounds still constrain `hitSlop`.

---

### `Icon` and brand components

**Files:**

- `src/design-system/assets/Icon.tsx`
- `src/design-system/assets/BrandLockup.tsx`
- `src/design-system/assets/BrandLockupStacked.tsx`

**Analog:** `FoundationGallery.tsx`

Use the same native composition, token-barrel import, test ID, accessibility prop pass-through, and explicit rejection conventions. Render only the generated local registry through installed `react-native-svg`; do not import evidence JSON directly at runtime.

For `Icon`:

- default to decorative (`accessible={false}` / hidden from the accessibility tree);
- when `accessibilityLabel` exists, expose `accessibilityRole="image"` and the supplied label;
- resolve semantic color from `colors[color]` and fixed size from `dimensions.iconSize20`;
- expose no XML/path/viewBox/raw-paint or arbitrary width/height escape hatch.

For lockups:

- accept one sizing axis (`width`) and derive height using 25:6 or 75:14;
- keep fixed visible copy and the single authored colourway;
- expose the inherent accessible label `Padel Potato`, allowing only a contextual accessibility-label override;
- expose no independent content, colour, image, or aspect-ratio override.

If the inspected Penpot export requires an unsupported SVG feature or an unprovable raster/text extraction branch, stop rather than approximate it.

---

### Public barrels

**Files:**

- `src/design-system/primitives/index.ts`
- `src/design-system/assets/index.ts`
- `src/design-system/index.ts`

**Analog:** `src/design-system/tokens/index.ts` (lines 1-18)

```typescript
export { borders, borderSources, type BorderToken } from './borders';
export { colors, colorSources, type ColorToken } from './colors';
export { spacing, spacingSources, type SpacingToken } from './spacing';
```

Use narrow named re-exports of public components, props/types, `IconName`, and story/test contracts intended for Phases 3–4. Do not duplicate registry values, expose raw normalized SVG strings as a supported public API, or export internal guards/generator details.

---

### Story taxonomy and Phase 2 stories

**Files:**

- `src/design-system/stories/storyContract.ts`
- `src/design-system/primitives/Text.stories.tsx`
- `src/design-system/primitives/Layout.stories.tsx`
- `src/design-system/primitives/Surface.stories.tsx`
- `src/design-system/primitives/Pressable.stories.tsx`
- `src/design-system/assets/Icon.stories.tsx`
- `src/design-system/assets/Brand.stories.tsx`

**Analog:** `src/design-system/foundations/FoundationGallery.stories.tsx`

**Typed CSF and bounded controls pattern** (lines 1-19):

```typescript
import type { Meta, StoryObj } from '@storybook/react-native';

const meta = {
  title: 'Foundations/Overview',
  component: FoundationGallery,
  argTypes: {
    category: {
      control: 'select',
      options: foundationCategories,
    },
  },
} satisfies Meta<typeof FoundationGallery>;

export default meta;
type Story = StoryObj<typeof meta>;
```

Retain `satisfies Meta<typeof Component>` and `StoryObj<typeof meta>`. Every selectable semantic prop uses a `select` with options derived from a closed immutable registry. Use action argTypes only for real callbacks. Never expose color pickers, arbitrary number/object controls, raw SVG, or unsupported state combinations.

`storyContract.ts` should publish the ordered taxonomy `Canonical`, `Variants`, `States`, `Boundaries`, `Interactive` and an applicability/reason matrix for all eight public exports. Story tests require each applicable category and a non-empty reason for every omission. Use titles exactly under:

- `Primitives/Text`
- `Primitives/Layout`
- `Primitives/Surface`
- `Primitives/Pressable`
- `Assets/Icons`
- `Assets/Brand`

The existing `.rnstorybook/main.ts` glob already discovers all `src/**/*.stories.*` files, so no main-config change is needed. Keep `FoundationFontGate` as the sole `.rnstorybook/preview.tsx` decorator; modify preview only if non-visual shared behavior is necessary and compose it inside the existing font gate.

---

### Shared test helpers and contract tests

**Files:**

- `src/design-system/testing/accessibility.ts`
- `tests/asset-contracts.test.tsx`
- `tests/primitive-contracts.test.tsx`
- `tests/pressable-contract.test.tsx`
- `tests/story-contracts.test.tsx`
- `tests/accessibility-contracts.test.tsx`

**Analog:** `tests/foundations-story.test.tsx`

**Import/query pattern** (lines 1-17):

```typescript
import { describe, expect, it } from '@jest/globals';
import { render, within } from '@testing-library/react-native';

import { FoundationGallery } from '../src/design-system/foundations/FoundationGallery';
import galleryMeta, { AllFoundations, Colors } from
  '../src/design-system/foundations/FoundationGallery.stories';
```

Keep tests beside the existing top-level `tests/` suite, use Jest globals plus RNTL, and import real components/stories/public registries. Prefer role/name/value/state queries and user-visible assertions over snapshots or recursive tree inspection.

**Parameterized coverage pattern** (lines 28-35 and 53-70):

```typescript
const categoryCases = [
  ['colors', 'Semantic colors', Object.keys(colors)],
  ['typography', 'Typography', Object.keys(typography)],
] as const;

it.each(categoryCases)(
  'renders the complete %s category with provenance-backed specimens',
  async (category, heading, tokenNames) => {
    const screen = await render(<FoundationGallery category={category} />);
    const section = screen.getByTestId(`foundation-section-${category}`);
    expect(within(section).getByRole('header', { name: heading })).toBeVisible();
    expect(within(section).getAllByTestId(/^foundation-token-/)).toHaveLength(
      tokenNames.length,
    );
  },
);
```

Use tables for the 18-icon order, two lockup ratios, token variants, 40/44/48 targets, semantic states, and story applicability. This keeps complete inventory coverage explicit and deterministic.

**Runtime rejection pattern** (lines 73-76):

```typescript
expect(() =>
  FoundationGallery({ category: '' as FoundationCategory }),
).toThrow('Unsupported foundation category: ""');
```

Apply this to unsupported token names, reserved style keys, unknown icon names, bad asset records, malformed state inputs, and unsafe evidence. Compile-time unions are not enough because casts and external JavaScript can reach runtime.

**Story metadata/coverage pattern** (lines 80-119):

```typescript
expect(galleryMeta.title).toBe('Foundations/Overview');
expect(Object.keys(stories)).toEqual([
  'AllFoundations',
  'Colors',
  'Typography',
]);

const screen = await render(<FoundationGallery {...AllFoundations.args} />);
expect(screen.getAllByTestId(/^foundation-token-/)).toHaveLength(45);
```

Phase 2 should assert exact story titles, ordered taxonomy/applicability, bounded `argTypes.options`, action argTypes, complete icon/brand inventory, and explicit omission reasons.

Shared helpers should remain ordinary exported assertion functions rather than custom Jest matcher augmentation. Provide focused helpers for role/name, value, state, enabled/disabled/loading press behavior, declared target geometry, decorative/labelled icon behavior, exact token style, and reserved-style rejection. Helpers must not hide fixture construction or swallow assertion errors.

For interactions, use `userEvent.press` where supported. Enabled must invoke once; disabled and loading must invoke zero times. Unit tests may assert declared min dimensions and `hitSlop`, but must state that they do not prove native layout. Automated large-text tests should prove scaling remains enabled, no default cap is imposed, long accessible names remain present, and actions remain reachable in the host contract; only native review can prove 200% reflow, focus, VoiceOver, or TalkBack behavior.

## Shared Patterns

### Evidence Before Runtime Assets

```text
Penpot Components page
  -> validate exact file/page/revision/source nodes
  -> retain raw exports and references
  -> narrowly normalize and hash
  -> validate exact inventory and SVG profile
  -> generate local immutable runtime registry
  -> render Icon/lockups
```

No icon or lockup geometry is handwritten, inferred from the Phase 1 screenshot, or substituted from an icon package. Runtime modules never query Penpot or a network.

### Token Ownership

All authored visual semantics resolve through `src/design-system/tokens/index.ts`. Public props accept token names rather than raw values. Escape-hatch types are allowlists; runtime flattening rejects reserved properties; caller style is applied first and invariant/token styles last.

### Explicit Errors

Follow the established gallery behavior: unsupported runtime values throw an actionable diagnostic. Evidence scripts fail the command with a non-zero exit and a specific message. Components must not catch and visually substitute unsupported values.

### Accessibility Defaults

Pass standard native accessibility props through. Defaults exist only for inherent semantics:

- `Icon` is decorative unless labelled, then it is an image.
- Both lockups inherently label themselves `Padel Potato`.
- `Pressable` merges caller state but forces disabled/busy invariants; it does not invent a role.
- Layout, surface, and text primitives do not invent roles.

### Storybook Boundary

`.rnstorybook/main.ts` already has the correct discovery glob and on-device addons. `.rnstorybook/preview.tsx` already owns the one global `FoundationFontGate`. Generated `.rnstorybook/storybook.requires.ts` remains generated and must not be hand-edited.

### Testing Boundary

Use Jest/RNTL for JavaScript and host contracts. Use the Expo-web smoke only for catalogue startup/discovery. Do not claim that Jest or web proves native touch geometry, focus, text measurement, VoiceOver, or TalkBack. Record the native checkpoint or its explicit Phase 5 deferral.

## No Exact Analog Found

| File | Role | Data Flow | Reason / Planner Guidance |
|---|---|---|---|
| `scripts/export-penpot-assets.mjs` | utility/generator | file-I/O/batch | No existing repository generator writes normalized binary/text asset evidence. Reuse the validator's assertions/path checks, Node crypto, fixed destinations, and fail-closed behavior; follow Phase 2 research for the narrow normalizer. |
| `src/design-system/primitives/Pressable.tsx` and its interaction helper | component/test utility | event-driven | No tracked interactive component exists. Use the locked state machine from UI-SPEC/research and the existing token/accessibility/test conventions; do not infer missing product semantics. |

## Metadata

**Analog search scope:** all tracked files under `src/design-system/`, `tests/`, `scripts/`, `.rnstorybook/`, plus retained `design-spec/` evidence

**Tracked source files inspected:** 25 implementation/config/test files plus Phase 2 planning inputs

**Strong analogs retained after early stopping:** 5

**Project skill directories:** `.codex/skills/` and `.agents/skills/` absent

**Pattern extraction date:** 2026-09-18

