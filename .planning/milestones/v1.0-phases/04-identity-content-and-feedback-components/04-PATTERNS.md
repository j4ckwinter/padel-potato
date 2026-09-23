# Phase 4: Identity, Content, and Feedback Components - Pattern Map

**Mapped:** 2026-09-18
**Files analyzed:** 61 expected new/modified files (grouped below)
**Analogs found:** 59 / 61
**Tracked-source gate:** Every existing analogue named below was verified with `git ls-files -- <path>`.

## Scope Translation

The locked phase scope implies these implementation surfaces:

- Deterministic revision-296 evidence: a Phase 4 extractor, validator, retained JSON, and a separate generated `phase4SourceRegistry.ts`. Do not modify Phase 3's generated `sourceRegistry.ts`.
- Deterministic artwork: a Phase 4 extractor/validator, placement manifest, three new WebPs, and a private renderer that reuses the three already-retained Phase 3 WebPs without copying their bytes.
- Fifteen public families, each with one component and one story module, organized under `identity`, `status`, `progress`, `content`, `feedback`, and `cards`.
- Narrow family/component/root exports, semantic family tests, source/artwork tests, a compile-time negative fixture, story-contract integration, and Phase 4 verification closure.
- A human decision checkpoint before Empty State visible fixture copy is frozen. Geometry, tuples, action presence, accessible action names, and artwork work can proceed before that decision.

## File Classification

| New/Modified File(s) | Role | Data Flow | Closest Tracked Analog | Match Quality |
|---|---|---|---|---|
| `scripts/extract-phase-4-components.mjs`, `design-spec/components/phase-4-components.json`, `src/design-system/components/phase4SourceRegistry.ts` | utility / generated config | file-I/O, batch, transform | `scripts/extract-phase-3-components.mjs` | exact |
| `scripts/validate-phase-4-components.mjs` | utility | file-I/O, batch | `scripts/validate-phase-3-components.mjs` | exact |
| `scripts/extract-phase-4-artwork.mjs`, `design-spec/assets/phase-4/artwork-manifest.json`, three new `design-spec/assets/phase-4/*.webp` files | utility / static assets | file-I/O, batch | `scripts/extract-phase-3-artwork.mjs` | exact |
| One deterministic local Avatar photo story fixture (exact path is planner discretion) | static asset | file-I/O | none | no direct analog |
| `scripts/validate-phase-4-artwork.mjs`, `tests/phase4-artwork.test.tsx` | utility / test | file-I/O, batch | `scripts/validate-phase-3-artwork.mjs`, `tests/phase3-artwork.test.tsx` | exact |
| `src/design-system/components/generated/phase4Artwork.tsx` | component utility | transform | `src/design-system/components/generated/phase3Artwork.tsx` | exact |
| `identity/{Avatar,AvatarGroup,AvatarPicker}.tsx`, `status/StatusChip.tsx`, `progress/StepProgress.tsx` | component | transform, event-driven | `src/design-system/components/forms/ChoiceChip.tsx` | role/data-flow match |
| `content/{PlayerItem,GameCard,NotificationRow,SettingsRow,StatTile,ScoreResultBlock,PlayerPreferencesCard}.tsx` | component | transform, event-driven | `src/design-system/components/forms/ChoiceChip.tsx` | role/data-flow match |
| `feedback/{BannerToast,EmptyState}.tsx`, `cards/IllustratedCard.tsx` | component | transform, event-driven | `src/design-system/components/forms/ChoiceChip.tsx` plus `src/design-system/components/generated/phase3Artwork.tsx` | role/data-flow match |
| The 15 matching `*.stories.tsx` modules | component catalogue | event-driven, transform | `src/design-system/components/actions/Button.stories.tsx` | exact role match |
| `identity/index.ts`, `status/index.ts`, `progress/index.ts`, `content/index.ts`, `feedback/index.ts`, `cards/index.ts`, `src/design-system/components/index.ts`, `src/design-system/index.ts` | config / public API | transform | `src/design-system/components/forms/index.ts`, `src/design-system/components/index.ts` | exact |
| `tests/phase4-source-registry.test.ts` | test | batch, file-I/O | `tests/phase3-source-registry.test.ts` | exact |
| `tests/identity-status-progress-components.test.tsx`, `tests/content-components.test.tsx`, `tests/feedback-card-components.test.tsx` | test | event-driven, transform | `tests/form-components.test.tsx` | exact role match |
| `tests/types/phase4-component-contracts.typecheck.tsx` | test | compile-time transform | none | no direct analog |
| `src/design-system/stories/storyContract.ts`, `tests/phase4-story-contracts.test.tsx` | config / test | transform, batch | `src/design-system/stories/storyContract.ts`, `tests/phase3-story-contracts.test.tsx` | exact |
| `scripts/validate-phase-4-verification.mjs`, `design-spec/phase-4-verification.md`, `package.json` | utility / evidence / config | file-I/O, batch | `scripts/validate-phase-3-verification.mjs`, `design-spec/phase-3-verification.md`, `package.json` | exact |

## Pattern Assignments

### Phase 4 source evidence and registry

**Applies to:** `scripts/extract-phase-4-components.mjs`, `design-spec/components/phase-4-components.json`, `src/design-system/components/phase4SourceRegistry.ts`

**Analog:** `scripts/extract-phase-3-components.mjs`

**Fixed identity and ordered family ledger** (lines 12-31):

```javascript
export const REVISION = 296;
export const PAGE_ID = '482a7222-5a3b-8086-8008-a6073072bbb1';
export const EVIDENCE_PATH = 'design-spec/components/phase-3-components.json';
export const REGISTRY_PATH = 'src/design-system/components/sourceRegistry.ts';

export const FAMILY_SOURCES = Object.freeze([
  Object.freeze({ key: 'button', name: 'Button', sourceId: '...', count: 9, kind: 'set' }),
  // exact source order continues
]);
```

Copy the structure, substituting the exact 15-family/76-record Phase 4 ledger. The Phase 4 registry path must be separate; `sourceRegistry.ts` is byte-identity protected by the Phase 3 pipeline.

**Variant-container traversal and active-record proof** (lines 157-197):

```javascript
const families = FAMILY_SOURCES.map((source) => {
  const setShape = shapeById.get(source.sourceId);
  assert(setShape?.data.isVariantContainer === true, `component set is missing or no longer a variant container: ${source.sourceId}`);
  const components = setShape.data.shapes.map((mainInstanceId) => {
    const component = componentByMainInstance.get(mainInstanceId);
    assert(component, `component set child has no component record: ${mainInstanceId}`);
    assert(component.data.variantId === source.sourceId, `component record points at the wrong family: ${component.id}`);
    return component;
  });
  // retain sourceIndex, originalTuple, normalizedTuple, and metrics
});
```

Extend `recordMetrics` with family-specific descendant metrics: Avatar's visible named child supplies 32/40/48/56 geometry even though each root is 64x64. Normalize only the approved Player Preferences `Property 1=Content=Full|Profile` mapping; do not introduce a generic `Property 1` parser.

**Generated immutable runtime evidence** (lines 232-249):

```typescript
const deepFreeze = <T>(value: T): Readonly<T> => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const nested of Object.values(value as Record<string, unknown>)) {
      deepFreeze(nested);
    }
  }
  return value;
};

export const phase3SourceEvidence = deepFreeze(/* generated literal */ as const);
export const phase3SourceIdentity = phase3SourceEvidence.source;
export const phase3Families = phase3SourceEvidence.families;
```

Generate the Phase 4 equivalent as a literal TypeScript module. Runtime code must not import retained JSON, read the archive, call `parseZip`, or access a network URL.

### Phase 4 component-evidence validator

**Applies to:** `scripts/validate-phase-4-components.mjs`, `tests/phase4-source-registry.test.ts`

**Analog:** `scripts/validate-phase-3-components.mjs`

**Path containment, exact inventory, and byte identity** (lines 30-41, 48-88, 91-107):

```javascript
function withinRoot(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

assert(record.id === expectedRecord.id, `${source.name} record order/ID differs at index ${recordIndex}`);
assert(record.sourceIndex === recordIndex, `${source.name} sourceIndex differs at index ${recordIndex}`);
assert(record.active === true, `deleted/inactive record is not allowed: ${record.id}`);
assert(JSON.stringify(record.normalizedTuple) === JSON.stringify(expectedRecord.normalizedTuple), `unapproved normalized tuple differs for ${record.id}`);

assert(evidenceText === generated.evidenceText, 'committed evidence differs byte-for-byte from deterministic regeneration');
assert(registryText === generated.registryText, 'runtime registry differs byte-for-byte from deterministic regeneration');
```

Preserve the controlled-mutation self-test pattern from lines 115-171. Phase 4 mutations must cover missing/extra/duplicate/reordered records, deleted legacy Avatar/Avatar Picker records, wrong set membership, Player Preferences normalization drift, Avatar descendant geometry drift, abbreviated UUIDs, unsafe paths, and evidence/registry byte drift.

**Registry test shape** from `tests/phase3-source-registry.test.ts` (lines 35-65, 128-139, 142-163):

```typescript
expect(phase3SourceEvidence.familyCount).toBe(13);
expect(phase3SourceEvidence.recordCount).toBe(75);
for (const family of phase3Families) {
  expect(family.records.map((record) => record.sourceIndex)).toEqual(
    family.records.map((_, index) => index),
  );
}

expect(Object.isFrozen(phase3SourceEvidence)).toBe(true);
expect(registrySource).not.toMatch(
  /(?:phase-3-components\.json|design-source|\.penpot)|readFileSync|parseZip|https?:\/\//u,
);
```

Use Phase 4 counts and explicitly test the two deleted-record exclusions and the one approved metadata normalization.

### Phase 4 artwork extraction and runtime renderers

**Applies to:** `scripts/extract-phase-4-artwork.mjs`, `scripts/validate-phase-4-artwork.mjs`, `design-spec/assets/phase-4/*`, `src/design-system/components/generated/phase4Artwork.tsx`, `tests/phase4-artwork.test.tsx`

**Analogs:** `scripts/extract-phase-3-artwork.mjs`, `src/design-system/components/generated/phase3Artwork.tsx`

**Media identity and byte validation** from the extractor (lines 280-317):

```javascript
const imageFills = (shape.data.fills ?? []).filter((fill) => fill.fillImage);
assert(imageFills.length === 1, `${source.key} header must have exactly one local image fill`);
const image = imageFills[0].fillImage;
assert(image.id === source.mediaRecordId, `${source.key} header media record differs`);
assert(image.mtype === 'image/webp' && image.width === 1254 && image.height === 1254, `${source.key} header media profile differs`);

const archivePath = `objects/${source.mediaId}.webp`;
const bytes = context.archive.readEntry(entry);
assert(
  bytes.length >= 12 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP',
  `${source.key} local media object is not a WebP`,
);
```

The Phase 4 manifest must model seven placements over six distinct media records. Extract only the three new records; reference the retained Phase 3 `mascot-wave.webp`, `mascot-search.webp`, and `mascot-profile.webp` at their Phase 4 placement sizes.

**Decorative static renderer** from `phase3Artwork.tsx` (lines 2-9, 45-62):

```tsx
import { Image } from 'react-native';

const decorative = {
  accessibilityElementsHidden: true,
  accessible: false,
  importantForAccessibility: 'no-hide-descendants' as const,
};

export function WaveHeaderMascot() {
  return <Image {...decorative} resizeMode="contain" source={require('../../../../design-spec/assets/phase-3/mascot-wave.webp')} style={{ height: 64, width: 64 }} />;
}
```

Keep every `require` literal and static. Phase 4 renderers own the source-authored 80x80 or 96x96 size and remain private.

### All 15 family component modules

**Applies to:** every new non-story `*.tsx` under `identity`, `status`, `progress`, `content`, `feedback`, and `cards`

**Analog:** `src/design-system/components/forms/ChoiceChip.tsx`

**Imports and closed discriminated props** (lines 1-31):

```typescript
import { StyleSheet, View } from 'react-native';
import { Icon } from '../../assets/Icon';
import { Pressable } from '../../primitives/Pressable';
import { Text } from '../../primitives/Text';
import { colors } from '../../tokens';

type AvailableChoiceChipProps = ChoiceChipCommonProps & (
  | Readonly<{ type: 'option'; icon: 'none'; selected: false; disabled?: false }>
  | Readonly<{ type: 'option'; icon: 'leading'; selected: true; disabled?: false }>
);
```

Use one union member per authored tuple or compatible authored branch. Do not expose generic children, render slots, arbitrary icons, style escape hatches, navigation, persistence, timers, or remote-loading behavior.

**Runtime key/scalar/tuple validation** (lines 33-92):

```typescript
for (const key of Object.keys(props)) {
  if (!supportedRuntimeProps.includes(key as (typeof supportedRuntimeProps)[number])) {
    unsupported(key, supportedRuntimeProps);
  }
}
const tuple = `${String(runtimeProps.type)}/${String(runtimeProps.icon)}/${state}`;
if (!supportedTuples.includes(tuple as (typeof supportedTuples)[number])) {
  unsupported(tuple, supportedTuples);
}
```

For Phase 4, use the exact required diagnostic: `Unsupported {family} configuration: {tuple}. Supported configurations: {list}.`

**Controlled callback and one semantic boundary** (lines 94-130):

```tsx
<Pressable
  accessibilityLabel={label}
  accessibilityRole={type === 'option' ? 'radio' : 'checkbox'}
  accessibilityState={{ checked: selected }}
  disabled={disabled}
  onPress={() => onSelectedChange(!selected)}
>
  <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
    {/* decorative children */}
  </View>
</Pressable>
```

Render directly from props; emit intent/next value and wait for caller rerender. Static branches expose no callback. Disabled/read-only branches suppress callbacks and expose native state. Compound rows/cards hide redundant nested artwork and expose only their authored action boundary.

Family-specific composition order:

- Build `Avatar` before `AvatarGroup`, `AvatarPicker`, `PlayerItem`, `GameCard`, and score-related composites.
- Build `StatusChip` before `PlayerPreferencesCard`; chips inside that card are static text, not controls.
- `StepProgress`, `StatTile`, `ScoreResultBlock`, and `PlayerPreferencesCard` are presentational and expose no invented interaction.
- `BannerToast` owns no portal or timer; `NotificationRow` owns no read mutation; `SettingsRow` toggle emits the next boolean; cards own no navigation.

### All 15 Storybook modules

**Analog:** `src/design-system/components/actions/Button.stories.tsx`

**Typed meta, bounded controls, and provenance** (lines 1-27, 14-15):

```tsx
import type { Meta, StoryObj } from '@storybook/react-native';

const sourceLabel = (recordId: string) =>
  `Penpot ${phase3SourceIdentity.fileId} / ${phase3SourceIdentity.pageId} / revision ${phase3SourceIdentity.revision} / set ... / record ${recordId}`;

const meta = {
  title: 'Actions/Button',
  component: Button,
  argTypes: { onPress: { action: 'pressed' } },
} satisfies Meta<typeof Button>;
```

Use the exact Phase 4 titles from the UI contract. Controls come from the immutable Phase 4 registry and callbacks appear only on branches that own them.

**Tuple-safe normalization** (lines 41-62):

```typescript
export const normalizeButtonStoryArgs = (args: ButtonStoryArgs): ButtonProps => {
  if (args.loading === true) {
    return { label, loading: true, onPress, size: 48, style: 'primary' };
  }
  // return one complete supported branch, never a Cartesian combination
};
```

**Source-order variants and controlled harness** (lines 94-107, 139-159):

```tsx
{buttonRecords.map((record) => (
  <Fragment key={record.id}>
    <Button {...recordProps(record)} />
    <Text>{`${Object.values(record.originalTuple).join(' / ')} · ${record.id}`}</Text>
  </Fragment>
))}

function InteractiveHarness({ onPress }: Pick<ButtonProps, 'onPress'>) {
  const [presses, setPresses] = useState(0);
  // story owns state, rerenders component, then forwards the action
}
```

Every family must account for `Canonical`, `Variants`, `States`, `Boundaries`, and `Interactive`; use a non-empty inapplicability reason when a family is static. `Variants` must collectively render all 76 active records in source order.

### Family behavior and type tests

**Applies to:** the three family suites and `tests/types/phase4-component-contracts.typecheck.tsx`

**Analog:** `tests/form-components.test.tsx`

**Controlled rerender proof** (lines 791-821):

```tsx
const onCheckedChange = jest.fn();
const screen = await render(<Checkbox checked={false} onCheckedChange={onCheckedChange} />);
const checkbox = screen.getByRole('checkbox', { checked: false });
await userEvent.setup().press(checkbox);

expect(onCheckedChange).toHaveBeenCalledWith(true);
expect(checkbox.props.accessibilityState).toEqual(expect.objectContaining({ checked: false }));

await screen.rerender(<Checkbox checked onCheckedChange={onCheckedChange} />);
expect(screen.getByRole('checkbox', { checked: true })).toBeTruthy();
```

**Disabled suppression and decorative-child proof** (lines 823-840):

```tsx
await userEvent.setup().press(checkbox);
expect(onCheckedChange).not.toHaveBeenCalled();
expect(screen.queryAllByRole('image')).toHaveLength(0);
```

Apply this test vocabulary to explicit presence/read/result/progress/toggle/selected states, exact roles/names/values, aggregate reading order, nested-action isolation, 44-point target declarations, long content, and 200%-scale witnesses. Avoid broad snapshots.

The compile-time fixture has no repository precedent. Add representative `@ts-expect-error` calls for unsupported tuples, impossible callbacks, illegal collection cardinalities, and branch-incompatible content. Keep runtime cast-and-rejection tests as a separate proof.

### Story-contract and public-export integration

**Applies to:** family barrels, `src/design-system/components/index.ts`, `src/design-system/index.ts`, `src/design-system/stories/storyContract.ts`, `tests/phase4-story-contracts.test.tsx`

**Analogs:** `src/design-system/components/forms/index.ts`, `src/design-system/stories/storyContract.ts`, `tests/phase3-story-contracts.test.tsx`

**Narrow barrel pattern** from `forms/index.ts` (lines 1-22):

```typescript
export { Checkbox, type CheckboxProps } from './Checkbox';
export {
  ChoiceChip,
  type ChoiceChipProps,
  type ChoiceChipType,
} from './ChoiceChip';
```

Export public components and intentional public prop/types only. Keep the generated registry and artwork renderers private.

**Contract definition from `storyContract.ts`** (lines 228-286):

```typescript
const allStories = categories(
  story('Canonical'), story('Variants'), story('States'),
  story('Boundaries'), story('Interactive'),
);

const phase3Definitions = Object.freeze([
  ['Button', 'button', 'Actions/Button', ['style', 'size'], ['onPress']],
] as const);

recordIds: Object.freeze(family.records.map(({ id }) => id)),
```

Add a distinct Phase 4 public-export type/definition table sourcing `phase4SourceRegistry.ts`; do not rewrite Phase 3 identities. Record exact controls/actions and explicit static-category reasons.

**Closure assertions from `tests/phase3-story-contracts.test.tsx`** (lines 26-65):

```typescript
expect(Object.keys(phase3StoryContracts)).toEqual(expectedExports);
expect(Object.values(phase3StoryContracts).map(({ title }) => title)).toEqual(expectedTitles);
expect(Object.keys(contract.categories)).toEqual(storyTaxonomy);
expect(contract.recordIds).toEqual(family?.records.map(({ id }) => id));
expect(contract.controls.every((control) => !prohibited.includes(control))).toBe(true);
expect(contract.actions.every((action) => action.startsWith('on'))).toBe(true);
```

Phase 4 adds the 15 expected exports/titles and proves exactly 76 record IDs, valid controls/actions, provenance, and native-review deferrals.

### Verification closure

**Applies to:** `scripts/validate-phase-4-verification.mjs`, `design-spec/phase-4-verification.md`, `package.json`

**Analogs:** `scripts/validate-phase-3-verification.mjs`, `design-spec/phase-3-verification.md`, `package.json`

**Validator pattern** (verification validator lines 8-24, 37-45):

```javascript
for (const value of [
  'revision 296', '13 families', '75 records', 'Canonical', 'Variants',
  'States', 'Boundaries', 'Interactive', 'Expo web',
  'Status: `deferred-to-phase-5`',
]) required(verification, value);

assert(!/(?:native|ios|android|voiceover|talkback)[^\n]{0,80}(?:pass(?:ed)?|verified|approved|complete)/iu.test(verification), 'verification contains unsupported native-pass language');
```

Use 15 families/76 records, require all Phase 4 validators/test witnesses, and retain the Phase 5 native deferral language. The verification record should mirror `design-spec/phase-3-verification.md` lines 19-42: command/result/evidence table, catalogue closure, and an explicit statement that host/web evidence does not claim native acceptance.

**Package script pattern** (`package.json` lines 19-23):

```json
"validate:phase3-verification": "node scripts/validate-phase-3-verification.mjs",
"verify:phase3": "npm run typecheck && npm run lint && npm test -- --runInBand && npm run validate:design-source && node scripts/validate-phase-3-components.mjs && node scripts/validate-phase-3-artwork.mjs && npm run validate:phase3-verification && npm run storybook:web:smoke"
```

Create Phase 4 equivalents and keep the bounded Expo web smoke as secondary evidence.

## Shared Patterns

### Authentication

No authentication or authorization pattern applies. These are stateless design-system components; callbacks emit intent only.

### Runtime Validation

**Source:** `src/design-system/components/forms/ChoiceChip.tsx:33`

Apply supported-key, scalar, callback-pairing, cardinality, and exact-tuple checks to every family. Invalid input must throw the Phase 4 diagnostic and must never coerce to a nearby design.

### Controlled State and Callback Suppression

**Source:** `src/design-system/components/forms/ChoiceChip.tsx:94`

Persistent state comes from props. A callback reports intent/next state; visual state changes only after rerender. Shared `Pressable` provides disabled suppression, focus treatment, and effective target expansion.

### Accessibility Boundary

**Source:** `src/design-system/components/forms/ChoiceChip.tsx:98`

Give the meaningful outer composite its role/name/value/state. Hide redundant icons, mascots, and nested identity decoration. Keep genuinely separate actions focusable, such as the two empty Avatar Group slots.

### Source Traceability

**Source:** `scripts/extract-phase-3-components.mjs:146`

Always bind revision, file/page IDs, exact set ID, component/main-instance IDs, source index, original and normalized tuple, and geometry. Preserve order from the variant container instead of sorting records.

### Story Taxonomy

**Source:** `src/design-system/stories/storyContract.ts:3`

Every public family accounts for the ordered taxonomy `Canonical`, `Variants`, `States`, `Boundaries`, `Interactive`; static categories carry a non-empty reason.

### Error Handling

Build scripts use a local `assert` that throws precise invariant messages and a `main` wrapper that prefixes the phase/tool name and sets `process.exitCode = 1` (`scripts/extract-phase-3-components.mjs:36`, `285-291`). Runtime components throw the exact unsupported-configuration diagnostic before rendering.

## No Analog Found

| File / Decision | Role | Data Flow | Reason / Planner Action |
|---|---|---|---|
| `tests/types/phase4-component-contracts.typecheck.tsx` | test | compile-time transform | No existing `@ts-expect-error` fixture exists. Create a minimal strict TypeScript fixture included by `tsconfig.json`; do not add a package. |
| Deterministic Avatar `Photo/Selected` story fixture | static fixture | file-I/O | No dedicated player-photo fixture exists and Penpot's Avatar Photo node is not media-backed. Add/reuse a clearly-labelled local fixture without claiming Penpot artwork provenance. |
| Final Empty State visible body/CTA copy | content decision | transform | The UI contract is draft/pending on this copy. Add a human checkpoint before canonical stories/tests freeze `There's nothing here yet.` / `Get started`; do not invent replacement copy. |

## Metadata

**Analog search scope:** `scripts/`, `src/design-system/`, `tests/`, `design-spec/`

**Tracked analogs inspected:** 18 files; all named paths verified tracked

**Primary analog set:** Phase 3 component extractor/validator, Phase 3 artwork extractor/renderers, `ChoiceChip`, `Button` stories, source/story contract tests, and Phase 3 verification closure

**Pattern extraction date:** 2026-09-18
