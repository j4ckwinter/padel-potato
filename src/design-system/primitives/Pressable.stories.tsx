import type { Meta, StoryObj } from '@storybook/react-native';

import {
  formatStorySourceIdentity,
  phase2StorySources,
} from '../stories/storyContract';
import { Stack } from './Stack';
import { Pressable, type PressableSize } from './Pressable';
import { Text } from './Text';

const sizes: readonly PressableSize[] = [
  'controlHeight40',
  'controlHeight44',
  'controlHeight48',
];
const longUnicode =
  'Activate example for Łucía 🚀／東京, Álvaro, Zoë, and Nguyễn without clipping the required action name.';

const meta = {
  title: 'Primitives/Pressable',
  component: Pressable,
  argTypes: {
    size: { control: 'select', options: sizes },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    onPress: { action: 'pressed' },
  },
} satisfies Meta<typeof Pressable>;

export default meta;
type Story = StoryObj<typeof meta>;

const specimen = (label: string, props: React.ComponentProps<typeof Pressable> = {}) => (
  <Pressable accessibilityLabel={label} accessibilityRole="button" {...props}>
    <Text variant="bodyStrong">{label}</Text>
  </Pressable>
);

export const Canonical: Story = {
  args: { accessibilityLabel: 'Activate example', accessibilityRole: 'button', children: <Text variant="bodyStrong">Activate example</Text>, size: 'controlHeight44' },
  render: (args) => (
    <Stack gap="space8">
      <Pressable {...args} />
      <Text color="textSecondary" variant="caption">
        {formatStorySourceIdentity(phase2StorySources.Pressable)}
      </Text>
    </Stack>
  ),
};

export const Variants: Story = {
  args: { accessibilityLabel: 'Activate example', accessibilityRole: 'button' },
  render: (args) => (
    <Stack gap="space8">
      {sizes.map((size) => specimen(size, { ...args, size }))}
    </Stack>
  ),
};

export const States: Story = {
  args: { accessibilityRole: 'button' },
  render: () => (
    <Stack gap="space8">
      {specimen('Enabled')}
      <Text variant="caption">Pressed: hold the enabled control</Text>
      {specimen('Focus demonstration')}
      {specimen('Disabled', { disabled: true })}
      {specimen('Loading', { loading: true })}
    </Stack>
  ),
};

export const Boundaries: Story = {
  args: { accessibilityLabel: 'Activate example', accessibilityRole: 'button' },
  render: () => (
    <Stack gap="space8" style={{ width: 220 }} testID="boundary-constrained-width">
      <Text testID="boundary-required-content" variant="body">{longUnicode}</Text>
      <Pressable
        accessibilityLabel="Activate example"
        accessibilityRole="button"
        onPress={() => undefined}
        testID="boundary-long-text-action"
      >
        <Text variant="bodyStrong">{longUnicode}</Text>
      </Pressable>
      <Text color="textSecondary" variant="caption">
        Native 200% font-scale review required; host rendering is not native proof.
      </Text>
    </Stack>
  ),
};

export const Interactive: Story = {
  args: { onPress: () => undefined },
  render: (args) => (
    <Pressable
      accessibilityLabel="Activate example"
      accessibilityRole="button"
      onPress={args.onPress}
    >
      <Text variant="bodyStrong">Activate example</Text>
    </Pressable>
  ),
};
