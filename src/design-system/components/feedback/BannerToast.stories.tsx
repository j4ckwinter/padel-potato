import type { Meta, StoryObj } from '@storybook/react-native';
import { Fragment, useState } from 'react';

import { Stack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { phase4Families, phase4SourceIdentity } from '../phase4SourceRegistry';
import {
  BannerToast,
  bannerToastStyles,
  type BannerToastProps,
} from './BannerToast';

const records = phase4Families[12].records;
const noop = () => undefined;

const sourceLabel = (recordId: string) =>
  `Penpot ${phase4SourceIdentity.fileId} / ${phase4SourceIdentity.pageId} / revision ${phase4SourceIdentity.revision} / set 482a7222-5a3b-8086-8008-a610135158ee / record ${recordId}`;

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
    ? args.style as (typeof bannerToastStyles)[number]
    : 'success';
  const copy = sourceCopy[style];
  const message = textOr(args.message, copy.message);
  const title = textOr(args.title, copy.title);

  switch (style) {
    case 'error':
      return {
        message,
        onClose: typeof args.onClose === 'function' ? args.onClose as () => void : noop,
        style,
        title,
        type: 'toast',
      };
    case 'warning':
      return {
        message,
        onViewGameDetails: typeof args.onViewGameDetails === 'function'
          ? args.onViewGameDetails as () => void
          : noop,
        style,
        title,
        type: 'banner',
      };
    case 'info':
      return {
        message,
        onViewBookingUpdate: typeof args.onViewBookingUpdate === 'function'
          ? args.onViewBookingUpdate as () => void
          : noop,
        style,
        title,
        type: 'banner',
      };
    case 'success':
      return {
        message,
        onClose: typeof args.onClose === 'function' ? args.onClose as () => void : noop,
        style,
        title,
        type: 'toast',
      };
  }
}

function recordProps(record: (typeof records)[number]): BannerToastProps {
  const [title, message] = record.metrics.typography.map(({ text }) => text);
  return normalizeBannerToastStoryArgs({
    message,
    style: record.normalizedTuple.style,
    title,
    type: record.normalizedTuple.type,
  });
}

export const Canonical: Story = {
  args: recordProps(records[3]),
  render: (args) => (
    <Stack gap="space8">
      <BannerToast {...normalizeBannerToastStoryArgs(args)} />
      <Text color="textSecondary" variant="caption">{sourceLabel(records[3].id)}</Text>
    </Stack>
  ),
};

export const Variants: Story = {
  args: Canonical.args,
  render: () => (
    <Stack gap="space16">
      {records.map((record) => (
        <Fragment key={record.id}>
          <BannerToast {...recordProps(record)} />
          <Text color="textSecondary" variant="caption">
            {`${Object.values(record.originalTuple).join(' / ')} · ${record.id}`}
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
      {records.map((record) => <BannerToast key={record.id} {...recordProps(record)} />)}
    </Stack>
  ),
};

export const Boundaries: Story = {
  args: Canonical.args,
  render: () => (
    <Stack gap="space8" style={{ width: 352 }}>
      <BannerToast
        message="Court details changed for an exceptionally long Tuesday evening social game, including the entrance instructions."
        onViewBookingUpdate={noop}
        style="info"
        title="Booking update for Łucía, Nguyễn, and 東京"
        type="banner"
      />
      <Text color="textSecondary" maxFontSizeMultiplier={2} variant="caption">
        Full announcement and View booking update remain reachable at 200% host scaling. Native announcement, target measurement, VoiceOver, and TalkBack review remain Phase 5.
      </Text>
    </Stack>
  ),
};

export function InteractiveBannerToastHarness(
  { initialStyle = 'info' }: Readonly<{
    initialStyle?: (typeof bannerToastStyles)[number];
  }>,
) {
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
      initialStyle={bannerToastStyles.includes(args.style) ? args.style : 'info'}
    />
  ),
};
