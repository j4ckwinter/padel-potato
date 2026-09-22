import { describe, expect, it } from '@jest/globals';

import {} from '../src/design-system/stories/fixtures';

import StatusChipStories, {
  Boundaries as StatusChipBoundaries,
  Canonical as StatusChipCanonical,
  Interactive as StatusChipInteractive,
  States as StatusChipStates,
  Variants as StatusChipVariants,
} from '../src/design-system/components/status/StatusChip.stories';

import StepProgressStories, {
  Boundaries as StepProgressBoundaries,
  Canonical as StepProgressCanonical,
  Interactive as StepProgressInteractive,
  States as StepProgressStates,
  Variants as StepProgressVariants,
} from '../src/design-system/components/progress/StepProgress.stories';

describe('Status Chip and Step Progress Storybook contracts', () => {
  it('accounts for all five categories under exact titles', () => {
    expect(StatusChipStories.title).toBe('Status/Status Chip');
    expect([
      StatusChipCanonical,
      StatusChipVariants,
      StatusChipStates,
      StatusChipBoundaries,
      StatusChipInteractive,
    ]).toHaveLength(5);
    expect(StepProgressStories.title).toBe('Progress/Step Progress');
    expect([
      StepProgressCanonical,
      StepProgressVariants,
      StepProgressStates,
      StepProgressBoundaries,
      StepProgressInteractive,
    ]).toHaveLength(5);
    expect(StepProgressInteractive.parameters).toEqual(
      expect.objectContaining({
        applicability: expect.stringMatching(/read-only/u),
      }),
    );
  });
});
