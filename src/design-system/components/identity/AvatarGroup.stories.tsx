import type { Meta, StoryObj } from '@storybook/react-native';
import { Fragment } from 'react';

import { Stack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { phase4Families, phase4SourceIdentity } from '../phase4SourceRegistry';
import {
  AvatarGroup,
  type AvatarGroupIdentity,
  type AvatarGroupProps,
} from './AvatarGroup';

const records = phase4Families[1].records;
const players = [
  { initials: 'AM', name: 'Alex Morgan', presence: 'online' },
  { initials: 'JT', name: 'Jamie Taylor', presence: 'online' },
  { initials: 'SK', name: 'Sam Kim', presence: 'online' },
  { initials: 'RB', name: 'Riley Brown', presence: 'online' },
] as const satisfies readonly AvatarGroupIdentity[];

const sourceLabel = (recordId: string) =>
  `Penpot ${phase4SourceIdentity.fileId} / ${phase4SourceIdentity.pageId} / revision ${phase4SourceIdentity.revision} / set 482a7222-5a3b-8086-8008-a60f7e527b9d / record ${recordId}`;

const meta = {
  title: 'Identity/Avatar Group',
  excludeStories: /^normalize/u,
  component: AvatarGroup,
  argTypes: {
    variant: {
      control: 'select',
      options: ['2-players', '3-players', '4-players', 'overflow', 'empty'],
    },
  },
} satisfies Meta<typeof AvatarGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

type StoryArgs = Readonly<{ overflow?: unknown; variant?: unknown }>;

export function normalizeAvatarGroupStoryArgs(args: StoryArgs): AvatarGroupProps {
  switch (args.variant) {
    case 'empty': return { onAddPlayer1: () => undefined, onAddPlayer2: () => undefined, variant: 'empty' };
    case '3-players': return { identities: [players[0], players[1], players[2]], variant: '3-players' };
    case '4-players': return { identities: players, variant: '4-players' };
    case 'overflow': return {
      identities: players,
      overflow: typeof args.overflow === 'number' && Number.isInteger(args.overflow) && args.overflow > 0
        ? args.overflow
        : 3,
      variant: 'overflow',
    };
    default: return { identities: [players[0], players[1]], variant: '2-players' };
  }
}

function recordProps(record: (typeof records)[number]): AvatarGroupProps {
  const content = record.normalizedTuple.content;
  const state = record.normalizedTuple.state;
  if (content === '2Slots' && state === 'empty') {
    return { onAddPlayer1: () => undefined, onAddPlayer2: () => undefined, variant: 'empty' };
  }
  if (content === '4Players' && state === 'overflow') {
    return { identities: players, overflow: 3, variant: 'overflow' };
  }
  if (content === '4Players') return { identities: players, variant: '4-players' };
  if (content === '3Players') {
    return { identities: [players[0], players[1], players[2]], variant: '3-players' };
  }
  return { identities: [players[0], players[1]], variant: '2-players' };
}

export const Canonical: Story = {
  args: { identities: [players[0], players[1]], variant: '2-players' },
  render: (args) => (
    <Stack gap="space8">
      <AvatarGroup {...normalizeAvatarGroupStoryArgs(args)} />
      <Text color="textSecondary" variant="caption">
        {sourceLabel(records[4].id)}
      </Text>
    </Stack>
  ),
};

export const Variants: Story = {
  args: Canonical.args,
  render: () => (
    <Stack gap="space16">
      {records.map((record) => (
        <Fragment key={record.id}>
          <AvatarGroup {...recordProps(record)} />
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
      <AvatarGroup identities={players} overflow={3} variant="overflow" />
      <AvatarGroup onAddPlayer1={() => undefined} onAddPlayer2={() => undefined} variant="empty" />
    </Stack>
  ),
};

export const Boundaries: Story = {
  args: Canonical.args,
  render: () => (
    <Stack gap="space8" style={{ width: 200 }}>
      <AvatarGroup
        identities={[
          { initials: 'ŁN', name: 'Łucía Nguyễn from 東京', presence: 'online' },
          players[1],
        ]}
        variant="2-players"
      />
      <Text color="textSecondary" maxFontSizeMultiplier={2} variant="caption">
        Full ordered group names remain available. Native 200% font-scale review remains a Phase 5 backstop.
      </Text>
    </Stack>
  ),
};

export const Interactive: Story = {
  args: {
    onAddPlayer1: () => undefined,
    onAddPlayer2: () => undefined,
    variant: 'empty',
  },
  render: () => (
    <AvatarGroup
      onAddPlayer1={() => undefined}
      onAddPlayer2={() => undefined}
      variant="empty"
    />
  ),
};
