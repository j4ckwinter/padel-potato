# Padel Potato

## What This Is

Padel Potato is a mobile app for organizing padel games among groups of friends and keeping a trustworthy record of the matches they play. The first milestone is a standalone React Native design system, surfaced through Storybook for iOS, Android, and convenient local web review.

## Core Value

Provide a dependable, reusable mobile component system so future product screens can be assembled consistently and confidently.

## Active Requirements

- Preserve the established tokens, component appearance, public props, variants, interactions, and accessibility behavior.
- Keep runtime components dependent only on modules and local assets within the design system.
- Provide representative, navigable Storybook stories for every public component family.
- Validate type safety, lint, behavior tests, web Storybook startup, and native bundle readiness.
- Use native Storybook as the authority for manual visual and interaction review; web is a secondary convenience surface.

## Out of Scope

- Product screens, navigation, backend services, persistence, and live game flows.
- Pixel-perfect browser parity or hosted Storybook deployment.
- Runtime coupling to design tools, extraction archives, evidence manifests, or source-record identifiers.

## Constraints

- **Platform:** Mobile-first iOS and Android.
- **Application stack:** React Native with Expo.
- **Component workbench:** React Native Storybook, conditionally enabled with `STORYBOOK_ENABLED`.
- **Runtime ownership:** Tokens, icons, fonts, artwork, supported configurations, and validation rules live in the design system.
- **Verification:** Run `npm run verify`; manual native Storybook review remains user-led.

## Key Decisions

| Decision | Rationale | Outcome |
|---|---|---|
| Build and validate reusable components before product screens | Screens should consume a stable system | Adopted |
| Keep native Storybook authoritative and web secondary | Native layout and interaction matter most | Adopted |
| Make the design system standalone from design-tool files and evidence pipelines | Runtime components should be portable and maintainable | Adopted 2026-09-22 |
| Preserve completed Phase 1–4 records as historical context | History remains useful without controlling the runtime | Adopted 2026-09-22 |

---
*Last updated: 2026-09-22 after standalone design-system conversion*
