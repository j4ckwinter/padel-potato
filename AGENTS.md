# Padel Potato

Padel Potato is a native-first Expo and React Native mobile app for organizing padel games among friends and keeping a trustworthy match record.

The current codebase contains a standalone design system under `src/design-system`, surfaced through React Native Storybook. Product navigation, backend services, authentication, persistence, notifications, and complete game workflows are not yet implemented.

## Project constraints

- Target iOS and Android. Web Storybook is a secondary local review surface.
- Use the Expo-managed React Native toolchain and Expo-compatible dependency versions.
- Keep tokens, icons, fonts, artwork, supported configurations, and validation rules inside `src/design-system`.
- Active runtime code must not depend on design-tool files or extraction evidence.
- Preserve existing component public APIs, variants, interactions, and accessibility behavior unless the task explicitly changes them.
- Keep Storybook conditionally enabled through `STORYBOOK_ENABLED`; production app bundles must exclude Storybook code.
- Use typed React Native styles and the existing local design tokens rather than adding another styling framework.
- Treat native iOS and Android behavior as authoritative over browser pixel parity.

## Working conventions

- Inspect existing patterns before introducing new architecture.
- Keep changes focused and preserve unrelated work in a dirty worktree.
- Add or update behavior-focused tests when a change has a practical test seam.
- Prefer accessibility-first queries in React Native Testing Library.
- Install Expo-managed runtime dependencies with `npx expo install`.
- Keep all Storybook packages on the same exact version.

## Verification

Run `npm run verify` for the full automated check. For visual or interaction changes, also review the relevant stories through native Storybook on the available iOS and Android targets.

Useful commands:

- `npm run storybook:native`
- `npm run storybook:web`
- `npm run typecheck`
- `npm run lint`
- `npm test -- --runInBand`
