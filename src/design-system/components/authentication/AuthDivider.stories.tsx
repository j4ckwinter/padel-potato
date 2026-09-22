import type { Meta, StoryObj } from '@storybook/react-native';
import { Fragment } from 'react';

import { Stack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { authDividerFixtures } from '../../stories/fixtures';
import { AuthDivider } from './AuthDivider';

const fixtures = authDividerFixtures;

export const authDividerStoryApplicability = Object.freeze({
  Canonical: Object.freeze({ status: 'story', story: 'Canonical' }),
  Variants: Object.freeze({ status: 'story', story: 'Variants' }),
  States: Object.freeze({
    status: 'inapplicable',
    reason: 'AuthDivider is static content with no authored transient state.',
  }),
  Boundaries: Object.freeze({ status: 'story', story: 'Boundaries' }),
  Interactive: Object.freeze({
    status: 'inapplicable',
    reason: 'AuthDivider exposes no callback or product interaction.',
  }),
} as const);

const meta = {
  title: 'Authentication/Auth Divider',
  excludeStories: /^authDividerStoryApplicability$/u,
  component: AuthDivider,
  argTypes: {
    label: { control: 'text' },
  },
} satisfies Meta<typeof AuthDivider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Canonical: Story = {
  args: { label: 'or' },
  render: (args) => (
    <Stack gap="space8">
      <AuthDivider {...args} />
      <Text color="textSecondary" variant="caption">
        {'Canonical configuration'}
      </Text>
    </Stack>
  ),
};

export const Variants: Story = {
  args: Canonical.args,
  render: () => (
    <Stack gap="space12">
      {fixtures.map((fixture) => (
        <Fragment key={fixture.label}>
          <AuthDivider />
          <Text color="textSecondary" variant="caption">
            {fixture.label}
          </Text>
        </Fragment>
      ))}
    </Stack>
  ),
};

export const Boundaries: Story = {
  args: Canonical.args,
  render: () => (
    <Stack gap="space8" style={{ width: 352 }}>
      <AuthDivider label="or continue with a deliberately long static alternative" />
      <Text color="textSecondary" variant="caption">
        A blank label is rejected. Long static content and 200% font-scale
        intent are host witnesses; native measurement requires native Storybook
        review.
      </Text>
    </Stack>
  ),
};
