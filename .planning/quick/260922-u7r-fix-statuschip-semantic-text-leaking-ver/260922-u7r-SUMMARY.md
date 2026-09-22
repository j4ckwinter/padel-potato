---
status: complete
quick_id: 260922-u7r
completed: 2026-09-22
commit: 41b31b9
---

# Status Chip Web Text Leakage Fix

Removed the redundant internal style-name text (`Success`, `Info`, `Neutral`, and related values) from `StatusChip`. On React Native Web, those words had been placed inside a one-pixel box without clipped overflow and appeared as vertical character columns.

The visible chip label, icon, colour, dimensions, roles, selected/disabled states, callbacks, and Player Preferences Card accessibility label are unchanged. A regression test now confirms that a chip renders its public label without rendering the internal style name.

## Verification

- Focused Status Chip and Player Preferences Card suites: 26 tests passed.
- Prettier check, TypeScript, and ESLint passed.
- Storybook web smoke passed and confirmed the Storybook entry bundle.
