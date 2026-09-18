import type { Meta, StoryObj } from '@storybook/react-native';
import { Fragment, useState } from 'react';

import { Inline } from '../../primitives/Inline';
import { Stack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { phase3Families, phase3SourceIdentity } from '../sourceRegistry';
import { Favourite, type FavouriteProps } from './Favourite';

const favouriteFamily = phase3Families[2];
const favouriteRecords = favouriteFamily.records;
const sourceLabel = (recordId: string) =>
  `Penpot ${phase3SourceIdentity.fileId} / ${phase3SourceIdentity.pageId} / revision ${phase3SourceIdentity.revision} / set ${favouriteFamily.sourceId} / record ${recordId}`;

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
    accessibilityLabel: 'Add Alex to favourites',
    checked: false,
    onCheckedChange: () => undefined,
  },
  render: (args) => (
    <Stack gap="space8">
      <Favourite {...args} />
      <Text color="textSecondary" variant="caption">
        {sourceLabel('ab02a31f-1852-80be-8008-a6fb4b6d6c28')}
      </Text>
    </Stack>
  ),
};

export const Variants: Story = {
  args: {
    accessibilityLabel: 'Add Alex to favourites',
    checked: false,
    onCheckedChange: () => undefined,
  },
  render: () => (
    <Stack gap="space12">
      {favouriteRecords.map((record) => (
        <Fragment key={record.id}>
          <Favourite
            accessibilityLabel={`${record.normalizedTuple.checked ? 'Remove Alex from' : 'Add Alex to'} favourites`}
            checked={record.normalizedTuple.checked}
            onCheckedChange={() => undefined}
          />
          <Text color="textSecondary" variant="caption">
            {`${Object.values(record.originalTuple).join(' / ')} · ${record.id}`}
          </Text>
        </Fragment>
      ))}
    </Stack>
  ),
};

export const States: Story = {
  args: {
    accessibilityLabel: 'Add Alex to favourites',
    checked: false,
    onCheckedChange: () => undefined,
  },
  render: () => (
    <Inline gap="space8">
      <Favourite accessibilityLabel="Add Alex to favourites" checked={false} onCheckedChange={() => undefined} />
      <Favourite accessibilityLabel="Remove Alex from favourites" checked onCheckedChange={() => undefined} />
      <Favourite accessibilityLabel="Favourite unavailable" checked={false} disabled onCheckedChange={() => undefined} />
    </Inline>
  ),
};

export const Boundaries: Story = {
  args: {
    accessibilityLabel: 'Add Alex to favourites',
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
        accessibilityLabel="Add Alex to favourites"
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
    accessibilityLabel: 'Add Alex to favourites',
    checked: false,
    onCheckedChange: () => undefined,
  },
  render: (args) => <InteractiveHarness onCheckedChange={args.onCheckedChange} />,
};
