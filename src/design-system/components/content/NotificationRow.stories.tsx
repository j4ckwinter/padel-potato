import type { Meta, StoryObj } from '@storybook/react-native';
import { Fragment, useState } from 'react';

import { Stack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { notificationRowFixtures } from '../../stories/fixtures';
import { NotificationRow, type NotificationRowProps } from './NotificationRow';

const fixtures = notificationRowFixtures;
const content = {
  message: 'Your activity has a new update',
  timestamp: '2m',
  title: 'Game update',
} as const;

type StoryArgs = Readonly<{
  configuration?: unknown;
  message?: unknown;
  onPress?: unknown;
  timestamp?: unknown;
  title?: unknown;
}>;

export const notificationRowStoryConfigurations = Object.freeze(
  fixtures.map(
    ({ configuration }) => `${configuration.type}/${configuration.state}`,
  ),
);

const meta = {
  title: 'Content/Notification Row',
  excludeStories: /(?:^normalize|Configurations$)/u,
  argTypes: {
    configuration: {
      control: 'select',
      options: notificationRowStoryConfigurations,
    },
    onPress: { action: 'notification pressed' },
  },
  parameters: { controls: { include: ['configuration', 'onPress'] } },
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<StoryArgs>;

export function normalizeNotificationRowStoryArgs(
  args: StoryArgs,
): NotificationRowProps {
  if (
    !notificationRowStoryConfigurations.includes(
      args.configuration as (typeof notificationRowStoryConfigurations)[number],
    )
  ) {
    throw new Error(
      `Unsupported Notification Row story configuration: ${String(args.configuration)}.`,
    );
  }
  const [type, state] = (
    args.configuration as (typeof notificationRowStoryConfigurations)[number]
  ).split('/') as [NotificationRowProps['type'], 'read' | 'unread'];
  const onPress =
    typeof args.onPress === 'function'
      ? (args.onPress as () => void)
      : () => undefined;
  const nextContent = {
    message:
      typeof args.message === 'string' && args.message.trim()
        ? args.message
        : content.message,
    onPress,
    timestamp:
      typeof args.timestamp === 'string' && args.timestamp.trim()
        ? args.timestamp
        : content.timestamp,
    title:
      typeof args.title === 'string' && args.title.trim()
        ? args.title
        : `${type[0].toUpperCase()}${type.slice(1)} update`,
  };
  return {
    ...nextContent,
    read: state === 'read',
    type,
  } as NotificationRowProps;
}

function fixtureProps(
  fixture: (typeof fixtures)[number],
): NotificationRowProps {
  const { state, type } = fixture.configuration;
  return normalizeNotificationRowStoryArgs({
    configuration: `${type}/${state}`,
    ...content,
    title: `${type[0].toUpperCase()}${type.slice(1)} update`,
  });
}

export const Canonical: Story = {
  args: { ...content, configuration: 'game/unread', onPress: () => undefined },
  render: (args) => (
    <Stack gap="space8">
      <NotificationRow {...normalizeNotificationRowStoryArgs(args)} />
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
          <NotificationRow {...fixtureProps(fixture)} />
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
      <NotificationRow {...fixtureProps(fixtures[5])} />
      <NotificationRow {...fixtureProps(fixtures[1])} />
    </Stack>
  ),
};

export const Boundaries: Story = {
  args: Canonical.args,
  render: () => (
    <Stack gap="space8" style={{ width: 352 }}>
      <NotificationRow
        message="Łucía Nguyễn from 東京 has joined an exceptionally long Tuesday social padel game"
        onPress={() => undefined}
        read={false}
        timestamp="2 minutes ago"
        title="A very long social update"
        type="social"
      />
      <Text color="textSecondary" maxFontSizeMultiplier={2} variant="caption">
        Full message semantics remain available. Native 200% font-scale review
        requires native Storybook review.
      </Text>
    </Stack>
  ),
};

function InteractiveHarness({ onPress }: Readonly<{ onPress?: unknown }>) {
  const [read, setRead] = useState(false);
  const callback =
    typeof onPress === 'function' ? (onPress as () => void) : undefined;
  return (
    <Stack gap="space8">
      <NotificationRow
        {...content}
        onPress={() => {
          callback?.();
          setRead(true);
        }}
        read={read}
        type="game"
      />
      <Text variant="body">{read ? 'Read' : 'Unread'}</Text>
    </Stack>
  );
}

export const Interactive: Story = {
  args: Canonical.args,
  render: (args) => <InteractiveHarness onPress={args.onPress} />,
};
