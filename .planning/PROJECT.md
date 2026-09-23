# Padel Potato

## What This Is

Padel Potato is a mobile app for organizing padel games among groups of friends and keeping a trustworthy record of the matches they play. Milestone v1.0 delivered its standalone Expo/React Native design system and Storybook catalogue. Product screens, navigation, game workflows, and persistence remain future work.

## Core Value

Make organizing padel games among friends simple and dependable, using the shipped component system as the consistent product foundation.

## Current State

- **Shipped:** v1.0 Design System on 2026-09-23 through an override closeout.
- **Delivered:** Foundations, primitives, local assets, typed component contracts, reusable component families, Storybook coverage, and automated host/web verification.
- **Automated evidence:** The final Phase 4 gate recorded 24 suites and 794 passing tests.
- **Archived:** Phase and quick-task history lives under `.planning/milestones/`.
- **Not verified:** Phase 5 native catalogue validation was not executed. iOS/Android manual review, 200% font-scale review, VoiceOver/TalkBack checks, production Storybook exclusion, and final catalogue coverage remain open.

## Current Milestone: v1.1 App Foundation

**Goal:** Establish a production-shaped, navigable Padel Potato application shell around the completed design system.

**Target features:**

- Expo Router with typed routes, deep links, stacks, and route groups.
- The existing design-system `BottomNavigation` as the custom tab presentation over standard Expo Router infrastructure.
- Root providers, fonts, splash handling, safe areas, error boundaries, and validated client environment configuration.
- Placeholder app screens composed from the design system and deterministic local fixtures.
- Development-build and EAS foundations, screen-level integration tests, and production-export proof that Storybook is excluded.
- An explicit decision and execution path for the native validation work deferred from v1.0.

## Active Requirements

- Preserve the shipped tokens, component appearance, public props, variants, interactions, and accessibility behavior.
- Keep active runtime code independent from design-tool archives and extraction evidence.
- Retain representative Storybook stories and behavior tests as product screens begin consuming the system.
- Add the application shell without authentication, backend services, persistence, or live game workflows.
- Resolve or deliberately rescope the eight deferred v1 requirements archived in `milestones/v1.0-REQUIREMENTS.md`.

## Out of Scope Until Replanned

- Hosted Storybook and pixel-perfect browser parity.
- Unspecified themes or component variants.
- Runtime coupling to design tools, extraction archives, or source-record identifiers.

## Constraints

- **Platform:** Mobile-first iOS and Android.
- **Application stack:** React Native with Expo.
- **Component workbench:** React Native Storybook, conditionally enabled with `STORYBOOK_ENABLED`.
- **Runtime ownership:** Tokens, icons, fonts, artwork, supported configurations, and validation rules live in `src/design-system`.
- **Verification:** `npm run verify` is the automated baseline; native visual and assistive-technology review remains human-led.

## Key Decisions

| Decision | Rationale | Outcome |
|---|---|---|
| Build reusable components before product screens | Screens should consume a stable system | ✓ Good — v1.0 delivered the standalone component system |
| Keep native Storybook authoritative and web secondary | Native layout and interaction matter most | ⚠ Revisit — authoritative native acceptance was deferred |
| Keep runtime code independent from design-tool evidence | Runtime components should be portable and maintainable | ✓ Good |
| Preserve completed planning artifacts as archives | History remains useful without controlling future runtime work | ✓ Good |
| Close v1.0 before executing Phase 5 | Begin a new milestone without claiming missing native evidence | Accepted override on 2026-09-23 |
| Use Expo Router with the existing BottomNavigation presentation | Keep standard routing infrastructure while preserving the shipped product identity | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `$gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `$gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-09-23 for v1.1 App Foundation initialization*
