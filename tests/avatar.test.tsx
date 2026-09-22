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

const rejectedImageSources = [
  { uri: 'ftp://example.com/player.webp' },
  { uri: 'blob:https://example.com/player-id' },
  { uri: 'ws://example.com/player.webp' },
  { uri: '//example.com/player.webp' },
  { uri: 'player.webp' },
] as const;

describe('Avatar public contract', () => {});

describe('Avatar runtime and semantic contract', () => {
  it.each([
    [32, 'online'],
    [40, 'online'],
    [48, 'away'],
    [48, 'offline'],
    [56, 'online'],
  ] as Array<[AvatarSize, AvatarPresence]>)('renders the authored %i/%s tuple at its named-child diameter', async (size, presence) => {
    const screen = await render(
      <Avatar {...({
        accessibilityLabel: `Alex Morgan, ${presence}`,
        initials: 'AM',
        presence,
        size,
      } as AvatarProps)} />,
    );

    const image = screen.getByRole('image', { name: `Alex Morgan, ${presence}` });
    expect(flattenedStyle(image.props.style)).toEqual(expect.objectContaining({
      borderRadius: size / 2,
      height: size,
      width: size,
    }));
    expect(screen.getByTestId('avatar-presence', { includeHiddenElements: true })).toBeTruthy();
  });

  it.each([
    [32, 'away'],
    [32, 'offline'],
    [40, 'away'],
    [40, 'offline'],
    [56, 'away'],
    [56, 'offline'],
  ] as Array<[32 | 40 | 56, 'away' | 'offline']>)('rejects the unauthored %i/%s tuple', (size, presence) => {
    expect(() => Avatar({
      accessibilityLabel: 'Unsupported avatar',
      initials: 'UA',
      presence,
      size,
    } as never)).toThrow(
      `Unsupported Avatar configuration: ${size}/${presence}. Supported configurations: 32/online, 40/online, 48/away, 48/offline, 56/online.`,
    );
  });

  it('rejects null identity content rather than inventing a fallback', () => {
    expect(() => Avatar({
      accessibilityLabel: 'Missing identity',
      initials: null,
      presence: 'online',
      size: 32,
    } as never)).toThrow(/Unsupported Avatar identity content/u);
  });

  it.each(rejectedImageSources)('rejects non-local image source %#', (source) => {
    expect(() => Avatar({
      accessibilityLabel: 'Remote identity',
      presence: 'online',
      size: 40,
      source,
    } as never)).toThrow(/bundled or local React Native image source/u);
  });

  it('exposes one image semantic when labelled and none when decorative', async () => {
    const labelled = await render(
      <Avatar
        accessibilityLabel="Alex Morgan, online"
        initials="AM"
        presence="online"
        size={40}
      />,
    );
    expect(labelled.getAllByRole('image')).toHaveLength(1);
    expect(labelled.getByText('AM', { includeHiddenElements: true })).toBeTruthy();

    const decorative = await render(
      <Avatar decorative initials="AM" presence="online" size={40} />,
    );
    expect(decorative.queryAllByRole('image')).toHaveLength(0);
  });
});

describe('Avatar Storybook contract', () => {
  it('accounts for the complete five-category Identity/Avatar taxonomy', () => {
    expect(AvatarStories.title).toBe('Identity/Avatar');
    expect([Canonical, Variants, States, Boundaries, Interactive]).toHaveLength(5);
    expect(Variants.render).toBeDefined();
    expect(Interactive.parameters).toEqual(expect.objectContaining({
      applicability: expect.stringMatching(/presentational/u),
    }));
  });
});
