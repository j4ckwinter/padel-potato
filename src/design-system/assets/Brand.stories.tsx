import type { Meta, StoryObj } from '@storybook/react-native';

import { Stack } from '../primitives/Stack';
import { Text } from '../primitives/Text';
import { BrandLockup } from './BrandLockup';
import { BrandLockupStacked } from './BrandLockupStacked';

function BrandCatalogue() {
  return (
    <Stack gap="space16">
      <BrandLockup testID="brand-lockup-horizontal" width={300} />
      <BrandLockupStacked testID="brand-lockup-stacked" width={300} />
    </Stack>
  );
}

const meta = {
  title: 'Assets/Brand',
  component: BrandCatalogue,
  argTypes: {},
} satisfies Meta<typeof BrandCatalogue>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Canonical: Story = {
  render: () => (
    <Stack gap="space8">
      <BrandCatalogue />
      <Text color="textSecondary" variant="caption">
        Horizontal brand lockup
      </Text>
      <Text color="textSecondary" variant="caption">
        Stacked brand lockup
      </Text>
    </Stack>
  ),
};

export const Variants: Story = {
  render: () => <BrandCatalogue />,
};

export const Boundaries: Story = {
  render: () => (
    <Stack gap="space8" style={{ width: 220 }}>
      <BrandLockup testID="brand-boundary-horizontal" width={120} />
      <BrandLockupStacked testID="brand-boundary-stacked" width={120} />
      <Text variant="caption">
        Width-only scaling preserves the authored 25:6 and 75:14 ratios. Visible
        brand copy and colourways are fixed artwork.
      </Text>
    </Stack>
  ),
};
