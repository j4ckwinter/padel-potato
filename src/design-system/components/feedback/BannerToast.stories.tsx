import type { Meta, StoryObj } from '@storybook/react-native';
import { Fragment, useState } from 'react';

import { Stack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { bannerToastFixtures } from '../../stories/fixtures';
import {
  BannerToast,
  bannerToastStyles,
  type BannerToastProps,
} from './BannerToast';

const fixtures = bannerToastFixtures;
const noop = () => undefined;

const meta = {
  title: 'Feedback/Banner Toast',
  excludeStories: /(?:^normalize|^Interactive.*Harness$)/u,
  component: BannerToast,
  argTypes: {
    style: { control: 'select', options: bannerToastStyles },
    type: { control: false, table: { disable: true } },
    onClose: { control: false, table: { disable: true } },
    onViewBookingUpdate: { control: false, table: { disable: true } },
    onViewGameDetails: { control: false, table: { disable: true } },
  },
} satisfies Meta<typeof BannerToast>;

export default meta;
type Story = StoryObj<typeof meta>;

type BannerToastStoryArgs = Readonly<{
  message?: unknown;
  onClose?: unknown;
  onViewBookingUpdate?: unknown;
  onViewGameDetails?: unknown;
  style?: unknown;
  title?: unknown;
  type?: unknown;
}>;

const sourceCopy = Object.freeze({
  error: {
    message: 'Please try again in a moment.',
    title: 'Something went wrong',
  },
  info: {
    message: 'Court details have changed.',
    title: 'Booking update',
  },
  success: {
    message: 'Your game is ready to share.',
    title: 'Game created',
  },
  warning: {
    message: 'One player still needs to confirm.',
    title: 'Check game details',
  },
});

const textOr = (value: unknown, fallback: string) =>
  typeof value === 'string' && value.trim().length > 0 ? value : fallback;

export function normalizeBannerToastStoryArgs(
  args: BannerToastStoryArgs,
): BannerToastProps {
  const style = bannerToastStyles.includes(
    args.style as (typeof bannerToastStyles)[number],
  )
    ? (args.style as (typeof bannerToastStyles)[number])
    : 'success';
  const copy = sourceCopy[style];
  const message = textOr(args.message, copy.message);
  const title = textOr(args.title, copy.title);

  switch (style) {
    case 'error':
      return {
        message,
        onClose:
          typeof args.onClose === 'function'
            ? (args.onClose as () => void)
            : noop,
        style,
        title,
        type: 'toast',
      };
    case 'warning':
      return {
        message,
        onViewGameDetails:
          typeof args.onViewGameDetails === 'function'
            ? (args.onViewGameDetails as () => void)
            : noop,
        style,
        title,
        type: 'banner',
      };
    case 'info':
      return {
        message,
        onViewBookingUpdate:
          typeof args.onViewBookingUpdate === 'function'
            ? (args.onViewBookingUpdate as () => void)
            : noop,
        style,
        title,
        type: 'banner',
      };
    case 'success':
      return {
        message,
        onClose:
          typeof args.onClose === 'function'
            ? (args.onClose as () => void)
            : noop,
        style,
        title,
        type: 'toast',
      };
  }
}

function fixtureProps(fixture: (typeof fixtures)[number]): BannerToastProps {
  const [title, message] = fixture.copy;
  return normalizeBannerToastStoryArgs({
    message,
    style: fixture.configuration.style,
    title,
    type: fixture.configuration.type,
  });
}

export const Canonical: Story = {
  args: fixtureProps(fixtures[3]),
  render: (args) => (
    <Stack gap="space8">
      <BannerToast {...normalizeBannerToastStoryArgs(args)} />
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
          <BannerToast {...fixtureProps(fixture)} />
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
      {fixtures.map((fixture) => (
        <BannerToast key={fixture.label} {...fixtureProps(fixture)} />
      ))}
    </Stack>
  ),
};

export const Boundaries: Story = {
  args: Canonical.args,
  render: () => (
    <Stack gap="space8" width="content">
      <BannerToast
        message="Court details changed for an exceptionally long Tuesday evening social game, including the entrance instructions."
        onViewBookingUpdate={noop}
        style="info"
        title="Booking update for Łucía, Nguyễn, and 東京"
        type="banner"
      />
      <Text color="textSecondary" maxFontSizeMultiplier={2} variant="caption">
        Full announcement and View booking update remain reachable at 200% host
        scaling. Native announcement, target measurement, VoiceOver, and
        TalkBack review require native Storybook review.
      </Text>
    </Stack>
  ),
};

export function InteractiveBannerToastHarness({
  initialStyle = 'info',
}: Readonly<{
  initialStyle?: (typeof bannerToastStyles)[number];
}>) {
  const [activations, setActivations] = useState(0);
  const props = normalizeBannerToastStoryArgs({
    onClose: () => setActivations((count) => count + 1),
    onViewBookingUpdate: () => setActivations((count) => count + 1),
    onViewGameDetails: () => setActivations((count) => count + 1),
    style: initialStyle,
  });

  return (
    <Stack gap="space8">
      <BannerToast {...props} />
      <Text variant="body">{`Action intents: ${activations}`}</Text>
    </Stack>
  );
}

export const Interactive: Story = {
  args: Canonical.args,
  render: (args) => (
    <InteractiveBannerToastHarness
      initialStyle={
        bannerToastStyles.includes(args.style) ? args.style : 'info'
      }
    />
  ),
};
