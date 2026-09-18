---
phase: 02-primitives-assets-and-component-contracts
reviewed: 2026-09-18T14:15:23Z
depth: standard
files_reviewed: 73
files_reviewed_list:
  - design-spec/assets/normalized/add.svg
  - design-spec/assets/normalized/back.svg
  - design-spec/assets/normalized/brand-lockup-stacked.png
  - design-spec/assets/normalized/brand-lockup.png
  - design-spec/assets/normalized/calendar.svg
  - design-spec/assets/normalized/check.svg
  - design-spec/assets/normalized/chevron.svg
  - design-spec/assets/normalized/clock.svg
  - design-spec/assets/normalized/close.svg
  - design-spec/assets/normalized/court.svg
  - design-spec/assets/normalized/eye.svg
  - design-spec/assets/normalized/filter.svg
  - design-spec/assets/normalized/home.svg
  - design-spec/assets/normalized/location.svg
  - design-spec/assets/normalized/notification.svg
  - design-spec/assets/normalized/overflow.svg
  - design-spec/assets/normalized/players.svg
  - design-spec/assets/normalized/profile.svg
  - design-spec/assets/normalized/search.svg
  - design-spec/assets/normalized/warning.svg
  - design-spec/assets/penpot-assets.json
  - design-spec/assets/raw/add.svg
  - design-spec/assets/raw/back.svg
  - design-spec/assets/raw/brand-lockup-stacked.png
  - design-spec/assets/raw/brand-lockup.png
  - design-spec/assets/raw/calendar.svg
  - design-spec/assets/raw/check.svg
  - design-spec/assets/raw/chevron.svg
  - design-spec/assets/raw/clock.svg
  - design-spec/assets/raw/close.svg
  - design-spec/assets/raw/court.svg
  - design-spec/assets/raw/eye.svg
  - design-spec/assets/raw/filter.svg
  - design-spec/assets/raw/home.svg
  - design-spec/assets/raw/location.svg
  - design-spec/assets/raw/notification.svg
  - design-spec/assets/raw/overflow.svg
  - design-spec/assets/raw/players.svg
  - design-spec/assets/raw/profile.svg
  - design-spec/assets/raw/search.svg
  - design-spec/assets/raw/warning.svg
  - design-spec/phase-2-verification.md
  - design-spec/references/components/brand-lockup-stacked.png
  - design-spec/references/components/brand-lockup.png
  - scripts/export-penpot-assets.mjs
  - scripts/validate-penpot-assets.mjs
  - src/design-system/assets/Brand.stories.tsx
  - src/design-system/assets/BrandLockup.tsx
  - src/design-system/assets/BrandLockupStacked.tsx
  - src/design-system/assets/Icon.stories.tsx
  - src/design-system/assets/Icon.tsx
  - src/design-system/assets/generated/iconRegistry.ts
  - src/design-system/assets/index.ts
  - src/design-system/index.ts
  - src/design-system/primitives/Inline.tsx
  - src/design-system/primitives/Layout.stories.tsx
  - src/design-system/primitives/Pressable.stories.tsx
  - src/design-system/primitives/Pressable.tsx
  - src/design-system/primitives/Stack.tsx
  - src/design-system/primitives/Surface.stories.tsx
  - src/design-system/primitives/Surface.tsx
  - src/design-system/primitives/Text.stories.tsx
  - src/design-system/primitives/Text.tsx
  - src/design-system/primitives/index.ts
  - src/design-system/primitives/styleGuards.ts
  - src/design-system/stories/storyContract.ts
  - src/design-system/testing/accessibility.ts
  - src/design-system/testing/index.ts
  - tests/accessibility-contracts.test.tsx
  - tests/asset-contracts.test.tsx
  - tests/pressable-contract.test.tsx
  - tests/primitive-contracts.test.tsx
  - tests/story-contracts.test.tsx
findings:
  critical: 5
  warning: 2
  info: 0
  total: 7
status: issues_found
---

# Phase 2: Code Review Report

**Reviewed:** 2026-09-18T14:15:23Z
**Depth:** standard
**Files Reviewed:** 73
**Status:** issues_found

## Summary

The primitive implementations are generally small and readable, and the submitted focused tests pass. The review nevertheless found five blocking contract/security defects and two robustness gaps. Most importantly, the asset pipeline hashes two independently prepared SVG files rather than proving that normalized runtime geometry was derived from the raw Penpot export, and its regex validator is not a fail-closed XML parser. The public `Pressable` contract also exposes native behavior and raw Android visual props that its declared bounded API is meant to own.

Verification performed during review: `npm run typecheck`, `node scripts/validate-penpot-assets.mjs`, and the focused asset, Pressable, and story test suites all passed. Those passes do not exercise the bypasses below.

## Narrative Findings (AI reviewer)

## Critical Issues

### CR-01 [BLOCKER]: Raw Penpot geometry and runtime geometry are never linked

**File:** `scripts/export-penpot-assets.mjs:40-49`

**Affected:** `scripts/validate-penpot-assets.mjs:58-66`

**Issue:** The generator reads `raw/*.svg` and `normalized/*.svg` as independent pre-existing inputs and merely hashes both. The validator then validates each independently. It never derives normalized XML from raw XML, compares geometry/child order/attributes between them, or verifies that the only transformation is the approved `#0e1716` to `currentColor` paint substitution. It also does not compare each SVG's `data-penpot-source-id` with `record.sourceNodeId`, and the paint check only requires that the expected paint appears somewhere. A changed `d`, swapped source file, or additional non-semantic paint can therefore be accepted after regeneration while the manifest and deterministic-regeneration checks still pass. That defeats the core source-fidelity guarantee.

**Fix:** Make raw SVG the sole generator input. Parse/validate it, verify the exact source-node attribute and every authored paint, produce normalized bytes through one deterministic paint-only transform, and compare those generated bytes with the checked-in normalized file before writing the manifest/registry. Reject any geometry, attribute, element-order, or extra-paint delta.

### CR-02 [BLOCKER]: The SVG allowlist can be bypassed with XML constructs the regex never inspects

**File:** `scripts/validate-penpot-assets.mjs:8-44`

**Issue:** `validateSvg` only scans opening tags matching `<[A-Za-z]...>` and a small forbidden regex. Declarations, processing instructions, doctypes/entities, CDATA, text nodes, unmatched closing tags, and trailing XML are not covered by the allowlist. For example, a `<!DOCTYPE ... <!ENTITY ... SYSTEM ...>>` plus an entity reference is outside both checks. This is not the promised fail-closed treatment of untrusted SVG build input and could expose whichever XML implementation consumes `SvgXml` now or later to external-entity or external-resource behavior.

**Fix:** Validate with a parser configured to reject DTDs, entities, processing instructions, CDATA, namespaces outside the required SVG namespace, and all content outside the exact element/attribute grammar. If no safe parser is approved, implement a full-consumption tokenizer and explicitly reject every `<` construct other than the allowed start/end tags; add controlled rejection tests for DOCTYPE/entity, processing-instruction, CDATA, malformed nesting, text nodes, and trailing content.

### CR-03 [BLOCKER]: `Pressable` exposes native props that bypass its bounded interaction and token contracts

**File:** `src/design-system/primitives/Pressable.tsx:83-99`

**Affected:** `src/design-system/primitives/Pressable.tsx:150-167`

**Issue:** `PressableProps` starts from almost the entire native `PressableProps` surface and omits only a short list. As a result, supported TypeScript callers can still provide `android_ripple` with an arbitrary raw color, `pressRetentionOffset`, `unstable_pressDelay`, `delayLongPress`, and `android_disableSound`; all are forwarded by `{...nativeProps}`. These props alter authored visuals and press behavior outside the closed Penpot/token/state contract, despite the component explicitly taking ownership of hit geometry and interaction behavior.

**Fix:** Define the public contract from an explicit `Pick`/allowlist of native accessibility, identity, children, focus, and other intentionally supported props. At minimum omit and runtime-reject `android_ripple`, `pressRetentionOffset`, `unstable_pressDelay`, `delayLongPress`, and `android_disableSound`, then add type/runtime tests proving these escape routes are closed.

### CR-04 [BLOCKER]: Empty labels create accessible images with no usable accessible name

**File:** `src/design-system/assets/Icon.tsx:68-80`

**Affected:** `src/design-system/assets/BrandLockup.tsx:23-34`; `src/design-system/assets/BrandLockupStacked.tsx:23-34`

**Issue:** `Icon` treats every string, including `''` and whitespace-only strings, as labelled and exposes `accessibilityRole="image"`/`accessible=true`. Both brand components likewise replace their inherent `Padel Potato` name with an empty caller label. This creates semantic images with no usable name, contradicting the stable-name contract and even the shared helper's explicit non-empty-label rule.

**Fix:** Treat only non-empty, non-whitespace labels as contextual labels. Reject an explicitly empty/whitespace label with the standard unsupported-value diagnostic (or fall back to `Padel Potato` for the brand lockups if that is the approved contract). Add empty and whitespace-only tests for all three component types.

### CR-05 [BLOCKER]: The Interactive Storybook story replaces the configured action with a no-op

**File:** `src/design-system/primitives/Pressable.stories.tsx:93-100`

**Issue:** The meta declares `onPress: { action: 'pressed' }`, but `Interactive.args` explicitly supplies `onPress: () => undefined`. That truthy story arg is passed directly to the component, so the action enhancer has no missing callback to inject and presses do not reach the on-device actions panel. The unit test hides the bug by replacing story args with its own Jest mock instead of exercising the story's default args.

**Fix:** Remove the no-op `onPress` default and let the action argType provide the callback, or use the Storybook-supported instrumented spy/action function. Add a story-level assertion against the actual composed/default story args instead of always replacing `onPress` during the test.

## Warnings

### WR-01 [WARNING]: PNG validation trusts manifest dimensions without inspecting IHDR

**File:** `scripts/validate-penpot-assets.mjs:68-77`

**Issue:** Brand validation checks only the eight-byte PNG signature and the file hash. It asserts the manifest's width/height constants but never reads the PNG IHDR dimensions. A valid PNG of any size can replace a lockup, be rehashed by the generator, and pass while the runtime component forces the declared ratio and distorts the artwork.

**Fix:** Parse the IHDR width/height directly from the PNG bytes (after validating chunk structure) and require exact `300x72` / `300x56` dimensions for raw, normalized, and reference files. Also require the three retained copies to be byte-identical where that is the intended contract.

### WR-02 [WARNING]: The long-text backstop test asserts metadata, not the boundary story witness

**File:** `tests/story-contracts.test.tsx:265-281`

**Affected:** `src/design-system/primitives/Pressable.stories.tsx:73-89`

**Issue:** The test calls the long-text backstop “machine-detectable” by comparing a hard-coded metadata object, but it never renders `PressableBoundaries`, queries `boundary-long-text-action`, checks its accessible name/content, or activates it. The metadata and story can drift independently; removing the witness from the story would leave this test green.

**Fix:** Render `PressableBoundaries` using its default args, query the declared witness ID, assert the preserved accessible name and long visible content, and press it with an observable callback/spied arg. Keep the native 200% review explicitly deferred, but make the host-level witness real.

---

_Reviewed: 2026-09-18T14:15:23Z_
_Reviewer: the agent (gsd-code-reviewer)_
_Depth: standard_
