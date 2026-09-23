---
quick_id: 260922-rrw
status: complete
mode: quick-full
description: Staged design-system cleanup
must_haves:
  truths:
    - Public component exports, props, supported configurations, rendering, interactions, accessibility, Storybook titles, and taxonomy remain unchanged.
    - Active code uses semantic artwork and fixture names with human-readable Storybook labels and no phase registry or numeric family indexing.
    - Repeated runtime validation and oversized Field internals are separated into focused private modules without weakening fail-closed behavior.
    - Tests are component-focused, behavior-oriented, and retain complete automated coverage.
  artifacts:
    - Semantic private artwork modules under src/design-system/assets/artwork
    - Named component fixture modules under src/design-system/stories/fixtures
    - Shared internal validation utilities and split Field implementation modules
    - Component-focused tests and shared test helpers
  key_links:
    - Stories consume fixtures by semantic export name and render human labels rather than internal IDs.
    - Runtime components consume shared validation helpers while keeping supported tuples local.
    - The standalone boundary test prevents obsolete phase registry and source terminology from returning.
---

# Staged Design-System Cleanup

## Task 1: Correct terminology, artwork ownership, and text defects

**Files:** `src/design-system/assets/artwork/**`, artwork consumers, affected stories/tests

**Action:** Move phase-named artwork into semantic private modules, share decorative media helpers, preserve exact geometry/media/test IDs, repair mojibake, and replace source-oriented captions and names.

**Verify:** Typecheck, lint, targeted artwork/content tests, and static terminology/encoding searches pass.

**Done:** Active artwork code and visible catalogue text are semantic, correctly encoded, and visually/semantically unchanged.

## Task 2: Replace registries and simplify runtime internals

**Files:** `src/design-system/stories/**`, all story consumers, `src/design-system/internal/**`, runtime components, `src/design-system/components/forms/field/**`

**Action:** Replace the monolithic phase arrays with named typed fixtures and human labels; consolidate story contracts; add narrow validation helpers; split Field into focused private modules; preserve public APIs and fail-closed validation.

**Verify:** Typecheck, lint, full Jest, no numeric fixture-family indexing, no obsolete phase/source names, and unchanged story title/taxonomy assertions.

**Done:** Fixtures, stories, validation, and Field internals are maintainable without changing behavior.

## Task 3: Reorganize tests and complete release verification

**Files:** `tests/**`, quick-task summary and verification artifacts

**Action:** Split large domain suites into component-focused files, introduce shared story-test helpers, remove obsolete fixture assertions/casts, strengthen standalone boundaries, and retain public behavior coverage.

**Verify:** `npm run verify`, Storybook title/story-count comparison, enabled and disabled Android exports, and representative manual Storybook review checklist.

**Done:** The full automated suite passes with component-focused tests and remaining manual visual review is explicitly documented.
