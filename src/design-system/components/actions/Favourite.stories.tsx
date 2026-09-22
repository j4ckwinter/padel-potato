import type { Meta, StoryObj } from '@storybook/react-native';
import { Fragment, useState } from 'react';

import { Inline } from '../../primitives/Inline';
import { Stack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { favouriteFixtures } from '../../stories/fixtures';
import { Favourite, type FavouriteProps } from './Favourite';


const meta = {
  title: 'Actions/Favourite',
  component: Favourite,
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    onCheckedChange: { action: 'checked changed' },
  },
} satisfies Meta<typeof Favourite>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Canonical: Story = {
  args: {
    accessibilityLabel: 'Alex favourite',
    checked: false,
    onCheckedChange: () => undefined,
  },
  render: (args) => (
    <Stack gap="space8">
      <Favourite {...args} />
      <Text color="textSecondary" variant="caption">
        {'Canonical configuration'}
      </Text>
    </Stack>
  ),
};

export const Variants: Story = {
  args: {
    accessibilityLabel: 'Alex favourite',
    checked: false,
    onCheckedChange: () => undefined,
  },
  render: () => (
    <Stack gap="space12">
      {favouriteFixtures.map((fixture) => (
        <Fragment key={fixture.label}>
          <Favourite
            accessibilityLabel="Alex favourite"
            checked={fixture.configuration.checked}
            onCheckedChange={() => undefined}
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
  args: {
    accessibilityLabel: 'Alex favourite',
    checked: false,
    onCheckedChange: () => undefined,
  },
  render: () => (
    <Inline gap="space8">
      <Favourite accessibilityLabel="Alex favourite" checked={false} onCheckedChange={() => undefined} />
      <Favourite accessibilityLabel="Alex favourite" checked onCheckedChange={() => undefined} />
      <Favourite accessibilityLabel="Alex favourite" checked={false} disabled onCheckedChange={() => undefined} />
    </Inline>
  ),
};

export const Boundaries: Story = {
  args: {
    accessibilityLabel: 'Alex favourite',
    checked: false,
    onCheckedChange: () => undefined,
  },
  render: () => (
    <Stack gap="space8">
      <Inline gap="space4">
        <Favourite
          accessibilityLabel="Add Alexandra Montgomery-Smythe to this tournament's favourites"
          checked={false}
          onCheckedChange={() => undefined}
        />
        <Favourite
          accessibilityLabel="Add the adjacent player to favourites"
          checked={false}
          onCheckedChange={() => undefined}
        />
      </Inline>
      <Text color="textSecondary" variant="caption">
        Full names remain available at 200%; adjacent controls each retain a 44-point target. Native assistive review remains Phase 5.
      </Text>
    </Stack>
  ),
};

function InteractiveHarness({ onCheckedChange }: Pick<FavouriteProps, 'onCheckedChange'>) {
  const [checked, setChecked] = useState(false);
  return (
    <Stack gap="space8">
      <Favourite
        accessibilityLabel="Alex favourite"
        checked={checked}
        onCheckedChange={(next) => {
          setChecked(next);
          onCheckedChange(next);
        }}
      />
      <Text variant="body">{checked ? 'Selected' : 'Default'}</Text>
    </Stack>
  );
}

export const Interactive: Story = {
  args: {
    accessibilityLabel: 'Alex favourite',
    checked: false,
    onCheckedChange: () => undefined,
  },
  render: (args) => <InteractiveHarness onCheckedChange={args.onCheckedChange} />,
};
