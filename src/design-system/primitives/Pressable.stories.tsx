import type { Meta, StoryObj } from '@storybook/react-native';
import { Fragment } from 'react';

import { Stack } from './Stack';
import { Pressable, type PressableSize } from './Pressable';
import { Surface } from './Surface';
import { Text } from './Text';

const sizes: readonly PressableSize[] = [
  'controlHeight40',
  'controlHeight44',
  'controlHeight48',
];
const longUnicode =
  'Long-content action for Łucía 🚀／東京, Álvaro, Zoë, and Nguyễn without clipping its accessible name.';

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

const specimen = (
  label: string,
  props: React.ComponentProps<typeof Pressable> = {},
) => (
  <Pressable accessibilityLabel={label} accessibilityRole="button" {...props}>
    <Text variant="body">{label}</Text>
  </Pressable>
);

export const Canonical: Story = {
  args: {
    accessibilityLabel: 'Canonical pressable',
    accessibilityRole: 'button',
    children: <Text variant="body">Canonical pressable</Text>,
    size: 'controlHeight44',
  },
  render: (args) => (
    <Stack gap="space8">
      <Pressable {...args} />
      <Text color="textSecondary" variant="caption">
        Standalone pressable primitive
      </Text>
    </Stack>
  ),
};

export const Variants: Story = {
  args: { accessibilityRole: 'button' },
  render: (args) => (
    <Stack gap="space8">
      {sizes.map((size) => (
        <Fragment key={size}>
          {specimen(`${size} specimen`, { ...args, size })}
        </Fragment>
      ))}
    </Stack>
  ),
};

export const States: Story = {
  args: { accessibilityRole: 'button' },
  render: () => (
    <Stack gap="space8">
      {specimen('Enabled state')}
      <Pressable
        accessibilityLabel="Pressed state demonstration"
        accessibilityRole="button"
      >
        {({ pressed }) => (
          <Surface
            background={pressed ? 'surfaceAccent' : 'surfaceMuted'}
            padding="space8"
            testID="pressed-state-visual"
          >
            <Text variant="body">
              {pressed
                ? 'Pressed state active'
                : 'Hold to preview pressed state'}
            </Text>
          </Surface>
        )}
      </Pressable>
      {specimen('Focus state')}
      {specimen('Disabled state', { disabled: true })}
      {specimen('Loading state', { loading: true })}
    </Stack>
  ),
};

export const Boundaries: Story = {
  args: {
    accessibilityLabel: 'Long-content action',
    accessibilityRole: 'button',
  },
  render: (args) => (
    <Stack gap="space8" width="compact" testID="boundary-constrained-width">
      <Text testID="boundary-required-content" variant="body">
        {longUnicode}
      </Text>
      <Pressable
        accessibilityLabel={args.accessibilityLabel}
        accessibilityRole={args.accessibilityRole}
        onPress={args.onPress}
        testID="boundary-long-text-action"
      >
        <Text variant="body">{longUnicode}</Text>
      </Pressable>
      <Text color="textSecondary" variant="caption">
        Native 200% font-scale review required; host rendering is not native
        proof.
      </Text>
    </Stack>
  ),
};

export const Interactive: Story = {
  render: (args) => (
    <Pressable
      accessibilityLabel="Activate example"
      accessibilityRole="button"
      onPress={args.onPress}
    >
      <Text variant="body">Activate example</Text>
    </Pressable>
  ),
};
