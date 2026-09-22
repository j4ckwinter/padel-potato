import type { Meta, StoryObj } from '@storybook/react-native';
import { Fragment, useState } from 'react';

import { iconNames } from '../../assets/iconDefinitions';
import { Inline } from '../../primitives/Inline';
import { Stack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { iconButtonFixtures } from '../../stories/fixtures';
import {
  IconButton,
  iconButtonSizes,
  type IconButtonProps,
} from './IconButton';

const meta = {
  title: 'Actions/Icon Button',
  component: IconButton,
  argTypes: {
    icon: { control: 'select', options: iconNames },
    size: { control: 'select', options: iconButtonSizes },
    disabled: { control: 'boolean' },
    onPress: { action: 'pressed' },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Canonical: Story = {
  args: {
    accessibilityLabel: 'Open notifications',
    icon: 'notification',
    size: 40,
  },
  render: (args) => (
    <Stack gap="space8">
      <IconButton {...args} />
      <Text color="textSecondary" variant="caption">
        {'Canonical configuration'}
      </Text>
    </Stack>
  ),
};

const fixtureProps = (
  fixture: (typeof iconButtonFixtures)[number],
): IconButtonProps => ({
  accessibilityLabel: `Open notifications — ${fixture.label}`,
  disabled: fixture.configuration.state === 'disabled',
  icon: 'notification',
  size: fixture.configuration.size as 40 | 44,
});

export const Variants: Story = {
  args: { accessibilityLabel: 'Open notifications', icon: 'notification' },
  render: () => (
    <Stack gap="space12">
      {iconButtonFixtures.map((fixture) => (
        <Fragment key={fixture.label}>
          <IconButton {...fixtureProps(fixture)} />
          <Text color="textSecondary" variant="caption">
            {fixture.label}
          </Text>
        </Fragment>
      ))}
    </Stack>
  ),
};

export const States: Story = {
  args: { accessibilityLabel: 'Open notifications', icon: 'notification' },
  render: () => (
    <Stack gap="space8">
      <IconButton accessibilityLabel="Open notifications" icon="notification" />
      <IconButton
        accessibilityLabel="Notifications unavailable"
        disabled
        icon="notification"
      />
      <Text color="textSecondary" variant="caption">
        Hold the enabled control for its native pressed treatment; keyboard
        focus drives the native focus ring.
      </Text>
    </Stack>
  ),
};

export const Boundaries: Story = {
  args: { accessibilityLabel: 'Open notifications', icon: 'notification' },
  render: () => (
    <Stack gap="space8">
      <Inline gap="space8">
        <IconButton
          accessibilityLabel="Open every unread game invitation and notification"
          icon="notification"
          size={40}
        />
        <IconButton
          accessibilityLabel="Open profile notifications"
          icon="notification"
          size={40}
        />
      </Inline>
      <Text color="textSecondary" variant="caption">
        Two-point clearance preserves each 44-point target. Full names remain
        available at 200%; native clipping review remains Phase 5.
      </Text>
    </Stack>
  ),
};

function InteractiveHarness({ onPress }: Pick<IconButtonProps, 'onPress'>) {
  const [presses, setPresses] = useState(0);
  return (
    <Stack gap="space8">
      <IconButton
        accessibilityLabel="Open notifications"
        icon="notification"
        onPress={(event) => {
          setPresses((count) => count + 1);
          onPress?.(event);
        }}
      />
      <Text variant="body">{`Activations: ${presses}`}</Text>
    </Stack>
  );
}

export const Interactive: Story = {
  args: { accessibilityLabel: 'Open notifications', icon: 'notification' },
  render: (args) => <InteractiveHarness onPress={args.onPress} />,
};
