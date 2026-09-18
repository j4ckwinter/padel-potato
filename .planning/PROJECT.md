# Padel Potato

## What This Is

Padel Potato is a mobile app for organizing padel games among groups of friends and keeping a trustworthy record of the matches they play. The broader product will let players create games, choose a date, time, and venue, invite friends, track responses until four players are confirmed, record scores, confirm results, and receive relevant notifications.

The first milestone is the product's React Native design system rather than the working game flow. It will translate the existing Penpot foundations and reusable components into an Expo-based component library, surfaced and verified through React Native Storybook on iOS and Android. Product screens, navigation, backend behavior, and persistent game data follow in later milestones.

## Core Value

Create a faithful, reusable mobile component system from the Penpot source of truth so future product screens can be assembled consistently and confidently.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Implement the Penpot foundations as reusable React Native design tokens and primitives.
- [ ] Implement every reusable component and its designed variants and states from the Penpot component library.
- [ ] Provide representative, navigable Storybook stories for all foundations, components, variants, and states.
- [ ] Run the component catalogue through Expo on both iOS and Android.
- [ ] Make the Storybook catalogue available for convenient local review in a desktop browser through Expo's web target.
- [ ] Use the committed `design-source/padel-potato UI Concepts.penpot` snapshot to extract authoritative design specifications and references.
- [ ] Verify native Storybook renders against Penpot references and record any intentional deviations.
- [ ] Preserve sensible React Native Web compatibility where practical without making web parity a milestone requirement.

### Out of Scope

- Product screen assembly — deferred until the foundations and reusable components are proven.
- App navigation and end-to-end user flows — deferred to the product-screen milestone.
- Backend services, authentication behavior, persistence, and live invitations — not needed for the Storybook design-system milestone.
- Game creation, response tracking, score entry, result confirmation, and notifications as working features — later application milestones.
- Public game discovery and the broader player directory as working features — later scope despite their presence in the product-screen designs.
- Pixel-perfect browser parity and hosted web deployment — local browser review is required, but native iOS and Android rendering remains authoritative.

## Context

- The initial audience for the eventual app is friend groups that currently coordinate padel games informally.
- The product is intended to solve both sides of the experience: fragmented coordination before a match and the lack of a reliable match record afterward.
- The ideal eventual flow is: create a game; choose date, time, and venue; invite friends; track responses until four players are confirmed; play; record the score; confirm the result.
- The committed `design-source/padel-potato UI Concepts.penpot` export is the canonical design snapshot for routine planning, extraction, implementation, and verification. Its deterministic identity and inventory are recorded in `design-spec/penpot-source.json`.
- Live Penpot MCP access is optional and is used only to check whether a newer snapshot should be exported; completed Phase 1/2 MCP evidence retains its historical provenance.
- Penpot design file: `c514c1fb-1cda-8125-8008-a606253a77a3`.
- Penpot foundations page: `482a7222-5a3b-8086-8008-a6072bd7e924` (`01 Foundations`).
- Penpot components page: `482a7222-5a3b-8086-8008-a6073072bbb1` (`02 Components`).
- Penpot product screens page: `482a7222-5a3b-8086-8008-a608ebaf11cd` (`03 Product Screens`).
- The product-screen library currently contains sign-up and onboarding, Home, Discover, My Games, Create Game, Game Details, player directory and profiles, notifications, and profile settings. These screens provide downstream context but are not part of the first milestone.

## Constraints

- **Platform**: Mobile only, targeting iOS and Android — the product experience is intentionally native-first.
- **Application stack**: React Native with Expo — chosen as the likely implementation platform for the eventual app and its component system.
- **Component workbench**: React Native Storybook — the first milestone must be independently reviewable without product screens.
- **Design authority**: The committed local Penpot export is the default authority for foundations, components, and product-screen context — implementation must not invent or silently substitute design values.
- **Verification**: Validate the local snapshot's deterministic manifest, then compare retained design references with native Storybook output — source inspection alone cannot prove runtime rendering fidelity.
- **Web support**: Provide a locally browser-accessible Storybook catalogue through Expo's web target, but do not add cost or compromise native behavior to achieve pixel-perfect browser parity.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Build foundations before reusable components | Components should consume one coherent token and primitive layer rather than duplicate design values | — Pending |
| Build and validate reusable components before product screens | The design system must be stable before screens depend on it | — Pending |
| Use React Native with Expo | The eventual product is mobile-only and should share the same runtime as its design system | — Pending |
| Use native Storybook on both iOS and Android as the acceptance target | Native rendering and interaction are authoritative for a mobile-only product | — Pending |
| Treat web Storybook as secondary compatibility | A browser catalogue is useful but not worth expanding the first milestone's acceptance surface | — Pending |
| Treat the committed local Penpot export as the canonical design snapshot | Exact tokens, properties, variants, states, and references remain reproducible offline; live MCP is only an optional freshness check | ✓ Adopted at revision 296 |
| Defer working product screens and backend flows | The first milestone is complete when the reusable system is proven in Storybook | — Pending |
| Use the complete exact Storybook 10.5.0 family for Expo 57 implementation | Clean-room probing proved 10.5.0 with Expo-aligned native peers passes dependency-tree validation, `expo install --check`, and Expo Doctor 21/21; the inherited 10.6.0 stack entry fails Expo 57 safe-area compatibility | ✓ Supersedes the inherited Storybook 10.6.0 implementation baseline for Phase 1 |

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
*Last updated: 2026-09-18 after adopting the local Penpot snapshot*
