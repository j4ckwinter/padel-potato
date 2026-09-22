import type { Meta, StoryObj } from '@storybook/react-native';
import { Fragment } from 'react';

import { Stack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { avatarFixtures } from '../../stories/fixtures';
import { Avatar, type AvatarProps } from './Avatar';

const storyPhoto = require('../../assets/media/mascot-profile.webp');


type AvatarStoryArgs = Readonly<{
  accessibilityLabel?: unknown;
  configuration?: unknown;
  initials?: unknown;
}>;

export const avatarStoryConfigurations = Object.freeze(
  avatarFixtures.map(({ configuration }) => (
    `${configuration.size}/${configuration.presence}`
  )),
);

const meta = {
  title: 'Identity/Avatar',
  excludeStories: /(?:^normalize|Configurations$)/u,
  argTypes: {
    configuration: { control: 'select', options: avatarStoryConfigurations },
  },
  parameters: { controls: { include: ['configuration'] } },
} satisfies Meta<AvatarStoryArgs>;

export default meta;
type Story = StoryObj<AvatarStoryArgs>;

export const normalizeAvatarStoryArgs = (args: AvatarStoryArgs): AvatarProps => {
  const accessibilityLabel = typeof args.accessibilityLabel === 'string'
    && args.accessibilityLabel.trim().length > 0
    ? args.accessibilityLabel
    : 'Alex Morgan, online';
  const initials = typeof args.initials === 'string' && args.initials.trim().length > 0
    ? args.initials.slice(0, 3)
    : 'AM';
  switch (args.configuration) {
    case '32/online': return { accessibilityLabel, initials, presence: 'online', size: 32 };
    case '40/online': return { accessibilityLabel, initials, presence: 'online', size: 40 };
    case '48/away': return { accessibilityLabel, initials, presence: 'away', size: 48 };
    case '48/offline': return { accessibilityLabel, initials, presence: 'offline', size: 48 };
    case '56/online': return { accessibilityLabel, initials, presence: 'online', size: 56 };
    default: throw new Error(`Unsupported Avatar story configuration: ${String(args.configuration)}.`);
  }
};

const fixtureProps = (fixture: (typeof avatarFixtures)[number]): AvatarProps => {
  const { presence, size } = fixture.configuration;
  return normalizeAvatarStoryArgs({
    accessibilityLabel: `Alex Morgan, ${presence}`,
    configuration: `${size}/${presence}`,
    initials: 'AM',
  });
};

export const Canonical: Story = {
  args: {
    accessibilityLabel: 'Alex Morgan, online',
    configuration: '40/online',
    initials: 'AM',
  },
  render: (args) => (
    <Stack gap="space8">
      <Avatar {...normalizeAvatarStoryArgs(args)} />
      <Text color="textSecondary" variant="caption">
        {'Canonical configuration'}
      </Text>
    </Stack>
  ),
};

export const Variants: Story = {
  args: Canonical.args,
  render: () => (
    <Stack gap="space16">
      {avatarFixtures.map((fixture) => (
        <Fragment key={fixture.label}>
          <Avatar {...fixtureProps(fixture)} />
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
      <Avatar accessibilityLabel="Alex Morgan, online" initials="AM" presence="online" size={56} />
      <Avatar accessibilityLabel="Alex Morgan, away" initials="AM" presence="away" size={48} />
      <Avatar accessibilityLabel="Alex Morgan, offline" initials="AM" presence="offline" size={48} />
      <Avatar accessibilityLabel="Local photo fixture, online" presence="online" size={40} source={storyPhoto} />
      <Text color="textSecondary" variant="caption">
        The photo is a deterministic local story fixture.
      </Text>
    </Stack>
  ),
};

export const Boundaries: Story = {
  args: Canonical.args,
  render: () => (
    <Stack gap="space8" style={{ width: 200 }}>
      <Avatar
        accessibilityLabel="Łucía Nguyễn from 東京, online"
        initials="ŁN"
        presence="online"
        size={56}
      />
      <Text color="textSecondary" maxFontSizeMultiplier={2} variant="caption">
        Full accessible identity is retained. Native 200% font-scale and composite review remain Phase 5 backstops.
      </Text>
    </Stack>
  ),
};

export const Interactive: Story = {
  args: Canonical.args,
  parameters: {
    applicability: 'Avatar is presentational and owns no component interaction; selection belongs to Avatar Picker.',
  },
  render: () => (
    <Stack gap="space8">
      <Avatar decorative initials="AM" presence="online" size={40} />
      <Text color="textSecondary" variant="caption">
        Decorative specimen for use inside an already-labelled composite.
      </Text>
    </Stack>
  ),
};
