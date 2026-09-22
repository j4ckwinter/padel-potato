import type { Meta, StoryObj } from '@storybook/react-native';
import { Fragment, useState } from 'react';

import { Stack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { phase3Families, phase3SourceIdentity } from '../sourceRegistry';
import {
  SegmentedControl,
  type SegmentOptions,
  type SegmentedControlProps,
} from './SegmentedControl';

const family = phase3Families[10];
const records = family.records;
const noop = () => undefined;
const sourceLabel = (recordId: string) =>
  `Penpot ${phase3SourceIdentity.fileId} / ${phase3SourceIdentity.pageId} / revision ${phase3SourceIdentity.revision} / set ${family.sourceId} / record ${recordId}`;
const optionsByCount = Object.freeze({
  2: ['Upcoming', 'Open'] as const,
  3: ['Upcoming', 'Open', 'Past'] as const,
  4: ['Upcoming', 'Open', 'Past', 'All'] as const,
});

const meta = {
  title: 'Navigation/Segmented Control',
  excludeStories: /(?:^normalize|^Interactive.*Harness$)/u,
  component: SegmentedControl,
  argTypes: {
    disabled: { control: 'boolean' },
    onValueChange: { action: 'value changed' },
    options: { control: false },
    value: { control: 'select', options: optionsByCount[2] },
  },
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

type SegmentedControlStoryArgs = Readonly<Record<string, unknown>>;

const validStoryOptions = (options: unknown): options is SegmentOptions =>
  Array.isArray(options)
  && [2, 3, 4].includes(options.length)
  && options.every((option) => typeof option === 'string' && option.trim().length > 0)
  && new Set(options).size === options.length;

export const normalizeSegmentedControlStoryArgs = (
  args: SegmentedControlStoryArgs,
): SegmentedControlProps => {
  const options = validStoryOptions(args.options) ? args.options : optionsByCount[2];
  return {
    disabled: args.disabled === true || undefined,
    onValueChange: typeof args.onValueChange === 'function'
      ? args.onValueChange as (value: string) => void
      : noop,
    options,
    value: typeof args.value === 'string' && options.includes(args.value)
      ? args.value
      : options[0],
  };
};

export const Canonical: Story = {
  args: {
    onValueChange: noop,
    options: optionsByCount[2],
    value: 'Upcoming',
  },
  render: (args) => (
    <Stack gap="space8">
      <SegmentedControl {...normalizeSegmentedControlStoryArgs(args)} />
      <Text color="textSecondary" variant="caption">
        {sourceLabel('482a7222-5a3b-8086-8008-a60ede15a862')}
      </Text>
    </Stack>
  ),
};

export const Variants: Story = {
  args: Canonical.args,
  render: () => (
    <Stack gap="space12">
      {records.map((record) => {
        const count = record.normalizedTuple.options as 2 | 3 | 4;
        const options = optionsByCount[count];
        return (
          <Fragment key={record.id}>
            <SegmentedControl
              disabled={record.normalizedTuple.state === 'disabled'}
              onValueChange={noop}
              options={options}
              value="Upcoming"
            />
            <Text color="textSecondary" variant="caption">
              {`${Object.values(record.originalTuple).join(' / ')} · ${record.id}`}
            </Text>
          </Fragment>
        );
      })}
    </Stack>
  ),
};

export const States: Story = {
  args: Canonical.args,
  render: () => (
    <Stack gap="space8">
      <SegmentedControl onValueChange={noop} options={optionsByCount[3]} value="Past" />
      <SegmentedControl disabled onValueChange={noop} options={optionsByCount[3]} value="Upcoming" />
    </Stack>
  ),
};

export const Boundaries: Story = {
  args: Canonical.args,
  render: () => (
    <Stack gap="space8">
      <SegmentedControl
        onValueChange={noop}
        options={[
          'Tournament registration',
          'Open games nearby',
          'Past championship matches',
          'All',
        ]}
        value="Open games nearby"
      />
      <Text color="textSecondary" variant="caption">
        long labels share the exact 350-point native width through one deterministic equal-allocation row. Adjacent 48-point targets do not overlap; 200% text and native clipping proof remains Phase 5.
      </Text>
    </Stack>
  ),
};

export function InteractiveSegmentedControlHarness() {
  const options = optionsByCount[3] satisfies SegmentOptions;
  const [value, setValue] = useState<string>(options[0]);
  return (
    <SegmentedControl onValueChange={setValue} options={options} value={value} />
  );
}

export const Interactive: Story = {
  args: Canonical.args,
  render: () => <InteractiveSegmentedControlHarness />,
};
