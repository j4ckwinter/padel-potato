import { describe, expect, it, jest } from '@jest/globals';

import { flattenedStyle, invalidProps } from './helpers/componentTest';

import { render, userEvent } from '@testing-library/react-native';

import { StyleSheet } from 'react-native';

import AvatarStories, {
  Boundaries,
  Canonical,
  Interactive,
  States,
  Variants,
} from '../src/design-system/components/identity/Avatar.stories';

import {
  Avatar,
  avatarPresences,
  avatarSizes,
  type AvatarPresence,
  type AvatarProps,
  type AvatarSize,
} from '../src/design-system/components/identity/Avatar';

import {  } from '../src/design-system/stories/fixtures';

import AvatarGroupStories, {
  Boundaries as AvatarGroupBoundaries,
  Canonical as AvatarGroupCanonical,
  Interactive as AvatarGroupInteractive,
  States as AvatarGroupStates,
  Variants as AvatarGroupVariants,
} from '../src/design-system/components/identity/AvatarGroup.stories';

import {
  AvatarGroup,
  type AvatarGroupIdentity,
} from '../src/design-system/components/identity/AvatarGroup';

import AvatarPickerStories, {
  Boundaries as AvatarPickerBoundaries,
  Canonical as AvatarPickerCanonical,
  Interactive as AvatarPickerInteractive,
  States as AvatarPickerStates,
  Variants as AvatarPickerVariants,
} from '../src/design-system/components/identity/AvatarPicker.stories';

import {
  AvatarPicker,
  type AvatarPickerProps,
} from '../src/design-system/components/identity/AvatarPicker';

import StatusChipStories, {
  Boundaries as StatusChipBoundaries,
  Canonical as StatusChipCanonical,
  Interactive as StatusChipInteractive,
  States as StatusChipStates,
  Variants as StatusChipVariants,
} from '../src/design-system/components/status/StatusChip.stories';

import { StatusChip } from '../src/design-system/components/status/StatusChip';

import StepProgressStories, {
  Boundaries as StepProgressBoundaries,
  Canonical as StepProgressCanonical,
  Interactive as StepProgressInteractive,
  States as StepProgressStates,
  Variants as StepProgressVariants,
} from '../src/design-system/components/progress/StepProgress.stories';

import { StepProgress } from '../src/design-system/components/progress/StepProgress';

describe('Step Progress runtime and semantic contract', () => {
  it.each([
    [1, 'Step 1 of 3'],
    [2, 'Step 2 of 3'],
    [3, 'Step 3 of 3'],
  ] as Array<[1 | 2 | 3, string]>)('renders exact active step %i', async (value, label) => {
    const screen = await render(<StepProgress value={value} />);
    const progress = screen.getByRole('progressbar', { name: label });
    expect(progress).toHaveAccessibilityValue({ min: 1, max: 3, now: value, text: label });
    expect(screen.getByText(label)).toBeTruthy();
  });

  it('renders explicit completion text/value', async () => {
    const screen = await render(<StepProgress value="complete" />);
    const progress = screen.getByRole('progressbar', { name: 'Setup complete' });
    expect(progress).toHaveAccessibilityValue({ min: 1, max: 3, now: 3, text: 'Setup complete' });
    expect(screen.getByText('Setup complete')).toBeTruthy();
  });

  it.each([0, 4, null, undefined, '3', 'done'])('rejects arbitrary progress %p', (value) => {
    expect(() => StepProgress({ value } as never)).toThrow(/Unsupported Step Progress/u);
  });
});
