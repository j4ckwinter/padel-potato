# Phase 3: Actions, Forms, and Navigation Components - Research

**Researched:** 2026-09-18
**Domain:** Penpot-derived React Native component families, controlled interaction contracts, accessibility, Storybook, and Jest/RNTL verification
**Confidence:** HIGH for repository/Penpot findings; MEDIUM for documentation findings fetched through web search

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Public API and Penpot Fidelity
- Model Penpot variant axes with closed discriminated props so unsupported combinations are not representable.
- Allow labels, values, and callbacks to be customized while keeping geometry and visual semantics component-owned.
- Normalize only clear Penpot authoring defects, such as generic `Property 1` or `Value 2` labels, and retain an explicit source mapping or deviation record.
- Retain Phase 3 component/source registries at canonical family or component-set level, pinned to the committed local Penpot revision 296.

#### State and Interaction Ownership
- Components expose controlled values and selections; interactive stories provide local harness state rather than making components product-state owners.
- Derive transient focus and pressed visuals from native events; public props represent persistent supported states rather than simulated transient states.
- Use native `TextInput` behavior for text fields; select, date, and time variants remain trigger components without implementing product-level picker overlays.
- Navigation components emit destination or action callbacks without owning routing or importing a navigation framework.

#### Accessibility and Native Semantics
- Use control-specific native roles and checked or selected accessibility values rather than generic button semantics everywhere.
- Expose each destination and segment in composite navigation controls as an individually named control with selected state.
- Associate field labels, hints, required state, and errors semantically while retaining the visible Penpot content.
- Reuse the Phase 2 `Pressable` contract and preserve at least 44x44 effective touch targets, including compact visual controls.

#### Storybook, Tests, and Delivery Structure
- Deliver dependency-ordered vertical families: actions first, forms and authentication second, then navigation and headers.
- Group stories under `Actions`, `Forms`, `Authentication`, and `Navigation` while using the established `Canonical`, `Variants`, `States`, `Boundaries`, and `Interactive` taxonomy.
- Test callbacks, blocked states, controlled changes, accessibility state, and field editing; real routing and product-level picker flows remain out of scope.
- Retain deterministic Penpot references and web/runtime checks during implementation; authoritative iOS and Android visual comparison remains assigned to Phase 5.

### the agent's Discretion
- Exact internal module boundaries, shared style helpers, and test fixture organization may follow the closest Phase 2 patterns as long as public contracts remain bounded and source-traceable.

### Deferred Ideas (OUT OF SCOPE)
- Product routing, application navigation state, authentication services, and complete date/time/select picker workflows remain deferred to later product milestones.
- Authoritative iOS and Android visual comparison remains in Phase 5.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ACTN-01 | Developer can use Button with every designed style, size, and state. | Nine-record sparse source matrix, Pressable composition, loading/blocked contract, and action/story tests. |
| ACTN-02 | Developer can use Icon Button with every designed size, icon, and state. | Six-record matrix, closed `IconName`, required accessible label, and 40/44 target rules. |
| ACTN-03 | Developer can use Favourite with every designed state. | Two-record `Property 1` to `checked` normalization, controlled toggle contract, and retained heart geometry. |
| FORM-01 | Developer can use Field with every designed type and state. | Twelve-record matrix and three-way discriminated implementation: editable, trigger, and stepper. |
| FORM-02 | Developer can use Choice Chip with every designed type, icon option, and state. | Eight-record sparse matrix, radio/checkbox semantic split, and controlled selection. |
| FORM-03 | Developer can use Checkbox with every designed state. | Four source records, controlled checked state, no invented indeterminate state. |
| FORM-04 | Developer can use Day Time Selector with every designed type and state. | Six source records, radio semantics, controlled selection, and exact day/time geometry. |
| AUTH-01 | Developer can use Social Sign-In Button with every designed provider and state. | Eight source records, local Google/Apple asset extraction, and no authentication SDK behavior. |
| AUTH-02 | Developer can use Auth Divider as designed. | One component record, static readable label, and decorative rules. |
| NAVG-01 | Developer can use Bottom Navigation with every designed active destination. | Five records, fixed destination registry/order, per-tab callbacks and selected semantics. |
| NAVG-02 | Developer can use Segmented Control with every designed option count and state. | Four source records, tuple-bounded 2/3/4 options, individual tabs, controlled value. |
| NAVG-03 | Developer can use App Header with every designed page configuration. | Nine-record page union, configuration-specific regions/callbacks, mascot evidence, and header semantics. |
| NAVG-04 | Developer can use Section Header as designed. | One component record, heading plus conditional required action callback. |
</phase_requirements>

## Summary

Phase 3 should be planned as three dependency-ordered vertical batches over a shared evidence/registry foundation: actions, forms/authentication, then navigation/headers. The committed archive contains exactly 75 active component records across the 13 required families. That matrix is intentionally sparse: for example, Button has only one 40-point record and Field does not contain every type/state combination. The implementation must preserve every retained record in source evidence and stories without treating those records as permission to invent a Cartesian product. [VERIFIED: `npm run design:inspect` against committed revision 296; approved contract at `.planning/phases/03-actions-forms-and-navigation-components/03-UI-SPEC.md:191-211`]

The existing Phase 2 layer is sufficient: `Pressable` already owns blocked state, native focus, target expansion, and accessibility-state merging; the local `Icon` registry and token/primitives layer already close visual escape routes; Storybook and RNTL conventions are established. No external package is needed. The one extra evidence task is local extraction/normalization of Phase 3-specific artwork and family metadata: the heart, Google/Apple provider artwork, and six 64-point App Header mascot media references are present in revision 296 but are not public names in the current 18-icon registry. They must be retained locally rather than redrawn or replaced. [VERIFIED: local revision-296 shape traversal via `scripts/penpot-source.mjs`; existing icon registry at `src/design-system/assets/generated/iconRegistry.ts:1-24`]

**Primary recommendation:** begin with a deterministic revision-296 Phase 3 source registry and asset extractor, then implement and verify each vertical family against that registry before starting its dependents.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|--------------|----------------|-----------|
| Penpot archive inspection and normalized evidence | Build-time tooling | Static assets | Node scripts read the committed archive and emit deterministic repository evidence; runtime components never parse Penpot. |
| Component rendering and controlled interactions | Browser / Client (React Native client) | — | All Phase 3 behavior is local native UI behavior with consumer-owned state. |
| Storybook catalogue/harness state | Browser / Client (React Native Storybook) | Build-time Storybook config | Stories render native components and may own demo state only. |
| Semantic/interaction verification | Test tooling | React Native host renderer | Jest/RNTL verifies observable host contracts; native visual/AT proof remains Phase 5. |
| Routing, authentication, picker overlays, persistence | Out of scope | — | CONTEXT.md explicitly defers these systems. |

## Project Constraints (from AGENTS.md)

- Mobile-only iOS/Android; Expo/React Native is the implementation stack. [VERIFIED: `AGENTS.md`, Project Constraints]
- React Native Storybook is the independently reviewable component workbench. [VERIFIED: `AGENTS.md`, Project Constraints]
- The committed `design-source/padel-potato UI Concepts.penpot` archive is the default design authority; use `npm run design:inspect`, and do not require live Penpot MCP. [VERIFIED: `AGENTS.md`, Project Constraints]
- Run `npm run validate:design-source`, then distinguish source inspection/web checks from native visual comparison. [VERIFIED: `AGENTS.md`, Project Constraints]
- Expo web is a secondary local catalogue and must not compromise native behavior. [VERIFIED: `AGENTS.md`, Project Constraints]
- Use typed React Native styles and local tokens; do not introduce NativeWind, a UI kit, CSS-in-JS, or a second Storybook configuration. [VERIFIED: `AGENTS.md`, Technology Stack]
- Use RNTL rather than deprecated renderer-centric component tests; keep Storybook packages on the already approved 10.5.0 family. [VERIFIED: `.planning/STATE.md`, accumulated Phase 1/2 decisions; `package.json:43-60`]
- Start implementation through the applicable GSD workflow; do not edit the repository outside it unless explicitly bypassed. [VERIFIED: `AGENTS.md`, GSD Workflow Enforcement]

## Standard Stack

No new dependency should be installed in this phase. Reuse the exact committed stack. The following versions are quoted verbatim from the opened package manifest. [VERIFIED: `package.json:25-62`]

### Core

| Library | Version | Purpose | Why Standard Here |
|---------|---------|---------|-------------------|
| Expo | `57.0.24` | Managed native/web runtime | Existing project runtime and Metro owner. |
| React Native | `0.86.3` | Native UI and accessibility primitives | Supplies `Pressable`, `TextInput`, native roles/states, layout, and focus events. |
| React | `19.2.3` | Component/state model | Existing compatible React version. |
| TypeScript | `6.0.3` | Discriminated props and exact tuple contracts | Existing strict compile gate; no alternate schema library is needed. |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@storybook/react-native` | `10.5.0` | Native component catalogue | All 13 public families and controlled story harnesses. |
| `@storybook/addon-ondevice-controls` | `10.5.0` | Bounded args | Only closed primitive controls from immutable registries. |
| `@storybook/addon-ondevice-actions` | `10.5.0` | Callback visibility | Only real public callbacks. |
| `@testing-library/react-native` | `14.0.1` | Semantic and interaction tests | Role/name/value/state queries and awaited `userEvent`. |
| Jest / `jest-expo` | `29.7.0` / `57.0.5` | Expo-aware unit/component runner | Existing preset and top-level `tests/` suite. |
| `react-native-svg` | `15.15.4` | Local vector artwork | Retained Phase 3 heart and provider vector geometry where the source is SVG-compatible. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Existing primitives/tokens | Third-party component kit | Would introduce untraced geometry, variants, and semantics, violating the locked source boundary. |
| Native `TextInput` | Pressable facade/custom text editor | Would lose native editable behavior and complicate accessibility and RNTL interactions. |
| Trigger-only select/date/time fields | Installed picker/bottom-sheet dependencies | Existing packages are present but product-level overlays are explicitly deferred; using them would expand scope. |
| Consumer-controlled state | Dual controlled/uncontrolled components | Adds hidden ownership and state synchronization combinations not authored in Penpot. |

**Installation:** none. Do not add or update packages.

## Package Legitimacy Audit

Not applicable. Phase 3 installs no package and uses only the existing, previously approved dependency matrix. Therefore the package-legitimacy gate has no new package input.

## Exact Penpot Inventory and Axes

The source identity is file `c514c1fb-1cda-8125-8008-a606253a77a3`, page `02 Components` (`482a7222-5a3b-8086-8008-a6073072bbb1`), revision `296`. The normalized public axes quoted by the approved UI contract are: Button `style: primary | secondary | destructive | ghost`, `size: 40 | 48`; Field `type: text | password | search | select | date | time | stepper`; Choice Chip `type: option | filter`, `icon: none | leading | trailing`; Bottom Navigation `home | games | create | players | profile`; Segmented Control exactly `2`, `3`, or `4`; App Header `home | games | create | players | profile | notifications | gameDetails | playerDetails | settings`. [VERIFIED: `.planning/phases/03-actions-forms-and-navigation-components/03-UI-SPEC.md:191-211`, values quoted verbatim]

| Family | Canonical set/component | Retained records | Implementation axis |
|--------|-------------------------|------------------|---------------------|
| Button | `482a7222-5a3b-8086-8008-a60ea01107a5` | 9 | Closed style/size; persistent disabled/loading; pressed/focused derived. |
| Icon Button | `482a7222-5a3b-8086-8008-a60eda8bf731` | 6 | `40 | 44`, closed `IconName`, required label. |
| Favourite | `ab02a31f-1852-80be-8008-a6fb4b80c769` | 2 | Normalize `Property 1: Default | Selected` to `checked: boolean`. |
| Field | `482a7222-5a3b-8086-8008-a60edc77a99f` | 12 | Editable/trigger/stepper discriminated branches. |
| Choice Chip | `482a7222-5a3b-8086-8008-a61b1055dd19` | 8 | Option/radio vs filter/checkbox semantic branch. |
| Checkbox | `482a7222-5a3b-8086-8008-a61e92e286a2` | 4 | Controlled boolean; no indeterminate state. |
| Day Time Selector | `482a7222-5a3b-8086-8008-a62580c2b764` | 6 | Day/time discriminant; controlled selection. |
| Social Sign-In Button | `482a7222-5a3b-8086-8008-a61e90365f95` | 8 | Google/Apple; default/pressed/focused/disabled. |
| Auth Divider | `482a7222-5a3b-8086-8008-a61e93b191ff` | 1 | Static label default `or`. |
| Bottom Navigation | `482a7222-5a3b-8086-8008-a61a5487bd61` | 5 | Fixed destination registry and order. |
| Segmented Control | `482a7222-5a3b-8086-8008-a60ede25d147` | 4 | Tuple-bounded 2/3/4 options. |
| App Header | `482a7222-5a3b-8086-8008-a61da61c2e7f` | 9 | Page-discriminated regions and callbacks. |
| Section Header | `482a7222-5a3b-8086-8008-a608c3bde79a` | 1 | Title plus optional action pair. |

### Retained record ledger

This ledger is the exact active-record result from local archive inspection. It should become a checked-in generated evidence registry so the planner can require exact count/order assertions. [VERIFIED: local `scripts/penpot-source.mjs` traversal of committed revision 296]

`DATA_Q7M2K9PX_START`

- Button: `...9febb9fe Secondary/48/Default`; `...9fef8841 Primary/40/Default`; `...9ff37cc9 Primary/48/Pressed`; `...9ff76866 Destructive/48/Default`; `...9ffb012d Primary/48/Focused`; `...9fff0e5a Primary/48/Loading`; `...a002fe1f Ghost/48/Default`; `...a006c15d Primary/48/Default`; `...a00aa7c3 Primary/48/Disabled` (all prefix `482a7222-5a3b-8086-8008-`).
- Icon Button: `...a60eda7950b0 40/Default/Notification`; `...a60eda7d0395 44/Default/Notification`; `...a60eda809f18 40/Pressed/Notification`; `...a60eda8475eb 40/Focused/Notification`; `...a60eda87a472 40/Disabled/Notification`; `ab02a31f-1852-80be-8008-a6fb1c6fcb94 44/Default/Value 2`.
- Favourite: `ab02a31f-1852-80be-8008-a6fb4b6d6c28 Property 1=Default`; `ab02a31f-1852-80be-8008-a6fb4b70487f Property 1=Selected`.
- Field: `...a60edc611d1f Text/Default`; `...a60edc64ca3f Select/Focused`; `...a60edc68782c Date/Filled`; `...a60edc6c2e7a Time/Disabled`; `...a60edc6fee32 Search/Error`; `...a60edc73a9ee Stepper/Success`; `...a61ebfb41d52 Password/Default`; `...a61ebfc2534d Password/Focused`; `...a61ebfcf9740 Password/Filled`; `...a61ebfdba0fd Password/Error`; `...a6441b03c008 Search/Default`; `ab02a31f-1852-80be-8008-a70ba55b7418 Text/Read only`.
- Choice Chip: `...a61b0dda64ca Option/Default/None`; `...a61b0e2824c4 Option/Selected/Leading`; `...a61b0e64f36b Option/Focused/None`; `...a61b0ea19e36 Option/Disabled/None`; `...a61b0ef148b4 Filter/Default/Trailing`; `...a61b0f7340b2 Filter/Selected/Leading`; `...a61b0fe4e063 Filter/Focused/Trailing`; `...a61b104c83d8 Filter/Disabled/Trailing`.
- Checkbox: `...a61e91ee2b48 Unchecked`; `...a61e925d864e Checked`; `...a61e929bb3af Focused`; `...a61e92d8b300 Disabled`.
- Day Time Selector: `...a6257eaab1fe Day/Default`; `...a6257f13960f Day/Selected`; `...a6257f7809c0 Day/Disabled`; `...a6257fe39820 Time/Default`; `...a62580512f9f Time/Selected`; `...a62580bacfc1 Time/Disabled`.
- Social Sign-In Button: `...a61e8cd600f5 Google/Default`; `...a61e8d34ebc3 Google/Pressed`; `...a61e8d8f8695 Google/Focused`; `...a61e8e15b0be Google/Disabled`; `...a61e8ebdd214 Apple/Default`; `...a61e8f4a29d0 Apple/Pressed`; `...a61e8fbc12cc Apple/Focused`; `...a61e902c685a Apple/Disabled`.
- Bottom Navigation: `...a608c35c3552 Home`; `...a61a521a8296 Games`; `...a61a534ab071 Players`; `...a61a547e5269 Profile`; `...a64a6bb0ef3a Create`.
- Segmented Control: `...a60ede15a862 2/Default`; `...a60ede19acec 3/Selected`; `...a60ede1db175 4/Focused`; `...a60ede21f882 3/Disabled`.
- App Header: `...a614fb46e43a Home`; `...a61da425e5db Games`; `...a61da49f5f47 Create`; `...a61da51a620a Players`; `...a61da5958fa0 Profile`; `...a61da612fc3a Notifications`; `...a6412e721e27 Game details`; `...a64ea95a3902 Player details`; `...a64fd4f7c3a8 Settings`.
- Singletons: Auth Divider `482a7222-5a3b-8086-8008-a61e93b191ff`; Section Header `482a7222-5a3b-8086-8008-a608c3bde79a`.

`DATA_Q7M2K9PX_END`

The abbreviated IDs above use the unambiguous shared prefix shown in each family; the generated JSON/TypeScript registry must store full UUIDs and assert 75 exact records. Do not copy the abbreviations into runtime code.

## Architecture Patterns

### System Architecture Diagram

```text
Committed Penpot archive (revision 296)
  -> validate archive identity/checksum/self-tests
  -> inspect only 13 approved families and descendant shapes/media
  -> normalize 2 documented metadata defects + harmless fractional dimensions
  -> retain exact 75-record evidence + hashes + family artwork
  -> generate immutable source/style registries
       -> Actions (Pressable + Text + Icon/local heart)
       -> Forms/Auth (Actions + TextInput + primitives + provider artwork)
       -> Navigation/Headers (Actions + controls + mascot media)
  -> public design-system barrel
  -> typed CSF stories (5-category contract)
  -> Jest/RNTL semantic/interaction/source tests
  -> Expo-web smoke (catalogue discovery only)
  -> Phase 5 native visual/VoiceOver/TalkBack comparison
```

### Recommended Project Structure

```text
scripts/
├── extract-phase-3-components.mjs       # local archive -> deterministic evidence/assets
└── validate-phase-3-components.mjs      # exact identity, records, axes, hashes, safety
design-spec/
├── components/phase-3-components.json   # 75 normalized source records + metrics
├── assets/phase-3/                       # retained heart/provider/mascot source evidence
└── phase-3-verification.md               # host/web results; native explicitly deferred
src/design-system/
├── components/
│   ├── sourceRegistry.ts                 # generated/immutable public source metadata
│   ├── shared/                           # family-only geometry/state helpers
│   ├── actions/                          # Button, IconButton, Favourite + stories
│   ├── forms/                            # Field, ChoiceChip, Checkbox, DayTimeSelector + stories
│   ├── authentication/                   # SocialSignInButton, AuthDivider + stories
│   └── navigation/                       # BottomNavigation, SegmentedControl, headers + stories
└── stories/storyContract.ts              # extend taxonomy/applicability for 13 exports
tests/
├── phase3-source-registry.test.ts
├── action-components.test.tsx
├── form-auth-components.test.tsx
├── navigation-components.test.tsx
└── phase3-story-contracts.test.tsx
```

Exact filenames are discretionary; keep ownership boundaries equivalent and keep evidence/build-time modules out of runtime imports.

### Pattern 1: Evidence first, runtime second

**What:** extend the local archive pipeline before component code. Filter by the 11 set IDs plus two singleton component IDs, reject deleted records, traverse each main instance and referenced media, sort deterministically, and emit full UUIDs/variant tuples/geometry/typography/paint/hash data. Validate exact revision/file/page, `75` count, two normalizations, and allowed shape/media profiles. [VERIFIED: UI contract requires all 75 records at `.planning/phases/03-actions-forms-and-navigation-components/03-UI-SPEC.md:322-339`; safe archive reader exists in `scripts/penpot-source.mjs`]

**When to use:** Wave 0, before the first component; rerun whenever evidence or generated registries change.

**Important asset finding:** current public icons do not include heart, Google, Apple, or mascots. Revision 296 contains a 20-point heart path; Google has four paths with `#4285f4`, `#34a853`, `#fbbc05`, `#ea4335`; Apple has two ink paths; Home/Games/Create/Players/Profile headers reference six 64-point media records (Games uses the Search mascot). Retain these as family-owned local assets, not generalize them into arbitrary caller-selectable icons. [VERIFIED: local revision-296 descendant/media inspection]

### Pattern 2: Public unions separate persistent props from native transient state

**What:** public types expose persistent inputs only. Pressed/focused is derived from the existing primitive/native input events. Every controlled callback emits the requested next value but the render remains governed by the supplied prop. [VERIFIED: `.planning/phases/03-actions-forms-and-navigation-components/03-UI-SPEC.md:70-79,237-265`]

**When to use:** every interactive family.

```typescript
// Source pattern: approved UI contract + existing Pressable implementation.
// The exact literal values are quoted in "Exact Penpot Inventory and Axes" above.
export const buttonStyles = Object.freeze([
  'primary', 'secondary', 'destructive', 'ghost',
] as const);
export const buttonSizes = Object.freeze([40, 48] as const);

type ButtonProps = {
  label: string;
  style: (typeof buttonStyles)[number];
  size: (typeof buttonSizes)[number];
  disabled?: boolean;
  loading?: boolean;
  onPress: () => void;
};
```

Because Penpot's Button axis is itself named `Style`, do not also add an unbounded React Native `style` object to `Button`. Prefer consumer wrapper layout; if a layout seam is unavoidable, name it `layoutStyle`, apply it only to outer placement keys, and retain the Penpot-to-public mapping explicitly. This avoids silently renaming an approved public axis or weakening the reserved visual contract. [VERIFIED: approved axis at UI-SPEC line 197; existing runtime style rejection pattern at `src/design-system/primitives/styleGuards.ts:84-99`]

### Pattern 3: Field is a discriminated family, not one bag of optional props

**What:** use three branches so impossible callbacks cannot coexist. Editable text/password/search use `TextInput`; select/date/time use `Pressable`; stepper renders two named child buttons and a value. Validation, visible helper/error, required indication, disabled/read-only state, and label association are shared shell inputs. [VERIFIED: `.planning/phases/03-actions-forms-and-navigation-components/03-UI-SPEC.md:250-265,269-293`]

```typescript
type EditableFieldProps = CommonFieldProps & {
  type: 'text' | 'password' | 'search';
  value: string;
  onChangeText: (next: string) => void;
  readOnly?: boolean;
};

type TriggerFieldProps = CommonFieldProps & {
  type: 'select' | 'date' | 'time';
  value?: string;
  placeholder: string;
  onPress: () => void;
};

type StepperFieldProps = CommonFieldProps & {
  type: 'stepper';
  value: string;
  onDecrement: () => void;
  onIncrement: () => void;
  decrementDisabled?: boolean;
  incrementDisabled?: boolean;
};
```

Keep bound decisions consumer-owned via explicit child-action disabled props; do not infer product limits. For password/search nested actions, use `IconButton` with explicit names and prevent the nested callback from bubbling into a parent trigger. Read-only editable inputs use native `editable={false}` and remain semantically distinct from disabled. [CITED: https://reactnative.dev/docs/0.86/textinput] [CITED: https://oss.callstack.com/react-native-testing-library/docs/api/events/user-event]

### Pattern 4: Fixed composites use registries and per-item semantics

**What:** Bottom Navigation owns one immutable five-destination registry (fixed order/label/icon) and emits a destination. Segmented Control accepts a tuple whose length is statically and runtime-bounded to 2/3/4 and requires unique values. App Header is a discriminated union whose page selects only the source-defined action regions and callback props. [VERIFIED: `.planning/phases/03-actions-forms-and-navigation-components/03-UI-SPEC.md:262-265,269-293`]

Recommended App Header source map from active revision-296 records:

| Page | Source regions | Public callbacks |
|------|----------------|------------------|
| `home`, `games`, `create`, `players` | mascot + title/subtitle + 44 notification action | `onNotificationPress` |
| `profile` | mascot + title/subtitle; source right action is hidden | none |
| `notifications`, `gameDetails`, `settings` | 40 back action + title/subtitle | `onBackPress` |
| `playerDetails` | 40 back + title/subtitle + 44 favourite action | `onBackPress`, controlled favourite pair |

The UI-SPEC mentions an overflow callback generically, but the active Profile record has its `Right action` parent marked hidden. Since the archive is authoritative and variants may not be invented, plan the source-faithful omission unless a later approved deviation explicitly makes overflow visible. [VERIFIED: local revision-296 App Header descendant inspection; authority rule at UI-SPEC lines 27-31 and scope guardrail at lines 379-386]

### Pattern 5: Extend, do not replace, Phase 2 story/test contracts

**What:** use `satisfies Meta<typeof Component>`, `StoryObj<typeof meta>`, closed `argTypes.options`, and local stateful render helpers for Interactive. Add all 13 exports to an immutable applicability registry and account for all five taxonomy categories; singleton/static Auth Divider still needs explicit inapplicability reasons where applicable. [VERIFIED: current pattern at `src/design-system/stories/storyContract.ts:1-66`; Storybook discovery at `.rnstorybook/main.ts:1-10`] [CITED: https://storybook.js.org/docs/api/csf/index] [CITED: https://storybook.js.org/docs/essentials/controls]

**Testing:** prefer awaited `userEvent.press`/`type`, role/name/state/value filters, and user-visible copy. Existing helpers already cover exact semantic state, callback suppression, target geometry, token styles, reserved-style rejection, and decorative nested icons. [VERIFIED: `src/design-system/testing/accessibility.ts:25-143`; `tests/pressable-contract.test.tsx:123-223`] [CITED: https://oss.callstack.com/react-native-testing-library/docs/api/queries]

### Anti-Patterns to Avoid

- **Cartesian expansion:** do not infer every style/size/state combination from a sparse record set; coverage means every retained record plus the approved normalized API, not invented visuals.
- **Persistent `pressed`/`focused` props:** these create production-only simulation states and bypass native event ownership.
- **One giant optional-prop component:** especially for Field/AppHeader; it permits impossible combinations and empty accessibility targets.
- **Router/picker/auth imports:** callbacks only; no product flow ownership.
- **Generic `button` role everywhere:** checkbox/radio/tab/heading/editable semantics are required.
- **Generalizing family artwork:** provider logos, heart, and mascot media are family-owned source assets, not additions to an arbitrary icon/theme API.
- **Snapshot-driven validation:** exact source tables and semantic assertions are more diagnostic and align with the existing zero-snapshot suite.
- **Claiming web/Jest as native proof:** these lanes cannot prove native geometry, focus rendering, VoiceOver/TalkBack, or pixel fidelity.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Activation/focus/blocked state | New press state machine per component | Existing Phase 2 `Pressable` | It already synchronizes disabled/loading, semantics, callback suppression, hitSlop, and focus ring. |
| Editable fields | Custom keyboard/input facade | React Native `TextInput` | Native editable, secure-entry, selection, and accessibility behavior. |
| Source parsing | Ad hoc ZIP/JSON extraction | `scripts/penpot-source.mjs` index and safety limits | Existing parser validates paths, compression, CRC, limits, identity, and manifests. |
| Icons and provider marks | Unicode, hand-drawn paths, icon package, remote URLs | Generated local registry and retained revision-296 family assets | Geometry/paint provenance and offline deterministic rendering. |
| Controlled state | Internal source-of-truth plus sync effects | Props + next-value callbacks; local state only in stories | Avoids contradictory ownership and hidden state. |
| Test matchers | Recursive tree walkers/snapshots | Existing test helpers plus RNTL role/name/value/state queries | Tests observable semantics and gives focused failures. |
| Story catalogue configuration | New Vite/web Storybook or generated-file edits | Existing `.rnstorybook` config/glob/font gate | Prevents a second configuration and preserves native authority. |

**Key insight:** Phase 3 complexity is in preserving a closed source matrix and semantics, not in adding libraries. Existing primitives already solve the difficult native mechanics.

## Common Pitfalls

### Pitfall 1: Treating source states as public simulation props
**What goes wrong:** Pressed/focused specimens become `pressed`/`focused` props and app code can force transient states.  
**Why it happens:** Penpot encodes visual specimens as a `State` axis.  
**How to avoid:** registry retains the source state, while runtime maps pressed/focused to native render/focus events; only disabled/loading/read-only/validation/selected remain props.  
**Warning signs:** production prop unions contain `pressed` or `focused`.

### Pitfall 2: Losing exact source coverage behind normalized axes
**What goes wrong:** an API looks complete but one of 75 records is never rendered/tested.  
**How to avoid:** registry records full source ID + original tuple + normalized tuple; Variants stories and parameterized tests assert source order and exact count.  
**Warning signs:** tests assert only union members or use `Object.keys` without source IDs.

### Pitfall 3: Conflating read-only and disabled Field behavior
**What goes wrong:** read-only values disappear from focus/reading order or disabled fields still edit.  
**How to avoid:** separate props/visual dispositions; native `editable={false}` blocks TextInput editing; disabled additionally carries disabled semantics and shared opacity. [CITED: https://reactnative.dev/docs/0.86/textinput]

### Pitfall 4: Duplicate accessibility elements from nested icons/text
**What goes wrong:** a control announces both the outer button and a nested image.  
**How to avoid:** outer control owns role/name/state; nested Icon/provider mark/heart is decorative.  
**Warning signs:** one visual action produces more than one `getAllByRole` result.

### Pitfall 5: Incorrect composite semantics or order
**What goes wrong:** Bottom Navigation/segments become one opaque control or focus order differs from visual order.  
**How to avoid:** each item is an individually named tab with `selected`; render from an immutable ordered registry/tuple. [CITED: https://reactnative.dev/docs/view] [CITED: https://oss.callstack.com/react-native-testing-library/docs/api/queries]

### Pitfall 6: Clipped hit expansion
**What goes wrong:** 40-point visuals declare two-point hitSlop but parent bounds clip it.  
**How to avoid:** boundary stories allocate clearance and tests document host geometry limits; verify physical targets in Phase 5. [VERIFIED: `src/design-system/primitives/Pressable.tsx:148-179`; helper limitation at `src/design-system/testing/accessibility.ts:74-94`]

### Pitfall 7: Expanding the token system for component-specific metrics
**What goes wrong:** 12-point chip inset or fixed compact typography becomes a caller-selectable global token.  
**How to avoid:** retain source-specific metrics in the family registry and component-owned styles; do not mutate foundation scales. [VERIFIED: `.planning/phases/03-actions-forms-and-navigation-components/03-UI-SPEC.md:97-116,120-142`]

### Pitfall 8: Forgetting fixed local media
**What goes wrong:** provider/mascot assets render as placeholders or remote images, or implementation reaches live Penpot.  
**How to avoid:** Wave 0 extracts/hashes local evidence and runtime assets; validation rejects missing media and runtime network references.

## Code Examples

### Controlled toggle using the established Pressable contract

```typescript
export function Checkbox({ checked, disabled = false, label, onCheckedChange }: CheckboxProps) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      disabled={disabled}
      onPress={() => onCheckedChange(!checked)}
      size="controlHeight40"
    >
      {/* visual frame; nested check Icon remains decorative */}
    </Pressable>
  );
}
```

This reuses the exact existing `PressableSize` value `controlHeight40`, whose implementation expands a 40-point visual to a declared 44-point target. [VERIFIED: `src/design-system/primitives/Pressable.tsx:20-24,148-179`; quoted value appears in cited source]

### Semantic, controlled interaction test

```typescript
const onCheckedChange = jest.fn();
const user = userEvent.setup();
const screen = await render(
  <Checkbox checked={false} label="Receive game reminders" onCheckedChange={onCheckedChange} />,
);

const checkbox = screen.getByRole('checkbox', {
  name: 'Receive game reminders',
  checked: false,
});
await user.press(checkbox);
expect(onCheckedChange).toHaveBeenCalledWith(true);
expect(checkbox).toHaveAccessibilityState({ checked: false }); // still controlled
```

RNTL documents role filters for `checked`, `selected`, `disabled`, `busy`, and value, and `userEvent` calls are asynchronous. [CITED: https://oss.callstack.com/react-native-testing-library/docs/api/queries] [CITED: https://oss.callstack.com/react-native-testing-library/docs/api/events/user-event]

### Closed Storybook controls

```typescript
const meta = {
  title: 'Actions/Button',
  component: Button,
  argTypes: {
    style: { control: 'select', options: buttonStyles },
    size: { control: 'select', options: buttonSizes },
    onPress: { action: 'pressed' },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;
```

The exact title is required by UI-SPEC and Storybook's official CSF/Controls docs support typed `Meta`/`StoryObj` and explicit options for closed values. [VERIFIED: `.planning/phases/03-actions-forms-and-navigation-components/03-UI-SPEC.md:297-318`] [CITED: https://storybook.js.org/docs/api/csf/index] [CITED: https://storybook.js.org/docs/essentials/controls]

## State of the Art

| Old/unsafe approach | Current project approach | Impact |
|---------------------|--------------------------|--------|
| Live Penpot MCP required for routine work | Committed archive revision 296 + local inspector | Deterministic, offline, reviewable source queries. |
| Web-first Storybook as authority | Native React Native Storybook; web smoke secondary | Stories exercise native components while keeping a browser review lane. |
| `react-test-renderer` snapshots | RNTL semantic queries and awaited user events | React 19-compatible, accessibility-oriented tests. |
| Loose string props / silent fallbacks | Closed registries, discriminated unions, runtime rejection | Unsupported states fail early and diagnostically. |
| Component-owned product state | Controlled values/callbacks and story-only harnesses | Components remain reusable and routing/backend independent. |

**Deprecated/outdated:** do not introduce `ComponentStory`/`ComponentMeta` Storybook types; use `Meta`/`StoryObj`. Do not hand-edit `.rnstorybook/storybook.requires.ts`. [CITED: https://storybook.js.org/docs/api/csf/index] [VERIFIED: `.planning/phases/03-actions-forms-and-navigation-components/03-UI-SPEC.md:318`]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| — | None. Recommendations are grounded in the approved context/UI contract, opened repository files, local revision-296 inspection, or cited official documentation. | — | — |

## Open Questions

1. **Profile App Header overflow discrepancy**
   - What we know: UI-SPEC generically mentions an overflow callback, but the active revision-296 Profile record's `Right action` parent is hidden.
   - What's unclear: whether a later design intent expected overflow despite the committed source visibility.
   - Recommendation: implement the source-faithful no-action Profile configuration and record the observation; add overflow only through an approved deviation/source update.

2. **Native evidence remains intentionally incomplete**
   - What we know: Windows can run Android/web locally; authoritative iOS/Android comparison and AT review are Phase 5.
   - What's unclear: the eventual iOS device/macOS runner route remains a project concern.
   - Recommendation: make Phase 3 verification explicitly host/web-only and carry the native checkpoint forward without blocking implementation.

## Environment Availability

| Dependency | Required By | Available | Version / Result | Fallback |
|------------|-------------|-----------|------------------|----------|
| Node.js | Scripts, Expo, Jest | yes | `v24.20.0` | Project guidance prefers Node 22 LTS; current commands passed, but CI should use the pinned supported project runtime when available. |
| npm | Scripts/package runner | yes | `11.19.0` | — |
| Canonical Penpot archive | Evidence extraction | yes | Revision 296; manifest and malformed-archive self-tests passed 2026-09-18 | None; required authority. |
| Jest/RNTL suite | Component validation | yes | 11 suites / 297 tests passed, 0 snapshots | — |
| TypeScript | Compile validation | yes | `npm run typecheck` passed | — |
| Expo web/native launchers | Catalogue | yes in manifest | Existing scripts at `package.json:19-23` | Web is secondary; Android/native manual lane during execution as available. |
| iOS Simulator on Windows | Phase 5 native proof | no | Not available on Windows | Physical iPhone/macOS runner; deferred to Phase 5. |

**Missing dependencies with no fallback:** none for Phase 3 implementation.

**Missing dependencies with fallback:** local iOS simulator; use the already deferred Phase 5 physical-device/macOS route.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Jest `29.7.0` + `jest-expo` `57.0.5` + RNTL `14.0.1` |
| Config file | `package.json` (`jest.preset = jest-expo`) |
| Quick run command | `npm test -- --runInBand <target-test-file>` |
| Full suite command | `npm run typecheck && npm run lint && npm test -- --runInBand && npm run validate:design-source && npm run storybook:web:smoke` |

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| ACTN-01 | Button exact records, variants, blocked/loading press, semantics, geometry | component + source | `npm test -- --runInBand tests/action-components.test.tsx` | No - Wave 0/Actions |
| ACTN-02 | IconButton size/icon/state, required name, targets | component | same action command | No - Actions |
| ACTN-03 | Favourite controlled checked next-value and heart states | component | same action command | No - Actions |
| FORM-01 | Field branches, editing, triggers, stepper, validation/read-only | component | `npm test -- --runInBand tests/form-auth-components.test.tsx` | No - Forms/Auth |
| FORM-02 | ChoiceChip sparse variants and radio/checkbox semantics | component | same forms/auth command | No - Forms/Auth |
| FORM-03 | Checkbox controlled state and blocked behavior | component | same forms/auth command | No - Forms/Auth |
| FORM-04 | Day/time geometry, controlled radio selection, disabled | component | same forms/auth command | No - Forms/Auth |
| AUTH-01 | Providers/states, local artwork, press semantics | component + asset | same forms/auth command | No - Forms/Auth |
| AUTH-02 | Static divider text/decorative rules | component | same forms/auth command | No - Forms/Auth |
| NAVG-01 | Five ordered tabs, selected state, destination callback | component | `npm test -- --runInBand tests/navigation-components.test.tsx` | No - Navigation |
| NAVG-02 | 2/3/4 tuple bounds, selection, disabled segments | component | same navigation command | No - Navigation |
| NAVG-03 | Nine page configurations, exact visible/absent actions and callbacks | component + source | same navigation command | No - Navigation |
| NAVG-04 | Header/title/action conditional pair | component | same navigation command | No - Navigation |
| All | Exact 75 records, set IDs, revision, order, normalizations, asset hashes | source contract | `npm test -- --runInBand tests/phase3-source-registry.test.ts` | No - Wave 0 |
| All | Titles, five-category applicability, bounded controls, provenance, record coverage | story contract | `npm test -- --runInBand tests/phase3-story-contracts.test.tsx` | No - Final integration |

### Test Design Details

- Parameterize over source registries rather than manually repeating cases; assert full record ID and original/normalized tuple.
- For enabled actions, awaited `userEvent.press` emits once; disabled/loading emits zero. Nested actions assert only their own callback.
- Controlled tests assert the callback's next value and that the rendered state does not change until rerendered with new props.
- Editable Field tests use `userEvent.type`/`clear`; read-only (`editable={false}`) must not emit changes. Trigger fields assert button role/value and no overlay. Stepper asserts names, bounds, and separate targets.
- Accessibility tests use role + name + state/value; nested icons/provider artwork/heart/mascot are hidden.
- Source/style tests assert exact dimensions, family-owned metrics, token colors, fractional normalization, fixed typography records, and reserved-style rejection.
- Boundary story tests cover long labels/values, empty fields, helper/error growth, constrained navigation, 200%-scale host intent, and hitSlop parent clearance without claiming native layout proof.

### Sampling Rate

- **Per task commit:** the owning test file plus `npm run typecheck`.
- **Per wave merge:** all Phase 3 test files, `npm run lint`, and `npm run validate:design-source`.
- **Phase gate:** full suite, phase source/asset validator, and Expo-web smoke green before `$gsd-verify-work`.

### Wave 0 Gaps

- [ ] `design-spec/components/phase-3-components.json` - full revision-296 normalized evidence and exact 75-record ledger.
- [ ] `scripts/extract-phase-3-components.mjs` and `scripts/validate-phase-3-components.mjs` - deterministic local extraction, media/shape safety, hashes, exact identity/order/normalizations.
- [ ] Phase 3 heart/provider/mascot retained assets and runtime generated modules.
- [ ] `src/design-system/components/sourceRegistry.ts` - immutable family/record/source map.
- [ ] `tests/phase3-source-registry.test.ts` - source identity/count/order/axis/normalization/assets.
- [ ] `tests/action-components.test.tsx` - ACTN-01..03.
- [ ] `tests/form-auth-components.test.tsx` - FORM-01..04 and AUTH-01..02.
- [ ] `tests/navigation-components.test.tsx` - NAVG-01..04.
- [ ] `tests/phase3-story-contracts.test.tsx` - story taxonomy, titles, controls, provenance, coverage.
- [ ] Phase verification record/validator and a `verify:phase3` script analogous to the Phase 2 gate.

Existing test infrastructure is healthy: on 2026-09-18, 11 suites and 297 tests passed in about five seconds; typecheck and design-source validation passed.

## Security Domain

Security enforcement is enabled at ASVS Level 1 in `.planning/config.json`; this phase is a stateless component-library slice with no network, secrets, authentication service, session, access-control, or cryptographic boundary. [VERIFIED: `.planning/config.json`, `workflow.security_enforcement`; scope at UI-SPEC lines 379-386]

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | Social buttons emit callbacks only; no SDK, tokens, credentials, or network. |
| V3 Session Management | No | No sessions or persistence. |
| V4 Access Control | No | No protected resources or routing. |
| V5 Input Validation | Yes, at public component boundary | Closed TypeScript unions plus runtime registry/boolean/tuple validation; reject unsupported values. |
| V6 Cryptography | No | No cryptographic operation; use SHA-256 only for deterministic evidence integrity through Node's standard library, not as an application security protocol. |

### Known Threat Patterns for the Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Malformed/traversal/compression-bomb Penpot archive | Tampering / Denial of service | Reuse `parseZip` path, method, CRC, entry/byte limits, and manifest identity checks. |
| Runtime/network asset substitution | Tampering / Information disclosure | Generate local hashed assets; forbid remote fetch and runtime Penpot access. |
| Unsupported JS values bypassing TypeScript | Tampering | Runtime closed-registry validation with actionable failure. |
| Callback firing while blocked or from wrong nested target | Elevation of privilege (UI action boundary) | One blocked predicate and explicit nested callback tests. |
| Sensitive auth behavior accidentally introduced | Information disclosure | Keep provider controls callback-only; no SDK/network/storage dependency. |

## Sources

### Primary (HIGH confidence)

- Committed `design-source/padel-potato UI Concepts.penpot`, revision 296, inspected with `npm run design:inspect` and direct use of the repository's bounded reader - exact family/set/record/shape/media evidence.
- `.planning/phases/03-actions-forms-and-navigation-components/03-CONTEXT.md` - locked implementation, state, accessibility, story, testing, and delivery decisions.
- `.planning/phases/03-actions-forms-and-navigation-components/03-UI-SPEC.md` - approved inventory, geometry, source axes, behavior, semantics, stories, tests, and scope.
- `src/design-system/primitives/Pressable.tsx`, `src/design-system/primitives/styleGuards.ts`, `src/design-system/testing/accessibility.ts`, `src/design-system/stories/storyContract.ts` - existing implementation patterns.
- `package.json` - exact installed dependency versions and commands.

### Secondary (MEDIUM confidence)

- https://reactnative.dev/docs/0.86/textinput - native TextInput behavior and props.
- https://reactnative.dev/docs/view - accessibility role/state/value surface.
- https://oss.callstack.com/react-native-testing-library/docs/api/queries - semantic queries and role filters.
- https://oss.callstack.com/react-native-testing-library/docs/api/events/user-event - awaited realistic press/type/clear interactions.
- https://storybook.js.org/docs/api/csf/index - typed CSF `Meta`/`StoryObj` story objects.
- https://storybook.js.org/docs/essentials/controls - closed `argTypes.options` controls.

### Tertiary (LOW confidence)

- None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - exact committed manifest and passing local environment.
- Penpot inventory: HIGH - exact committed archive revision inspected locally; 75 active records identified.
- Architecture: HIGH - locked decisions plus established Phase 2 repository patterns.
- Accessibility/testing docs: MEDIUM - official documentation fetched through web search because Context7/ctx7 was unavailable.
- Pitfalls: HIGH where tied to source/contracts; MEDIUM where based on official framework documentation.

**Research date:** 2026-09-18
**Valid until:** 2026-10-18 for repository/source findings; recheck official framework docs if dependency versions change.
