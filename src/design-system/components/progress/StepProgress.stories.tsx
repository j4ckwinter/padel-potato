import type { Meta, StoryObj } from '@storybook/react-native';
import { Fragment } from 'react';

import { Stack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { stepProgressFixtures } from '../../stories/fixtures';
import {
  StepProgress,
  type StepProgressProps,
  type StepProgressValue,
} from './StepProgress';

const fixtures = stepProgressFixtures;
const values = Object.freeze([1, 2, 3, 'complete'] as const);

const meta = {
  title: 'Progress/Step Progress',
  excludeStories: /^normalize/u,
  component: StepProgress,
  argTypes: { value: { control: 'select', options: values } },
} satisfies Meta<typeof StepProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

export function normalizeStepProgressStoryArgs(
  args: Readonly<{ value?: unknown }>,
): StepProgressProps {
  return {
    value: values.includes(args.value as StepProgressValue)
      ? (args.value as StepProgressValue)
      : 1,
  };
}

function recordValue(fixture: (typeof fixtures)[number]): StepProgressValue {
  return fixture.configuration.content;
}

export const Canonical: Story = {
  args: { value: 1 },
  render: (args) => (
    <Stack gap="space8">
      <StepProgress {...normalizeStepProgressStoryArgs(args)} />
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
          <StepProgress value={recordValue(fixture)} />
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
      <StepProgress value={1} />
      <StepProgress value={2} />
      <StepProgress value={3} />
      <StepProgress value="complete" />
    </Stack>
  ),
};

export const Boundaries: Story = {
  args: Canonical.args,
  render: () => (
    <Stack gap="space8" style={{ width: 352 }}>
      <StepProgress value="complete" />
      <Text color="textSecondary" maxFontSizeMultiplier={2} variant="caption">
        Exact progress copy and values stay available. Native 200% font-scale
        review remains Phase 5.
      </Text>
    </Stack>
  ),
};

export const Interactive: Story = {
  args: Canonical.args,
  parameters: {
    applicability:
      'Step Progress is a read-only progress indicator and exposes no authored interaction.',
  },
  render: (args) => <StepProgress {...normalizeStepProgressStoryArgs(args)} />,
};
