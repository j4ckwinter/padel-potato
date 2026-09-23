---
quick_id: 260922-qrl
status: complete
mode: quick-full
description: Remove Penpot coupling and make components standalone
must_haves:
  truths:
    - Runtime components, tokens, stories, and normal tests do not depend on Penpot evidence.
    - Existing component APIs, supported variants, appearance, interactions, and accessibility remain unchanged.
    - Runtime artwork required by the design system is owned beneath src/design-system.
  artifacts:
    - src/design-system assets and component-owned runtime definitions
    - behavior-focused Jest and Storybook contracts
    - package verify command without Penpot validation
  key_links:
    - Components consume only design-system runtime tokens, primitives, definitions, and assets.
    - Storybook fixtures describe public component variants without source record IDs.
    - Active project guidance describes a standalone component library.
---

# Remove Penpot Coupling and Make Components Standalone

## Task 1: Decouple runtime code and assets

**Files:** `src/design-system/**`, retained runtime media moved from `design-spec/assets/**`

**Action:** Replace Phase 3/4 evidence registries with component-owned constants, reduce icons to runtime SVG definitions, remove token provenance maps, remove Penpot wording, and relocate every required brand/mascot asset beneath the design system without changing public component behavior.

**Verify:** TypeScript passes and static searches find no Penpot/design-spec/source-registry coupling in active design-system runtime code.

**Done:** Components and assets render from self-contained runtime definitions with existing APIs and visual values preserved.

## Task 2: Make Storybook and tests behavior-focused

**Files:** `src/design-system/**/*.stories.tsx`, `src/design-system/stories/storyContract.ts`, `tests/**`

**Action:** Replace source-record-derived story fixtures and contracts with explicit public configurations; remove source identity displays and evidence assertions; retain interaction, accessibility, variant, boundary, catalogue, icon, and artwork behavior coverage; add a standalone-boundary regression test.

**Verify:** Full Jest suite, lint, typecheck, and Storybook web smoke pass.

**Done:** Normal tests and stories exercise the public design-system contract without Penpot evidence.

## Task 3: Remove the pipeline and update active guidance

**Files:** `design-source/**`, `design-spec/**`, Penpot/phase-evidence scripts, `package.json`, `.gitattributes`, `AGENTS.md`, active `.planning` project and Phase 5 documents

**Action:** Delete the archive/evidence/extraction pipeline and obsolete scripts, add a unified verify command, remove the LFS rule, and update only active guidance while preserving completed Phase 1-4 history and unrelated dirty worktree changes.

**Verify:** Removed paths no longer exist; active-source search is clean; unified verification and Storybook native enabled/disabled bundle checks pass.

**Done:** The repository's active workflow treats the component library as standalone and contains no executable Penpot dependency.
