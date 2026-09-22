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

describe('Status Chip runtime and semantic contract', () => {
  it.each(['neutral', 'success', 'warning', 'info', 'error'] as const)(
    'renders %s/default as static labelled content',
    async (style) => {
      const screen = await render(
        <StatusChip label={`${style} status`} style={style} variant="default" />,
      );
      expect(screen.getByText(`${style} status`)).toBeTruthy();
      expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
      expect(screen.queryAllByRole('button')).toHaveLength(0);
    },
  );

  it('emits the next selected value without changing controlled state', async () => {
    const onSelectedChange = jest.fn();
    const screen = await render(
      <StatusChip
        label="Confirmed"
        onSelectedChange={onSelectedChange}
        selected
        style="success"
        variant="selectable"
      />,
    );
    const chip = screen.getByRole('checkbox', { name: 'Confirmed' });
    expect(chip).toBeChecked();
    await userEvent.setup().press(chip);
    expect(onSelectedChange).toHaveBeenCalledWith(false);
    expect(chip).toBeChecked();
  });

  it('exposes the authored disabled branch and suppresses activation', async () => {
    const screen = await render(
      <StatusChip label="Unavailable" style="neutral" variant="disabled" />,
    );
    const chip = screen.getByRole('button', { name: 'Unavailable' });
    expect(chip).toBeDisabled();
    await userEvent.setup().press(chip);
    expect(chip).toBeDisabled();
  });

  it.each([
    { label: 'Wrong', style: 'warning', variant: 'selectable' },
    { label: 'Wrong', onSelectedChange: jest.fn(), selected: true, style: 'success', variant: 'default' },
    { label: 'Wrong', style: 'success', variant: 'disabled' },
    { label: '', style: 'neutral', variant: 'default' },
  ])('rejects an unsupported chip tuple %#', (props) => {
    expect(() => StatusChip(invalidProps(props))).toThrow(/Unsupported Status Chip/u);
  });
});
