# Phase 5 UI Specification: Storybook Validation Surface

## Intent

Phase 5 adds no new product design language. It presents the existing standalone component library clearly enough for manual native review.

## Catalogue Contract

- Preserve existing story titles and the `Canonical`, `Variants`, `States`, `Boundaries`, and `Interactive` taxonomy.
- Controls expose only supported public props or explicit configuration fixtures.
- Actions map only to real public callbacks.
- Foundation specimens show runtime token names and values without provenance labels.
- Artwork and brand imagery load only from `src/design-system/assets`.
- Long content, disabled states, focus treatment, accessibility names, target sizes, and sparse configurations remain reviewable.

## Acceptance

- Existing stories render and behave as before on native Storybook.
- Browser Storybook starts successfully as a secondary smoke target.
- The catalogue contains no source-record, revision, archive, or extraction terminology.
- Manual review remains controlled by the user, who will report any observed issues separately.
