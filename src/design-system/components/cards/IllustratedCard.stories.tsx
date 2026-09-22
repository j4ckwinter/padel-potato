import type { Meta, StoryObj } from '@storybook/react-native';
import { Fragment, useState } from 'react';

import { Stack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { phase4Families } from '../../stories/componentFixtures';
import {
  IllustratedCard,
  type IllustratedCardParticipant,
  type IllustratedCardProps,
} from './IllustratedCard';

const records = phase4Families[14].records;
const participants = [
  { initials: 'AM', name: 'Alex Morgan', slot: 1 },
  { initials: 'JT', name: 'Jamie Taylor', slot: 2 },
  { initials: 'SK', name: 'Sam Kim', slot: 3 },
  { initials: 'RB', name: 'Riley Brown', slot: 4 },
] as const satisfies readonly IllustratedCardParticipant[];
const sourceLabel = (fixtureId: string) => `Fixture ${fixtureId}`;

const meta = {
  title: 'Cards/Illustrated Card',
  excludeStories: /^normalize/u,
  component: IllustratedCard,
  argTypes: {
    type: { control: 'select', options: ['gameCreated', 'invitePlayers', 'matchResult', 'nextGame'] },
    onInvitePlayers: { action: 'invite players', if: { arg: 'type', eq: 'invitePlayers' } },
    onShareGame: { action: 'share game', if: { arg: 'type', eq: 'gameCreated' } },
    onViewGame: { action: 'view game', if: { arg: 'type', eq: 'nextGame' } },
    onViewResults: { action: 'view results', if: { arg: 'type', eq: 'matchResult' } },
  },
} satisfies Meta<typeof IllustratedCard>;

export default meta;
type Story = StoryObj<typeof meta>;
type StoryArgs = Readonly<{ type?: unknown }> & Partial<Record<
  'onInvitePlayers' | 'onShareGame' | 'onViewGame' | 'onViewResults',
  unknown
>>;

const callback = (value: unknown) => typeof value === 'function'
  ? value as () => void
  : () => undefined;

export function normalizeIllustratedCardStoryArgs(args: StoryArgs): IllustratedCardProps {
  switch (args.type) {
    case 'gameCreated': return {
      detailPrimary: 'Your court is booked and',
      detailSecondary: 'ready to share.',
      eyebrow: 'Success',
      onShareGame: callback(args.onShareGame),
      participants: [participants[0], participants[1]],
      title: 'Game created!',
      type: 'gameCreated',
    };
    case 'invitePlayers': return {
      detailPrimary: 'Share this game and fill',
      detailSecondary: 'the remaining player slots.',
      eyebrow: 'Players',
      onInvitePlayers: callback(args.onInvitePlayers),
      participants: [participants[0], participants[1]],
      title: 'Bring your crew',
      type: 'invitePlayers',
    };
    case 'matchResult': return {
      detailPrimary: 'You won 6\u20134, 6\u20133',
      detailSecondary: 'View scores and highlights',
      eyebrow: 'Completed',
      onViewResults: callback(args.onViewResults),
      participants,
      title: 'Great match!',
      type: 'matchResult',
    };
    default: return {
      detailPrimary: 'Padel United \u00b7 Court 3',
      detailSecondary: '18:30 \u00b7 90 min',
      eyebrow: 'Your next game',
      onViewGame: callback(args.onViewGame),
      participants,
      title: 'Tuesday Social Padel',
      type: 'nextGame',
    };
  }
}

function recordProps(record: (typeof records)[number]): IllustratedCardProps {
  return normalizeIllustratedCardStoryArgs({ type: record.normalizedTuple.type });
}

export const Canonical: Story = {
  args: normalizeIllustratedCardStoryArgs({ type: 'nextGame' }),
  render: (args) => (
    <Stack gap="space8">
      <IllustratedCard {...normalizeIllustratedCardStoryArgs(args)} />
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
          <IllustratedCard {...recordProps(record)} />
          <Text color="textSecondary" variant="caption">
            {`${Object.values(record.originalTuple).join(' / ')} \u00b7 ${record.id}`}
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
      {records.map((record) => <IllustratedCard key={record.id} {...recordProps(record)} />)}
    </Stack>
  ),
};

export const Boundaries: Story = {
  args: Canonical.args,
  render: () => (
    <Stack gap="space8" style={{ width: 352 }}>
      <IllustratedCard
        detailPrimary="Padel United International Centre \u00b7 The exceptionally long Court 3 name"
        detailSecondary="18:30 \u00b7 90 minutes with arrival and access instructions"
        eyebrow="Your next game"
        onViewGame={() => undefined}
        participants={participants}
        title="Tuesday Social Padel for \u0141uc\u00eda, Nguy\u1ec5n, and friends from \u6771\u4eac"
        type="nextGame"
      />
      <Text color="textSecondary" maxFontSizeMultiplier={2} variant="caption">
        View game remains reachable at 200% host scaling. Invite and Game created preserve the authored two-player partial participant state; arbitrary partial participant arrays are rejected. Native measurement remains a Phase 5 backstop.
      </Text>
    </Stack>
  ),
};

function InteractiveIllustratedCardHarness(props: IllustratedCardProps) {
  const [activations, setActivations] = useState(0);
  const record = normalizeIllustratedCardStoryArgs({ type: props.type });
  const track = (intent: () => void) => () => {
    setActivations((count) => count + 1);
    intent();
  };
  const tracked: IllustratedCardProps = record.type === 'nextGame'
    ? { ...record, onViewGame: track(props.type === 'nextGame' ? props.onViewGame : () => undefined) }
    : record.type === 'matchResult'
      ? { ...record, onViewResults: track(props.type === 'matchResult' ? props.onViewResults : () => undefined) }
      : record.type === 'invitePlayers'
        ? { ...record, onInvitePlayers: track(props.type === 'invitePlayers' ? props.onInvitePlayers : () => undefined) }
        : { ...record, onShareGame: track(props.type === 'gameCreated' ? props.onShareGame : () => undefined) };
  return (
    <Stack gap="space8">
      <IllustratedCard {...tracked} />
      <Text variant="body">{`Activations: ${activations}`}</Text>
    </Stack>
  );
}

export const Interactive: Story = {
  args: Canonical.args,
  render: (args) => (
    <InteractiveIllustratedCardHarness {...normalizeIllustratedCardStoryArgs(args)} />
  ),
};
