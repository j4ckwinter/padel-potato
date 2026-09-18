import type { Meta, StoryObj } from '@storybook/react-native';

import { borders, colors, radii, spacing } from '../tokens';
import {
  formatStorySourceIdentity,
  phase2StorySources,
} from '../stories/storyContract';
import { Stack } from './Stack';
import { Surface } from './Surface';
import { Text } from './Text';

const longUnicode = 'Łucía 🚀／東京 · Álvaro · Zoë · Nguyễn';

const meta = {
  title: 'Primitives/Surface',
  component: Surface,
  argTypes: {
    background: { control: 'select', options: Object.keys(colors) },
    borderColor: { control: 'select', options: Object.keys(colors) },
    borderWidth: { control: 'select', options: Object.keys(borders) },
    padding: { control: 'select', options: Object.keys(spacing) },
    radius: { control: 'select', options: Object.keys(radii) },
  },
} satisfies Meta<typeof Surface>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Canonical: Story = {
  args: { background: 'surface', padding: 'space16' },
  render: (args) => (
    <Stack gap="space8">
      <Surface {...args}><Text variant="body">Surface content</Text></Surface>
      <Text color="textSecondary" variant="caption">
        {formatStorySourceIdentity(phase2StorySources.Surface)}
      </Text>
    </Stack>
  ),
};

export const Variants: Story = {
  args: { background: 'surfaceAccent', borderColor: 'border', borderWidth: 'borderDefault', padding: 'space16', radius: 'radius16' },
  render: (args) => <Surface {...args}><Text variant="body">Token-bounded surface</Text></Surface>,
};

export const Boundaries: Story = {
  args: { background: 'surface', padding: 'space8' },
  render: () => (
    <Stack gap="space8" style={{ width: 220 }} testID="boundary-constrained-width">
      <Surface testID="boundary-zero" />
      <Surface testID="boundary-one"><Text variant="body">One</Text></Surface>
      <Surface testID="boundary-many"><Text variant="body">One · Two · Three</Text></Surface>
      <Surface testID="boundary-required-content"><Text variant="body">{longUnicode}</Text></Surface>
      <Text ellipsizeMode="tail" numberOfLines={1} testID="boundary-explicit-truncation" variant="body">
        Consumer-authored optional truncation: {longUnicode}
      </Text>
    </Stack>
  ),
};

