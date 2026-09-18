---
phase: 03-actions-forms-and-navigation-components
reviewed: 2026-09-18T21:15:00Z
depth: standard
files_reviewed: 59
files_reviewed_list:
  - design-spec/assets/phase-3/apple.svg
  - design-spec/assets/phase-3/artwork-manifest.json
  - design-spec/assets/phase-3/google.svg
  - design-spec/assets/phase-3/heart.svg
  - design-spec/assets/phase-3/mascot-create.webp
  - design-spec/assets/phase-3/mascot-players.webp
  - design-spec/assets/phase-3/mascot-profile.webp
  - design-spec/assets/phase-3/mascot-search.webp
  - design-spec/assets/phase-3/mascot-wave.webp
  - design-spec/components/phase-3-components.json
  - design-spec/phase-3-verification.md
  - package.json
  - scripts/extract-phase-3-artwork.mjs
  - scripts/extract-phase-3-components.mjs
  - scripts/validate-phase-3-artwork.mjs
  - scripts/validate-phase-3-components.mjs
  - scripts/validate-phase-3-verification.mjs
  - src/design-system/components/actions/Button.stories.tsx
  - src/design-system/components/actions/Button.tsx
  - src/design-system/components/actions/Favourite.stories.tsx
  - src/design-system/components/actions/Favourite.tsx
  - src/design-system/components/actions/IconButton.stories.tsx
  - src/design-system/components/actions/IconButton.tsx
  - src/design-system/components/actions/index.ts
  - src/design-system/components/authentication/AuthDivider.stories.tsx
  - src/design-system/components/authentication/AuthDivider.tsx
  - src/design-system/components/authentication/index.ts
  - src/design-system/components/authentication/SocialSignInButton.stories.tsx
  - src/design-system/components/authentication/SocialSignInButton.tsx
  - src/design-system/components/forms/Checkbox.stories.tsx
  - src/design-system/components/forms/Checkbox.tsx
  - src/design-system/components/forms/ChoiceChip.stories.tsx
  - src/design-system/components/forms/ChoiceChip.tsx
  - src/design-system/components/forms/DayTimeSelector.stories.tsx
  - src/design-system/components/forms/DayTimeSelector.tsx
  - src/design-system/components/forms/Field.stories.tsx
  - src/design-system/components/forms/Field.tsx
  - src/design-system/components/forms/index.ts
  - src/design-system/components/generated/phase3Artwork.tsx
  - src/design-system/components/index.ts
  - src/design-system/components/navigation/AppHeader.stories.tsx
  - src/design-system/components/navigation/AppHeader.tsx
  - src/design-system/components/navigation/BottomNavigation.stories.tsx
  - src/design-system/components/navigation/BottomNavigation.tsx
  - src/design-system/components/navigation/index.ts
  - src/design-system/components/navigation/SectionHeader.stories.tsx
  - src/design-system/components/navigation/SectionHeader.tsx
  - src/design-system/components/navigation/SegmentedControl.stories.tsx
  - src/design-system/components/navigation/SegmentedControl.tsx
  - src/design-system/components/sourceRegistry.ts
  - src/design-system/index.ts
  - src/design-system/stories/storyContract.ts
  - tests/action-components.test.tsx
  - tests/authentication-components.test.tsx
  - tests/form-components.test.tsx
  - tests/navigation-components.test.tsx
  - tests/phase3-artwork.test.tsx
  - tests/phase3-source-registry.test.ts
  - tests/phase3-story-contracts.test.tsx
findings:
  critical: 3
  warning: 2
  info: 0
  total: 5
status: issues_found
---

# Phase 3: Code Review Report

**Reviewed:** 2026-09-18T21:15:00Z
**Depth:** standard
**Files Reviewed:** 59
**Status:** issues_found

## Summary

The Phase 3 source, runtime components, stories, public barrels, validators, retained assets, and focused tests were reviewed. Typecheck, lint, the component/artwork/verification validators, and all seven Phase 3 test suites pass, but the review found three shipping blockers and two warnings. The main risks are a clipped native touch target, runtime callback values that evade the advertised fail-closed boundary, Storybook controls that generate rejected prop combinations, and an artwork validator that does not bind vector geometry to the correct export.

## Narrative Findings (AI reviewer)

## Critical Issues

### CR-01: SectionHeader's action cannot provide the declared 44-point native touch target

**File:** `src/design-system/components/navigation/SectionHeader.tsx:93-104`

**Issue:** The optional action is a 40-point `Pressable` with two-point `hitSlop`, but it is placed inside a parent whose height is fixed to 28 points. React Native does not allow a child's hit region to extend beyond its parent bounds (the shared `Pressable` documents this constraint), so the action's effective vertical target is clipped to the 28-point SectionHeader row. `overflow: 'visible'` affects drawing, not native hit testing. This directly violates QUAL-06 and the component's own 44-point target contract. The test at `tests/navigation-components.test.tsx:432-445` only asserts the child `hitSlop` object and therefore gives a false-positive without checking parent clearance.

**Fix:** Give the root a minimum 44-point interaction height while preserving the 28-point visual row, or place the action in an unconstrained 44-point wrapper. Add a layout-level/native acceptance assertion that the parent bounds do not clip the expanded target.

```tsx
container: {
  alignItems: 'center',
  flexDirection: 'row',
  minHeight: 44,
  width: 350,
}

actionTarget: {
  height: 40,
  minWidth: 40,
}
```

### CR-02: Button and IconButton accept invalid callback values and crash only when pressed

**Files:** `src/design-system/components/actions/Button.tsx:73-105`, `src/design-system/components/actions/IconButton.tsx:35-54`

**Issue:** Both validators enumerate `onPress` as supported but never verify that a supplied value is a function. A JavaScript caller or casted Storybook arg can pass a truthy non-function; the shared `Pressable` then creates a handler and executes `onPress(event)`, producing a runtime `TypeError` on user interaction. Falsy invalid values are silently treated as no callback. This contradicts the phase's fail-closed runtime contract and differs from `SocialSignInButton`, which correctly validates `onPress`.

**Fix:** Apply the same optional callback validation in both components and add press-time regression tests for truthy and falsy non-functions.

```tsx
if (typeof props.onPress !== 'undefined' && typeof props.onPress !== 'function') {
  unsupported(props.onPress, ['function']);
}
```

### CR-03: Several Storybook controls create impossible discriminated prop combinations

**Files:** `src/design-system/components/actions/Button.stories.tsx:20-25`, `src/design-system/components/forms/ChoiceChip.stories.tsx:25-30`, `src/design-system/components/forms/DayTimeSelector.stories.tsx:23-27`, `src/design-system/components/navigation/AppHeader.stories.tsx:39-46`, `src/design-system/components/navigation/SegmentedControl.stories.tsx:26-30`

**Issue:** These stories expose discriminant-dependent values as independent controls and pass the resulting args directly to components. Concrete failures include Button allowing `secondary/40`, `disabled + loading`, or disabled non-primary combinations; ChoiceChip allowing unsupported type/icon/selected tuples; DayTimeSelector changing `type` while retaining the other branch's content keys or allowing `selected + disabled`; AppHeader changing `page` while retaining the wrong callback set; and SegmentedControl allowing free-text values outside `options`. Each component then throws its intentional runtime diagnostic, so normal use of the catalogue controls breaks the story instead of demonstrating only supported designs. The generic contract test at `tests/phase3-story-contracts.test.tsx:60-65` checks only a blacklist of control names and cannot detect incompatible combinations.

**Fix:** Route controlled args through per-family normalizers that construct a valid discriminated object (as `Field.stories.tsx:20-65` already does), or replace independent controls with a single immutable source-backed tuple/record selector. Add tests that exercise every control transition and render the resulting story without throwing.

```tsx
const safeButtonArgs = (args: Partial<ButtonProps>): ButtonProps => {
  if (args.loading) return { label: args.label ?? 'Button', loading: true, style: 'primary', size: 48 };
  if (args.disabled) return { label: args.label ?? 'Button', disabled: true, style: 'primary', size: 48 };
  // Return only one of the authored enabled tuples.
};
```

## Warnings

### WR-01: Artwork validation does not bind SVG paths and paints to the correct runtime export

**File:** `scripts/validate-phase-3-artwork.mjs:151-176`

**Issue:** For each retained vector, the validator checks only whether each `viewBox`, path string, and paint appears somewhere in the entire generated runtime source. It does not parse an individual exported function or compare that function with a deterministic generated module. Swapping a Google `<Path>` line with an Apple `<Path>` line still passes `validateArtworkEvidence`, even though both provider logos become incorrect. The runtime tests at `tests/phase3-artwork.test.tsx:102-131` verify decorative semantics and export presence but not per-export geometry, so this false positive survives the complete Phase 3 gate.

**Fix:** Generate `phase3Artwork.tsx` deterministically and compare it byte-for-byte, or parse each named export and validate its exact viewBox, ordered paths, paints, dimensions, and path count. Add controlled-rejection cases that swap paths between exports and alter path ownership.

### WR-02: Favourite source stories change the accessible name when checked

**File:** `src/design-system/components/actions/Favourite.stories.tsx:52-60,74-79`

**Issue:** The checked specimens use `Remove Alex from favourites` while unchecked specimens use `Add Alex to favourites`. The Phase 3 accessibility contract requires a stable name whose checked state is communicated through `accessibilityState.checked`; changing both forces assistive-technology users to relearn the control and demonstrates a usage pattern contrary to the component contract. The interactive story uses a stable label, but the canonical source-state coverage does not.

**Fix:** Use the same label (for example, `Alex favourite`) for checked and unchecked specimens and let the checkbox state communicate selection. Add a story assertion that rerendering from unchecked to checked preserves the accessible name.

---

_Reviewed: 2026-09-18T21:15:00Z_
_Reviewer: the agent (gsd-code-reviewer)_
_Depth: standard_
