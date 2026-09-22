import type { Meta, StoryObj } from '@storybook/react-native';

import { spacing, type SpacingToken } from '../tokens';
import { StoryFrame } from '../stories/StoryFrame';
import { Inline } from './Inline';
import { Stack, type LayoutAlignment, type LayoutJustification } from './Stack';
import { Text } from './Text';

type LayoutStoryProps = {
  align: LayoutAlignment;
  gap: SpacingToken;
  justify: LayoutJustification;
  padding: SpacingToken;
  wrap: boolean;
};

const alignments: readonly LayoutAlignment[] = [
  'start',
  'center',
  'end',
  'stretch',
];
const justifications: readonly LayoutJustification[] = [
  'start',
  'center',
  'end',
  'spaceBetween',
  'spaceAround',
  'spaceEvenly',
];
const longUnicode = 'Łucía 🚀／東京 · Álvaro · Zoë · Nguyễn';

function LayoutStory({ align, gap, justify, padding, wrap }: LayoutStoryProps) {
  return (
    <Stack gap="space16">
      <Stack align={align} gap={gap} justify={justify} padding={padding}>
        <Text variant="body">Stack item one</Text>
        <Text variant="body">Stack item two</Text>
      </Stack>
      <Inline
        align={align}
        gap={gap}
        justify={justify}
        padding={padding}
        wrap={wrap}
      >
        <Text variant="body">Inline item one</Text>
        <Text variant="body">Inline item two</Text>
      </Inline>
    </Stack>
  );
}

const meta = {
  title: 'Primitives/Layout',
  component: LayoutStory,
  argTypes: {
    align: { control: 'select', options: alignments },
    gap: { control: 'select', options: Object.keys(spacing) },
    justify: { control: 'select', options: justifications },
    padding: { control: 'select', options: Object.keys(spacing) },
    wrap: { control: 'boolean' },
  },
} satisfies Meta<typeof LayoutStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Canonical: Story = {
  args: {
    align: 'stretch',
    gap: 'space16',
    justify: 'start',
    padding: 'space16',
    wrap: false,
  },
  render: (args) => (
    <Stack gap="space8">
      <LayoutStory {...args} />
      <Text color="textSecondary" variant="caption">
        Stack layout primitive
      </Text>
      <Text color="textSecondary" variant="caption">
        Inline layout primitive
      </Text>
    </Stack>
  ),
};

export const Variants: Story = {
  args: {
    align: 'center',
    gap: 'space8',
    justify: 'spaceBetween',
    padding: 'space16',
    wrap: true,
  },
  render: (args) => <LayoutStory {...args} />,
};

export const Boundaries: Story = {
  args: {
    align: 'stretch',
    gap: 'space8',
    justify: 'start',
    padding: 'space8',
    wrap: true,
  },
  render: () => (
    <Stack gap="space16">
      {(['compact', 'content', 'viewport'] as const).map((width) => (
        <StoryFrame key={width} width={width}>
          <Stack gap="space8" testID={`boundary-${width}`}>
            <Stack testID="boundary-zero" />
            <Stack testID="boundary-one">
              <Text variant="body">One</Text>
            </Stack>
            <Inline gap="space4" testID="boundary-many" wrap>
              <Text variant="body">One</Text>
              <Text variant="body">Two</Text>
              <Text variant="body">Three</Text>
            </Inline>
            <Inline gap="space4" testID="boundary-required-content" wrap>
              <Text variant="body">{longUnicode}</Text>
            </Inline>
            <Text
              ellipsizeMode="tail"
              numberOfLines={1}
              testID="boundary-explicit-truncation"
              variant="body"
            >
              Consumer-authored optional truncation: {longUnicode}
            </Text>
          </Stack>
        </StoryFrame>
      ))}
    </Stack>
  ),
};
