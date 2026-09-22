import type { Meta, StoryObj } from '@storybook/react-native';
import { Fragment, useState } from 'react';

import { Stack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { phase4Families } from '../../stories/componentFixtures';
import { AvatarPicker, type AvatarPickerProps } from './AvatarPicker';

const storyPhoto = require('../../assets/media/mascot-profile.webp');
const records = phase4Families[2].records;
const sourceLabel = (fixtureId: string) => `Fixture ${fixtureId}`;

const meta = {
  title: 'Identity/Avatar Picker',
  excludeStories: /^normalize/u,
  component: AvatarPicker,
  argTypes: {
    variant: { control: 'select', options: ['empty', 'initials', 'photo', 'error'] },
    onPress: { action: 'pressed' },
  },
} satisfies Meta<typeof AvatarPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

type StoryArgs = Readonly<{ onPress?: unknown; variant?: unknown }>;

export function normalizeAvatarPickerStoryArgs(args: StoryArgs): AvatarPickerProps {
  const onPress = typeof args.onPress === 'function'
    ? args.onPress as AvatarPickerProps['onPress']
    : () => undefined;
  switch (args.variant) {
    case 'initials': return { initials: 'AM', onPress, variant: 'initials' };
    case 'photo': return { onPress, source: storyPhoto, variant: 'photo' };
    case 'error': return { onPress, variant: 'error' };
    default: return { onPress, variant: 'empty' };
  }
}

function recordProps(record: (typeof records)[number]): AvatarPickerProps {
  const content = record.normalizedTuple.content;
  const state = record.normalizedTuple.state;
  if (content === 'photo' && state === 'selected') {
    return { onPress: () => undefined, source: storyPhoto, variant: 'photo' };
  }
  if (content === 'initials') return { initials: 'AM', onPress: () => undefined, variant: 'initials' };
  if (state === 'error') return { onPress: () => undefined, variant: 'error' };
  return { onPress: () => undefined, variant: 'empty' };
}

export const Canonical: Story = {
  args: { onPress: () => undefined, variant: 'empty' },
  render: (args) => (
    <Stack gap="space8">
      <AvatarPicker {...normalizeAvatarPickerStoryArgs(args)} />
      <Text color="textSecondary" variant="caption">{sourceLabel(records[3].id)}</Text>
    </Stack>
  ),
};

export const Variants: Story = {
  args: Canonical.args,
  render: () => (
    <Stack gap="space16">
      {records.map((record) => (
        <Fragment key={record.id}>
          <AvatarPicker {...recordProps(record)} />
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
    <Stack gap="space16">
      <AvatarPicker onPress={() => undefined} variant="empty" />
      <AvatarPicker initials="AM" onPress={() => undefined} variant="initials" />
      <AvatarPicker onPress={() => undefined} source={storyPhoto} variant="photo" />
      <AvatarPicker onPress={() => undefined} variant="error" />
    </Stack>
  ),
};

export const Boundaries: Story = {
  args: Canonical.args,
  render: () => (
    <Stack gap="space8" style={{ width: 352 }}>
      <AvatarPicker onPress={() => undefined} variant="error" />
      <Text color="textSecondary" maxFontSizeMultiplier={2} variant="caption">
        The full action and error remain readable. Native 200% font-scale reachability review remains Phase 5.
      </Text>
    </Stack>
  ),
};

function InteractiveHarness({ onPress }: Pick<AvatarPickerProps, 'onPress'>) {
  const [selected, setSelected] = useState(false);
  const handlePress = () => {
    setSelected((value) => !value);
    onPress();
  };
  return selected
    ? <AvatarPicker initials="AM" onPress={handlePress} variant="initials" />
    : <AvatarPicker onPress={handlePress} variant="empty" />;
}

export const Interactive: Story = {
  args: { onPress: () => undefined, variant: 'empty' },
  render: (args) => <InteractiveHarness onPress={normalizeAvatarPickerStoryArgs(args).onPress} />,
};
