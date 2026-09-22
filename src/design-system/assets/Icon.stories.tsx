import type { Meta, StoryObj } from '@storybook/react-native';

import { Stack } from '../primitives/Stack';
import { Text } from '../primitives/Text';
import { colors } from '../tokens';
import { Icon } from './Icon';
import { iconNames } from './iconDefinitions';

const meta = {
  title: 'Assets/Icons',
  component: Icon,
  argTypes: {
    name: { control: 'select', options: iconNames },
    color: { control: 'select', options: Object.keys(colors) },
    size: { control: 'select', options: ['iconSize20'] },
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Canonical: Story = {
  args: { accessibilityLabel: 'Add', color: 'ink', name: 'add', size: 'iconSize20' },
  render: (args) => (
    <Stack gap="space8">
      <Icon {...args} />
      <Text color="textSecondary" variant="caption">
        Standalone icon contract
      </Text>
    </Stack>
  ),
};

export const Variants: Story = {
  args: { name: 'add' },
  render: () => (
    <Stack gap="space8">
      {iconNames.map((name) => (
        <Stack gap="space4" key={name}>
          <Icon
            accessibilityLabel={`Icon ${name}`}
            name={name}
            testID={`icon-gallery-${name}`}
          />
          <Text variant="caption">{name}</Text>
        </Stack>
      ))}
    </Stack>
  ),
};

export const Boundaries: Story = {
  args: { name: 'add' },
  render: () => (
    <Stack gap="space8">
      <Icon name="add" testID="decorative-icon" />
      <Icon accessibilityLabel="Labelled icon" name="add" testID="labelled-icon" />
      <Text variant="caption">
        Icons remain at the sole authored iconSize20 boundary; consumers scale the surrounding layout, not the geometry.
      </Text>
    </Stack>
  ),
};
