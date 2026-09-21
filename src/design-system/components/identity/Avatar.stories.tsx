import type { Meta, StoryObj } from '@storybook/react-native';
import { Fragment } from 'react';

import { Stack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import {
  avatarPresences,
  avatarRecords,
  avatarSizes,
  phase4SourceIdentity,
} from '../phase4SourceRegistry';
import {
  Avatar,
  type AvatarPresence,
  type AvatarProps,
  type AvatarSize,
} from './Avatar';

const storyPhoto = require('../../../../design-spec/assets/phase-3/mascot-profile.webp');

const sourceLabel = (recordId: string) =>
  `Penpot ${phase4SourceIdentity.fileId} / ${phase4SourceIdentity.pageId} / revision ${phase4SourceIdentity.revision} / set 482a7222-5a3b-8086-8008-a60fcc2bf6a2 / record ${recordId}`;

const meta = {
  title: 'Identity/Avatar',
  component: Avatar,
  argTypes: {
    size: { control: 'select', options: avatarSizes },
    presence: { control: 'select', options: avatarPresences },
    accessibilityLabel: { control: 'text' },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

type AvatarStoryArgs = Readonly<{
  accessibilityLabel?: unknown;
  initials?: unknown;
  presence?: unknown;
  size?: unknown;
}>;

export const normalizeAvatarStoryArgs = (args: AvatarStoryArgs): AvatarProps => {
  const accessibilityLabel = typeof args.accessibilityLabel === 'string'
    && args.accessibilityLabel.trim().length > 0
    ? args.accessibilityLabel
    : 'Alex Morgan, online';
  const initials = typeof args.initials === 'string' && args.initials.trim().length > 0
    ? args.initials.slice(0, 3)
    : 'AM';
  const tuple = `${String(args.size)}/${String(args.presence)}`;
  switch (tuple) {
    case '32/online': return { accessibilityLabel, initials, presence: 'online', size: 32 };
    case '40/online': return { accessibilityLabel, initials, presence: 'online', size: 40 };
    case '48/away': return { accessibilityLabel, initials, presence: 'away', size: 48 };
    case '48/offline': return { accessibilityLabel, initials, presence: 'offline', size: 48 };
    case '56/online': return { accessibilityLabel, initials, presence: 'online', size: 56 };
    default: return { accessibilityLabel, initials, presence: 'online', size: 40 };
  }
};

const recordProps = (record: (typeof avatarRecords)[number]): AvatarProps => {
  const size = record.normalizedTuple.size as AvatarSize;
  const presence = record.normalizedTuple.presence as AvatarPresence;
  return normalizeAvatarStoryArgs({
    accessibilityLabel: `Alex Morgan, ${presence}`,
    initials: 'AM',
    presence,
    size,
  });
};

export const Canonical: Story = {
  args: {
    accessibilityLabel: 'Alex Morgan, online',
    initials: 'AM',
    presence: 'online',
    size: 40,
  },
  render: (args) => (
    <Stack gap="space8">
      <Avatar {...normalizeAvatarStoryArgs(args)} />
      <Text color="textSecondary" variant="caption">
        {sourceLabel('482a7222-5a3b-8086-8008-a60fcb3084a2')}
      </Text>
    </Stack>
  ),
};

export const Variants: Story = {
  args: Canonical.args,
  render: () => (
    <Stack gap="space16">
      {avatarRecords.map((record) => (
        <Fragment key={record.id}>
          <Avatar {...recordProps(record)} />
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
      <Avatar accessibilityLabel="Alex Morgan, online" initials="AM" presence="online" size={56} />
      <Avatar accessibilityLabel="Alex Morgan, away" initials="AM" presence="away" size={48} />
      <Avatar accessibilityLabel="Alex Morgan, offline" initials="AM" presence="offline" size={48} />
      <Avatar accessibilityLabel="Local photo fixture, online" presence="online" size={40} source={storyPhoto} />
      <Text color="textSecondary" variant="caption">
        The photo is a deterministic local story fixture, not claimed Penpot Avatar artwork.
      </Text>
    </Stack>
  ),
};

export const Boundaries: Story = {
  args: Canonical.args,
  render: () => (
    <Stack gap="space8" style={{ width: 200 }}>
      <Avatar
        accessibilityLabel="Łucía Nguyễn from 東京, online"
        initials="ŁN"
        presence="online"
        size={56}
      />
      <Text color="textSecondary" maxFontSizeMultiplier={2} variant="caption">
        Full accessible identity is retained. Native 200% font-scale and composite review remain Phase 5 backstops.
      </Text>
    </Stack>
  ),
};

export const Interactive: Story = {
  args: Canonical.args,
  parameters: {
    applicability: 'Avatar is presentational and owns no component interaction; selection belongs to Avatar Picker.',
  },
  render: () => (
    <Stack gap="space8">
      <Avatar decorative initials="AM" presence="online" size={40} />
      <Text color="textSecondary" variant="caption">
        Decorative specimen for use inside an already-labelled composite.
      </Text>
    </Stack>
  ),
};
