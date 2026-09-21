---
phase: 04-identity-content-and-feedback-components
reviewed: 2026-09-21T19:11:16.806Z
depth: standard
files_reviewed: 60
files_reviewed_list:
  - design-spec/assets/phase-4/artwork-manifest.json
  - design-spec/assets/phase-4/mascot-game-created.webp
  - design-spec/assets/phase-4/mascot-match-result.webp
  - design-spec/assets/phase-4/mascot-no-games.webp
  - design-spec/components/phase-4-components.json
  - design-spec/phase-4-edge-coverage.json
  - design-spec/phase-4-verification.md
  - package.json
  - scripts/extract-phase-4-artwork.mjs
  - scripts/extract-phase-4-components.mjs
  - scripts/validate-phase-4-artwork.mjs
  - scripts/validate-phase-4-components.mjs
  - scripts/validate-phase-4-verification.mjs
  - src/design-system/components/cards/IllustratedCard.stories.tsx
  - src/design-system/components/cards/IllustratedCard.tsx
  - src/design-system/components/cards/index.ts
  - src/design-system/components/content/GameCard.stories.tsx
  - src/design-system/components/content/GameCard.tsx
  - src/design-system/components/content/NotificationRow.stories.tsx
  - src/design-system/components/content/NotificationRow.tsx
  - src/design-system/components/content/PlayerItem.stories.tsx
  - src/design-system/components/content/PlayerItem.tsx
  - src/design-system/components/content/PlayerPreferencesCard.stories.tsx
  - src/design-system/components/content/PlayerPreferencesCard.tsx
  - src/design-system/components/content/ScoreResultBlock.stories.tsx
  - src/design-system/components/content/ScoreResultBlock.tsx
  - src/design-system/components/content/SettingsRow.stories.tsx
  - src/design-system/components/content/SettingsRow.tsx
  - src/design-system/components/content/StatTile.stories.tsx
  - src/design-system/components/content/StatTile.tsx
  - src/design-system/components/content/index.ts
  - src/design-system/components/feedback/BannerToast.stories.tsx
  - src/design-system/components/feedback/BannerToast.tsx
  - src/design-system/components/feedback/EmptyState.stories.tsx
  - src/design-system/components/feedback/EmptyState.tsx
  - src/design-system/components/feedback/index.ts
  - src/design-system/components/generated/phase4Artwork.tsx
  - src/design-system/components/identity/Avatar.stories.tsx
  - src/design-system/components/identity/Avatar.tsx
  - src/design-system/components/identity/AvatarGroup.stories.tsx
  - src/design-system/components/identity/AvatarGroup.tsx
  - src/design-system/components/identity/AvatarPicker.stories.tsx
  - src/design-system/components/identity/AvatarPicker.tsx
  - src/design-system/components/identity/index.ts
  - src/design-system/components/index.ts
  - src/design-system/components/phase4SourceRegistry.ts
  - src/design-system/components/progress/StepProgress.stories.tsx
  - src/design-system/components/progress/StepProgress.tsx
  - src/design-system/components/progress/index.ts
  - src/design-system/components/status/StatusChip.stories.tsx
  - src/design-system/components/status/StatusChip.tsx
  - src/design-system/components/status/index.ts
  - src/design-system/stories/storyContract.ts
  - tests/content-components.test.tsx
  - tests/feedback-card-components.test.tsx
  - tests/identity-status-progress-components.test.tsx
  - tests/phase4-artwork.test.tsx
  - tests/phase4-source-registry.test.ts
  - tests/phase4-story-contracts.test.tsx
  - tests/types/phase4-component-contracts.typecheck.tsx
findings:
  critical: 3
  warning: 2
  info: 0
  total: 5
status: issues_found
---

# Phase 04: Code Review Report

**Reviewed:** 2026-09-21T19:11:16.806Z  
**Depth:** standard  
**Files Reviewed:** 60  
**Status:** issues_found

## Summary

The Phase 4 source, stories, generators, validators, evidence, and tests were reviewed against the plans, approved context, and UI contract. The complete `npm run verify:phase4` gate passes (24 suites, 751 tests, design-source validation, both Phase 4 validators, verification validation, and Storybook web smoke), but that gate does not cover several invalid runtime and catalogue combinations. Three blockers and two robustness/design-contract warnings remain.

## Narrative Findings (AI reviewer)

## Critical Issues

### CR-01: The local-image guard accepts remote URI schemes

**Classification:** BLOCKER  
**Files:**

- `C:\Users\jackw\Documents\dev\padel\src\design-system\components\identity\Avatar.tsx:63-70`
- `C:\Users\jackw\Documents\dev\padel\src\design-system\components\identity\AvatarGroup.tsx:67-74`
- `C:\Users\jackw\Documents\dev\padel\src\design-system\components\identity\AvatarPicker.tsx:26-36`
- `C:\Users\jackw\Documents\dev\padel\src\design-system\components\content\PlayerItem.tsx:82-89`
- `C:\Users\jackw\Documents\dev\padel\src\design-system\components\content\GameCard.tsx:97-104`

**Issue:** All five copies of `isLocalSource` implement a denylist for only `http:`, `https:`, and `data:`. Values such as `{ uri: 'ftp://example.com/player.webp' }`, `{ uri: 'blob:https://example.com/id' }`, protocol-relative URIs, and unknown schemes therefore pass validation and are forwarded to React Native `Image`. `AvatarPicker` also accepts the same values as bare strings. This contradicts the explicit local/bundled-only media trust boundary and can permit an external fetch or platform-specific URI handling through a public component API. The current tests cover `file:` fixtures but do not probe other remote or unknown schemes.

**Fix:** Move the check into one shared validator and use an explicit allowlist of the local URI forms supported by this app (plus positive integer bundled assets). Reject protocol-relative and all unknown/network schemes, and add table-driven runtime tests for `ftp:`, `blob:`, `ws:`, `//host`, and malformed values at each public consumer.

```ts
const LOCAL_URI = /^(?:file|content|asset|ph):/iu;

export function isLocalImageSource(value: unknown): value is ImageSourcePropType {
  if (typeof value === 'number') return Number.isInteger(value) && value > 0;
  if (Array.isArray(value)) return value.length > 0 && value.every(isLocalImageSource);
  if (!value || typeof value !== 'object') return false;
  const uri = (value as { uri?: unknown }).uri;
  return typeof uri === 'string' && LOCAL_URI.test(uri.trim());
}
```

### CR-02: AvatarGroup accepts props belonging to the wrong discriminated branch

**Classification:** BLOCKER  
**File:** `C:\Users\jackw\Documents\dev\padel\src\design-system\components\identity\AvatarGroup.tsx:105-136`  
**Issue:** The runtime validator checks keys against the union-wide property list but does not enforce an exact key set per branch. The `empty` branch accepts and silently ignores `overflow`; every populated branch accepts and silently ignores `onAddPlayer1` and `onAddPlayer2`. This means JavaScript callers, deserialized props, or TypeScript escapes can construct cross-branch configurations that the Phase 4 contract requires to fail closed. The type fixture rejects one callback leak at compile time, but the runtime collection tests at `tests/identity-status-progress-components.test.tsx:224-233` do not exercise either leak.

**Fix:** Validate exact own-property sets for every branch before validating values, then add runtime rejection cases for callbacks on populated branches and `overflow` on `empty`.

```ts
const keys = Object.keys(runtime).sort();
const expected = runtime.variant === 'empty'
  ? ['onAddPlayer1', 'onAddPlayer2', 'variant']
  : runtime.variant === 'overflow'
    ? ['identities', 'overflow', 'variant']
    : ['identities', 'variant'];

if (keys.join('|') !== expected.sort().join('|')) {
  unsupported(`${String(runtime.variant)} contains branch-incompatible properties`);
}
```

### CR-03: Storybook controls can select impossible tuples and show a different branch than the selected args

**Classification:** BLOCKER  
**Files:**

- `C:\Users\jackw\Documents\dev\padel\src\design-system\components\identity\Avatar.stories.tsx:24-60`
- `C:\Users\jackw\Documents\dev\padel\src\design-system\components\status\StatusChip.stories.tsx:18-61`
- `C:\Users\jackw\Documents\dev\padel\src\design-system\components\content\PlayerItem.stories.tsx:24-68`
- `C:\Users\jackw\Documents\dev\padel\src\design-system\components\content\GameCard.stories.tsx:29-66`
- `C:\Users\jackw\Documents\dev\padel\src\design-system\components\content\NotificationRow.stories.tsx:19-55`
- `C:\Users\jackw\Documents\dev\padel\src\design-system\components\content\SettingsRow.stories.tsx:13-63`
- `C:\Users\jackw\Documents\dev\padel\src\design-system\components\content\StatTile.stories.tsx:14-54`
- `C:\Users\jackw\Documents\dev\padel\src\design-system\stories\storyContract.ts:357-372`

**Issue:** Sparse discriminated tuples are exposed as independent control axes. For example, Avatar lets a reviewer select `32/away`, then silently renders `40/online`; StatusChip lets a reviewer select `warning/selectable`, then silently renders `success/selectable`; StatTile exposes 16 Cartesian combinations for a six-tuple family and maps unsupported selections to `compact/winRate/positive`. Branch-specific action controls are also advertised together in families such as PlayerItem, GameCard, EmptyState, and IllustratedCard even when the selected branch cannot own that callback. This directly violates the UI contract that controls can form only valid tuples and actions exist only on the selected branch. Because Storybook is the milestone's review surface, displaying a different branch from the chosen control state makes catalogue verification unreliable.

**Fix:** Expose one whole-branch/record control whose options are the registry's valid tuples, derive all discriminants and callbacks from that selection, and conditionally hide or disable action controls that do not belong to the selected branch. Remove fallback coercion of user-selected invalid combinations; the catalogue should make them unselectable. Extend `phase4-story-contracts.test.tsx` to enumerate the actual control Cartesian product (or whole-branch options) and assert every selectable value maps to the same supported tuple.

## Warnings

### WR-01: IllustratedCard permits unbounded initials inside a fixed 32-point badge

**Classification:** WARNING  
**File:** `C:\Users\jackw\Documents\dev\padel\src\design-system\components\cards\IllustratedCard.tsx:97-107`  
**Issue:** Participant initials are validated only as non-empty text, then rendered without truncation or a line limit inside a fixed `32x32` participant circle (`IllustratedCard.tsx:179-182` and `246-255`). A caller can supply an arbitrarily long string, causing overflow or an unreadable badge. Other Phase 4 avatar-bearing components already enforce one to three visible characters, so this family is an inconsistent public boundary.

**Fix:** Apply the same bounded initials contract used by Avatar/AvatarGroup (preferably through a shared grapheme-aware helper) and add rejection tests for empty, whitespace-only, and overlong values.

### WR-02: Phase 4 catalogue composition repeatedly uses a prohibited spacing token

**Classification:** WARNING  
**File:** `C:\Users\jackw\Documents\dev\padel\src\design-system\components\identity\Avatar.stories.tsx:94`  
**Issue:** The Phase 4 UI contract declares only `space4`, `space8`, `space16`, `space24`, and `space32` for catalogue/general composition and explicitly prohibits `space12`. Nevertheless, `space12` is selected 27 times across the Avatar, AvatarGroup, AvatarPicker, StatusChip, StepProgress, PlayerItem, GameCard, NotificationRow, SettingsRow, StatTile, ScoreResultBlock, PlayerPreferencesCard, and BannerToast stories. This creates a catalogue layout that is outside the phase's declared design scale and weakens the source-fidelity contract.

**Fix:** Replace each `space12` story-stack gap with the appropriate declared token (normally `space16` unless the source-backed composition calls for `space8`) and add a source scan or story-contract assertion that Phase 4 story composition does not select undeclared spacing tokens.

---

_Reviewed: 2026-09-21T19:11:16.806Z_  
_Reviewer: the agent (gsd-code-reviewer)_  
_Depth: standard_
