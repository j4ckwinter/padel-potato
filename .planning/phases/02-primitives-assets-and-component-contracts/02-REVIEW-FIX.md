---
phase: 02-primitives-assets-and-component-contracts
fixed_at: 2026-09-18T14:44:59Z
review_path: .planning/phases/02-primitives-assets-and-component-contracts/02-REVIEW.md
iteration: 3
findings_in_scope: 2
fixed: 2
skipped: 0
status: all_fixed
---

# Phase 02: Code Review Fix Report

**Fixed at:** 2026-09-18T14:44:59Z
**Source review:** `.planning/phases/02-primitives-assets-and-component-contracts/02-REVIEW.md`
**Iteration:** 3

**Summary:**

- Findings in scope: 2
- Fixed: 2
- Skipped: 0

## Fixed Issues

### CR-01: `aria-busy` can override the loading accessibility invariant

**Status:** Fixed; requires human verification because this finding concerns state-precedence logic.
**Files modified:** `src/design-system/primitives/Pressable.tsx`, `tests/pressable-contract.test.tsx`
**Commit:** `bdec4dc`
**Applied fix:** Emitted owned `aria-busy` and `aria-disabled` values after the native accessibility spread, keeping the complete standard accessibility pass-through while preventing caller aliases from contradicting the component's loading and blocked state machine. The render contract now supplies conflicting false aliases alongside disabled/loading and verifies the final host state remains busy and disabled while unrelated accessibility state and value fields survive.

### WR-01: The PNG validator still accepts structurally undecodable indexed images

**Files modified:** `scripts/validate-penpot-assets.mjs`, `tests/asset-contracts.test.tsx`
**Commit:** `727d270`
**Applied fix:** Required indexed-colour PNGs to contain a valid `PLTE` before `IDAT`; rejected duplicate, late, forbidden, oversized, malformed, and unknown critical chunks; reconstructed filtered rows; and verified every indexed sample resolves to an available palette entry. Existing CRC, chunk-order, consecutive-IDAT, zlib-inflation, decoded-length, and row-filter checks remain active. A controlled valid-zlib indexed PNG without `PLTE` now proves the mandatory palette rejection.

## Verification

Verification ran in the main checkout because `.planning/config.json` sets `workflow.use_worktrees` to `false`.

- `npm run typecheck` — passed.
- `npm run lint` — passed with zero warnings.
- `npm test -- --runInBand` — passed: 10 suites, 294 tests, zero snapshots.
- `node scripts/validate-penpot-assets.mjs` — passed with 18 icons, two lockups, controlled SVG/PNG rejections, and deterministic regeneration.
- `npm run storybook:web:smoke` — passed with the Storybook entry confirmed.
- Focused Pressable and asset contract suites passed after their corresponding fixes.

## Skipped Issues

None — all in-scope findings were fixed.

---

_Fixed: 2026-09-18T14:44:59Z_
_Fixer: the agent (gsd-code-fixer)_
_Iteration: 3_
