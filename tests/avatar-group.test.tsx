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

const groupPlayers = [
  { name: 'Alex Morgan', initials: 'AM', presence: 'online' },
  { name: 'Jamie Taylor', initials: 'JT', presence: 'online' },
  { name: 'Sam Kim', initials: 'SK', presence: 'online' },
  { name: 'Riley Brown', initials: 'RB', presence: 'online' },
] as const satisfies readonly AvatarGroupIdentity[];

describe('Avatar Group runtime and semantic contract', () => {
  type PopulatedAvatarGroupProps = Exclude<Parameters<typeof AvatarGroup>[0], { variant: 'empty' }>;
  it.each([
    ['2 players/default', { identities: [groupPlayers[0], groupPlayers[1]], variant: '2-players' }],
    ['3 players/default', { identities: [groupPlayers[0], groupPlayers[1], groupPlayers[2]], variant: '3-players' }],
    ['4 players/default', { identities: groupPlayers, variant: '4-players' }],
    ['4 players/overflow', { identities: groupPlayers, overflow: 3, variant: 'overflow' }],
  ] as Array<[string, PopulatedAvatarGroupProps]>)('renders the authored %s branch in supplied order', async (_tuple, props) => {
    const screen = await render(<AvatarGroup {...props} />);
    const group = screen.getByRole('summary');
    const expected = groupPlayers.slice(0, props.identities.length).map(({ name }) => name).join(', ');

    expect(group).toHaveAccessibilityValue({ text: 'overflow' in props ? `${expected}, plus 3 more` : expected });
    expect(screen.queryAllByRole('image')).toHaveLength(0);
    expect(screen.getAllByTestId('avatar-group-identity', { includeHiddenElements: true }))
      .toHaveLength(props.identities.length);
  });

  it('keeps two empty-slot actions independent', async () => {
    const onAddPlayer1 = jest.fn();
    const onAddPlayer2 = jest.fn();
    const screen = await render(
      <AvatarGroup
        onAddPlayer1={onAddPlayer1}
        onAddPlayer2={onAddPlayer2}
        variant="empty"
      />,
    );
    const user = userEvent.setup();

    await user.press(screen.getByRole('button', { name: 'Add player 1' }));
    expect(onAddPlayer1).toHaveBeenCalledTimes(1);
    expect(onAddPlayer2).not.toHaveBeenCalled();
    await user.press(screen.getByRole('button', { name: 'Add player 2' }));
    expect(onAddPlayer2).toHaveBeenCalledTimes(1);
  });

  it.each([
    { identities: [], variant: '2-players' },
    { identities: groupPlayers.slice(0, 1), variant: '2-players' },
    { identities: [...groupPlayers, groupPlayers[0]], variant: '4-players' },
    { identities: groupPlayers, overflow: 0, variant: 'overflow' },
    { identities: groupPlayers, overflow: -1, variant: 'overflow' },
    { identities: [groupPlayers[0], null], variant: '2-players' },
    {
      onAddPlayer1: jest.fn(),
      onAddPlayer2: jest.fn(),
      overflow: 2,
      variant: 'empty',
    },
    {
      identities: [groupPlayers[0], groupPlayers[1]],
      onAddPlayer1: jest.fn(),
      variant: '2-players',
    },
    {
      identities: groupPlayers,
      onAddPlayer2: jest.fn(),
      overflow: 2,
      variant: 'overflow',
    },
  ])('rejects an unsupported collection %#', (props) => {
    expect(() => AvatarGroup(invalidProps(props))).toThrow(/Unsupported Avatar Group/u);
  });

  it.each(rejectedImageSources)('rejects a non-local nested image source %#', (source) => {
    expect(() => AvatarGroup({
      identities: [
        { name: 'Remote player', presence: 'online', source },
        groupPlayers[1],
      ],
      variant: '2-players',
    } as never)).toThrow(/source must be bundled or local/u);
  });
});
