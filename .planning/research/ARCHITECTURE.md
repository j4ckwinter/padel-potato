# Architecture Patterns

**Domain:** React Native / Expo design system, reviewed in Storybook
**Researched:** 2026-09-17
**Confidence:** MEDIUM — verified against current Storybook and Penpot primary documentation; exact Penpot object structure and installed Expo SDK still need implementation-time inspection.

## Recommended Architecture

Build one TypeScript React Native component library inside the Expo application. Its public surface is a deliberate, small set of token exports, layout/interaction primitives, and named reusable components. Storybook is a separate runtime entry point for exercising that same surface; it must never be where component behaviour or design values live.

```text
Penpot Foundations + Components (authority; stable page/node IDs)
       │ read-only MCP extraction + reference exports
       ▼
design-spec records ──► semantic design tokens ──► primitives ──► components
       │                       │                       │               │
       │                       └──────── TypeScript contracts ──────────┘
       ▼                                                               ▼
reference images + deviation ledger                         colocated CSF stories
       │                                                               │
       └──────────────────── native visual comparison ◄───────────────┤
                                                                       ▼
                      Expo Metro entry swap → on-device Storybook (iOS/Android)
                      optional secondary local catalogue → Expo web / RN Web
```

Use a source layout equivalent to the following (names may be adapted, boundaries should not):

```text
src/design-system/
  tokens/             # raw + semantic token values and TypeScript types
  primitives/         # token-consuming low-level UI contracts
  components/         # reusable composed controls; no product/domain knowledge
  assets/             # Penpot-exported icons/images and their source manifest
  index.ts             # curated public exports only
.rnstorybook/         # native Storybook configuration and global decorators
.storybook/           # only if a separate browser Storybook is required
design-spec/          # generated/checked-in Penpot metadata, references, deviation ledger
```

Do not create a `screens/`, navigation, game, player, API, store, or persistence layer in this milestone. A component may accept generic display and callback props, but must not reach into future application state or navigation.

### Component Boundaries

| Component | Responsibility | Communicates With |
|---|---|---|
| `design-spec` records | Trace each implementation to Penpot page/node/component IDs, extracted measurements, assets, reference-render path, and status. They are evidence, not runtime inputs. | Penpot MCP workflow, verification scripts/docs |
| `tokens` | Export typed raw foundations only where needed and semantic aliases for all component consumption: color roles, type styles, spacing, radii, borders, elevation, opacity, motion, sizing. | Penpot-derived specs; primitives; Storybook theme/decorators |
| `primitives` | Define RN-native building blocks such as text, stack/inline layout, surface, icon, pressable and focus/state treatment. Translate semantic tokens into `StyleSheet`/style props. | tokens, asset wrappers; components |
| `components` | Implement Penpot component-set contracts, variants, states and slots by composing primitives. Own accessibility labels/roles and interaction callbacks. | primitives, tokens, assets; their own stories/tests |
| `assets` | Keep exported SVG/raster assets and a manifest mapping each asset to Penpot source identity and intended RN rendering method. | Penpot exports; icon/image primitives |
| native Storybook config | Discover stories; supply global backgrounds, safe-area/container and action decorators; use Expo/Metro entry switching. | all stories; Expo Metro |
| browser review config | Optional, secondary local catalogue of the same stories/components via RN Web. It contains no duplicate component implementations. | shared stories/components |
| tests | Assert token contracts, component semantics, interactions, and selected visual regression or reference-comparison evidence. | public exports and stories; never Penpot live at ordinary unit-test runtime |

### Token and Dependency Flow

1. Extract `01 Foundations` into a human-reviewed spec record first. Preserve the original Penpot token/style/component IDs as provenance. Classify values as raw (for example palette ramps or numeric spacing scale) versus semantic (for example `content.primary`, `surface.default`, `action.primary`).
2. Encode raw values once and derive semantic aliases from them. Components consume semantic aliases; a raw token is permitted only in token/primitives implementation. This makes later visual correction a token change rather than a repo-wide search.
3. Build primitives with React Native APIs (`View`, `Text`, `Pressable`, `Image`/SVG) and compose tokens through styles. Platform selectors are isolated in primitives/assets, rather than scattered through components.
4. Build each Penpot component set as one exported component with a typed variant/state union. Model designed states explicitly (for example `disabled`, `selected`, `loading`, `error`) rather than allowing arbitrary stringly style overrides.
5. Stories invoke public component APIs only. Tests can use stories as fixtures/portable stories where compatible, but unit tests also directly cover invariant contracts. Product screens will later depend only on the root design-system barrel, never on `.rnstorybook` or Penpot spec files.

**Dependency rule:** `tokens → primitives → components → stories/tests/verification`. Imports must flow left-to-right. A primitive cannot import a component, a component cannot import Storybook, and runtime code cannot import verification artifacts.

### Data Flow

Penpot is an external design authority, not an application runtime dependency:

```text
Penpot MCP read/extract
  → source manifest (Penpot IDs, style values, variants, asset export metadata)
  → reviewed token/component implementation
  → story matrix (each public variant + meaningful state)
  → Expo native render on iOS and Android
  → captured render compared with same-device-class Penpot reference
  → pass, corrected implementation, or documented intentional deviation
```

This prevents an unavailable Penpot tab or MCP connection from breaking the library, application build, or ordinary test suite.

## Story and Test Organization

Colocate a `*.stories.tsx` and `*.test.tsx` with every primitive/component. Give stories stable titles aligned with the public taxonomy, e.g. `Foundations/Color`, `Primitives/Pressable`, `Components/Button`. Foundations get visual reference stories (type scale, color roles, spacing/radius/elevation samples), not fake product screens.

Each component story file should include:

- a canonical/default story;
- a generated or explicit variant matrix covering every designed variant;
- an interactive-state matrix (enabled, pressed where representable, disabled, selected, loading, error); and
- only necessary content/size boundary cases.

Put shared provider setup, device-safe viewport padding, backgrounds, and action logging in `.rnstorybook/preview.tsx`, not repeated decorators. Configure a narrow, deterministic story glob in `.rnstorybook/main.ts`. Current React Native Storybook supports TypeScript CSF, `main.ts` story discovery, `preview.tsx` decorators, and on-device controls/actions/backgrounds. [Storybook React Native docs](https://github.com/storybookjs/react-native) (MEDIUM confidence, primary documentation reached via verified web search).

Tests should be tiered:

| Tier | Scope | Runs when | Evidence |
|---|---|---|---|
| Static/type | token schemas, forbidden dependency direction, public API typing | every change | compile/lint result |
| Unit | deterministic token resolution, component rendering, accessibility props and callback semantics | every change | test result |
| Story interaction | representative interactions and state changes using the same args/decorators as stories where tooling supports it | every component phase | portable-story or renderer test result |
| Native smoke | Storybook launch and representative story navigation on iOS and Android | milestone/CI-capable device lane | simulator/device capture |
| Visual design verification | selected canonical and state stories compared with Penpot reference renders | after a component or token batch | artifact plus ledger entry |
| Web smoke | local browser discovery/rendering for shared stories | after shared-story/config changes | browser screenshot/console result |

The browser lane is deliberately smoke-level. Current Storybook treats high-fidelity on-device React Native and browser React Native Web as separate implementations; the latter is feature-rich but can differ when DOM equivalents are used. [Storybook React Native Web documentation](https://storybook.js.org/docs/get-started/frameworks/react-native-web-vite) (MEDIUM confidence). Do not block native fidelity on browser pixel parity. If the explicit requirement is literally `expo start --web` rather than a Vite catalogue, spike that in the bootstrap phase and preserve a single shared story source; current official documentation describes the supported browser catalogue as RN Web + Vite, so an Expo-Metro-only browser path must be proven rather than assumed.

## Penpot MCP Extraction and Verification Workflow

1. Connect MCP to the specified Penpot file and confirm the active document and the two authoritative pages: `01 Foundations` (`482a7222-5a3b-8086-8008-a6072bd7e924`) and `02 Components` (`482a7222-5a3b-8086-8008-a6073072bbb1`). Do not use `03 Product Screens` as an implementation backlog.
2. Run read-only overview/extraction requests per page/component set. Record page ID, node/component ID, name, variant property values, typography, dimensions, spacing, colours, asset identity, and any state annotation in a reviewable manifest. MCP can inspect pages, components, styles, tokens and export shapes; start read-only because it can also modify the connected design file. [Penpot MCP documentation](https://help.penpot.app/mcp/) (MEDIUM confidence).
3. Export reference renders for each canonical foundation/component and each visually distinct state. Store them with a source manifest and immutable filenames keyed by Penpot ID; do not overwrite an old baseline without recording why it changed.
4. Implement against the manifest, then open the matching Storybook story on iOS and Android. Capture the native render at a declared device/scale, compare to the matching Penpot export, and log the result.
5. A mismatch must end as: corrected code/token, corrected design source confirmed by the designer, platform-rendering limitation with a reason, or an intentional deviation. The ledger must name the Penpot ID, story ID, platforms checked, reference/capture paths, date, owner, decision, and follow-up.
6. Keep MCP connected and its Penpot tab awake during extraction. Penpot documents that the plugin operates on the selected connected tab and can fail when that tab is frozen; extraction must therefore be an explicit workflow step, never a hidden test prerequisite. [Penpot MCP documentation](https://help.penpot.app/mcp/) (MEDIUM confidence).

## Patterns to Follow

### Pattern 1: Semantic Token Facade

**What:** Export intent-based tokens to components and retain raw design scales inside the token module.

**When:** Always. It is particularly important before multiple Penpot components begin sharing surfaces, text and action styling.

**Example:**

```typescript
// tokens/color.ts
export const palette = { grass700: '#...', ink950: '#...' } as const;
export const color = {
  content: { primary: palette.ink950 },
  surface: { default: '#...' },
  action: { primary: palette.grass700 },
} as const;
```

### Pattern 2: Component Contract + Variant Matrix

**What:** One component maps an explicit Penpot component set to a discriminated prop contract; one story matrix proves the contract.

**When:** Whenever Penpot exposes a reusable component with variants/states.

**Example:**

```typescript
type ButtonProps = {
  variant: 'primary' | 'secondary' | 'tertiary';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;
};
```

### Pattern 3: Evidence Kept Outside Runtime

**What:** Preserve Penpot metadata, exported reference files and deviation decisions as versioned verification artifacts, never imported by the app.

**When:** For every foundation/component batch.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Hex Values and Layout Numbers in Components

**Why bad:** It breaks Penpot traceability and turns foundation corrections into broad rewrites.

**Instead:** Apply semantic tokens through primitives.

### Anti-Pattern 2: Building “Generic” Components Before Reading Penpot Variants

**Why bad:** It silently creates props, states, and visual behaviour the authority did not define.

**Instead:** Extract one component set first, implement its exact contract, then add only demonstrated responsive/accessibility adaptations.

### Anti-Pattern 3: Storybook-Only Implementations

**Why bad:** Screens later cannot reuse decorators, mock state or bespoke story styling safely.

**Instead:** Stories consume the library’s public API; shared providers belong in preview configuration.

### Anti-Pattern 4: Treating Web as Pixel Authority

**Why bad:** React Native Web and native rendering can differ in platform capability and layout details.

**Instead:** Use web for convenient discovery/smoke review; retain iOS and Android captures as acceptance evidence.

## Scalability Considerations

| Concern | At 100 users | At 10K users | At 1M users |
|---|---|---|---|
| Consumer count | Single Expo app; direct workspace imports are sufficient. | Publish/version the library only if another app needs it. | Maintain semantic-versioned package contracts and migration notes. |
| Visual verification | Manual side-by-side comparison is acceptable. | Automate repeatable capture/diff for canonical stories. | Baseline governance, device matrix and approval workflow are required. |
| Token change | Review affected stories manually. | Use token-to-component provenance to target regression runs. | Enforce design-token change review and compatibility/deprecation policy. |
| Story catalogue | One story per matrix is navigable. | Split taxonomy by primitives/components and use stable titles. | Generate coverage reports from component manifests; avoid unbounded combinations. |

## Suggested Vertical Build Order

1. **Bootstrap and proof seam:** Create Expo TypeScript app, native Storybook entry-point swap/Metro wrapper, a single shared sample story, iOS/Android launch checks, and an explicit local web proof. This resolves the only material renderer/configuration uncertainty before design work accumulates. Storybook’s current Expo guidance uses `withStorybook` and `STORYBOOK_ENABLED` entry swapping, which keeps Storybook out of the ordinary app bundle. [Getting started](https://github.com/storybookjs/react-native/blob/next/docs/docs/intro/getting-started/index.md) (MEDIUM confidence).
2. **Penpot inventory and foundations:** Extract foundations, create the source/reference/deviation artifact structure, implement tokens and base text/layout/surface primitives, and publish foundation stories plus unit tests.
3. **Interaction and asset primitives:** Establish pressable/focus/disabled conventions, icon/image wrappers and asset provenance. Verify these on both native platforms before any composite component hides flaws.
4. **Component batches, vertically:** For each Penpot component set: extract → typed component → canonical/variant/state stories → unit/interaction tests → iOS/Android comparison → ledger decision. Batch by dependency (for example Button before button-bearing controls), not by speculative product screen.
5. **Catalogue hardening:** Confirm all designed variants/states have navigable stories, run native regression sweeps, keep web review working, and close every mismatch as a correction or documented deviation.

## Sources

- [Storybook for React Native — current setup, Storybook config, addons, and Expo entry switching](https://github.com/storybookjs/react-native) — MEDIUM confidence (official project documentation, cross-checked with current docs).
- [Storybook React Native getting started](https://github.com/storybookjs/react-native/blob/next/docs/docs/intro/getting-started/index.md) — MEDIUM confidence.
- [Storybook for React Native Web](https://storybook.js.org/docs/get-started/frameworks/react-native-web-vite) — MEDIUM confidence (official documentation).
- [Penpot MCP server](https://help.penpot.app/mcp/) — MEDIUM confidence (official documentation).
