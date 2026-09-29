import type { Meta, StoryObj } from '@storybook/react-native';
import { Fragment } from 'react';

import { Stack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { avatarGroupFixtures } from '../../stories/fixtures';
import {
  AvatarGroup,
  type AvatarGroupIdentity,
  type AvatarGroupProps,
} from './AvatarGroup';

const fixtures = avatarGroupFixtures;
const players = [
  { initials: 'AM', name: 'Alex Morgan', presence: 'online' },
  { initials: 'JT', name: 'Jamie Taylor', presence: 'online' },
  { initials: 'SK', name: 'Sam Kim', presence: 'online' },
  { initials: 'RB', name: 'Riley Brown', presence: 'online' },
] as const satisfies readonly AvatarGroupIdentity[];

const meta = {
  title: 'Identity/Avatar Group',
  excludeStories: /^normalize/u,
  component: AvatarGroup,
  argTypes: {
    variant: {
      control: 'select',
      options: [
        '2-players',
        '3-players',
        '4-players',
        'partial',
        'overflow',
        'empty',
      ],
    },
  },
} satisfies Meta<typeof AvatarGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

type StoryArgs = Readonly<{ overflow?: unknown; variant?: unknown }>;

export function normalizeAvatarGroupStoryArgs(
  args: StoryArgs,
): AvatarGroupProps {
  switch (args.variant) {
    case 'partial':
      return { identities: [players[0]], variant: 'partial' };
    case 'empty':
      return {
        onAddPlayer1: () => undefined,
        onAddPlayer2: () => undefined,
        variant: 'empty',
      };
    case '3-players':
      return {
        identities: [players[0], players[1], players[2]],
        variant: '3-players',
      };
    case '4-players':
      return { identities: players, variant: '4-players' };
    case 'overflow':
      return {
        identities: players,
        overflow:
          typeof args.overflow === 'number' &&
          Number.isInteger(args.overflow) &&
          args.overflow > 0
            ? args.overflow
            : 3,
        variant: 'overflow',
      };
    default:
      return { identities: [players[0], players[1]], variant: '2-players' };
  }
}

function fixtureProps(fixture: (typeof fixtures)[number]): AvatarGroupProps {
  const content = fixture.configuration.content;
  const state = fixture.configuration.state;
  if (state === 'partial') {
    return { identities: [players[0]], variant: 'partial' };
  }
  if (content === '2Slots' && state === 'empty') {
    return {
      onAddPlayer1: () => undefined,
      onAddPlayer2: () => undefined,
      variant: 'empty',
    };
  }
  if (content === '4Players' && state === 'overflow') {
    return { identities: players, overflow: 3, variant: 'overflow' };
  }
  if (content === '4Players')
    return { identities: players, variant: '4-players' };
  if (content === '3Players') {
    return {
      identities: [players[0], players[1], players[2]],
      variant: '3-players',
    };
  }
  return { identities: [players[0], players[1]], variant: '2-players' };
}

export const Canonical: Story = {
  args: { identities: [players[0], players[1]], variant: '2-players' },
  render: (args) => (
    <Stack gap="space8">
      <AvatarGroup {...normalizeAvatarGroupStoryArgs(args)} />
      <Text color="textSecondary" variant="caption">
        {fixtures[5].label}
      </Text>
    </Stack>
  ),
};

export const Variants: Story = {
  args: Canonical.args,
  render: () => (
    <Stack gap="space16">
      {fixtures.map((fixture) => (
        <Fragment key={fixture.label}>
          <AvatarGroup {...fixtureProps(fixture)} />
          <Text color="textSecondary" variant="caption">
            {fixture.label}
          </Text>
        </Fragment>
      ))}
    </Stack>
  ),
};

export const States: Story = {
  args: Canonical.args,
  render: () => (
    <Stack gap="space16">
      <AvatarGroup identities={[players[0]]} variant="partial" />
      <AvatarGroup identities={players} overflow={3} variant="overflow" />
      <AvatarGroup
        onAddPlayer1={() => undefined}
        onAddPlayer2={() => undefined}
        variant="empty"
      />
    </Stack>
  ),
};

export const Boundaries: Story = {
  args: Canonical.args,
  render: () => (
    <Stack gap="space8" width="compact">
      <AvatarGroup
        identities={[
          {
            initials: 'ŁN',
            name: 'Łucía Nguyễn from 東京',
            presence: 'online',
          },
          players[1],
        ]}
        variant="2-players"
      />
      <Text color="textSecondary" maxFontSizeMultiplier={2} variant="caption">
        Full ordered group names remain available. Native 200% font-scale review
        requires native Storybook review.
      </Text>
    </Stack>
  ),
};

export const Interactive: Story = {
  args: {
    onAddPlayer1: () => undefined,
    onAddPlayer2: () => undefined,
    variant: 'empty',
  },
  render: () => (
    <AvatarGroup
      onAddPlayer1={() => undefined}
      onAddPlayer2={() => undefined}
      variant="empty"
    />
  ),
};
