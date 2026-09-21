import type { Meta, StoryObj } from '@storybook/react-native';
import { Fragment, useState } from 'react';

import { Stack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { phase4Families, phase4SourceIdentity } from '../phase4SourceRegistry';
import {
  PlayerItem,
  type PlayerItemIdentity,
  type PlayerItemProps,
} from './PlayerItem';

const records = phase4Families[5].records;
const player = {
  initials: 'AM',
  name: 'Alex Morgan',
  presence: 'away',
  supportingText: 'Intermediate · Rating 4.6',
} as const satisfies PlayerItemIdentity;

const sourceLabel = (recordId: string) =>
  `Penpot ${phase4SourceIdentity.fileId} / ${phase4SourceIdentity.pageId} / revision ${phase4SourceIdentity.revision} / set 482a7222-5a3b-8086-8008-a60fd2e43204 / record ${recordId}`;

const meta = {
  title: 'Content/Player Item',
  component: PlayerItem,
  argTypes: {
    variant: {
      control: 'select',
      options: ['list', 'game-slot', 'empty-game-slot', 'invite-result'],
    },
    selected: { control: 'boolean' },
    disabled: { control: 'boolean' },
    onSelectedChange: { action: 'selection changed' },
    onViewPlayer: { action: 'view player' },
    onInvite: { action: 'invite player' },
  },
} satisfies Meta<typeof PlayerItem>;

export default meta;
type Story = StoryObj<typeof meta>;

type StoryArgs = Readonly<{
  disabled?: unknown;
  onInvite?: unknown;
  onSelectedChange?: unknown;
  onViewPlayer?: unknown;
  selected?: unknown;
  variant?: unknown;
}>;

export function normalizePlayerItemStoryArgs(args: StoryArgs): PlayerItemProps {
  const onInvite = typeof args.onInvite === 'function' ? args.onInvite as () => void : () => undefined;
  const onSelectedChange = typeof args.onSelectedChange === 'function'
    ? args.onSelectedChange as (selected: boolean) => void
    : () => undefined;
  const onViewPlayer = typeof args.onViewPlayer === 'function'
    ? args.onViewPlayer as () => void
    : () => undefined;
  switch (args.variant) {
    case 'empty-game-slot': return { onInvite, variant: 'empty-game-slot' };
    case 'game-slot': return {
      identity: { ...player, supportingText: 'Confirmed · Intermediate' },
      onViewPlayer,
      variant: 'game-slot',
    };
    case 'invite-result': return args.disabled === true
      ? { disabled: true, identity: player, onInvite, variant: 'invite-result' }
      : { disabled: false, identity: player, onInvite, variant: 'invite-result' };
    default: return {
      identity: player,
      onSelectedChange,
      selected: args.selected === true,
      variant: 'list',
    };
  }
}

function recordProps(record: (typeof records)[number]): PlayerItemProps {
  const { state, type } = record.normalizedTuple;
  if (type === 'gameSlot' && state === 'empty') {
    return { onInvite: () => undefined, variant: 'empty-game-slot' };
  }
  if (type === 'gameSlot') {
    return {
      identity: { ...player, supportingText: 'Confirmed · Intermediate' },
      onViewPlayer: () => undefined,
      variant: 'game-slot',
    };
  }
  if (type === 'inviteResult') {
    return state === 'disabled'
      ? { disabled: true, identity: player, variant: 'invite-result' }
      : { disabled: false, identity: player, onInvite: () => undefined, variant: 'invite-result' };
  }
  return {
    identity: player,
    onSelectedChange: () => undefined,
    selected: state === 'selected',
    variant: 'list',
  };
}

export const Canonical: Story = {
  args: {
    identity: player,
    onSelectedChange: () => undefined,
    selected: false,
    variant: 'list',
  },
  render: (args) => (
    <Stack gap="space8">
      <PlayerItem {...normalizePlayerItemStoryArgs(args)} />
      <Text color="textSecondary" variant="caption">{sourceLabel(records[5].id)}</Text>
    </Stack>
  ),
};

export const Variants: Story = {
  args: Canonical.args,
  render: () => (
    <Stack gap="space12">
      {records.map((record) => (
        <Fragment key={record.id}>
          <PlayerItem {...recordProps(record)} />
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
    <Stack gap="space12">
      <PlayerItem identity={player} onSelectedChange={() => undefined} selected variant="list" />
      <PlayerItem disabled identity={player} variant="invite-result" />
      <PlayerItem onInvite={() => undefined} variant="empty-game-slot" />
    </Stack>
  ),
};

export const Boundaries: Story = {
  args: Canonical.args,
  render: () => (
    <Stack gap="space8" style={{ width: 328 }}>
      <PlayerItem
        identity={{
          initials: 'ŁN',
          name: 'Łucía Nguyễn from 東京',
          presence: 'away',
          supportingText: 'Intermediate player with a deliberately long supporting description',
        }}
        onViewPlayer={() => undefined}
        variant="game-slot"
      />
      <Text color="textSecondary" maxFontSizeMultiplier={2} variant="caption">
        Full Unicode semantics remain available. Native 200% font-scale review remains a Phase 5 backstop.
      </Text>
    </Stack>
  ),
};

function InteractiveHarness(props: Readonly<{ onSelectedChange?: (selected: boolean) => void }>) {
  const [selected, setSelected] = useState(false);
  return (
    <PlayerItem
      identity={player}
      onSelectedChange={(next) => {
        setSelected(next);
        props.onSelectedChange?.(next);
      }}
      selected={selected}
      variant="list"
    />
  );
}

export const Interactive: Story = {
  args: Canonical.args,
  render: (args) => (
    <InteractiveHarness
      onSelectedChange={'onSelectedChange' in args ? args.onSelectedChange : undefined}
    />
  ),
};
