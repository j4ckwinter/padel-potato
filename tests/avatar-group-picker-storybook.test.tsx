import { describe, expect, it } from '@jest/globals';

import {} from '../src/design-system/stories/fixtures';

import AvatarGroupStories, {
  Boundaries as AvatarGroupBoundaries,
  Canonical as AvatarGroupCanonical,
  Interactive as AvatarGroupInteractive,
  States as AvatarGroupStates,
  Variants as AvatarGroupVariants,
} from '../src/design-system/components/identity/AvatarGroup.stories';

import AvatarPickerStories, {
  Boundaries as AvatarPickerBoundaries,
  Canonical as AvatarPickerCanonical,
  Interactive as AvatarPickerInteractive,
  States as AvatarPickerStates,
  Variants as AvatarPickerVariants,
} from '../src/design-system/components/identity/AvatarPicker.stories';

describe('Avatar Group and Picker Storybook contracts', () => {
  it('accounts for all five story categories under exact Identity titles', () => {
    expect(AvatarGroupStories.title).toBe('Identity/Avatar Group');
    expect([
      AvatarGroupCanonical,
      AvatarGroupVariants,
      AvatarGroupStates,
      AvatarGroupBoundaries,
      AvatarGroupInteractive,
    ]).toHaveLength(5);
    expect(AvatarPickerStories.title).toBe('Identity/Avatar Picker');
    expect([
      AvatarPickerCanonical,
      AvatarPickerVariants,
      AvatarPickerStates,
      AvatarPickerBoundaries,
      AvatarPickerInteractive,
    ]).toHaveLength(5);
  });
});
