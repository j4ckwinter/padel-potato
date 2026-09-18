# Phase 4: Identity, Content, and Feedback Components - Research

**Researched:** 2026-09-18
**Domain:** Source-traced React Native component families, deterministic Penpot extraction, Storybook catalogue contracts, and semantic interaction testing
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

### Public Contracts and Composition
- Model Penpot variant axes as closed discriminated unions matching only authored tuples; unsupported combinations must not be representable or silently accepted.
- Allow callers to supply names, dates, scores, labels, image sources, and callbacks while keeping layout and visual semantics component-owned.
- Publish one public component per named Penpot family, using tightly typed nested data only where compound content requires it rather than exposing generic render slots or a catch-all card.
- Image-bearing components accept local or React Native image sources, use deterministic story fixtures, and expose fallback states only where the committed Penpot source authors them.

### State and Interaction Ownership
- Components remain controlled; interactive stories own local state and rerender components after callbacks.
- Content rows and cards expose specific callbacks for authored actions without owning navigation, routing, persistence, or other product behavior.
- Unread, selected, result, and progress states use explicit semantic props or discriminated branches grounded in authored Penpot records rather than being inferred from display content.
- Disabled and read-only states suppress callbacks, expose the appropriate native accessibility state, and preserve the authored visual treatment.

### Delivery, Stories, and Verification
- Deliver dependency-ordered vertical batches: identity, status, and progress first; content rows and cards second; feedback and illustrated content last.
- Group stories under `Identity`, `Status`, `Progress`, `Content`, `Feedback`, and `Cards`, using the established `Canonical`, `Variants`, `States`, `Boundaries`, and `Interactive` taxonomy.
- Tests prove typed tuple rejection, semantics, callbacks, controlled states, content boundaries, and complete revision-296 source traceability rather than relying on broad snapshots.
- Retain deterministic Penpot references and host/web checks during Phase 4; authoritative iOS and Android visual comparison remains assigned to Phase 5.

### the agent's Discretion
- Exact internal module boundaries, shared family helpers, fixture organization, and implementation batching may follow the closest Phase 2 and Phase 3 patterns as long as the approved public contracts remain bounded and source-traceable.

### Deferred Ideas (OUT OF SCOPE)
- Product screens, application routing, live notifications, remote images, backend data, and persistent game or player state remain deferred to later milestones.
- Authoritative iOS and Android visual comparison, assistive-technology review, production exclusion, and the final catalogue coverage audit remain in Phase 5.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| IDEN-01 | Developer can use Avatar with every designed size and presence state. | Exact five-tuple ledger, child-geometry extraction warning, image/initial semantics, and identity test plan. |
| IDEN-02 | Developer can use Avatar Group with every designed content and state combination. | Exact five-tuple ledger, ordered overlap/overflow model, two-slot action semantics, and cardinality tests. |
| IDEN-03 | Developer can use Avatar Picker with every designed content and state. | Exact four-tuple ledger, controlled image source/error model, 136/160 geometry, and callback tests. |
| STAT-01 | Developer can use Status Chip with every designed style and state. | Exact seven-tuple ledger, static versus controlled-selectable branches, and disabled callback suppression. |
| PROG-01 | Developer can use Step Progress with every designed step and state. | Exact four-tuple ledger and `progressbar` value/text semantics. |
| CONT-01 | Developer can use Player Item with every designed type and state. | Exact six-tuple ledger, Avatar dependency, branch-specific action model, and 328-point boundary. |
| CONT-02 | Developer can use Game Card with every designed type and state. | Exact five-tuple ledger, AvatarGroup dependency, action/no-action branches, and compact/full geometry. |
| CONT-03 | Developer can use Notification Row with every designed type and read state. | Exact six-tuple ledger, explicit read semantics, coherent row name, and controlled callback behavior. |
| CONT-04 | Developer can use Settings Row with every designed type, icon, and state. | Exact nine-tuple ledger, button/switch branch model, native pressed-state rule, and disabled tests. |
| CONT-05 | Developer can use Stat Tile with every designed type, content, and state. | Exact six-tuple ledger, compact/featured geometry, and explicit positive/neutral semantics. |
| CONT-06 | Developer can use Score Result Block with every designed type and result state. | Exact six-tuple ledger, fixed score model, aggregate reading order, and no-timer rule. |
| CONT-07 | Developer can use Player Preferences Card with every designed content state. | Exact two-record normalization, StatusChip dependency, and static-composition semantics. |
| FDBK-01 | Developer can use Banner Toast with every designed style and type. | Exact four-tuple ledger, action-versus-close branches, announcement semantics, and no portal/timer ownership. |
| FDBK-02 | Developer can use Empty State with every designed content and action state. | Exact three-tuple ledger, local mascot extraction, copy-resolution checkpoint, and action prohibition for no-notification state. |
| CARD-01 | Developer can use Illustrated Card with every designed type and state. | Exact four-tuple ledger, local mascot reuse/new-asset map, exact CTA semantics, and controlled action tests. |
</phase_requirements>

## Summary

Plan Phase 4 as a deterministic evidence foundation followed by three locked vertical batches, not as 15 independent visual widgets. The committed revision-296 archive contains exactly `15` required families and `76` active records; the authored matrix is sparse and includes deleted legacy Avatar/Avatar Picker records that must be rejected. The exact family count, record count, set IDs, tuples, source order, component IDs, main-instance IDs, frames, text, and media references were rechecked with `npm run design:inspect` and the repository's archive reader. [VERIFIED: `npm run design:inspect`; `.planning/phases/04-identity-content-and-feedback-components/04-UI-SPEC.md:177-199`, exact values quoted in Source Inventory below]

The safest architecture is a new Phase 4 extractor/evidence file and a separate generated `phase4SourceRegistry.ts`, leaving Phase 3's byte-identity-checked `sourceRegistry.ts` untouched. Phase 3's validator regenerates and compares that file byte-for-byte, so appending Phase 4 data directly would break an existing verification invariant unless the Phase 3 generator and validator were deliberately redesigned too. [VERIFIED: `scripts/extract-phase-3-components.mjs:12-17,236-249`; `scripts/validate-phase-3-components.mjs:53-71`; `tests/phase3-source-registry.test.ts:129-162`]

Artwork is bounded and local: seven Phase 4 mascot placements resolve to six distinct local WebP media records; three media records already have retained Phase 3 files and three require new extraction. Avatar photos are caller-owned content and the source Avatar layer is not a photo media record, so use a deterministic checked-in/local story fixture without treating it as a design token. [VERIFIED: local revision-296 archive traversal via `scripts/penpot-source.mjs`; `.planning/phases/04-identity-content-and-feedback-components/04-UI-SPEC.md:220-223,304,321`]

**Primary recommendation:** First generate and self-test a separate Phase 4 registry plus artwork manifest, then implement vertically in the locked order with each family landing together with its stories and semantic tests; put a human decision checkpoint before locking Empty State fixture copy because the UI review left that copy dimension unresolved. [VERIFIED: `04-CONTEXT.md`, Delivery, Stories, and Verification; caller-provided UI review status; `.planning/phases/04-identity-content-and-feedback-components/04-UI-SPEC.md:368-374,378-388`]

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Penpot archive extraction and validation | Build tooling | Static repository assets | Node scripts read the committed archive and emit deterministic JSON/TypeScript/assets; runtime code must not parse Penpot. [VERIFIED: `scripts/extract-phase-3-components.mjs:145-224`; UI-SPEC lines 72-77] |
| Component rendering and controlled interaction | Browser / Client (React Native runtime) | — | Components render native primitives and emit callbacks; they own no routing, persistence, upload, timers, or live data. [VERIFIED: UI-SPEC lines 227-255] |
| Storybook catalogue and fixtures | Browser / Client | Static repository assets | Stories own interactive state and use bundled deterministic fixtures; Expo web is secondary evidence. [VERIFIED: UI-SPEC lines 283-304,325] |
| Mascot/image storage | Static repository assets | Browser / Client | Mascots are extracted local WebPs loaded through static `require`; callers may supply the bounded image content allowed by the public contract. [VERIFIED: local archive inspection; CITED: https://reactnative.dev/docs/0.86/images] |
| Product navigation, backend, live notifications, persistence | API / Backend / product app | — | Explicitly outside Phase 4; callbacks expose intent only. [VERIFIED: `04-CONTEXT.md`, Deferred Ideas; UI-SPEC lines 368-374] |

## Project Constraints (from AGENTS.md)

- Target mobile iOS and Android with React Native and Expo; keep the experience native-first. [VERIFIED: `AGENTS.md`, Project Constraints]
- Use React Native Storybook as the independently reviewable component workbench; do not require product screens. [VERIFIED: `AGENTS.md`, Project Constraints]
- Treat `design-source/padel-potato UI Concepts.penpot` as the default design authority and use `npm run design:inspect` for routine queries; live Penpot MCP is optional only for freshness. [VERIFIED: `AGENTS.md`, Project Constraints]
- Run `npm run validate:design-source` and retain source-to-runtime comparison evidence; source inspection alone does not prove native rendering fidelity. [VERIFIED: `AGENTS.md`, Project Constraints]
- Keep Expo web browser-accessible without compromising native behavior for pixel-perfect web parity. [VERIFIED: `AGENTS.md`, Project Constraints]
- Use the already-approved exact project stack, notably Expo `57.0.24`, React Native `0.86.3`, React `19.2.3`, Storybook `10.5.0`, Jest Expo `57.0.5`, and RNTL `14.0.1`; do not follow the stale `10.6.0` inherited stack table. [VERIFIED: `package.json`; `.planning/STATE.md`, accumulated Phase 1 decisions]
- Do not make implementation edits outside a GSD execution workflow. This research file is the canonical planning artifact requested by the active GSD plan-phase workflow. [VERIFIED: `AGENTS.md`, GSD Workflow Enforcement]
- No project-defined skills exist under the configured project skill roots. [VERIFIED: project skill discovery and `AGENTS.md`, Project Skills]

## Standard Stack

### Core

| Library / facility | Version | Purpose | Why Standard |
|--------------------|---------|---------|--------------|
| Expo | `57.0.24` | Runtime and Metro/web host | Already compatibility-approved and exact-pinned; Phase 4 adds no runtime package. [VERIFIED: `package.json`; npm registry version check on 2026-09-18] |
| React Native | `0.86.3` | Native views, images, accessibility, interaction | Existing runtime and official semantics for roles/state/value/local images. [VERIFIED: `package.json`; CITED: https://reactnative.dev/docs/0.86/accessibility; CITED: https://reactnative.dev/docs/0.86/images] |
| React | `19.2.3` | Controlled component/story state | Existing exact-pinned component model. [VERIFIED: `package.json`; npm registry version check on 2026-09-18] |
| `@storybook/react-native` | `10.5.0` | Native-first catalogue | Existing approved version; typed CSF uses `Meta`/`StoryObj` and closed controls. [VERIFIED: `package.json`; `src/design-system/components/actions/Button.stories.tsx`; CITED: https://storybook.js.org/docs/writing-stories/typescript] |

### Supporting

| Library / facility | Version | Purpose | When to Use |
|--------------------|---------|---------|-------------|
| Jest + `jest-expo` | `29.7.0` / `57.0.5` | Unit, registry, and host-semantic tests | Every family, extractor contract, story contract, and verification gate. [VERIFIED: `package.json`] |
| `@testing-library/react-native` | `14.0.1` | Role/name/value/state and user interaction tests | All semantic and controlled-interaction coverage. [VERIFIED: `package.json`; `src/design-system/testing/accessibility.ts`] |
| `react-native-svg` | `15.15.4` | Existing exact local vector/icon rendering | Reuse existing generated Icon/artwork only; no new icon library. [VERIFIED: `package.json`; UI-SPEC lines 20-28] |
| Local `scripts/penpot-source.mjs` | repository code | Safe deterministic archive parsing | Source extraction, media lookup, and validation. [VERIFIED: `scripts/penpot-source.mjs`; `npm run validate:design-source` passed 2026-09-18] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Separate `phase4SourceRegistry.ts` | Append Phase 4 data to `sourceRegistry.ts` | Appending forces a coordinated rewrite of the Phase 3 byte-identity generator/validator; a separate generated module preserves existing proof while the story-contract module can import both. [VERIFIED: Phase 3 generator/validator paths above] |
| Existing primitives plus family-owned private geometry | Third-party card/avatar/toast UI kit | A kit would introduce untraced values and wider APIs, violating the design authority and registry safety contract. [VERIFIED: UI-SPEC lines 28,357-364] |
| Static local WebPs | Remote mascot/image service | Remote loading, retry, upload, and broken-image states are explicitly deferred. [VERIFIED: UI-SPEC lines 220-235,351,370-374] |
| Semantic/behavior assertions | Broad snapshots | Snapshots do not prove callback suppression, controlled rerendering, tuple rejection, source order, or accessible values. [VERIFIED: UI-SPEC lines 308-325] |

**Installation:** No package installation is required or authorized for Phase 4. Reuse the exact dependencies already pinned in `package.json`. [VERIFIED: `package.json`; UI-SPEC lines 357-364]

## Package Legitimacy Audit

Not applicable: the recommended implementation installs no external packages. The planner should treat any proposed new UI, image, upload, notification, card, or accessibility package as scope drift requiring a new legitimacy audit and explicit approval. [VERIFIED: UI-SPEC lines 357-364]

**Packages removed due to [SLOP] verdict:** none.

**Packages flagged as suspicious [SUS]:** none.

## Source Inventory and Extraction Findings

The exact active ledger is quoted verbatim from the opened contract and was rechecked against the archive: [VERIFIED: `npm run design:inspect`; `.planning/phases/04-identity-content-and-feedback-components/04-UI-SPEC.md:181-197`]

| Family | Set ID | Count | Exact authored tuples |
|--------|--------|------:|-----------------------|
| Avatar | `482a7222-5a3b-8086-8008-a60fcc2bf6a2` | 5 | `32/Online`, `40/Online`, `48/Away`, `48/Offline`, `56/Online` |
| Avatar Group | `482a7222-5a3b-8086-8008-a60f7e527b9d` | 5 | `2 players/Default`, `3 players/Default`, `4 players/Default`, `4 players/Overflow`, `2 slots/Empty` |
| Avatar Picker | `482a7222-5a3b-8086-8008-a6265a9ac857` | 4 | `Empty/Default`, `Initials/Default`, `Photo/Selected`, `Empty/Error` |
| Status Chip | `482a7222-5a3b-8086-8008-a60fcef69ad7` | 7 | `Neutral/Default`, `Success/Default`, `Warning/Default`, `Info/Default`, `Error/Default`, `Success/Selected`, `Neutral/Disabled` |
| Step Progress | `482a7222-5a3b-8086-8008-a6243bcc3463` | 4 | `1/Active`, `2/Active`, `3/Active`, `Complete/Complete` |
| Player Item | `482a7222-5a3b-8086-8008-a60fd2e43204` | 6 | `List/Default`, `List/Selected`, `Game slot/Default`, `Game slot/Empty`, `Invite result/Default`, `Invite result/Disabled` |
| Game Card | `482a7222-5a3b-8086-8008-a6100d35e8ef` | 5 | `Next/Default`, `Open/Default`, `Compact/Default`, `Completed/Default`, `Open/Full` |
| Notification Row | `482a7222-5a3b-8086-8008-a6101117dfd4` | 6 | `Game/Unread`, `Booking/Unread`, `Social/Unread`, `Warning/Unread`, `Game/Read`, `Social/Read` |
| Settings Row | `482a7222-5a3b-8086-8008-a61b708e9d2e` | 9 | `Navigation/Default/Profile`, `Navigation/Pressed/Profile`, `Navigation/Disabled/Profile`, `Navigation/Default/Court`, `Value/Default/Location`, `Toggle/Off/Notification`, `Toggle/On/Notification`, `Toggle/Disabled/Notification`, `Destructive/Default/Close` |
| Stat Tile | `482a7222-5a3b-8086-8008-a61bebc50714` | 6 | `Compact/Games played/Neutral`, `Compact/Win rate/Positive`, `Compact/Rating/Neutral`, `Compact/Streak/Positive`, `Featured/Rating/Positive`, `Featured/Streak/Positive` |
| Score Result Block | `482a7222-5a3b-8086-8008-a61c4979950c` | 6 | `Compact/Won`, `Compact/Lost`, `Compact/Live`, `Full/Won`, `Full/Lost`, `Full/Live` |
| Player Preferences Card | `ab02a31f-1852-80be-8008-a6fde66e54b7` | 2 | Source `Content=Full`, `Content=Profile`; public `content="full"`, `content="profile"` |
| Banner Toast | `482a7222-5a3b-8086-8008-a610135158ee` | 4 | `Success/Toast`, `Info/Banner`, `Warning/Banner`, `Error/Toast` |
| Empty State | `482a7222-5a3b-8086-8008-a610159eb57a` | 3 | `No games/With action`, `No notifications/No action`, `No players/With action` |
| Illustrated Card | `482a7222-5a3b-8086-8008-a6187034754b` | 4 | `Next game/Default`, `Match result/Default`, `Invite players/Default`, `Game created/Default` |

### Extraction Requirements

- Emit `design-spec/components/phase-4-components.json` and a generated `src/design-system/components/phase4SourceRegistry.ts`; include canonical archive hash/path, file/page/revision, family/set/source identity, source index, component ID, main-instance ID, original tuple, normalized tuple, source names, root metrics, and family-specific descendant metrics. [VERIFIED: UI-SPEC lines 177-199; analogous Phase 3 schema in `scripts/extract-phase-3-components.mjs:145-224`]
- Preserve variant-container child order. Reject missing/extra/duplicate/reordered records, deleted records, wrong set membership, wrong file/page/revision, changed normalization, changed geometry, abbreviated UUIDs, unsafe paths, and byte drift between generated output and committed evidence. [VERIFIED: `scripts/extract-phase-3-components.mjs:141-202`; `scripts/validate-phase-3-components.mjs:53-91`; UI-SPEC lines 179-199]
- Normalize only the explicitly approved Player Preferences metadata: quote `Property 1=Content=Full` → `content="full"` and `Property 1=Content=Profile` → `content="profile"`. Do not apply a generic parser that silently normalizes arbitrary `Property 1` values. [VERIFIED: `npm run design:inspect -- --query "Player Preferences Card"`; UI-SPEC line 194]
- Normalize floating serialization such as `352.00000000000006` only through a documented geometry policy; retain raw and normalized dimensions. [VERIFIED: local archive inspection; analogous Phase 3 policy in `scripts/extract-phase-3-components.mjs:87-92,195-218`]
- Avatar is the exception to root-frame extraction: each active main-instance root is `64×64`, while its named visible Avatar child carries the tuple diameter `32`, `40`, `48`, or `56`. The extractor must record and validate that child geometry, otherwise all five variants appear identical. [VERIFIED: local revision-296 archive traversal; UI-SPEC line 207]
- Validate every family frame quoted by the UI contract, including `190×56`, `352×136/160`, `132×36`, `352×48`, `328×80`, `352×176/112`, `352×92`, `352×64`, `160×112`, `328×112`, `352×120/176`, `350×152`, `352×72/88`, `352×220`, and `352×176`. [VERIFIED: UI-SPEC lines 203-221; values quoted verbatim]

### Artwork and Fixture Map

Seven authored mascot placements resolve to these six distinct local media records: [VERIFIED: local revision-296 archive traversal via `scripts/penpot-source.mjs`; values quoted verbatim]

| Use | Render size | Media record | Disposition |
|-----|-------------|--------------|-------------|
| Empty State / No games | `96×96` | `c514c1fb-1cda-8125-8008-a60625a0cf2e` | Extract new Phase 4 WebP. |
| Empty State / No notifications; Illustrated Card / Next game | `96×96`; `80×80` | `c514c1fb-1cda-8125-8008-a60625a0cf34` | Reuse retained Phase 3 `mascot-wave.webp` bytes with Phase 4 fixed renderers. |
| Empty State / No players | `96×96` | `c514c1fb-1cda-8125-8008-a60625a0cf31` | Reuse retained Phase 3 `mascot-search.webp`. |
| Illustrated Card / Match result | `80×80` | `c514c1fb-1cda-8125-8008-a60625a0cf30` | Extract new Phase 4 WebP. |
| Illustrated Card / Invite players | `80×80` | `c514c1fb-1cda-8125-8008-a60625a0cf33` | Reuse retained Phase 3 `mascot-profile.webp`. |
| Illustrated Card / Game created | `80×80` | `c514c1fb-1cda-8125-8008-a60625a0cf32` | Extract new Phase 4 WebP. |

Each source media record is local `image/webp`, `1254×1254`; validate media record ID, object media ID/name, MIME/profile, local flag, archive object path, WebP signature, byte hash, fixed output path, and static runtime `require`. [VERIFIED: local revision-296 media inventory; analogous checks in `scripts/extract-phase-3-artwork.mjs:292-315`; `scripts/validate-phase-3-artwork.mjs:133-206`]

Do not duplicate the three already-retained WebPs. A Phase 4 private renderer module may statically require Phase 3 files at the new source-authored `80`/`96` render sizes while its own manifest proves the Phase 4 placement-to-media mapping. [VERIFIED: Phase 3 retained asset paths in `src/design-system/components/generated/phase3Artwork.tsx:46-62`; Phase 4 sizes from archive inspection]

For `Photo/Selected` stories, use a deterministic local fixture passed through the public image-source prop. The Avatar source's `Photo` node is a solid shape rather than a media fill, so do not claim a Penpot photo asset was extracted. [VERIFIED: local Avatar descendant inspection; UI-SPEC lines 72-77,223]

## Architecture Patterns

### System Architecture Diagram

```text
Committed revision-296 .penpot archive
        |
        v
safe local parser + Phase 4 extractor
        |
        +--> exact family/tuple/geometry evidence JSON
        |          |
        |          v
        |    independent validator + rejection self-tests
        |
        +--> generated deep-frozen Phase 4 runtime registry
        |
        +--> fixed local mascot WebPs + private renderer/manifest
                   |
                   v
tokens + primitives + Icon + Phase 3 components
                   |
                   v
15 bounded Phase 4 components
        |
        +--> typed CSF stories and controlled harnesses
        +--> Jest/RNTL semantic and interaction tests
        +--> narrow family/component/root barrels
                   |
                   v
Expo native Storybook + secondary Expo-web smoke
```

This keeps source parsing and media extraction out of the runtime bundle and makes each runtime branch traceable to immutable generated evidence. [VERIFIED: UI-SPEC lines 70-77,177-199,283-325]

### Recommended Project Structure

```text
design-spec/
├── components/phase-4-components.json
└── assets/phase-4/
    ├── artwork-manifest.json
    └── [three newly extracted mascot WebPs]
scripts/
├── extract-phase-4-components.mjs
├── validate-phase-4-components.mjs
├── extract-phase-4-artwork.mjs
├── validate-phase-4-artwork.mjs
└── validate-phase-4-verification.mjs
src/design-system/components/
├── phase4SourceRegistry.ts              # generated, private
├── generated/phase4Artwork.tsx          # fixed private renderers
├── identity/                            # Avatar, AvatarGroup, AvatarPicker
├── status/                              # StatusChip
├── progress/                            # StepProgress
├── content/                             # seven named content families
├── feedback/                            # BannerToast, EmptyState
└── cards/                               # IllustratedCard
tests/
├── phase4-source-registry.test.ts
├── phase4-artwork.test.tsx
├── identity-status-progress-components.test.tsx
├── content-components.test.tsx
├── feedback-card-components.test.tsx
├── phase4-story-contracts.test.tsx
└── types/phase4-component-contracts.typecheck.tsx
```

Exact filenames remain planner discretion, but a separate Phase 4 registry is prescriptive because the Phase 3 registry has an existing byte-identity contract. [VERIFIED: `scripts/extract-phase-3-components.mjs:15`; `tests/phase3-source-registry.test.ts:129-162`]

### Pattern 1: Closed Branch Props Plus Runtime Tuple Validation

**What:** define a discriminated union containing only authored tuples, then validate keys, scalar content, callback pairing, and the normalized tuple at runtime. Keep the diagnostic shape exactly `Unsupported {family} configuration: {tuple}. Supported configurations: {list}.` [VERIFIED: UI-SPEC line 170; existing pattern in `src/design-system/components/forms/ChoiceChip.tsx:16-96`]

**When to use:** every Phase 4 public family. Compound families may use tightly typed nested data, but not generic render slots. [VERIFIED: `04-CONTEXT.md`, Public Contracts and Composition]

```typescript
// Source: existing ChoiceChip contract and Phase 4 UI contract.
type StatusChipProps =
  | { style: 'neutral'; state: 'default'; label: string }
  | { style: 'success'; state: 'default'; label: string }
  | { style: 'warning'; state: 'default'; label: string }
  | { style: 'info'; state: 'default'; label: string }
  | { style: 'error'; state: 'default'; label: string }
  | {
      style: 'success';
      state: 'selected';
      label: string;
      selected: true;
      onSelectedChange: (next: boolean) => void;
    }
  | { style: 'neutral'; state: 'disabled'; label: string };
```

The values `neutral/default`, `success/default`, `warning/default`, `info/default`, `error/default`, `success/selected`, and `neutral/disabled` are quoted from the authoritative tuple ledger. [VERIFIED: UI-SPEC line 186]

### Pattern 2: Controlled Intent, Never Component-Owned Product State

**What:** callbacks emit the next semantic value or named intent; the supplied props continue to control rendering until rerender. Disabled branches suppress callbacks through both the public branch and shared Pressable. [VERIFIED: `04-CONTEXT.md`, State and Interaction Ownership; `src/design-system/components/forms/ChoiceChip.tsx:95-105`; `src/design-system/primitives/Pressable.tsx:157-205`]

**When to use:** selected StatusChip/PlayerItem, notification read state, SettingsRow toggle, AvatarPicker state, and all named actions. Presentational StatTile, ScoreResultBlock, StepProgress, and PlayerPreferencesCard expose no invented callbacks. [VERIFIED: UI-SPEC lines 237-255]

### Pattern 3: Composite Owns One Coherent Semantic Boundary

**What:** hide nested decorative icons/images/avatars when a parent announces the full identity or action; expose separate children only when each is a real action, such as `Add player 1` and `Add player 2`. Use explicit aggregate labels for scores/statistics and preserve deterministic reading order. [VERIFIED: UI-SPEC lines 259-279]

React Native documents `button`, `checkbox`, `image`, `progressbar`, `switch`, and `alert` roles and range `accessibilityValue` with `min`, `max`, `now`, and `text`. [CITED: https://reactnative.dev/docs/0.86/accessibility]

### Pattern 4: Source-Order Stories With Tuple-Safe Controls

**What:** map the immutable family records directly into `Variants`; render canonical provenance; supply `Canonical`, `Variants`, `States`, `Boundaries`, and `Interactive` or a non-empty inapplicability reason. Normalize story args into a valid whole discriminated branch so controls cannot create impossible Cartesian products. [VERIFIED: UI-SPEC lines 283-304; existing pattern in `src/design-system/components/actions/Button.stories.tsx`; `src/design-system/stories/storyContract.ts:3-11,236-300`]

Official Storybook guidance supports typed `Meta`/`StoryObj`, explicit control options for closed values, and primitive-to-complex mapping for non-serializable values. [CITED: https://storybook.js.org/docs/writing-stories/typescript; CITED: https://storybook.js.org/docs/essentials/controls]

### Pattern 5: Compile-Time Negative Fixtures

**What:** add a TypeScript-only fixture included by the existing strict `tsconfig.json`, with `@ts-expect-error` calls for representative impossible tuples/callbacks. Runtime tests should still cast malformed data and assert the exact diagnostic. [VERIFIED: `tsconfig.json`; current runtime rejection pattern in `tests/form-components.test.tsx` and `tests/navigation-components.test.tsx`; locked typed-rejection decision in `04-CONTEXT.md`]

This closes a Phase 4-specific gap: current tests prove runtime rejection extensively, but the repository contains no `@ts-expect-error`, `tsd`, or equivalent negative compile fixture. [VERIFIED: repository search on 2026-09-18]

### Recommended Implementation Order

1. **Evidence and assets:** extractor, separate generated registry, validator/self-tests, artwork extraction/manifest/private renderers, Wave 0 type/test shells. [VERIFIED: dependency requirement implied by UI-SPEC lines 177-199,315-325]
2. **Identity/status/progress:** Avatar → AvatarGroup and AvatarPicker; StatusChip and StepProgress. These become dependencies for later compound families. [VERIFIED: UI-SPEC lines 45-68; locked batch order in `04-CONTEXT.md`]
3. **Content rows/cards:** PlayerItem; GameCard and NotificationRow; SettingsRow; StatTile and ScoreResultBlock; PlayerPreferencesCard last because it composes StatusChip. [VERIFIED: UI-SPEC lines 47-68,203-221]
4. **Feedback/illustrated:** BannerToast, EmptyState, IllustratedCard after artwork and action primitives exist. Put the manual Empty State copy decision before its canonical story/test expectations are frozen. [VERIFIED: UI-SPEC lines 219-223,253-255; caller-provided UI review status]
5. **Catalogue integration:** narrow barrels, Phase 4 story contract, full 76-record coverage audit, verification aggregator, web smoke. Each preceding implementation task should already include that family's stories and tests; this step audits integration rather than deferring quality. [VERIFIED: UI-SPEC lines 283-325]

### Anti-Patterns to Avoid

- **Cartesian product props:** axes are sparse; accepting every style/state/type combination invents designs. [VERIFIED: exact ledger at UI-SPEC lines 181-197]
- **Root-frame-only extraction:** breaks Avatar because the root is `64×64` while visible diameters differ. [VERIFIED: local archive inspection]
- **Mutating Phase 3 `sourceRegistry.ts`:** breaks its deterministic byte identity unless its whole generator/validator contract is redesigned. [VERIFIED: Phase 3 generator/validator/test cited above]
- **One generic card or row:** loses exact content hierarchy, callback names, and branch semantics. [VERIFIED: `04-CONTEXT.md`, Public Contracts and Composition]
- **Whole-card press plus nested CTA:** creates competing activation boundaries; only the authored action is interactive. [VERIFIED: UI-SPEC lines 246-255]
- **Internal selected/read/toggle state:** violates controlled ownership and makes stories/tests misleading. [VERIFIED: `04-CONTEXT.md`, State and Interaction Ownership]
- **Treating mascot/avatar imagery as accessible by default:** causes duplicate announcements inside labelled composites. [VERIFIED: UI-SPEC lines 263-277]
- **Auto-dismiss or global toast portal:** neither is authored; BannerToast is a bounded visual component. [VERIFIED: UI-SPEC line 253]
- **Claiming native acceptance from Jest/web:** Phase 5 owns measured targets, pixel fidelity, VoiceOver, TalkBack, and authoritative native comparison. [VERIFIED: UI-SPEC lines 279,325,374]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Penpot ZIP parsing | A new ad hoc unzip/JSON traversal | Existing `scripts/penpot-source.mjs` | It already validates archive structure and backs the passing design-source self-test. [VERIFIED: `scripts/penpot-source.mjs`; `npm run validate:design-source` output] |
| Press/focus/disabled/target behavior | Per-component touch logic | Existing `Pressable` | It centralizes disabled/loading suppression, focus ring, opacity, and 44-point hit expansion. [VERIFIED: `src/design-system/primitives/Pressable.tsx:157-205`] |
| Icons | New SVG paths or icon package | Existing generated `Icon` registry | Only local revision-296 geometry is allowed. [VERIFIED: UI-SPEC lines 20-28,357-364] |
| Buttons/compact close actions | Bespoke action controls | Existing `Button` / `IconButton` where the source treatment matches | Preserves established semantics, focus, and target behavior. [VERIFIED: UI-SPEC lines 45-46] |
| Story taxonomy/provenance | Per-file informal conventions | Extend `storyContract.ts` | Existing tests require exact taxonomy, titles, controls/actions, source records, and native deferrals. [VERIFIED: `tests/phase3-story-contracts.test.tsx:29-78`] |
| Accessibility assertions | Repeated low-level checks | `src/design-system/testing` helpers plus focused composite assertions | Existing helpers prove roles, names, values, states, targets, tokens, and decorative children. [VERIFIED: `src/design-system/testing/accessibility.ts`] |
| Image loading/fallback/upload | Loader, cache, retry, picker, permissions | Caller-supplied source plus authored branches only | Those systems and states are deferred. [VERIFIED: UI-SPEC lines 223-235,351,370-374] |
| Toast lifecycle | Timer, queue, portal | Controlled `BannerToast` visual component | No auto-dismiss/global ownership is authored. [VERIFIED: UI-SPEC line 253] |

**Key insight:** this phase's hard problem is not rendering cards; it is preserving a sparse 76-record contract across extraction, types, runtime validation, stories, semantics, media, and verification without introducing product behavior. [VERIFIED: UI-SPEC lines 177-199,227-325]

## Common Pitfalls

### Pitfall 1: Deleted Legacy Records Leak Into Runtime

**What goes wrong:** archive queries for `Avatar` return deleted legacy records plus active records; Avatar Picker also has a deleted prior set. [VERIFIED: `npm run design:inspect -- --query Avatar`; `npm run design:inspect -- --query "Avatar Picker"`]

**Why it happens:** name queries are broader than authoritative set membership. [VERIFIED: inspection output]

**How to avoid:** select exact approved variant-set IDs, traverse container child order, and assert every component is active and belongs to the set. [VERIFIED: UI-SPEC lines 179-199; Phase 3 extractor pattern]

**Warning signs:** counts above `5` for active Avatar or above `4` for active Avatar Picker, or any `deleted: true` registry entry. [VERIFIED: UI-SPEC lines 183-185]

### Pitfall 2: Evidence Has the Right Tuple but Wrong Geometry

**What goes wrong:** Avatar variants all appear `64×64` if only main-instance roots are measured. [VERIFIED: local archive inspection]

**Why it happens:** the active source wraps the visible avatar in a fixed container. [VERIFIED: local archive inspection]

**How to avoid:** capture named descendant geometry and validate family-specific source-owned regions, not only roots. [VERIFIED: UI-SPEC lines 203-223]

**Warning signs:** generated Avatar records have identical visual dimensions or presence positions. [VERIFIED: source tuples and visual contract]

### Pitfall 3: Story Controls Manufacture Invalid Branches

**What goes wrong:** independent controls create unauthored combinations or callbacks that do not exist on the chosen branch. [VERIFIED: sparse ledger and UI-SPEC line 304]

**Why it happens:** Storybook serializes args independently. [CITED: https://storybook.js.org/docs/essentials/controls]

**How to avoid:** choose a record/tuple as the controlling unit or normalize every arg change into one supported complete branch; disable irrelevant callback controls. [VERIFIED: existing `normalizeButtonStoryArgs` pattern in Button stories]

**Warning signs:** `Compact` GameCard exposes a View action, default StatusChip becomes selectable, or no-notifications EmptyState exposes an action. [VERIFIED: UI-SPEC lines 244,247,254]

### Pitfall 4: Touch Target Expansion Is Clipped

**What goes wrong:** a 32/36/40 visual declares `hitSlop` but its parent leaves no clearance, so the effective target is clipped. [VERIFIED: comment and calculation in `src/design-system/primitives/Pressable.tsx:145-205`; UI-SPEC lines 231-235]

**How to avoid:** preserve at least the required surrounding clearance and test declared host geometry; measured native proof remains Phase 5. [VERIFIED: `src/design-system/testing/accessibility.ts:78-98`; UI-SPEC lines 319,325]

### Pitfall 5: Feedback Re-announces on Unrelated Rerenders

**What goes wrong:** a live/alert region is recreated or updated with every parent render, repeatedly interrupting users. [VERIFIED: UI-SPEC line 275]

**How to avoid:** keep announcement content stable and use native-appropriate alert/live-region semantics only for the feedback container. Android's `accessibilityLiveRegion` supports `none`, `polite`, and `assertive`; native behavior still requires Phase 5 review. [CITED: https://reactnative.dev/docs/0.86/accessibility]

### Pitfall 6: Mascot Reuse Is Implemented as Byte Duplication

**What goes wrong:** copied WebPs drift or inflate the evidence surface. [VERIFIED: Phase 4 media map above]

**How to avoid:** retain one output per media object and a placement manifest that maps each component/shape/render size to that output. Static `require` paths must be literal, not dynamically concatenated. [CITED: https://reactnative.dev/docs/0.86/images]

### Pitfall 7: Generic Empty-State Copy Is Silently Locked

**What goes wrong:** the planner treats `There’s nothing here yet.` / `Get started` as approved product copy even though the UI check passed only 6/7 dimensions and explicitly left the generic-copy conflict for manual resolution. [VERIFIED: caller-provided UI review status; archive text inspection quotes `There’s nothing here yet.` and `Get started`]

**How to avoid:** insert a human decision checkpoint before EmptyState canonical fixtures and assertions are finalized. Layout, exact tuples, action presence, accessible action names, and mascot extraction can proceed independently. [VERIFIED: UI-SPEC lines 163-173,196,220,254]

**Warning signs:** tests permanently assert the generic body/CTA without an approved disposition, or implementation invents replacement copy. [VERIFIED: manual-resolution requirement]

## Code Examples

### Controlled Progress Semantics

```tsx
// Source: React Native 0.86 accessibility docs + approved Phase 4 contract.
<View
  accessibilityRole="progressbar"
  accessibilityLabel={complete ? 'Setup complete' : `Step ${step} of 3`}
  accessibilityValue={
    complete
      ? { text: 'Setup complete' }
      : { min: 1, max: 3, now: step }
  }
>
  {/* source-traced track and label */}
</View>
```

The only valid visible labels are quoted as `Step 1 of 3`, `Step 2 of 3`, `Step 3 of 3`, and `Setup complete`. [VERIFIED: UI-SPEC line 173] React Native documents range value fields `min`, `max`, `now`, and `text`. [CITED: https://reactnative.dev/docs/0.86/accessibility]

### Static Local Artwork

```tsx
// Source: React Native 0.86 static image resource guidance.
<Image
  accessible={false}
  accessibilityElementsHidden
  importantForAccessibility="no-hide-descendants"
  resizeMode="contain"
  source={require('../../../../design-spec/assets/phase-4/mascot-match-result.webp')}
  style={{ width: 80, height: 80 }}
/>
```

The `80×80` render size is source-authored for Illustrated Card mascot placements. [VERIFIED: local revision-296 archive inspection] React Native requires static `require` paths to be known statically. [CITED: https://reactnative.dev/docs/0.86/images]

### Runtime Tuple Diagnostic

```typescript
// Source: approved Phase 4 copy contract.
throw new Error(
  `Unsupported ${family} configuration: ${tuple}. ` +
  `Supported configurations: ${supported.join(', ')}.`,
);
```

The exact diagnostic template is quoted as `Unsupported {family} configuration: {tuple}. Supported configurations: {list}.` [VERIFIED: UI-SPEC line 170]

## State of the Art

| Old / risky approach | Current project approach | When established | Impact |
|----------------------|--------------------------|------------------|--------|
| Live Penpot MCP as routine authority | Committed revision-296 archive plus `design:inspect`; MCP optional for freshness | Quick task `260918-noz` | Extraction is deterministic and offline. [VERIFIED: `.planning/STATE.md`; `AGENTS.md`] |
| One permissive props interface | Closed unions plus runtime rejection | Phases 2-3 | Invalid tuples fail early rather than visually degrading. [VERIFIED: `src/design-system/components/forms/ChoiceChip.tsx`] |
| Runtime reading retained JSON/Penpot | Generated deep-frozen TypeScript evidence | Phase 3 | Runtime has no archive/parser/network dependency. [VERIFIED: `scripts/extract-phase-3-components.mjs:236-249`; tests source registry lines 129-141] |
| Broad snapshots | Semantic and behavioral RNTL assertions | Phases 2-3 | Roles, names, values, callbacks, and controlled state are directly proven. [VERIFIED: UI-SPEC lines 308-325; existing tests] |
| Browser/native evidence conflated | Host/web proof now; authoritative native acceptance in Phase 5 | Phase 1 onward | Phase 4 cannot overclaim native fidelity. [VERIFIED: `.planning/STATE.md`; UI-SPEC line 325] |

**Deprecated/outdated:** Storybook `10.6.x` inherited guidance, Vite Storybook, third-party UI kits/icon packs, `react-test-renderer`-first tests, runtime Penpot parsing, internal persistent state, snapshot-only coverage, remote fixture URLs, and generic card/render-slot APIs. [VERIFIED: `.planning/STATE.md`; `AGENTS.md`; UI-SPEC lines 28,70-77,357-374]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| — | None. Recommendations are grounded in locked context, opened project files, direct archive inspection, current official React Native/Storybook docs, and passing local design-source validation. | — | — |

## Open Questions

1. **What approved visible body and CTA copy should replace or retain the generic Empty State strings?**
   - What we know: the archive literally contains `There’s nothing here yet.` for all three branches and `Get started` for the two action branches; full accessible action intents are `Create game` and `Invite players`. [VERIFIED: direct archive text inspection; UI-SPEC lines 163-173,254]
   - What's unclear: the UI checker passed 6/7 dimensions and left the generic empty-state copy conflict for manual resolution; `04-UI-SPEC.md` remains draft/pending at lines 378-388. [VERIFIED: caller-provided status; UI-SPEC lines 378-388]
   - Recommendation: planner adds a human checkpoint before the EmptyState story copy and assertions are locked. Do not block registry, geometry, artwork, or component-shell work.

2. **Which local image should serve as the Photo/Selected avatar fixture?**
   - What we know: the public contract accepts a React Native image source; the Avatar source contains no photo media fill; stories must be deterministic and local. [VERIFIED: `04-CONTEXT.md`; direct archive inspection; UI-SPEC lines 223,304,321]
   - What's unclear: no dedicated player-photo fixture currently exists in the repository. [VERIFIED: repository image inventory on 2026-09-18]
   - Recommendation: reuse a retained local mascot only as clearly labelled fixture content or add a tiny deterministic non-design fixture with provenance; do not claim it is Penpot-authored Avatar artwork.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node.js | extractors, validators, tests | ✓ | `v24.20.0` | Project baseline is Node 22 LTS, but current Node successfully ran design validation; execute CI on the pinned project baseline too. [VERIFIED: environment probe; `AGENTS.md` stack] |
| npm | scripts and exact dependencies | ✓ | `11.19.0` | — [VERIFIED: environment probe] |
| Expo CLI through project dependency | Storybook/web host | ✓ | `57.0.26` CLI reporting against project Expo `57.0.24` | Use package scripts, not a global install. [VERIFIED: environment probe; `package.json`] |
| Committed Penpot archive | all source extraction | ✓ | revision `296` | No fallback; it is authoritative. [VERIFIED: `npm run validate:design-source`] |
| Jest/RNTL | validation architecture | ✓ | Jest `29.7.0`, RNTL `14.0.1` | — [VERIFIED: `package.json`] |
| Expo web smoke | secondary catalogue check | ✓ script present | project script | Phase 5 still owns native acceptance. [VERIFIED: `package.json`] |

**Missing dependencies with no fallback:** none for Phase 4 implementation and host/web verification. [VERIFIED: environment audit]

**Missing dependencies with fallback:** none. Native iOS validation remains a Phase 5 environment concern, not a Phase 4 blocker. [VERIFIED: `.planning/STATE.md`, blocker; UI-SPEC line 374]

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Jest `29.7.0` + `jest-expo` `57.0.5` + RNTL `14.0.1` [VERIFIED: `package.json`] |
| Config file | `package.json` (`jest.preset = "jest-expo"`) [VERIFIED: `package.json`] |
| Quick run command | `npm test -- --runInBand tests/<target>.test.tsx` [VERIFIED: existing Jest script and test layout] |
| Full suite command | `npm run verify:phase4` to be added as `typecheck && lint && Jest && validate:design-source && Phase 4 component/artwork/verifier checks && storybook:web:smoke` [VERIFIED: required gate at UI-SPEC line 325; analogous `verify:phase3` in `package.json`] |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| IDEN-01/02/03 | Exact tuples, identity semantics, controlled selection/error, callbacks, overlap/cardinality | unit + registry | `npm test -- --runInBand tests/identity-status-progress-components.test.tsx tests/phase4-source-registry.test.ts` | ❌ Wave 0 |
| STAT-01/PROG-01 | Sparse selectable/static chip branches; progress role/value/text | unit + accessibility | same identity/status/progress command | ❌ Wave 0 |
| CONT-01/02 | Player and game branches, nested actions, Avatar/AvatarGroup composition, boundaries | unit + interaction | `npm test -- --runInBand tests/content-components.test.tsx` | ❌ Wave 0 |
| CONT-03/04 | Explicit read/switch state, coherent row names, callback suppression | unit + interaction | `npm test -- --runInBand tests/content-components.test.tsx` | ❌ Wave 0 |
| CONT-05/06/07 | Statistic/score reading order, explicit state, StatusChip static composition | unit + accessibility | `npm test -- --runInBand tests/content-components.test.tsx` | ❌ Wave 0 |
| FDBK-01/02 | Announcement/action branches, no timer/portal, exact mascot/action presence | unit + artwork | `npm test -- --runInBand tests/feedback-card-components.test.tsx tests/phase4-artwork.test.tsx` | ❌ Wave 0 |
| CARD-01 | Exact card branches, CTA names, mascot mapping, participant semantics | unit + artwork | same feedback/card command | ❌ Wave 0 |
| All Phase 4 IDs | Exact titles/taxonomy, valid controls/actions, provenance, 76 records | contract | `npm test -- --runInBand tests/phase4-story-contracts.test.tsx` | ❌ Wave 0 |
| All Phase 4 IDs | Compile-time rejection of impossible tuples | typecheck fixture | `npm run typecheck` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** targeted family test plus `npm run typecheck`. [VERIFIED: existing scripts and locked typed-test requirement]
- **Per wave merge:** `npm run lint && npm test -- --runInBand && npm run validate:design-source` plus the relevant Phase 4 validator. [VERIFIED: UI-SPEC line 325]
- **Phase gate:** new `npm run verify:phase4` and bounded Storybook web smoke green before `$gsd-verify-work`; record that native acceptance remains deferred. [VERIFIED: analogous `verify:phase3`; UI-SPEC line 325]

### Wave 0 Gaps

- [ ] `scripts/extract-phase-4-components.mjs` and `scripts/validate-phase-4-components.mjs` — exact 15-family/76-record source proof.
- [ ] `scripts/extract-phase-4-artwork.mjs` and `scripts/validate-phase-4-artwork.mjs` — six-media/seven-placement proof and three new WebPs.
- [ ] `tests/phase4-source-registry.test.ts` — immutable registry, normalization, active-record exclusion, geometry, byte identity.
- [ ] `tests/phase4-artwork.test.tsx` — hashes, static paths, decorative semantics, placement mapping.
- [ ] Family behavior test files listed in the map.
- [ ] `tests/types/phase4-component-contracts.typecheck.tsx` — compile-time negative fixtures.
- [ ] Phase 4 story-contract test and `validate-phase-4-verification.mjs`.
- [ ] `verify:phase4` / `validate:phase4-verification` package scripts.

## Security Domain

Security enforcement is enabled at ASVS Level 1. This is a stateless local component-library phase with no authentication service, session, authorization, secrets, database, or cryptographic boundary. [VERIFIED: `.planning/config.json`; UI-SPEC lines 368-374]

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | Authentication services are outside scope; no credentials/tokens enter these components. [VERIFIED: UI-SPEC lines 368-374] |
| V3 Session Management | no | No session state or storage. [VERIFIED: `04-CONTEXT.md`, Deferred Ideas] |
| V4 Access Control | no | Components emit intent only and make no authorization decision. [VERIFIED: UI-SPEC lines 231-255] |
| V5 Input Validation | yes | Closed TypeScript unions plus runtime key/value/tuple validation; archive identity, path, record, geometry, media, and hash validation. [VERIFIED: UI-SPEC lines 70-77,315-323; Phase 3 validation pattern] |
| V6 Cryptography | no | SHA-256 is evidence integrity metadata, not an application cryptographic/authentication feature; use Node `crypto`, never custom algorithms. [VERIFIED: `scripts/extract-phase-3-components.mjs`] |

### Known Threat Patterns for This Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Crafted/corrupt archive or wrong revision | Tampering | Fixed file/page/revision/hash, safe parser, exact set IDs/counts/order, controlled malformed-archive self-tests. [VERIFIED: `npm run validate:design-source`; Phase 3 validator pattern] |
| Path traversal during extraction | Tampering / Elevation of Privilege | Fixed output paths, `path.resolve` containment checks, reject archive/output paths outside repository roots. [VERIFIED: `scripts/validate-phase-3-components.mjs:25-42`] |
| Remote runtime dependency hidden in generated assets | Information Disclosure / Spoofing | Static local `require`, reject URI/network imports in generated evidence/artwork; deterministic story fixtures. [VERIFIED: UI-SPEC lines 223,321,364; Phase 3 artwork validator] |
| Unsupported props/callbacks create product behavior | Tampering | Runtime supported-key allowlists, closed branches, named intent callbacks only. [VERIFIED: `src/design-system/components/actions/Button.tsx:51-108`; UI-SPEC lines 231-255] |
| Source evidence altered without regeneration | Repudiation | Content hash, byte-for-byte regeneration, deep freeze, registry/evidence equality tests. [VERIFIED: Phase 3 extractor/validator/tests] |

## Sources

### Primary (HIGH confidence)

- `design-source/padel-potato UI Concepts.penpot` revision 296, queried with `npm run design:inspect` and traversed with the opened local archive reader — family inventory, tuples, source order, geometry, text, media IDs, and render sizes.
- `.planning/phases/04-identity-content-and-feedback-components/04-CONTEXT.md` — locked public API, state ownership, batching, story, test, and scope decisions.
- `.planning/phases/04-identity-content-and-feedback-components/04-UI-SPEC.md` — visual, interaction, accessibility, source, story, test, and scope contract; copy dimension remains pending manual resolution.
- `scripts/extract-phase-3-components.mjs`, `scripts/validate-phase-3-components.mjs`, `scripts/extract-phase-3-artwork.mjs`, `scripts/validate-phase-3-artwork.mjs` — closest deterministic extraction/validation analogues.
- Existing Phase 3 components, stories, tests, `storyContract.ts`, `Pressable.tsx`, and testing helpers — current implementation conventions.
- `package.json`, `tsconfig.json`, `AGENTS.md`, `.planning/config.json`, `REQUIREMENTS.md`, `ROADMAP.md`, and `STATE.md` — exact stack, workflow, validation, and project constraints.

### Secondary (MEDIUM confidence)

- https://reactnative.dev/docs/0.86/accessibility — roles, states/values, and Android live-region behavior.
- https://reactnative.dev/docs/0.86/images — static bundled image resource behavior and static `require` constraint.
- https://reactnative.dev/docs/0.86/image — accepted image source shape/type.
- https://storybook.js.org/docs/writing-stories/typescript — typed `Meta` / `StoryObj` pattern.
- https://storybook.js.org/docs/essentials/controls — explicit options, mappings, and conditional/disabled controls.
- https://storybook.js.org/docs/essentials/actions — explicit callback action logging.

### Tertiary (LOW confidence)

- None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — exact installed versions and existing package scripts were opened and registry existence was checked; no new dependency is proposed.
- Architecture: HIGH — derived from locked decisions, current Phase 2/3 code, byte-identity validation constraints, and direct archive inspection.
- Source inventory/artwork: HIGH — exact active records, geometry, text, and media were queried from the committed revision-296 archive this session.
- Pitfalls: HIGH — each is either directly reproduced from archive/code behavior or mandated by the UI contract.
- Empty State copy: LOW as a decision — the conflict is known, but final visible copy explicitly awaits manual resolution.

**Research date:** 2026-09-18
**Valid until:** 2026-10-18 for stable internal architecture; re-run archive inspection immediately if the committed `.penpot` bytes or revision change.
