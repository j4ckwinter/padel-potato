import type { Meta, StoryObj } from '@storybook/react-native';
import { Fragment, useState } from 'react';

import { Stack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { phase3Families, phase3SourceIdentity } from '../sourceRegistry';
import {
  BottomNavigation,
  bottomNavigationDestinations,
  type BottomNavigationDestination,
} from './BottomNavigation';

const family = phase3Families[9];
const records = family.records;
const noop = () => undefined;
const sourceLabel = (recordId: string) =>
  `Penpot ${phase3SourceIdentity.fileId} / ${phase3SourceIdentity.pageId} / revision ${phase3SourceIdentity.revision} / set ${family.sourceId} / record ${recordId}`;

const meta = {
  title: 'Navigation/Bottom Navigation',
  excludeStories: /^Interactive.*Harness$/u,
  component: BottomNavigation,
  argTypes: {
    activeDestination: {
      control: 'select',
      options: bottomNavigationDestinations.map(({ destination }) => destination),
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
        {sourceLabel('482a7222-5a3b-8086-8008-a608c35c3552')}
      </Text>
    </Stack>
  ),
};

export const Variants: Story = {
  args: Canonical.args,
  render: () => (
    <Stack gap="space12">
      {records.map((record) => (
        <Fragment key={record.id}>
          <BottomNavigation
            activeDestination={record.normalizedTuple.active as BottomNavigationDestination}
            onDestinationPress={noop}
          />
          <Text color="textSecondary" variant="caption">
            {`${record.originalTuple.Active} · ${record.id}`}
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
        Selected state is controlled; Create retains its source-defined accent action treatment.
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
        Exact 390-point native width keeps five adjacent targets separate. Fixed labels remain complete at 200% font scale; native clipping and overlap proof remains Phase 5.
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
