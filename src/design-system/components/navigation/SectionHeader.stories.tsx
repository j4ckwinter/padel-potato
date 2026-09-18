import type { Meta, StoryObj } from '@storybook/react-native';
import { Fragment, useState } from 'react';

import { Stack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { phase3Families, phase3SourceIdentity } from '../sourceRegistry';
import { SectionHeader } from './SectionHeader';

const family = phase3Families[12];
const records = family.records;
const noop = () => undefined;
const sourceLabel = (recordId: string) =>
  `Penpot ${phase3SourceIdentity.fileId} / ${phase3SourceIdentity.pageId} / revision ${phase3SourceIdentity.revision} / component ${family.sourceId} / record ${recordId}`;

const meta = {
  title: 'Navigation/Section Header',
  component: SectionHeader,
  argTypes: {
    actionLabel: { control: 'text' },
    onActionPress: { action: 'action pressed' },
    title: { control: 'text' },
  },
} satisfies Meta<typeof SectionHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Canonical: Story = {
  args: {
    actionLabel: 'See all ›',
    onActionPress: noop,
    title: 'Open games near you',
  },
  render: (args) => (
    <Stack gap="space8">
      <SectionHeader {...args} />
      <Text color="textSecondary" variant="caption">
        {sourceLabel('482a7222-5a3b-8086-8008-a608c3bde79a')}
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
          <SectionHeader actionLabel="See all ›" onActionPress={noop} title="Open games near you" />
          <Text color="textSecondary" variant="caption">
            {sourceLabel(record.id)}
          </Text>
        </Fragment>
      ))}
    </Stack>
  ),
};

export const States: Story = {
  args: Canonical.args,
  render: () => (
    <Stack gap="space12">
      <SectionHeader actionLabel="See all ›" onActionPress={noop} title="Open games near you" />
      <SectionHeader title="Your recent games" />
    </Stack>
  ),
};

export const Boundaries: Story = {
  args: Canonical.args,
  render: () => (
    <Stack gap="space8">
      <SectionHeader
        actionLabel="Review every game ›"
        onActionPress={noop}
        title="A complete long section heading for nearby tournament games"
      />
      <Text color="textSecondary" variant="caption">
        The source-faithful visual row remains 350 by 28 inside a 354 by 44 interaction-clearance wrapper. Long title and action copy preserve a separately named effective 44-point target and 200% text intent without overlap. Native wrapping, hit testing, and measurement remain Phase 5; Profile no overflow is demonstrated in App Header boundaries.
      </Text>
    </Stack>
  ),
};

export function InteractiveSectionHeaderHarness() {
  const [count, setCount] = useState(0);
  return (
    <SectionHeader
      actionLabel={`See all (${count}) ›`}
      onActionPress={() => setCount((current) => current + 1)}
      title="Open games near you"
    />
  );
}

export const Interactive: Story = {
  args: Canonical.args,
  render: () => <InteractiveSectionHeaderHarness />,
};
