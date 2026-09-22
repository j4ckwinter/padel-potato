import type { Meta, StoryObj } from '@storybook/react-native';
import { Fragment, useState } from 'react';

import { Stack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { phase4Families } from '../../stories/componentFixtures';
import { NotificationRow, type NotificationRowProps } from './NotificationRow';

const records = phase4Families[7].records;
const content = {
  message: 'Your activity has a new update',
  timestamp: '2m',
  title: 'Game update',
} as const;

const sourceLabel = (fixtureId: string) => `Fixture ${fixtureId}`;

type StoryArgs = Readonly<{
  configuration?: unknown;
  message?: unknown;
  onPress?: unknown;
  timestamp?: unknown;
  title?: unknown;
}>;

export const notificationRowStoryConfigurations = Object.freeze(
  records.map(({ normalizedTuple }) => (
    `${normalizedTuple.type}/${normalizedTuple.state}`
  )),
);

const meta = {
  title: 'Content/Notification Row',
  excludeStories: /(?:^normalize|Configurations$)/u,
  argTypes: {
    configuration: { control: 'select', options: notificationRowStoryConfigurations },
    onPress: { action: 'notification pressed' },
  },
  parameters: { controls: { include: ['configuration', 'onPress'] } },
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<StoryArgs>;

export function normalizeNotificationRowStoryArgs(args: StoryArgs): NotificationRowProps {
  if (!notificationRowStoryConfigurations.includes(
    args.configuration as (typeof notificationRowStoryConfigurations)[number],
  )) {
    throw new Error(`Unsupported Notification Row story configuration: ${String(args.configuration)}.`);
  }
  const [type, state] = (args.configuration as (typeof notificationRowStoryConfigurations)[number]).split('/') as [
    NotificationRowProps['type'],
    'read' | 'unread',
  ];
  const onPress = typeof args.onPress === 'function' ? args.onPress as () => void : () => undefined;
  const nextContent = {
    message: typeof args.message === 'string' && args.message.trim() ? args.message : content.message,
    onPress,
    timestamp: typeof args.timestamp === 'string' && args.timestamp.trim() ? args.timestamp : content.timestamp,
    title: typeof args.title === 'string' && args.title.trim() ? args.title : `${type[0].toUpperCase()}${type.slice(1)} update`,
  };
  return { ...nextContent, read: state === 'read', type } as NotificationRowProps;
}

function recordProps(record: (typeof records)[number]): NotificationRowProps {
  const { state, type } = record.normalizedTuple;
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
      <Text color="textSecondary" variant="caption">{sourceLabel(records[5].id)}</Text>
    </Stack>
  ),
};

export const Variants: Story = {
  args: Canonical.args,
  render: () => (
    <Stack gap="space16">
      {records.map((record) => (
        <Fragment key={record.id}>
          <NotificationRow {...recordProps(record)} />
          <Text color="textSecondary" variant="caption">
            {`${Object.values(record.originalTuple).join(' / ')} · ${record.id}`}
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
      <NotificationRow {...recordProps(records[5])} />
      <NotificationRow {...recordProps(records[1])} />
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
        Full message semantics remain available. Native 200% font-scale review remains a Phase 5 backstop.
      </Text>
    </Stack>
  ),
};

function InteractiveHarness({ onPress }: Readonly<{ onPress?: unknown }>) {
  const [read, setRead] = useState(false);
  const callback = typeof onPress === 'function' ? onPress as () => void : undefined;
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
