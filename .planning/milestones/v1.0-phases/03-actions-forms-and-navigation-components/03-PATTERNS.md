# Phase 3: Actions, Forms, and Navigation Components - Pattern Map

**Mapped:** 2026-09-18
**Files analyzed:** 31 proposed files/artifact groups
**Analogs found:** 27 / 31

## Repository Baseline

The closest implementation patterns are all tracked Phase 2 source. Each named analog below was verified with `git ls-files -- <path>`; no ignored runtime/install mirror is referenced.

1. `src/design-system/primitives/Pressable.tsx` — closed native prop surface, one blocked predicate, native-derived focus, semantic state merging, callback suppression, and 40/44/48 target geometry.
2. `src/design-system/tokens/colors.ts` — immutable source-backed registry, derived public union, and one provenance record per public value.
3. `src/design-system/primitives/Pressable.stories.tsx` plus `src/design-system/stories/storyContract.ts` — typed CSF, bounded controls, canonical provenance, five-category taxonomy, and explicit inapplicability.
4. `tests/pressable-contract.test.tsx` plus `src/design-system/testing/accessibility.ts` — RNTL role/name/state queries, controlled event assertions, native focus events, touch-target checks, and runtime rejection.
5. `scripts/export-penpot-assets.mjs` plus `scripts/validate-penpot-assets.mjs` — deterministic source lists, hashes, fixed destinations, exact identity/order validation, safe paths, and controlled rejection checks.

Phase 3 should extend these seams rather than introduce a new component framework, style layer, router, picker, authentication SDK, or Storybook configuration.

## File Classification

Exact filenames remain planner discretion. The following are the smallest coherent groups implied by `03-CONTEXT.md`, `03-RESEARCH.md`, and `03-UI-SPEC.md`.

| New/Modified File | Role | Data Flow | Closest Tracked Analog | Match Quality |
|---|---|---|---|---|
| `scripts/extract-phase-3-components.mjs` | utility/generator | file-I/O/batch/transform | `scripts/export-penpot-assets.mjs` | role-match |
| `scripts/validate-phase-3-components.mjs` | utility/validator | file-I/O/batch | `scripts/validate-penpot-assets.mjs` | exact-role |
| `design-spec/components/phase-3-components.json` | model/evidence | batch | `design-spec/assets/penpot-assets.json` | role-match |
| `design-spec/assets/phase-3/*` | asset/evidence | file-I/O | `design-spec/assets/raw/*` + `design-spec/assets/normalized/*` | exact-role |
| `design-spec/phase-3-verification.md` | evidence/config | batch | `design-spec/phase-2-verification.md` | exact-role |
| `src/design-system/components/sourceRegistry.ts` | model/generated registry | transform | `src/design-system/tokens/colors.ts` | exact-role |
| `src/design-system/components/shared/*` | utility | transform | `src/design-system/primitives/styleGuards.ts` | role-match |
| `src/design-system/components/actions/Button.tsx` | component | event-driven/request-response | `src/design-system/primitives/Pressable.tsx` | exact-flow |
| `src/design-system/components/actions/IconButton.tsx` | component | event-driven/request-response | `src/design-system/primitives/Pressable.tsx` + `src/design-system/assets/Icon.tsx` | exact-flow |
| `src/design-system/components/actions/Favourite.tsx` | component | event-driven/request-response | `src/design-system/primitives/Pressable.tsx` | exact-flow |
| `src/design-system/components/forms/Field.tsx` | component | event-driven/request-response | `src/design-system/primitives/Pressable.tsx` + `src/design-system/primitives/Text.tsx` | role-match |
| `src/design-system/components/forms/ChoiceChip.tsx` | component | event-driven/request-response | `src/design-system/primitives/Pressable.tsx` | exact-flow |
| `src/design-system/components/forms/Checkbox.tsx` | component | event-driven/request-response | `src/design-system/primitives/Pressable.tsx` | exact-flow |
| `src/design-system/components/forms/DayTimeSelector.tsx` | component | event-driven/request-response | `src/design-system/primitives/Pressable.tsx` | exact-flow |
| `src/design-system/components/authentication/SocialSignInButton.tsx` | component | event-driven/request-response | `src/design-system/primitives/Pressable.tsx` | exact-flow |
| `src/design-system/components/authentication/AuthDivider.tsx` | component | transform/request-response | `src/design-system/primitives/Inline.tsx` + `Text.tsx` | role-match |
| `src/design-system/components/navigation/BottomNavigation.tsx` | component | event-driven/request-response | `src/design-system/primitives/Pressable.tsx` | exact-flow |
| `src/design-system/components/navigation/SegmentedControl.tsx` | component | event-driven/request-response | `src/design-system/primitives/Pressable.tsx` | exact-flow |
| `src/design-system/components/navigation/AppHeader.tsx` | component | event-driven/request-response | `src/design-system/primitives/Pressable.tsx` + `Text.tsx` | role-match |
| `src/design-system/components/navigation/SectionHeader.tsx` | component | event-driven/request-response | `src/design-system/primitives/Pressable.tsx` + `Text.tsx` | role-match |
| `src/design-system/components/{family}/index.ts` | utility/public API | transform | `src/design-system/primitives/index.ts` | exact-role |
| `src/design-system/index.ts` | utility/public API | transform | existing `src/design-system/index.ts` | exact, modify |
| `src/design-system/stories/storyContract.ts` | model/config | transform | existing file | exact, extend |
| `src/design-system/components/**/*.stories.tsx` | story component | request-response/event-driven | `src/design-system/primitives/Pressable.stories.tsx` | exact-role |
| `src/design-system/testing/accessibility.ts` | test utility | request-response/event-driven | existing file | exact, extend only if needed |
| `tests/phase3-source-registry.test.ts` | test | file-I/O/batch | `tests/asset-contracts.test.tsx` | role-match |
| `tests/action-components.test.tsx` | test | event-driven/request-response | `tests/pressable-contract.test.tsx` | exact-flow |
| `tests/form-auth-components.test.tsx` | test | event-driven/request-response | `tests/pressable-contract.test.tsx` | exact-flow |
| `tests/navigation-components.test.tsx` | test | event-driven/request-response | `tests/pressable-contract.test.tsx` | exact-flow |
| `tests/phase3-story-contracts.test.tsx` | test | batch/request-response | `tests/story-contracts.test.tsx` | exact-role |
| `package.json` verification scripts | config | batch | existing Phase 2 scripts | exact, modify |

## Pattern Assignments

### Evidence extractor, validator, source registry, and family-owned artwork

**Files:** extractor/validator scripts, Phase 3 JSON and assets, `sourceRegistry.ts`, source-registry tests, verification record, and package scripts.

**Analogs:** `scripts/export-penpot-assets.mjs`, `scripts/validate-penpot-assets.mjs`, and `src/design-system/tokens/colors.ts`.

**Deterministic input and generated-output pattern** (`scripts/export-penpot-assets.mjs:8-39,72-98`):

```javascript
export const FILE_ID = 'c514c1fb-1cda-8125-8008-a606253a77a3';
export const PAGE_ID = '482a7222-5a3b-8086-8008-a6073072bbb1';
export const REVISION = 292;

const sha256 = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');

function registrySource(root, icons) {
  const records = icons.map((icon) => {
    const xml = read(root, icon.normalizedPath).toString('utf8').trim();
    return `  ${JSON.stringify(icon.name)}: Object.freeze(${JSON.stringify({ ...icon, xml })})`;
  });
  return `// Generated by scripts/export-penpot-assets.mjs. Do not edit.\n...`;
}
```

Use revision `296`, the fixed Components page ID, 13 canonical family IDs, and the exact 75-record source order. Generate full UUIDs; never propagate the abbreviated research ledger IDs. Record original and normalized tuples, including only the two approved metadata repairs (`Property 1` to `checked`, Icon Button `Value 2` to `notification`) and harmless fractional-dimension normalization. Heart, Google/Apple artwork, and mascot media remain family-owned local assets, not public additions to `IconName`.

**Safe paths and exact inventory validation** (`scripts/validate-penpot-assets.mjs:190-230`):

```javascript
assert(typeof relative === 'string' && !path.isAbsolute(relative), `unsafe absolute path: ${relative}`);
assert(!relative.split(/[\\/]/).includes('..'), `unsafe traversing path: ${relative}`);
const allowed = path.resolve(repoRoot, expectedRoot);
const resolved = path.resolve(repoRoot, relative);
const rel = path.relative(allowed, resolved);
assert(rel && !rel.startsWith('..') && !path.isAbsolute(rel), `path outside fixed root: ${relative}`);

assert(manifest.fileId === FILE_ID, 'wrong file identity');
assert(manifest.pageId === PAGE_ID, 'wrong page identity');
assert(manifest.revision === REVISION, 'wrong source revision');
assert(JSON.stringify(manifest.icons.map((x) => x.name)) === JSON.stringify(ICON_SOURCES.map((x) => x[0])), 'icon inventory order or names changed');
```

Adapt this to assert exact family count, record count `75`, full ID order, uniqueness, sparse tuple membership, asset hashes, permitted shape/media profiles, and no deleted records. Reuse `scripts/penpot-source.mjs`; do not write a second ZIP reader.

**Controlled rejection pattern** (`scripts/validate-penpot-assets.mjs:250-259,281-300`):

```javascript
function expectFailure(label, manifest, repoRoot, mutate) {
  const copy = structuredClone(manifest); mutate(copy); let error;
  try { validateAssetEvidence({ manifest: copy, repoRoot }); } catch (caught) { error = caught; }
  assert(error, `controlled rejection did not fail: ${label}`);
}

expectFailure('revision', manifest, repoRoot, (copy) => { copy.revision = 291; });
expectFailure('duplicate', manifest, repoRoot, (copy) => { copy.icons[1].name = copy.icons[0].name; });
expectFailure('reorder', manifest, repoRoot, (copy) => { copy.icons.reverse(); });
expectFailure('traversal', manifest, repoRoot, (copy) => { copy.icons[0].rawPath = '../add.svg'; });
```

Add wrong family ID, missing/extra/reordered record, unapproved normalization, wrong sparse tuple, changed media hash, remote asset, unsupported SVG feature, and unsafe-path rejection cases.

**Immutable value/type/provenance pattern** (`src/design-system/tokens/colors.ts:1-10,28-55`):

```typescript
const source = (designName: string, sourceId: string) =>
  Object.freeze({ designName, sourceId, fileId: '...', pageId: '...', revision: 292 } as const);

export type ColorToken = keyof typeof colors;

export const colorSources = Object.freeze({
  accent: source('color.accent', '482a...'),
} as const satisfies Readonly<Record<ColorToken, ReturnType<typeof source>>>);
```

Make the Phase 3 registry immutable, derive unions from values, and keep build-time evidence out of runtime imports. Runtime records may expose only what rendering/source traceability needs.

---

### Actions: `Button`, `IconButton`, and `Favourite`

**Primary analog:** `src/design-system/primitives/Pressable.tsx`.

**Closed public surface and runtime guard pattern** (`Pressable.tsx:99-146,155-179`):

```typescript
const supportedRuntimeProps = [
  ...accessibilityPropKeys,
  'children', 'disabled', 'loading', 'onPress', 'size', 'style',
] as const;

export type PressableProps = SupportedNativeProps & {
  disabled?: boolean;
  loading?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
  size?: PressableSize;
  style?: StyleProp<PressableLayoutStyle>;
};

for (const key of Object.keys(props)) {
  if (!supportedRuntimeProps.includes(key as (typeof supportedRuntimeProps)[number])) {
    unsupported(key, supportedRuntimeProps);
  }
}
```

Each component should expose only source-backed variant axes, content, standard accessibility inputs, controlled state, callbacks, and at most a Phase 2-style outer `layoutStyle` allowlist. Since Button's Penpot axis is named `style`, do not overload it with arbitrary React Native style objects.

**Blocked/focus/target pattern** (`Pressable.tsx:174-228`):

```typescript
const isDisabled = resolveBooleanDesignValue(disabled, true, false);
const isLoading = resolveBooleanDesignValue(loading, true, false);
const blocked = isDisabled || isLoading;
const expansion = Math.max(0, (44 - visualSize) / 2);

<NativePressable
  accessibilityState={{ ...accessibilityState, busy: isLoading, disabled: blocked }}
  disabled={blocked}
  hitSlop={{ bottom: expansion, left: expansion, right: expansion, top: expansion }}
  onPress={handlePress}
/>
```

Compose this primitive; do not duplicate its state machine. Button loading must preserve the accessible name and geometry. `IconButton` requires a non-empty accessible label and renders nested `Icon` decoratively. `Favourite` renders from `checked`, emits `onCheckedChange(!checked)`, and stays unchanged until the consumer rerenders.

**Decorative icon pattern** (`src/design-system/assets/Icon.tsx:60-88`):

```typescript
if (typeof name !== 'string' || !own(iconRegistry, name)) unsupported(name, iconNames);
const labelled = accessibilityLabel !== undefined;

<SvgXml
  accessibilityElementsHidden={!labelled}
  accessibilityRole={labelled ? 'image' : undefined}
  accessible={labelled}
  importantForAccessibility={labelled ? 'yes' : 'no-hide-descendants'}
/>
```

For nested action artwork, omit the icon label so the outer action is the single accessibility element.

---

### Forms and authentication

**Files:** `Field`, `ChoiceChip`, `Checkbox`, `DayTimeSelector`, `SocialSignInButton`, and `AuthDivider`.

**Analogs:** `Pressable.tsx` for triggers/toggles, `Text.tsx` for bounded typography/layout, and `Icon.tsx` for decorative artwork.

**Token ownership and style ordering** (`src/design-system/primitives/Text.tsx:45-80`):

```typescript
const textOwnedStyleKeys = [
  'color', 'fontFamily', 'fontSize', 'fontStyle', 'fontWeight', 'letterSpacing', 'lineHeight',
] as const satisfies readonly (keyof TextStyle)[];

export function Text({ color = 'ink', style, variant, ...props }: TextProps) {
  guardStyle(style, textOwnedStyleKeys, textLayoutStyleKeys);
  const typographyStyle = resolveDesignToken(typography, variant);
  const textColor = resolveDesignToken(colors, color);
  return <NativeText {...props} style={[style, typographyStyle, { color: textColor }]} />;
}
```

Caller placement comes first; token/source-owned visual styles come last. Preserve fixed component metrics in family styles/registry rather than adding foundation tokens.

`Field` has no exact component analog. Implement it as three discriminated branches:

- editable `text | password | search`: native `TextInput`, controlled `value`/`onChangeText`, `editable={false}` for read-only;
- trigger `select | date | time`: labelled `Pressable`, displayed value in `accessibilityValue.text`, callback only, no overlay;
- `stepper`: displayed controlled value plus separately named decrement/increment `Pressable`s and explicit bound-disabled props.

Share only the label/helper/error/required shell. Do not create one bag of optional callbacks. Password/search nested actions must be individually named and must not invoke a parent action.

For `ChoiceChip`, use `radio` + checked semantics for option and `checkbox` + checked semantics for filter. `Checkbox` has only boolean checked; do not add indeterminate. `DayTimeSelector` uses radio semantics and a stable composite accessible name. `SocialSignInButton` is callback-only and uses retained local artwork. `AuthDivider` keeps readable static text while both rules are hidden.

---

### Navigation and headers

**Files:** `BottomNavigation`, `SegmentedControl`, `AppHeader`, and `SectionHeader`.

**Analogs:** immutable registry pattern from `colors.ts`, event/semantics from `Pressable.tsx`, and bounded content/style from `Text.tsx`.

Render Bottom Navigation from one frozen registry in source order: `home`, `games`, `create`, `players`, `profile`. Each item is a separately named tab with `selected`, and every press emits only `onDestinationPress(destination)`.

Model Segmented Control options as a union of readonly 2-, 3-, or 4-tuples and validate length plus unique values at runtime. Each segment is a separately named tab; the controlled value remains unchanged until rerender.

Model App Header as a page-discriminated union rather than optional action slots. The revision-296 map is:

| Page | Visible action contract |
|---|---|
| `home`, `games`, `create`, `players` | required notification callback |
| `profile` | no right action (the source node is hidden) |
| `notifications`, `gameDetails`, `settings` | required back callback |
| `playerDetails` | required back callback plus controlled favourite pair |

Do not add Profile overflow without an approved deviation. Only visible actions enter the accessibility tree. Mascots and action icons are decorative. `SectionHeader` should use a discriminated optional action pair: action label and callback are both present or both absent.

---

### Stories and story contract

**Files:** all Phase 3 `*.stories.tsx` and `src/design-system/stories/storyContract.ts`.

**Analog:** `src/design-system/primitives/Pressable.stories.tsx` and the existing story contract.

**Typed CSF and bounded controls** (`Pressable.stories.tsx:21-33`):

```typescript
const meta = {
  title: 'Primitives/Pressable',
  component: Pressable,
  argTypes: {
    size: { control: 'select', options: sizes },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    onPress: { action: 'pressed' },
  },
} satisfies Meta<typeof Pressable>;

export default meta;
type Story = StoryObj<typeof meta>;
```

Use the exact titles from UI-SPEC under `Actions`, `Forms`, `Authentication`, and `Navigation`. Derive select options from immutable registries. Never expose pressed/focused props, raw styles, colors, dimensions, artwork, or impossible unions as controls.

**Canonical provenance and boundary disclosure** (`Pressable.stories.tsx:44-58,104-130`):

```typescript
export const Canonical: Story = {
  render: (args) => (
    <Stack gap="space8">
      <Pressable {...args} />
      <Text color="textSecondary" variant="caption">
        {formatStorySourceIdentity(phase2StorySources.Pressable)}
      </Text>
    </Stack>
  ),
};
```

Canonical stories show exact revision-296 file/page/family/record identity. Variants render every retained record in deterministic source order, not a Cartesian product. Interactive stories may own local demo state. Boundaries must cover long copy, constrained width, 200% scaling intent, helper/error growth, empty Field, and hit-area clearance while explicitly stating that host/web output is not native proof.

**Five-category accounting** (`storyContract.ts:1-9,44-57`):

```typescript
export const storyTaxonomy = Object.freeze([
  'Canonical', 'Variants', 'States', 'Boundaries', 'Interactive',
] as const);

const categories = (...) =>
  Object.freeze({ Canonical: canonical, Variants: variants, States: states,
    Boundaries: boundaries, Interactive: interactive })
  satisfies Readonly<Record<StoryCategory, StoryApplicability>>;
```

Extend rather than replace the Phase 2 registry. Every one of 13 exports needs either a story or a non-empty reason in every category. `AuthDivider` will legitimately mark transient/interactive categories inapplicable.

---

### Semantic and interaction tests

**Files:** source, action, form/auth, navigation, and story contract tests; optionally focused additions to `src/design-system/testing/accessibility.ts`.

**Analog:** `tests/pressable-contract.test.tsx` and `src/design-system/testing/accessibility.ts`.

**Parameterized blocked-state test** (`tests/pressable-contract.test.tsx:123-155`):

```typescript
it.each(stateCases)(
  '%s exposes accurate state and invokes the action the expected number of times',
  async (_name, disabled, loading, expectedPresses) => {
    const onPress = jest.fn();
    const user = userEvent.setup();
    const screen = await render(<Pressable accessibilityLabel="Activate example" accessibilityRole="button" disabled={disabled} loading={loading} onPress={onPress} />);
    const subject = screen.getByRole('button', { name: 'Activate example' });
    await expectPressContract(user, subject, onPress, expectedPresses);
    expect(subject.props.accessibilityState).toEqual(expect.objectContaining({
      busy: loading,
      disabled: disabled || loading,
    }));
  },
);
```

Use awaited `userEvent.press`, `type`, and `clear`. Test next-value emissions and then assert the rendered checked/selected/value state remains governed by the original prop until rerender. Query by role + accessible name + checked/selected/disabled/value wherever possible.

**Touch target and focus event tests** (`tests/pressable-contract.test.tsx:199-257`):

```typescript
expect(subject.props.hitSlop).toEqual({
  bottom: expansion, left: expansion, right: expansion, top: expansion,
});
expect(visualSize + expansion * 2).toBeGreaterThanOrEqual(44);

fireEvent(subject, 'focus', { nativeEvent: {} });
expect(flattenedStyle(screen.getByTestId('subject').props.style)).toEqual(
  expect.objectContaining({ outlineColor: colors.focusRing, outlineWidth: borders.focusRingWidth }),
);
```

Do not invent production `focused`/`pressed` props to simplify tests. Use native events and render-function state. Assert declared target geometry but retain the helper's warning that host checks cannot prove parent clipping/native layout.

**Reusable helper style** (`src/design-system/testing/accessibility.ts:25-71,74-94`):

```typescript
export function expectRoleAndName(queries, role, name) {
  const element = queries.getByRole(role, { name });
  expect(element).toHaveAccessibleName(name);
  return element;
}

export async function expectPressContract(user, element, callback, expectedPresses) {
  const callsBefore = callback.mock.calls.length;
  await user.press(element);
  expect(callback.mock.calls.length - callsBefore).toBe(expectedPresses);
}
```

Keep helpers as ordinary focused functions, not custom matcher augmentation. Add helpers only where they reduce repeated observable assertions; do not hide fixtures, traverse renderer internals, or swallow failures.

**Runtime rejection** (`tests/pressable-contract.test.tsx:314-320`):

```typescript
expect(() =>
  Pressable({ size: 'controlHeight42' as PressableSize }),
).toThrow(/Unsupported design-system value: controlHeight42\. Supported values:/u);
```

Cover casted bad variants, malformed tuples, duplicate options, missing required action pairs, unsafe layout styles, and unknown registry values. Compile-time unions alone are not the runtime boundary.

## Shared Patterns

### One-Way Dependencies

```text
revision-296 archive -> extraction/validation -> retained evidence/generated registry
tokens + primitives + local assets -> Phase 3 components -> stories
public components/registries -> tests
```

Runtime modules never parse Penpot, import evidence JSON, call a network, or depend on Storybook/tests.

### Controlled State

All selections, values, and destinations are props. Events emit requested next values only. Internal state is reserved for transient native focus handling already owned by `Pressable` and for Storybook harnesses.

### Accessibility Ownership

The outer interactive control owns role, name, state, and value. Nested icons/provider marks/hearts/mascots are decorative. Composite navigation exposes each item separately in visual order. Visible labels, hints, required markers, and error text remain present.

### Visual Ownership

Use existing tokens through `src/design-system/tokens/index.ts`; keep component-specific revision-296 metrics in family-owned styles/registry. Any outer layout seam is an allowlist guarded at runtime and applied before invariant styles.

### Public Exports

Follow existing narrow barrels (`src/design-system/index.ts:1-3`):

```typescript
export * from './assets';
export * from './primitives';
export * from './tokens';
```

Add the components barrel without exporting raw evidence, generator internals, unbounded style helpers, or family artwork internals.

### Verification Boundary

Jest/RNTL proves host semantics and event contracts; Expo web proves catalogue discovery. Neither proves native measurement, parent-bound hitSlop behavior, focus rendering, VoiceOver/TalkBack, or pixel fidelity. Record these as explicitly deferred to Phase 5.

## Anti-Patterns to Avoid

- Do not expand sparse Penpot records into an invented Cartesian variant matrix.
- Do not add persistent `pressed` or `focused` production props.
- Do not duplicate `Pressable` blocked/focus/hit-target logic in each component.
- Do not model Field or App Header as a giant optional-prop bag.
- Do not add router, picker, authentication SDK, backend, persistence, or product state.
- Do not give every control `button` semantics; use checkbox, radio, tab, header, editable text, state, and value semantics precisely.
- Do not generalize heart/provider/mascot artwork into caller-selectable icon/theme APIs.
- Do not add arbitrary style/color/number/object controls or broad React Native style escape hatches.
- Do not hand-edit `.rnstorybook/storybook.requires.ts` or add a second Storybook configuration.
- Do not use snapshots/recursive renderer walking as primary validation.
- Do not claim source inspection, Jest, or web output is authoritative native proof.

## No Exact Analog Found

| File | Role | Data Flow | Planner Guidance |
|---|---|---|---|
| `scripts/extract-phase-3-components.mjs` | utility/generator | Penpot archive file-I/O/batch | Reuse the tracked asset export/validation conventions and the existing bounded `scripts/penpot-source.mjs`; no current generator extracts component families/descendant media directly from the archive. |
| `src/design-system/components/forms/Field.tsx` | component | native editing + event-driven triggers | Use native `TextInput` for editable branches and Phase 2 `Pressable` for trigger/stepper branches; preserve a discriminated union. |
| `src/design-system/components/navigation/BottomNavigation.tsx` / `SegmentedControl.tsx` | composite component | event-driven selection | No tracked multi-item interactive composite exists; combine immutable registry ordering with one independently semantic `Pressable` per item. |
| `src/design-system/components/navigation/AppHeader.tsx` | component | configuration-driven/event-driven | No tracked page-discriminated composite exists; implement the exact revision-296 page/action map and reject impossible action props. |

## Metadata

**Analog search scope:** all tracked files under `src/design-system/`, `tests/`, `scripts/`, `design-spec/`, and `.rnstorybook/`

**Tracked source inventory reviewed:** 72 tracked implementation, test, script, evidence, and Storybook files; 10 strong analog files read; 5 pattern families retained after early stopping

**Pattern extraction date:** 2026-09-18

