import type { Meta, StoryObj } from '@storybook/react-native';

import { FoundationGallery, foundationCategories } from './FoundationGallery';

const meta = {
  title: 'Foundations/Overview',
  component: FoundationGallery,
  argTypes: {
    category: {
      control: 'select',
      options: foundationCategories,
    },
  },
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof FoundationGallery>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AllFoundations: Story = {
  args: {},
};

export const Colors: Story = {
  args: { category: 'colors' },
};

export const Typography: Story = {
  args: { category: 'typography' },
};

export const Spacing: Story = {
  args: { category: 'spacing' },
};

export const Radii: Story = {
  args: { category: 'radii' },
};

export const Dimensions: Story = {
  args: { category: 'dimensions' },
};

export const Borders: Story = {
  args: { category: 'borders' },
};

export const Opacity: Story = {
  args: { category: 'opacity' },
};
