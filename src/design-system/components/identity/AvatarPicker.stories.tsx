import type { Meta, StoryObj } from '@storybook/react-native';
import { Fragment, useState } from 'react';

import { Stack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { avatarPickerFixtures } from '../../stories/fixtures';
import { AvatarPicker, type AvatarPickerProps } from './AvatarPicker';

const storyPhoto = require('../../assets/media/mascot-profile.webp');
const fixtures = avatarPickerFixtures;

const meta = {
  title: 'Identity/Avatar Picker',
  excludeStories: /^normalize/u,
  component: AvatarPicker,
  argTypes: {
    variant: {
      control: 'select',
      options: ['empty', 'initials', 'photo', 'error'],
    },
    onPress: { action: 'pressed' },
  },
} satisfies Meta<typeof AvatarPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

type StoryArgs = Readonly<{ onPress?: unknown; variant?: unknown }>;

export function normalizeAvatarPickerStoryArgs(
  args: StoryArgs,
): AvatarPickerProps {
  const onPress =
    typeof args.onPress === 'function'
      ? (args.onPress as AvatarPickerProps['onPress'])
      : () => undefined;
  switch (args.variant) {
    case 'initials':
      return { initials: 'AM', onPress, variant: 'initials' };
    case 'photo':
      return { onPress, source: storyPhoto, variant: 'photo' };
    case 'error':
      return { onPress, variant: 'error' };
    default:
      return { onPress, variant: 'empty' };
  }
}

function fixtureProps(fixture: (typeof fixtures)[number]): AvatarPickerProps {
  const content = fixture.configuration.content;
  const state = fixture.configuration.state;
  if (content === 'photo' && state === 'selected') {
    return { onPress: () => undefined, source: storyPhoto, variant: 'photo' };
  }
  if (content === 'initials')
    return { initials: 'AM', onPress: () => undefined, variant: 'initials' };
  if (state === 'error') return { onPress: () => undefined, variant: 'error' };
  return { onPress: () => undefined, variant: 'empty' };
}

export const Canonical: Story = {
  args: { onPress: () => undefined, variant: 'empty' },
  render: (args) => (
    <Stack gap="space8">
      <AvatarPicker {...normalizeAvatarPickerStoryArgs(args)} />
      <Text color="textSecondary" variant="caption">
        {fixtures[3].label}
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
          <AvatarPicker {...fixtureProps(fixture)} />
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
      <AvatarPicker onPress={() => undefined} variant="empty" />
      <AvatarPicker
        initials="AM"
        onPress={() => undefined}
        variant="initials"
      />
      <AvatarPicker
        onPress={() => undefined}
        source={storyPhoto}
        variant="photo"
      />
      <AvatarPicker onPress={() => undefined} variant="error" />
    </Stack>
  ),
};

export const Boundaries: Story = {
  args: Canonical.args,
  render: () => (
    <Stack gap="space8" width="content">
      <AvatarPicker onPress={() => undefined} variant="error" />
      <Text color="textSecondary" maxFontSizeMultiplier={2} variant="caption">
        The full action and error remain readable. Native 200% font-scale
        reachability review requires native Storybook review.
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
  return selected ? (
    <AvatarPicker initials="AM" onPress={handlePress} variant="initials" />
  ) : (
    <AvatarPicker onPress={handlePress} variant="empty" />
  );
}

export const Interactive: Story = {
  args: { onPress: () => undefined, variant: 'empty' },
  render: (args) => (
    <InteractiveHarness
      onPress={normalizeAvatarPickerStoryArgs(args).onPress}
    />
  ),
};
