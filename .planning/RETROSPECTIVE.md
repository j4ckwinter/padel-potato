# Project Retrospective

## Milestone: v1.0 — Design System

**Shipped:** 2026-09-23  
**Closeout:** Override  
**Phases:** 4 verified, 1 deferred | **Plans:** 33 completed

### What Was Built

- An Expo 57 / React Native Storybook workbench for native and local web review.
- A standalone token, primitive, local-asset, and component system under `src/design-system`.
- Typed public contracts, Storybook taxonomy, semantic tests, and fail-closed evidence validation.
- Complete reusable action, form, navigation, identity, content, feedback, and card families.

### What Worked

- Dependency-ordered vertical slices kept each component family reviewable and testable.
- Closed prop unions and source-ordered story contracts prevented unsupported combinations.
- Separating runtime assets from design evidence produced a portable design-system boundary.
- Automated verification caught count drift and semantic regressions without overstating native fidelity.

### What Was Inefficient

- Evidence extraction and retained design provenance consumed substantial effort after runtime independence became the more important goal.
- Native acceptance was repeatedly deferred on a Windows development environment and accumulated into an oversized final validation phase.
- Planning artifacts occasionally drifted from current toolchain recommendations and needed explicit reconciliation.

### Patterns Established

- Foundations are the enforceable styling authority; component-local styles remain structural.
- Interactive components use controlled state, isolated callbacks, and a single semantic owner.
- Storybook web is a smoke-review surface; native review is the visual authority.
- Verification reports must distinguish automated host evidence from human native acceptance.

### Key Lessons

- Schedule small native review checkpoints throughout a milestone instead of concentrating them in a final phase.
- Treat toolchain drift as a dedicated maintenance decision, not an incidental dependency edit.
- Archive design evidence once runtime independence is proven so product work can proceed from stable public contracts.

### Cost Observations

- Repository at closeout: approximately 25,826 tracked TypeScript/TSX lines.
- Timeline: 2026-09-17 through 2026-09-23.
- Notable: 33 plans delivered broad component coverage quickly, but final native acceptance remained a human/platform bottleneck.

## Cross-Milestone Trends

| Milestone | Verified Phases | Deferred Phases | Plans | Primary lesson |
|---|---:|---:|---:|---|
| v1.0 Design System | 4 | 1 | 33 | Integrate native acceptance continuously |
