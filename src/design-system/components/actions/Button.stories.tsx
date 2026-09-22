import type { Meta, StoryObj } from '@storybook/react-native';
import { Fragment, useState } from 'react';

import { Stack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import {
  buttonFixtures,
  buttonStyles,
  buttonSizes,
} from '../../stories/fixtures';
import { Button, type ButtonProps } from './Button';

const meta = {
  title: 'Actions/Button',
  excludeStories: /^normalize/u,
  component: Button,
  argTypes: {
    style: { control: 'select', options: buttonStyles },
    size: { control: 'select', options: buttonSizes },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    onPress: { action: 'pressed' },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

type ButtonStoryArgs = Readonly<{
  disabled?: unknown;
  label?: unknown;
  loading?: unknown;
  onPress?: unknown;
  size?: unknown;
  style?: unknown;
}>;

export const normalizeButtonStoryArgs = (
  args: ButtonStoryArgs,
): ButtonProps => {
  const label =
    typeof args.label === 'string' && args.label.trim().length > 0
      ? args.label
      : 'Button label';
  const onPress =
    typeof args.onPress === 'function'
      ? (args.onPress as ButtonProps['onPress'])
      : undefined;

  if (args.loading === true) {
    return { label, loading: true, onPress, size: 48, style: 'primary' };
  }
  if (args.disabled === true) {
    return { disabled: true, label, onPress, size: 48, style: 'primary' };
  }

  const size = buttonSizes.includes(args.size as 40 | 48)
    ? (args.size as 40 | 48)
    : 48;
  const style = buttonStyles.includes(args.style as ButtonProps['style'])
    ? (args.style as ButtonProps['style'])
    : 'primary';
  if (size === 40) return { label, onPress, size, style: 'primary' };
  return { label, onPress, size, style } as ButtonProps;
};

export const Canonical: Story = {
  args: {
    label: 'Create game',
    size: 48,
    style: 'primary',
  },
  render: (args) => (
    <Stack gap="space8">
      <Button {...normalizeButtonStoryArgs(args)} />
      <Text color="textSecondary" variant="caption">
        {'Canonical configuration'}
      </Text>
    </Stack>
  ),
};

const fixtureProps = (
  fixture: (typeof buttonFixtures)[number],
): ButtonProps => {
  const tuple = fixture.configuration;
  const style = tuple.style as ButtonProps['style'];
  const size = tuple.size as 40 | 48;
  if (tuple.state === 'disabled') {
    return {
      disabled: true,
      label: 'Button label',
      size: 48,
      style: 'primary',
    };
  }
  if (tuple.state === 'loading') {
    return { label: 'Button label', loading: true, size: 48, style: 'primary' };
  }
  if (size === 40) return { label: 'Button label', size, style: 'primary' };
  return { label: 'Button label', size: 48, style } as ButtonProps;
};

export const Variants: Story = {
  args: { label: 'Button label', style: 'primary' },
  render: () => (
    <Stack gap="space12">
      {buttonFixtures.map((fixture) => (
        <Fragment key={fixture.label}>
          <Button {...fixtureProps(fixture)} />
          <Text color="textSecondary" variant="caption">
            {fixture.label}
          </Text>
        </Fragment>
      ))}
    </Stack>
  ),
};

export const States: Story = {
  args: { label: 'Default', style: 'primary' },
  render: () => (
    <Stack gap="space8">
      <Button label="Default" style="primary" />
      <Button disabled label="Disabled" style="primary" />
      <Button label="Loading" loading style="primary" />
      <Text color="textSecondary" variant="caption">
        Hold Default for the native pressed treatment; keyboard focus drives the
        native focus ring.
      </Text>
    </Stack>
  ),
};

export const Boundaries: Story = {
  args: { label: 'Long label', style: 'primary' },
  render: () => (
    <Stack gap="space8" width="compact">
      <Button
        label="Create a very long game name for Łucía, 東京, and Nguyễn"
        style="primary"
      />
      <Text color="textSecondary" variant="caption">
        Full accessible name retained. Native 200% font-scale and hit-area
        clipping review require native Storybook review.
      </Text>
    </Stack>
  ),
};

function InteractiveHarness({ onPress }: Pick<ButtonProps, 'onPress'>) {
  const [presses, setPresses] = useState(0);
  return (
    <Stack gap="space8">
      <Button
        label="Create game"
        onPress={(event) => {
          setPresses((count) => count + 1);
          onPress?.(event);
        }}
        style="primary"
      />
      <Text variant="body">{`Activations: ${presses}`}</Text>
    </Stack>
  );
}

export const Interactive: Story = {
  args: { label: 'Create game', style: 'primary' },
  render: (args) => <InteractiveHarness onPress={args.onPress} />,
};
