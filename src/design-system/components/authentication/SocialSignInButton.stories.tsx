import type { Meta, StoryObj } from '@storybook/react-native';
import { Fragment, useState } from 'react';

import { Stack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { socialSignInButtonFixtures } from '../../stories/fixtures';
import {
  SocialSignInButton,
  socialSignInProviders,
  type SocialSignInProvider,
} from './SocialSignInButton';

const fixtures = socialSignInButtonFixtures;

const meta = {
  title: 'Authentication/Social Sign-In Button',
  component: SocialSignInButton,
  argTypes: {
    disabled: { control: 'boolean' },
    onPress: { action: 'pressed' },
    provider: { control: 'select', options: socialSignInProviders },
  },
} satisfies Meta<typeof SocialSignInButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Canonical: Story = {
  args: { provider: 'google' },
  render: (args) => (
    <Stack gap="space8">
      <SocialSignInButton {...args} />
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
          <SocialSignInButton
            disabled={fixture.configuration.state === 'disabled'}
            provider={fixture.configuration.provider as SocialSignInProvider}
          />
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
    <Stack gap="space8">
      <SocialSignInButton provider="google" />
      <SocialSignInButton disabled provider="google" />
      <SocialSignInButton provider="apple" />
      <SocialSignInButton disabled provider="apple" />
      <Text color="textSecondary" variant="caption">
        Hold enabled actions for native pressed treatment; keyboard focus drives the two-point focus ring.
      </Text>
    </Stack>
  ),
};

export const Boundaries: Story = {
  args: Canonical.args,
  render: () => (
    <Stack gap="space8" style={{ width: 352 }}>
      <SocialSignInButton provider="google" />
      <SocialSignInButton provider="apple" />
      <Text color="textSecondary" variant="caption">
        The fixed provider copy preserves its full accessible name. Native 200% font-scale, long-copy resilience, and 44-point target review remain Phase 5; provider copy is not caller-customizable.
      </Text>
    </Stack>
  ),
};

function InteractiveHarness({ provider }: { provider: SocialSignInProvider }) {
  const [activations, setActivations] = useState(0);
  return (
    <Stack gap="space8">
      <SocialSignInButton
        onPress={() => setActivations((count) => count + 1)}
        provider={provider}
      />
      <SocialSignInButton disabled onPress={() => setActivations((count) => count + 1)} provider={provider} />
      <Text variant="body">{`Activations: ${activations}`}</Text>
    </Stack>
  );
}

export const Interactive: Story = {
  args: Canonical.args,
  render: (args) => <InteractiveHarness provider={args.provider} />,
};
