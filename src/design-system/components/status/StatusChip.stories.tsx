import type { Meta, StoryObj } from '@storybook/react-native';
import { Fragment, useState } from 'react';

import { Stack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { phase4Families, phase4SourceIdentity } from '../phase4SourceRegistry';
import {
  StatusChip,
  type StatusChipProps,
  type StatusChipStyle,
} from './StatusChip';

const records = phase4Families[3].records;
const statusStyles = Object.freeze(['neutral', 'success', 'warning', 'info', 'error'] as const);
const sourceLabel = (recordId: string) =>
  `Penpot ${phase4SourceIdentity.fileId} / ${phase4SourceIdentity.pageId} / revision ${phase4SourceIdentity.revision} / set 482a7222-5a3b-8086-8008-a60fcef69ad7 / record ${recordId}`;

const meta = {
  title: 'Status/Status Chip',
  component: StatusChip,
  argTypes: {
    style: { control: 'select', options: statusStyles },
    variant: { control: 'select', options: ['default', 'selectable', 'disabled'] },
    selected: { control: 'boolean' },
    onSelectedChange: { action: 'selected changed' },
  },
} satisfies Meta<typeof StatusChip>;

export default meta;
type Story = StoryObj<typeof meta>;

type StoryArgs = Readonly<{
  label?: unknown;
  onSelectedChange?: unknown;
  selected?: unknown;
  style?: unknown;
  variant?: unknown;
}>;

export function normalizeStatusChipStoryArgs(args: StoryArgs): StatusChipProps {
  const label = typeof args.label === 'string' && args.label.trim().length > 0
    ? args.label
    : 'Status';
  if (args.variant === 'selectable') {
    return {
      label,
      onSelectedChange: typeof args.onSelectedChange === 'function'
        ? args.onSelectedChange as (selected: boolean) => void
        : () => undefined,
      selected: args.selected === true,
      style: 'success',
      variant: 'selectable',
    };
  }
  if (args.variant === 'disabled') {
    return { label, style: 'neutral', variant: 'disabled' };
  }
  const style = statusStyles.includes(args.style as StatusChipStyle)
    ? args.style as StatusChipStyle
    : 'neutral';
  return { label, style, variant: 'default' };
}

function recordProps(record: (typeof records)[number]): StatusChipProps {
  const style = record.normalizedTuple.style;
  const state = record.normalizedTuple.state;
  if (state === 'selected') {
    return {
      label: 'Confirmed',
      onSelectedChange: () => undefined,
      selected: true,
      style: 'success',
      variant: 'selectable',
    };
  }
  if (state === 'disabled') return { label: 'Unavailable', style: 'neutral', variant: 'disabled' };
  return { label: `${style[0].toUpperCase()}${style.slice(1)}`, style, variant: 'default' };
}

export const Canonical: Story = {
  args: { label: 'Status', style: 'neutral', variant: 'default' },
  render: (args) => (
    <Stack gap="space8">
      <StatusChip {...normalizeStatusChipStoryArgs(args)} />
      <Text color="textSecondary" variant="caption">{sourceLabel(records[6].id)}</Text>
    </Stack>
  ),
};

export const Variants: Story = {
  args: Canonical.args,
  render: () => (
    <Stack gap="space12">
      {records.map((record) => (
        <Fragment key={record.id}>
          <StatusChip {...recordProps(record)} />
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
      <StatusChip label="Confirmed" onSelectedChange={() => undefined} selected style="success" variant="selectable" />
      <StatusChip label="Unavailable" style="neutral" variant="disabled" />
      <Text color="textSecondary" variant="caption">
        Hold the selectable branch for native pressed treatment; keyboard focus drives the native focus ring.
      </Text>
    </Stack>
  ),
};

export const Boundaries: Story = {
  args: Canonical.args,
  render: () => (
    <Stack gap="space8" style={{ width: 180 }}>
      <StatusChip label="Awaiting confirmation from Łucía" style="warning" variant="default" />
      <Text color="textSecondary" maxFontSizeMultiplier={2} variant="caption">
        Complete accessible status remains available while the authored chip stays 36 points high.
      </Text>
    </Stack>
  ),
};

function InteractiveHarness({ onSelectedChange }: Readonly<{
  onSelectedChange?: (selected: boolean) => void;
}>) {
  const [selected, setSelected] = useState(true);
  return (
    <StatusChip
      label="Confirmed"
      onSelectedChange={(next) => {
        setSelected(next);
        onSelectedChange?.(next);
      }}
      selected={selected}
      style="success"
      variant="selectable"
    />
  );
}

export const Interactive: Story = {
  args: {
    label: 'Confirmed',
    onSelectedChange: () => undefined,
    selected: true,
    style: 'success',
    variant: 'selectable',
  },
  render: (args) => (
    <InteractiveHarness
      onSelectedChange={'onSelectedChange' in args && typeof args.onSelectedChange === 'function'
        ? args.onSelectedChange
        : undefined}
    />
  ),
};
