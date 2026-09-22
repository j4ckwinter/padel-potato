import type { Meta, StoryObj } from '@storybook/react-native';
import { Fragment, useState } from 'react';

import { Stack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { phase4Families } from '../../stories/componentFixtures';
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

const sourceLabel = (fixtureId: string) => `Fixture ${fixtureId}`;

type StoryArgs = Readonly<{
  configuration?: unknown;
  onInvite?: unknown;
  onSelectedChange?: unknown;
  onViewPlayer?: unknown;
}>;

export const playerItemStoryConfigurations = Object.freeze(
  records.map(({ normalizedTuple }) => (
    `${normalizedTuple.type}/${normalizedTuple.state}`
  )),
);

const meta = {
  title: 'Content/Player Item',
  excludeStories: /(?:^normalize|Configurations$)/u,
  argTypes: {
    configuration: { control: 'select', options: playerItemStoryConfigurations },
    onInvite: { action: 'invite player' },
    onSelectedChange: { action: 'selected changed' },
    onViewPlayer: { action: 'view player' },
  },
  parameters: { controls: { include: ['configuration'] } },
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<StoryArgs>;

export function normalizePlayerItemStoryArgs(args: StoryArgs): PlayerItemProps {
  const onInvite = typeof args.onInvite === 'function'
    ? args.onInvite as () => void
    : () => undefined;
  const onSelectedChange = typeof args.onSelectedChange === 'function'
    ? args.onSelectedChange as (selected: boolean) => void
    : () => undefined;
  const onViewPlayer = typeof args.onViewPlayer === 'function'
    ? args.onViewPlayer as () => void
    : () => undefined;
  switch (args.configuration) {
    case 'gameSlot/empty': return { onInvite, variant: 'empty-game-slot' };
    case 'gameSlot/default': return {
      identity: { ...player, supportingText: 'Confirmed · Intermediate' },
      onViewPlayer,
      variant: 'game-slot',
    };
    case 'inviteResult/default': return {
      disabled: false,
      identity: player,
      onInvite,
      variant: 'invite-result',
    };
    case 'inviteResult/disabled': return {
      disabled: true,
      identity: player,
      variant: 'invite-result',
    };
    case 'list/default':
    case 'list/selected': return {
      identity: player,
      onSelectedChange,
      selected: args.configuration === 'list/selected',
      variant: 'list',
    };
    default: throw new Error(`Unsupported Player Item story configuration: ${String(args.configuration)}.`);
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
    configuration: 'list/default',
    onSelectedChange: () => undefined,
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
    <Stack gap="space16">
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
    <Stack gap="space16">
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
  args: { configuration: 'list/default' },
  parameters: { controls: { include: ['onSelectedChange'] } },
  render: (args) => (
    <InteractiveHarness
      onSelectedChange={typeof args.onSelectedChange === 'function'
        ? args.onSelectedChange as (selected: boolean) => void
        : undefined}
    />
  ),
};

export const ViewPlayerInteraction: Story = {
  args: { configuration: 'gameSlot/default' },
  parameters: { controls: { include: ['onViewPlayer'] } },
  render: (args) => <PlayerItem {...normalizePlayerItemStoryArgs(args)} />,
};

export const InviteInteraction: Story = {
  args: { configuration: 'gameSlot/empty' },
  parameters: { controls: { include: ['onInvite'] } },
  render: (args) => <PlayerItem {...normalizePlayerItemStoryArgs(args)} />,
};
