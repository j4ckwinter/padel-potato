import type { Meta, StoryObj } from '@storybook/react-native';
import { Fragment, useState } from 'react';

import { Stack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { bottomNavigationFixtures } from '../../stories/fixtures';
import {
  BottomNavigation,
  bottomNavigationDestinations,
  type BottomNavigationDestination,
} from './BottomNavigation';

const fixtures = bottomNavigationFixtures;
const noop = () => undefined;

const meta = {
  title: 'Navigation/Bottom Navigation',
  excludeStories: /^Interactive.*Harness$/u,
  component: BottomNavigation,
  argTypes: {
    activeDestination: {
      control: 'select',
      options: bottomNavigationDestinations.map(
        ({ destination }) => destination,
      ),
    },
    onDestinationPress: { action: 'destination pressed' },
  },
} satisfies Meta<typeof BottomNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Canonical: Story = {
  args: { activeDestination: 'home', onDestinationPress: noop },
  render: (args) => (
    <Stack gap="space8">
      <BottomNavigation {...args} />
      <Text color="textSecondary" variant="caption">
        {'Canonical configuration'}
      </Text>
    </Stack>
  ),
};

export const Variants: Story = {
  args: Canonical.args,
  render: () => (
    <Stack gap="space12">
      {fixtures.map((fixture) => (
        <Fragment key={fixture.label}>
          <BottomNavigation
            activeDestination={
              fixture.configuration.active as BottomNavigationDestination
            }
            onDestinationPress={noop}
          />
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
    <Stack gap="space8">
      <BottomNavigation activeDestination="home" onDestinationPress={noop} />
      <BottomNavigation activeDestination="create" onDestinationPress={noop} />
      <Text color="textSecondary" variant="caption">
        Selected state is controlled; Create retains its component-defined
        accent action treatment.
      </Text>
    </Stack>
  ),
};

export const Boundaries: Story = {
  args: Canonical.args,
  render: () => (
    <Stack gap="space8">
      <BottomNavigation activeDestination="profile" onDestinationPress={noop} />
      <Text color="textSecondary" variant="caption">
        Exact 390-point native width keeps five adjacent targets separate. Fixed
        labels remain complete at 200% font scale; native clipping and overlap
        proof requires native Storybook review.
      </Text>
    </Stack>
  ),
};

export function InteractiveBottomNavigationHarness() {
  const [activeDestination, setActiveDestination] =
    useState<BottomNavigationDestination>('home');
  return (
    <BottomNavigation
      activeDestination={activeDestination}
      onDestinationPress={setActiveDestination}
    />
  );
}

export const Interactive: Story = {
  args: Canonical.args,
  render: () => <InteractiveBottomNavigationHarness />,
};
