---
phase: "04"
slug: "identity-content-and-feedback-components"
status: draft
shadcn_initialized: false
preset: none
created: "2026-09-18"
---

# Phase 4 — UI Design Contract

> Visual and interaction contract for the remaining identity, status, progress, content, feedback, and illustrated-card families. The committed Penpot archive at revision 296 and the implemented Phase 2/3 design-system contracts are authoritative.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | Custom local React Native design system; no shadcn |
| Preset | Not applicable |
| Component library | React Native core primitives composed through the local `Text`, `Stack`, `Inline`, `Surface`, `Icon`, and `Pressable` layer |
| Icon library | Padel Potato revision-296 generated icon registry; local authored geometry only |
| Font | Inter 4.1, local static 400/600/700 families loaded through `FoundationFontGate` |
| Runtime | Expo 57 / React Native 0.86; native-first, with Expo web as a secondary catalogue lane |
| Design authority | `design-source/padel-potato UI Concepts.penpot`, file `c514c1fb-1cda-8125-8008-a606253a77a3`, page `482a7222-5a3b-8086-8008-a6073072bbb1`, revision 296 |

No shadcn initialization gate applies. This project already has an established source-traced React Native design system, and the stack decision explicitly excludes web UI kits, NativeWind/Tailwind, and substituted component libraries.

---

## Component Inventory

Enumerated by `rg -l '^export function' src/design-system -g '*.tsx' -g '!*.stories.tsx' -g '!**/generated/**' -g '!**/__tests__/**'` — 23 existing exported component modules — `padel-potato@1.0.0` — 2026-09-18.

This table is a non-exhaustive list of known-good dependencies for Phase 4, never a closed allowlist. Phase 4 adds the 15 public families specified below.

| Component | Import path | Phase 4 use |
|-----------|-------------|-------------|
| `Text` | `src/design-system/primitives` | Every authored typography role and scaling behavior |
| `Stack`, `Inline` | `src/design-system/primitives` | Token-backed vertical/horizontal composition |
| `Surface` | `src/design-system/primitives` | Authored card, row, feedback, and chip surfaces |
| `Pressable` | `src/design-system/primitives` | Press/focus/disabled semantics and 44-point effective targets |
| `Icon` | `src/design-system/assets` | Closed local icon names; decorative when nested in labelled controls |
| `Button` | `src/design-system/components` | Empty-state actions where the authored action treatment matches the existing button contract |
| `IconButton` | `src/design-system/components` | Authored close actions where a labelled compact action is required |
| `StatusChip` | Phase 4 public component | Shared status/pill presentation, including Player Preferences Card composition |
| `Avatar` | Phase 4 public component | Shared identity presentation, including groups, rows, cards, and score results |

### Phase 4 Public Deliverables

| Group | Public component | Responsibility |
|-------|------------------|----------------|
| Identity | `Avatar` | Authored size/presence tuples with caller-provided identity content |
| Identity | `AvatarGroup` | Exact 2/3/4-player, four-player overflow, and two-empty-slot configurations |
| Identity | `AvatarPicker` | Controlled empty/initials/photo selection and authored validation error |
| Status | `StatusChip` | Exact semantic style/state tuples and optional controlled selection |
| Progress | `StepProgress` | Steps 1–3 and complete progress states |
| Content | `PlayerItem` | List, game-slot, and invite-result branches with their exact states/actions |
| Content | `GameCard` | Next, open, compact, completed, and full-open game summaries |
| Content | `NotificationRow` | Game, booking, social, and warning notification branches with explicit read state |
| Content | `SettingsRow` | Navigation, value, toggle, and destructive row branches |
| Content | `StatTile` | Compact/featured statistic tuples with neutral/positive treatment |
| Content | `ScoreResultBlock` | Compact/full won, lost, and live score presentation |
| Content | `PlayerPreferencesCard` | Full and profile preference-summary branches |
| Feedback | `BannerToast` | Exact toast/banner semantic combinations and their authored actions |
| Feedback | `EmptyState` | No-games, no-notifications, and no-players content/action branches |
| Cards | `IllustratedCard` | Next-game, match-result, invite-players, and game-created cards |

### Public Boundary

- Export one named component per Penpot family through narrow family barrels, `src/design-system/components/index.ts`, and `src/design-system/index.ts`.
- Props are closed discriminated unions of the authored tuples. Do not expose generic `variant`, render-slot, arbitrary icon, raw colour, raw dimension, children-as-layout, or catch-all card APIs.
- Callers may provide only the content the family visibly owns: names, initials, dates, venue/time strings, scores, labels, local/React Native image sources, counts, and specifically named callbacks.
- Components are controlled. Persistent selected, read, result, toggle, validation, and progress state changes only after the consumer rerenders with new props.
- Reject unsupported runtime tuples in development/tests. Never coerce, silently substitute, or expand sparse tuples into a Cartesian product.
- Runtime components import generated local TypeScript evidence and assets only. They do not read the Penpot archive, retained JSON, network resources, navigation, storage, or product models.

---

## Spacing Scale

### Default catalogue scale

| Scale step | Token | Usage |
|------------|-------|-------|
| 4 | `space4` | Tight indicator and text gaps |
| 8 | `space8` | Compact row, chip, and icon/text spacing |
| 16 | `space16` | Default component padding and content gap |
| 24 | `space24` | Group and story-section spacing |
| 32 | `space32` | Large specimen separation |
| 48 | Not authored | Do not synthesize or use as a raw literal |
| 64 | Not authored | Do not synthesize or use as a raw literal |

The declared Phase 4 spacing scale is exactly `space4`, `space8`, `space16`, `space24`, and `space32`. Phase 4 public props, catalogue layout, and general component composition must not select `space12`, `space20`, or `space40`.

Exceptions:

- Authored component dimensions such as 32, 36, 40, 44, 48, 56, 64, 72, 80, 88, 92, 96, 112, 120, 136, 152, 160, 176, 220, 328, 350, and 352 are geometry, not spacing tokens. Record them in family evidence and do not promote them into spacing APIs.
- Where a revision-296 node measures 12, 20, or 40 points, retain that measurement only as a private, source-ID-backed component geometry constant, analogous to Phase 3's private 12-point Choice Chip inset. It is not a declared spacing token or caller-selectable value.
- Interactive visuals smaller than 44×44 retain their authored visual size inside an effective target of at least 44×44, using the existing `Pressable` contract without changing visible spacing.
- Overlapping avatar offsets, progress-track widths, illustration placement, and score-column widths are source-owned geometry. They remain private implementation constants tied to source IDs.

---

## Typography

### Default catalogue hierarchy

Phase 4 documentation and surrounding Storybook presentation use exactly four sizes and two weights:

| Role | Token | Size | Weight | Absolute line height |
|------|-------|------|--------|----------------------|
| Supporting | `caption` | 11 | 400 | 13.2 |
| Body | `body` | 14 | 400 | 16.8 |
| Heading | `heading` | 18 | 700 | 21.6 |
| Display | `display` | 28 | 700 | 33.6 |

The declared Phase 4 hierarchy is limited to the four rows above and weights 400/700. If a retained revision-296 node uses another text treatment, preserve its exact font metrics only as fixed, private, component-owned source evidence tied to that node ID. Such a treatment is not a Phase 4 token, role, reusable variant, Storybook control, or caller-selectable value.

Contract:

- Use only the existing static Inter families; native weight synthesis is prohibited.
- `allowFontScaling` remains enabled. Do not add a default `maxFontSizeMultiplier`.
- Body and supporting content wrap and grow vertically. Single-line truncation is allowed only where the source is intrinsically single-line and the full content remains the accessible name/value.
- Scores, percentages, counts, dates, and progress labels remain textual semantic content rather than image content.
- Boundary stories exercise 200% font scale. Native acceptance of layout and assistive-technology behavior remains Phase 5.

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `canvas` — `#fbf8f0` | Catalogue canvas and broad background context |
| Secondary (30%) | `surface` — `#ffffff`; `surfaceMuted` — `#f0f0eb` | Cards, rows, avatar wells, tracks, and subdued component regions |
| Accent (10%) | `accent` — `#ade533`; `surfaceAccent` — `#d1f28a` | Selected status chips, progress fill/complete state, positive emphasis, primary empty-state action, and authored success emphasis only |
| Destructive | `danger` — `#ffd6d6` | Error feedback and source-authored destructive/error surfaces only |
| Informational | `info` — `#d6edfa`; `warning` — `#ffeb9e` | Source-authored info and warning chips/banners only |
| Primary ink | `ink` — `#0e1716` | Primary content and default icon stroke |
| Supporting ink | `textSecondary` — `#3b4742`; `muted` — `#636b6e`; `olive` — `#636657` | Secondary metadata, muted labels, and source-authored semantic treatment |

Accent is reserved for selected Status Chip state, Step Progress completion/current fill, positive Stat Tile treatment, authored success feedback, and the primary Empty State action. It is not a blanket background, text colour, or interaction colour.

Further rules:

- Every colour resolves through the existing `ColorToken` inventory. No raw public colour props or new semantic colours are introduced.
- Unread, selected, positive, warning, info, error, and destructive meaning must include text, icon, state, or native semantics; colour alone is insufficient.
- Disabled visuals use the source-authored treatment and expose `accessibilityState.disabled`; where the source uses opacity, reuse `opacityDisabled` rather than an untraced value.
- Focus uses the established 2-point `focusRing` treatment without replacing authored state styling.

---

## Copywriting Contract

Visible fixture copy comes from revision 296. Callers may replace content-bearing strings where the public contract permits, but stories retain these authored examples.

| Element | Copy |
|---------|------|
| No games Empty State | Heading `No games`; supporting sentence `There’s nothing here yet.`; authored next action `Get started`, exposed semantically as `Create game` |
| No notifications Empty State | Heading `No notifications`; supporting sentence `There’s nothing here yet.`; no action is authored or rendered |
| No players Empty State | Heading `No players`; supporting sentence `There’s nothing here yet.`; authored next action `Get started`, exposed semantically as `Invite players` |
| Avatar Picker empty action | `Add a profile photo` |
| Avatar Picker selected action | `Change profile photo` |
| Avatar Picker error | `Choose a JPG or PNG under 5 MB` |
| Success toast | `Game created` / `Your game is ready to share.` |
| Info banner | `Booking update` / `Court details have changed.` / visible `View`; full action name `View booking update` |
| Warning banner | `Check game details` / `One player still needs to confirm.` / visible `View`; full action name `View game details` |
| Error toast | `Something went wrong` / `Please try again in a moment.` |
| Unsupported tuple diagnostic | `Unsupported {family} configuration: {tuple}. Supported configurations: {list}.` |
| Destructive action | `Sign out` — invoke the supplied destructive callback only; no confirmation dialog/copy is authored in this milestone, so do not invent one |

Source-constrained compact CTA exception: the visible single-word labels `View`, `Results`, `Invite`, and `Share` remain exactly as authored because expanding them would violate revision-296 fidelity and the fixed 352-point layout. They map to branch-specific full names and callbacks: Game Card `View` → `View game`, Game Card `Results` → `View results`, Illustrated Card `View` → `View game`, Illustrated Card `Results` → `View results`, Illustrated Card `Invite` → `Invite players`, and Illustrated Card `Share` → `Share game`. The full verb+noun string is the accessible name, callback intent, story action label, and test expectation. Progress labels remain exactly `Step 1 of 3`, `Step 2 of 3`, `Step 3 of 3`, and `Setup complete`.

---

## Source and Variant Contract

The canonical source contains 76 active Phase 4 component records. Deleted legacy Avatar and Avatar Picker records are historical archive data and must not enter the runtime registry.

| Family | Variant-set ID | Active records | Exact authored tuples |
|--------|----------------|----------------|-----------------------|
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
| Player Preferences Card | `ab02a31f-1852-80be-8008-a6fde66e54b7` | 2 | Normalize generic source metadata to `content="full"` and `content="profile"`, preserving source mappings for `Content=Full` and `Content=Profile` |
| Banner Toast | `482a7222-5a3b-8086-8008-a610135158ee` | 4 | `Success/Toast`, `Info/Banner`, `Warning/Banner`, `Error/Toast` |
| Empty State | `482a7222-5a3b-8086-8008-a610159eb57a` | 3 | `No games/With action`, `No notifications/No action`, `No players/With action` |
| Illustrated Card | `482a7222-5a3b-8086-8008-a6187034754b` | 4 | `Next game/Default`, `Match result/Default`, `Invite players/Default`, `Game created/Default` |

Registry generation must retain source order, component ID, main-instance ID, variant-set ID, normalized tuple, file/page IDs, revision, and source names. Deep-freeze the generated registry and validate it independently against `npm run design:inspect` output.

---

## Visual Component Contract

| Family | Authored frame / presentation contract |
|--------|----------------------------------------|
| Avatar | Visual diameters are exactly 32, 40, 48, or 56 according to the retained tuple. Keep circular clipping, initials/photo content, and online/away/offline indicator geometry component-owned. |
| Avatar Group | 190×56 source frame; overlapping identities retain source order. Overflow shows exactly four identities plus `+{count}`. Empty renders exactly two `+` slots. |
| Avatar Picker | 352×136 for non-error branches and 352×160 for error; target, camera/add icon, action label, initials/photo, and visible error remain one composed control. |
| Status Chip | 132×36 source frame; semantic icon, label, fill/border, selected, and disabled treatment come from the exact tuple. Caller content must not alter the authored height. |
| Step Progress | 352×48; label is `Step n of 3` or `Setup complete`; track/value and completion icon remain source-owned. |
| Player Item | 328×80; preserve avatar/empty slot, primary name, supporting line, and one trailing authored action without exposing arbitrary accessory slots. |
| Game Card | 352×176 except Compact at 352×112; preserve status, title, venue, optional time, participant group, and source-authored compact action. Its full branch-specific action name is `View game` or `View results`. |
| Notification Row | 352×92; type icon, title, message, timestamp, and unread indicator retain fixed reading order. Read state removes unread emphasis without removing content. |
| Settings Row | 352×64; one leading source icon, label/value where authored, and exactly one branch-specific trailing affordance. |
| Stat Tile | Compact 160×112; Featured 328×112. Preserve label, value, supporting text, and positive trend indicator only for positive tuples. |
| Score Result Block | Compact 352×120; Full 352×176. Preserve status, team rows, set columns, winner emphasis, and live note where authored. |
| Player Preferences Card | 350×152; compose exact source-backed Status Chips beneath the branch heading. Full includes Intermediate; Profile omits it. |
| Banner Toast | Toast 352×72; Banner 352×88. Preserve icon well, title, message, and only the action afforded by the tuple. |
| Empty State | 352×220; preserve centered title, body, 96×96 local mascot, and action only for the two `With action` tuples. |
| Illustrated Card | 352×176; preserve eyebrow, title, two detail lines, participant states, authored local mascot, and exact action label per type. |

Illustrations, avatars, and mascots use retained deterministic local fixtures in Storybook. Remote fetch, image upload, camera/gallery integration, retry UI, and generic broken-image fallbacks are out of scope unless an authored branch above explicitly supplies the state.

---

## Interaction and State Contract

### Shared rules

- Native `pressed` and `focused` are transient interaction states. Persistent source states are controlled props and never mutate internally.
- Disabled/read-only branches suppress every relevant callback and expose native disabled state. Decorative nested icons/images do not become duplicate accessibility elements.
- Every visible action has one specifically named callback. Callback invocation emits intent/data only; it never routes, persists, fetches, uploads, signs out, marks a notification remotely, or starts a timer.
- A compact 32/36/40-point visual may be static. If interactive, its effective target is at least 44×44 without enlarging the authored visual.
- Do not invent loading/skeleton/spinner states. Phase 4 data and image fixtures are supplied synchronously by Storybook.

### Family behavior

| Family | Interaction ownership |
|--------|-----------------------|
| Avatar | Presentational image/identity. Optional accessibility label exposes one image semantic; presence is included in the label/state description when meaningful. |
| Avatar Group | Presentational group for populated/overflow branches. Empty slots may expose separately named `Add player 1` and `Add player 2` buttons only when their callbacks are supplied by the exact empty branch. |
| Avatar Picker | One named button (`Add a profile photo` or `Change profile photo`) invokes `onPress`; selected/error content is controlled by props. No picker, permission, upload, or validation engine is owned. |
| Status Chip | Default semantic chips may be static. The authored Selected branch is a controlled checkbox-style option; Disabled suppresses activation. Do not support selection for unauthored style/state tuples. |
| Step Progress | Read-only progress indicator; no press callback. Current step/complete is explicit, not inferred from label text. |
| Player Item | List/Selected and invite/game-slot actions use a single branch-specific press callback. Selected is controlled. Empty slot names the invitation action. Disabled invite results suppress callback. |
| Game Card | Only the authored action is interactive: `View game` for Next/Open and `View results` for Completed. Compact has no invented action. Card composition does not own navigation. |
| Notification Row | A supplied row callback emits the notification intent; `read`/`unread` is explicit and does not change until rerender. No live notification or persistence behavior. |
| Settings Row | Navigation, Value, and Destructive are named buttons. Toggle is a controlled switch emitting the next boolean. Pressed is native-driven; Disabled suppresses navigation/toggle callbacks. |
| Stat Tile | Presentational summary; no callbacks. Positive/neutral is explicit rather than inferred from numeric content. |
| Score Result Block | Presentational score summary; no callbacks or timers. `won`, `lost`, and `live` are explicit. |
| Player Preferences Card | Presentational summary; no generic chip-selection behavior inside the card. |
| Banner Toast | Info Banner exposes `View booking update`; Warning Banner exposes `View game details`; Success/Error Toast exposes a named close callback. No auto-dismiss timer or global portal is owned by the component. |
| Empty State | `No games/With action` exposes `Create game`; `No players/With action` exposes `Invite players`; `No notifications/No action` forbids an action. Visible compact source copy remains as documented above. The component owns no navigation. |
| Illustrated Card | Next game exposes `View game`; Match result exposes `View results`; Invite players exposes `Invite players`; Game created exposes `Share game`. Each has one matching callback; no whole-card press or product behavior. |

---

## Accessibility Contract

| Family | Native semantic contract |
|--------|--------------------------|
| Avatar | Labelled source/initials exposed as one image where identity is meaningful; decorative when the surrounding labelled composite already announces the person. |
| Avatar Group | One ordered group description for populated/overflow content; interactive empty slots remain separately focusable named buttons. Overflow count is announced. |
| Avatar Picker | `button` with visible action as the stable name; error message remains visible and is included through hint/description association without replacing the name. |
| Status Chip | Static text for noninteractive use; controlled selectable branch uses checkbox semantics with checked state; disabled is announced. |
| Step Progress | `progressbar` with `min=1`, `max=3`, `now=1|2|3`, or completion text/value; the visible progress label remains readable. |
| Player Item | One named button per authored interactive row/action. Name combines player/slot identity with action context; selected/disabled state is exposed. |
| Game Card | Status, title, venue/time, and participants stay in reading order; only the authored action is a button. |
| Notification Row | Row name combines title/message/timestamp; unread is explicitly announced and not conveyed only by a dot/colour. |
| Settings Row | Navigation/value/destructive branches are buttons; toggle branch is a switch with checked and disabled state. Leading/trailing icons are decorative. |
| Stat Tile | Label, value, supporting text, and positive trend read as one coherent statistic; trend is not colour-only. |
| Score Result Block | Match status, team names, and set scores have deterministic reading order and an aggregate accessible summary. Winner/live state is not colour-only. |
| Player Preferences Card | Heading precedes preference values; composed chips are static text within this context and do not create false controls. |
| Banner Toast | Feedback is exposed as a live/alert announcement appropriate to native support; action and close remain individually named buttons. Do not repeatedly announce on unrelated rerenders. |
| Empty State | Heading, explanatory body, then optional action button. Mascot is decorative. |
| Illustrated Card | Eyebrow, title, details, participants, then action. Mascot and participant decoration are hidden when redundant with text. |

All semantic content must remain complete at 200% font scaling. Focus/reading order follows visible top-to-bottom and left-to-right order. Host tests establish role/name/value/state contracts now; VoiceOver, TalkBack, native focus rendering, and measured target acceptance remain Phase 5.

---

## Storybook Contract

Group titles exactly under `Identity`, `Status`, `Progress`, `Content`, `Feedback`, and `Cards`. Every public export accounts for the ordered taxonomy `Canonical`, `Variants`, `States`, `Boundaries`, `Interactive` with a story or a non-empty inapplicability reason.

| Story category | Required Phase 4 content |
|----------------|--------------------------|
| `Canonical` | One revision-296-faithful specimen with file, page, revision, variant-set ID, and component-record identity visible in catalogue context |
| `Variants` | All 76 active records in deterministic source order; deleted legacy records excluded; sparse authored tuples shown exactly |
| `States` | Presence, empty/overflow/error, selected/disabled/read, progress, result/live, toggle, positive, and feedback states where authored |
| `Boundaries` | 200% font scale, long identity/card/message/value content, score/read-order integrity, constrained 328/350/352 layouts, overflow counts, and hit-area parent clearance |
| `Interactive` | Local controlled harnesses for avatar selection, selectable chips/items, empty slots, notification intent, settings toggle/actions, banner/toast actions, empty-state CTA, and illustrated-card action |

Recommended titles:

- `Identity/Avatar`, `Identity/Avatar Group`, `Identity/Avatar Picker`
- `Status/Status Chip`
- `Progress/Step Progress`
- `Content/Player Item`, `Content/Game Card`, `Content/Notification Row`, `Content/Settings Row`, `Content/Stat Tile`, `Content/Score Result Block`, `Content/Player Preferences Card`
- `Feedback/Banner Toast`, `Feedback/Empty State`
- `Cards/Illustrated Card`

Controls derive from the immutable Phase 4 source registry and can form only valid tuples. Action controls exist only for callbacks actually present on the selected discriminated branch. Stories use deterministic local image/content fixtures and do not introduce screens, navigation, network requests, live data, or timers.

---

## Test Contract

Use Jest/RNTL, explicit Jest globals, the Expo preset, and `src/design-system/testing` helpers. Tests are semantic and behavioral, not broad snapshots.

| Coverage | Required proof |
|----------|----------------|
| Source registry | Revision 296; exact file/page/family/set IDs; all 76 active records; source order; deleted-record exclusion; Player Preferences metadata normalization |
| Closed props | Every listed tuple accepted and every unsupported combination rejected by types and runtime validation |
| Controlled state | Selected, read, toggle, progress, result, presence, and validation props remain unchanged until consumer rerender |
| Press behavior | Enabled callback once; disabled zero; nested actions do not activate parent behavior; noninteractive branches expose no callback path |
| Accessibility | Exact roles, names, values, checked/selected/disabled states, feedback announcements, decorative children, and composite reading order |
| Touch targets | Every interactive 32/36/40-point visual has a declared effective target of at least 44×44 with parent clearance |
| Content boundaries | Long names/messages/venues/preferences/score labels and 200% scaling preserve complete semantics and reachable actions |
| Media | Deterministic local/RN sources only; authored initials/empty/error behavior only; no hidden remote fallback or fetch |
| Visual tokens | Exact existing tokens plus private source-backed geometry; no unexplained literal enters a public API |
| Stories | Exact titles, taxonomy/applicability, bounded controls/actions, canonical provenance, and complete 76-record coverage |

Run `npm run validate:design-source`, typecheck, lint, Jest, a Phase 4 registry/component validator, and the bounded Storybook web smoke. These prove deterministic source and host/web behavior only. Do not claim native measurement, pixel fidelity, focus rendering, VoiceOver, or TalkBack acceptance before Phase 5.

---

## UI Considerations

Applicable state considerations resolved: 12 covered, 5 backstop, 0 unresolved.

| Category | Element(s) | Status | Resolution / Reason |
|----------|------------|--------|---------------------|
| Empty | Avatar Group, Avatar Picker, Player Item, Empty State | ✅ covered | Render only the authored two-slot, empty-picker, open-slot, and three Empty State branches; do not synthesize empty variants elsewhere. |
| Empty | Fixed-tuple cards, rows, progress, stats, and scores | ✅ covered | Dismissed as inapplicable: each branch requires the semantic content needed by its closed contract; missing required content is rejected. |
| Loading | All Phase 4 families | ✅ covered | Dismissed as inapplicable: stories use synchronous fixtures and no family owns fetch/upload/loading behavior; unauthored spinners and skeletons are prohibited. |
| Error | Avatar Picker | ✅ covered | `Empty/Error` retains the action and shows the documented image-format/size error without colour-only meaning. |
| Error | Banner Toast and unsupported tuples | ✅ covered | Error Toast uses the documented retry guidance; invalid API tuples throw the documented diagnostic rather than silently falling back. |
| Populated | Identity/content/card families | ✅ covered | Canonical and Variants stories include every populated source record and deterministic fixture content. |
| Partial | Game Card and Illustrated Card participants | ✅ covered | Exact open/full and empty-participant branches represent authored incomplete groups; arbitrary partial combinations are rejected. |
| Partial | Player Preferences Card | ✅ covered | `full` and `profile` are the only supported content sets; omitted arbitrary preferences do not create new layouts. |
| Overflow | Avatar Group | ✅ covered | Exactly four visible player identities plus a positive `+{count}` indicator represent the authored overflow state. |
| Overflow | Rows, cards, feedback, and preferences | 🧪 backstop | A constrained-width rendered boundary proves long content wraps/truncates according to the source hierarchy without hiding its full accessible value or action. |
| Zero / one / many | Avatar Group | ✅ covered | Zero/one and more-than-four direct identities are rejected; authored configurations are 2, 3, 4, 4+overflow, or exactly two empty slots. |
| Zero / one / many | Score sets and card participants | ✅ covered | Fixed source structures retain their exact set/participant positions; arbitrary collection counts are not public. |
| Long text | Player Item, Notification Row, Settings Row | 🧪 backstop | A held-out 200%-scale story/test proves primary/supporting/value copy reflows or truncates without losing the accessible name/state. |
| Long text | Game Card, Empty State, Illustrated Card | 🧪 backstop | A held-out 200%-scale story/test proves hierarchy and optional actions remain reachable without overlap. |
| Long text | Stat Tile, Score Result Block, preferences | 🧪 backstop | A held-out rendered test proves numeric alignment and semantic reading order survive enlarged/long labels. |
| Long text | Banner Toast and Avatar Picker error | 🧪 backstop | A held-out rendered test proves messages grow without clipping the action/close target and remain announced once. |
| Media | Avatar, Avatar Picker, Empty State, Illustrated Card | ✅ covered | Use deterministic valid local/RN fixtures; only source-authored initials, empty, and validation error states exist. Remote-loading and broken-image behavior is deferred, not silently invented. |

Backstop rows require explicit rendered/test evidence at verification time; absence routes to human review and never silently passes.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| None | None | Not applicable — no shadcn or third-party component registry is used |
| Local Penpot source | 15 Phase 4 families / 76 active component records | `npm run validate:design-source` passed on 2026-09-18; exact file/page/revision/source identity required |

No third-party registry, icon pack, remote image service, uploader, notification SDK, or card library may substitute the retained local system.

---

## Scope Guardrails

- Build only the 15 Phase 4 public families, generated source evidence/assets, narrow barrels, stories, semantic/interaction tests, and deterministic validation evidence.
- Deliver vertical batches in the locked order: identity/status/progress; content rows/cards; feedback/illustrated content.
- Do not build product screens, application navigation, routing, live notifications, remote images, camera/gallery flows, backend data, persistence, auto-dismiss infrastructure, or product state.
- Do not add deleted legacy records, untraced variants, generic render slots, raw visual values, third-party UI kits, or broad style escape hatches.
- Retain host/web checks and source-grounded references during Phase 4. Authoritative iOS/Android visual comparison, target measurement, VoiceOver/TalkBack review, production exclusion, and final catalogue audit remain Phase 5.

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS
- [ ] Dimension 7 Inventory Provenance: PASS

**Approval:** pending
