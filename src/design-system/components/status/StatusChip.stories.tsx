import type { Meta, StoryObj } from '@storybook/react-native';
import { Fragment, useState } from 'react';

import { Stack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { statusChipFixtures } from '../../stories/fixtures';
import { StatusChip, type StatusChipProps } from './StatusChip';

const fixtures = statusChipFixtures;

type StoryArgs = Readonly<{
  configuration?: unknown;
  label?: unknown;
  onSelectedChange?: unknown;
}>;

export const statusChipStoryConfigurations = Object.freeze(
  fixtures.map(
    ({ configuration }) => `${configuration.style}/${configuration.state}`,
  ),
);

const meta = {
  title: 'Status/Status Chip',
  excludeStories: /(?:^normalize|Configurations$)/u,
  argTypes: {
    configuration: {
      control: 'select',
      options: statusChipStoryConfigurations,
    },
    onSelectedChange: {
      action: 'selected changed',
      if: { arg: 'configuration', eq: 'success/selected' },
    },
  },
  parameters: { controls: { include: ['configuration', 'onSelectedChange'] } },
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<StoryArgs>;

export function normalizeStatusChipStoryArgs(args: StoryArgs): StatusChipProps {
  const label =
    typeof args.label === 'string' && args.label.trim().length > 0
      ? args.label
      : 'Status';
  switch (args.configuration) {
    case 'neutral/default':
      return { label, style: 'neutral', variant: 'default' };
    case 'success/default':
      return { label, style: 'success', variant: 'default' };
    case 'warning/default':
      return { label, style: 'warning', variant: 'default' };
    case 'info/default':
      return { label, style: 'info', variant: 'default' };
    case 'error/default':
      return { label, style: 'error', variant: 'default' };
    case 'neutral/disabled':
      return { label, style: 'neutral', variant: 'disabled' };
    case 'success/selected':
      return {
        label,
        onSelectedChange:
          typeof args.onSelectedChange === 'function'
            ? (args.onSelectedChange as (selected: boolean) => void)
            : () => undefined,
        selected: true,
        style: 'success',
        variant: 'selectable',
      };
    default:
      throw new Error(
        `Unsupported Status Chip story configuration: ${String(args.configuration)}.`,
      );
  }
}

function fixtureProps(fixture: (typeof fixtures)[number]): StatusChipProps {
  const style = fixture.configuration.style;
  const state = fixture.configuration.state;
  if (state === 'selected') {
    return {
      label: 'Confirmed',
      onSelectedChange: () => undefined,
      selected: true,
      style: 'success',
      variant: 'selectable',
    };
  }
  if (state === 'disabled')
    return { label: 'Unavailable', style: 'neutral', variant: 'disabled' };
  return {
    label: `${style[0].toUpperCase()}${style.slice(1)}`,
    style,
    variant: 'default',
  };
}

export const Canonical: Story = {
  args: { configuration: 'neutral/default', label: 'Status' },
  render: (args) => (
    <Stack gap="space8">
      <StatusChip {...normalizeStatusChipStoryArgs(args)} />
      <Text color="textSecondary" variant="caption">
        {fixtures[6].label}
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
          <StatusChip {...fixtureProps(fixture)} />
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
      <StatusChip
        label="Confirmed"
        onSelectedChange={() => undefined}
        selected
        style="success"
        variant="selectable"
      />
      <StatusChip label="Unavailable" style="neutral" variant="disabled" />
      <Text color="textSecondary" variant="caption">
        Hold the selectable branch for native pressed treatment; keyboard focus
        drives the native focus ring.
      </Text>
    </Stack>
  ),
};

export const Boundaries: Story = {
  args: Canonical.args,
  render: () => (
    <Stack gap="space8" style={{ width: 180 }}>
      <StatusChip
        label="Awaiting confirmation from Łucía"
        style="warning"
        variant="default"
      />
      <Text color="textSecondary" maxFontSizeMultiplier={2} variant="caption">
        Complete accessible status remains available while the authored chip
        stays 36 points high.
      </Text>
    </Stack>
  ),
};

function InteractiveHarness({
  onSelectedChange,
}: Readonly<{
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
    configuration: 'success/selected',
    label: 'Confirmed',
    onSelectedChange: () => undefined,
  },
  render: (args) => (
    <InteractiveHarness
      onSelectedChange={
        'onSelectedChange' in args &&
        typeof args.onSelectedChange === 'function'
          ? (args.onSelectedChange as (selected: boolean) => void)
          : undefined
      }
    />
  ),
};
