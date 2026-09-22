import type { Meta, StoryObj } from '@storybook/react-native';

import { colors, typography } from '../tokens';
import { Stack } from './Stack';
import { Text } from './Text';

const longUnicode =
  'Łucía 🚀／東京 joins Álvaro, Zoë, and Nguyễn for a long padel match description that must wrap without losing required content.';

const meta = {
  title: 'Primitives/Text',
  component: Text,
  argTypes: {
    variant: { control: 'select', options: Object.keys(typography) },
    color: { control: 'select', options: Object.keys(colors) },
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Canonical: Story = {
  args: { children: 'Same court. Better people.', variant: 'body' },
  render: (args) => (
    <Stack gap="space8">
      <Text {...args} />
      <Text color="textSecondary" variant="caption">
        Standalone typography primitive
      </Text>
    </Stack>
  ),
};

export const Variants: Story = {
  args: { children: 'Text specimen', variant: 'body' },
  render: () => (
    <Stack gap="space8">
      {Object.keys(typography).map((variant) => (
        <Text key={variant} variant={variant as keyof typeof typography}>
          {variant} — Same court. Better people.
        </Text>
      ))}
    </Stack>
  ),
};

export const Boundaries: Story = {
  args: { children: longUnicode, variant: 'body' },
  render: () => (
    <Stack gap="space8" width="compact" testID="boundary-constrained-width">
      <Text testID="boundary-zero" variant="body" />
      <Text testID="boundary-one" variant="body">
        One
      </Text>
      <Text testID="boundary-many" variant="body">
        One · Two · Three
      </Text>
      <Text testID="boundary-required-content" variant="body">
        {longUnicode}
      </Text>
      <Text
        ellipsizeMode="tail"
        numberOfLines={1}
        testID="boundary-explicit-truncation"
        variant="body"
      >
        Consumer-authored optional truncation: {longUnicode}
      </Text>
    </Stack>
  ),
};
