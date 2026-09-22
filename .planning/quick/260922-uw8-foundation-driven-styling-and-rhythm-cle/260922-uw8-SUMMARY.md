---
status: complete
quick_id: 260922-uw8
completed: 2026-09-22
commit: 60c08b4
---

# Foundation-Driven Styling and Rhythm Cleanup

Foundations now own the design system's visual geometry. The public token barrel exposes a generic four-point sizing scale, compact/content/viewport widths, zero spacing and sizing, and a full-radius token. Legacy dimension aliases remain compatible while resolving from the shared sizing scale.

Stack, Inline, Surface, Text, and Pressable now accept tokenized margin and geometry props. Their raw `style` boundary is restricted to structural flex, alignment, positioning, percentage/full width, and documented zero values. Development guards reject unsupported runtime overrides, while Pressable preserves its minimum touch target when a larger tokenized minimum is requested.

Components now fill their parent frame rather than owning 328–390 pixel widths. Cards and rows use natural or minimum height, controls use padding and touch-target tokens, disabled treatment uses the shared opacity token, and circular/pill shapes use `radiusFull`. Closed SVG paths, raster dimensions, and provider artwork remain unchanged.

Storybook boundary fixtures use shared 320, 352, and 390 pixel review frames. The Foundation Gallery includes sizing, responsive layout, four-point rhythm, full-radius, and disabled-opacity specimens.

An ESLint rule and independent source-boundary test reject governed numeric style literals, raw colours, and direct typography declarations throughout active design-system and Storybook code, excluding token definitions and closed artwork internals.

## Verification

- `npm run verify` passed, including formatting, TypeScript, ESLint, 52 Jest suites / 729 tests, and Storybook web smoke.
- Storybook-enabled Android export passed with the catalogue entry and 2,043 modules.
- Storybook-disabled Android export passed from the application entry with 578 modules.
- Disabled export contained zero Storybook references; enabled export contained the expected Storybook reference.
- Native visual comparison at 320, 352, and 390 pixel frames and 200% font scaling remains a manual review item.
