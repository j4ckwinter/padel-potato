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

## Next Milestone Goals

Define these through `$gsd-new-milestone` rather than treating them as pre-approved scope:

- Decide whether deferred native catalogue validation is a prerequisite or an early phase.
- Assemble product screens from the design system without weakening its public contracts.
- Introduce navigation and the first coherent game-organizing workflow.
- Decide backend, authentication, persistence, and notification boundaries only when required by the chosen product slice.

## Active Requirements

- Preserve the shipped tokens, component appearance, public props, variants, interactions, and accessibility behavior.
- Keep active runtime code independent from design-tool archives and extraction evidence.
- Retain representative Storybook stories and behavior tests as product screens begin consuming the system.
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

---
*Last updated: 2026-09-23 after v1.0 Design System override closeout*
