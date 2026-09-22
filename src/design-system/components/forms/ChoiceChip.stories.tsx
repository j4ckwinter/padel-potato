import type { Meta, StoryObj } from '@storybook/react-native';
import { Fragment, useState } from 'react';

import { Inline } from '../../primitives/Inline';
import { Stack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { phase3Families } from '../../stories/componentFixtures';
import {
  ChoiceChip,
  choiceChipTypes,
  type ChoiceChipProps,
  type ChoiceChipType,
} from './ChoiceChip';

const choiceChipFamily = phase3Families[4];
const choiceChipRecords = choiceChipFamily.records;
const noop = () => undefined;
const sourceLabel = (fixtureId: string) => `Fixture ${fixtureId}`;

const meta = {
  title: 'Forms/Choice Chip',
  excludeStories: /(?:^normalize|^Interactive.*Harness$)/u,
  component: ChoiceChip,
  argTypes: {
    disabled: { control: 'boolean' },
    icon: { control: false, table: { disable: true } },
    onSelectedChange: { action: 'selection changed' },
    selected: { control: 'boolean' },
    type: { control: 'select', options: choiceChipTypes },
  },
} satisfies Meta<typeof ChoiceChip>;

export default meta;
type Story = StoryObj<typeof meta>;

type ChoiceChipStoryArgs = Readonly<{
  disabled?: unknown;
  label?: unknown;
  onSelectedChange?: unknown;
  selected?: unknown;
  type?: unknown;
}>;

export const normalizeChoiceChipStoryArgs = (args: ChoiceChipStoryArgs): ChoiceChipProps => {
  const type = choiceChipTypes.includes(args.type as ChoiceChipType)
    ? args.type as ChoiceChipType
    : 'option';
  const disabled = args.disabled === true;
  const selected = !disabled && args.selected === true;
  return {
    disabled: disabled || undefined,
    icon: selected ? 'leading' : type === 'option' ? 'none' : 'trailing',
    label: typeof args.label === 'string' && args.label.trim().length > 0
      ? args.label
      : type === 'option' ? 'Social' : 'Intermediate',
    onSelectedChange: typeof args.onSelectedChange === 'function'
      ? args.onSelectedChange as ChoiceChipProps['onSelectedChange']
      : noop,
    selected,
    type,
  } as ChoiceChipProps;
};

export const Canonical: Story = {
  args: {
    icon: 'none',
    label: 'Social',
    onSelectedChange: noop,
    selected: false,
    type: 'option',
  },
  render: (args) => (
    <Stack gap="space8">
      <ChoiceChip {...normalizeChoiceChipStoryArgs(args)} />
      <Text color="textSecondary" variant="caption">
        {sourceLabel('482a7222-5a3b-8086-8008-a61b0dda64ca')}
      </Text>
    </Stack>
  ),
};

const recordProps = (record: (typeof choiceChipRecords)[number]): ChoiceChipProps => {
  const { icon, state, type } = record.normalizedTuple;
  return {
    disabled: state === 'disabled',
    icon,
    label: type === 'option' ? 'Social' : 'Intermediate',
    onSelectedChange: noop,
    selected: state === 'selected',
    type,
  } as ChoiceChipProps;
};

export const Variants: Story = {
  args: Canonical.args,
  render: () => (
    <Stack gap="space12">
      {choiceChipRecords.map((record) => (
        <Fragment key={record.id}>
          <ChoiceChip {...recordProps(record)} />
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
    <Stack gap="space12">
      <ChoiceChip icon="none" label="Social" onSelectedChange={noop} selected={false} type="option" />
      <ChoiceChip icon="leading" label="Social" onSelectedChange={noop} selected type="option" />
      <ChoiceChip disabled icon="trailing" label="Intermediate" onSelectedChange={noop} selected={false} type="filter" />
      <Text color="textSecondary" variant="caption">
        Keyboard/native focus drives the focused record; it is never a persistent prop.
      </Text>
    </Stack>
  ),
};

export const Boundaries: Story = {
  args: Canonical.args,
  render: () => (
    <Stack gap="space8">
      <Inline gap="space4">
        <ChoiceChip icon="none" label="A deliberately long label" onSelectedChange={noop} selected={false} type="option" />
        <ChoiceChip icon="trailing" label="Adjacent filter" onSelectedChange={noop} selected={false} type="filter" />
      </Inline>
      <Text color="textSecondary" variant="caption">
        The full accessible long label remains available at 200%; four points of parent spacing preserves target clearance between expanded 40-point visuals. Native measurement remains Phase 5.
      </Text>
    </Stack>
  ),
};

export function InteractiveChoiceChipHarness() {
  const [type, setType] = useState<ChoiceChipType>('option');
  const [selected, setSelected] = useState(false);
  const icon = selected ? 'leading' : type === 'option' ? 'none' : 'trailing';
  const selectionProps = {
    icon,
    label: type === 'option' ? 'Social' : 'Intermediate',
    onSelectedChange: setSelected,
    selected,
    type,
  } as ChoiceChipProps;
  const switchProps = {
    icon: type === 'option' ? 'trailing' : 'none',
    label: type === 'option' ? 'Switch to filter' : 'Switch to option',
    onSelectedChange: () => {
      setType(type === 'option' ? 'filter' : 'option');
      setSelected(false);
    },
    selected: false,
    type: type === 'option' ? 'filter' : 'option',
  } as ChoiceChipProps;
  return (
    <Stack gap="space12">
      <ChoiceChip {...selectionProps} />
      <ChoiceChip {...switchProps} />
    </Stack>
  );
}

export const Interactive: Story = {
  args: Canonical.args,
  render: () => <InteractiveChoiceChipHarness />,
};
