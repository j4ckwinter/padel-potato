import type { Meta, StoryObj } from '@storybook/react-native';
import { Fragment } from 'react';

import { Stack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { gameCardFixtures } from '../../stories/fixtures';
import {
  GameCard,
  type GameCardParticipant,
  type GameCardProps,
} from './GameCard';

const fixtures = gameCardFixtures;
const participants = [
  { initials: 'AM', name: 'Alex Morgan', presence: 'online', slot: 1 },
  { initials: 'JT', name: 'Jamie Taylor', presence: 'online', slot: 2 },
  { initials: 'SK', name: 'Sam Kim', presence: 'online', slot: 3 },
  { initials: 'RB', name: 'Riley Brown', presence: 'online', slot: 4 },
] as const satisfies readonly GameCardParticipant[];
const content = {
  time: '18:30 · 90 min',
  title: 'Tuesday Social Padel',
  venue: 'Padel United · Court 3',
} as const;

type StoryArgs = Readonly<{
  configuration?: unknown;
  onInvitePlayers?: unknown;
  onShareGame?: unknown;
  onViewGame?: unknown;
  onViewResults?: unknown;
  time?: unknown;
  title?: unknown;
  venue?: unknown;
}>;

export const gameCardStoryConfigurations = Object.freeze(
  fixtures.map(
    ({ configuration }) => `${configuration.type}/${configuration.state}`,
  ),
);

const meta = {
  title: 'Content/Game Card',
  excludeStories: /(?:^normalize|Configurations$)/u,
  argTypes: {
    configuration: { control: 'select', options: gameCardStoryConfigurations },
    onInvitePlayers: { action: 'invite players' },
    onShareGame: { action: 'share game' },
    onViewGame: { action: 'view game' },
    onViewResults: { action: 'view results' },
  },
  parameters: { controls: { include: ['configuration'] } },
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<StoryArgs>;

export function normalizeGameCardStoryArgs(args: StoryArgs): GameCardProps {
  const title =
    typeof args.title === 'string' && args.title.trim()
      ? args.title
      : content.title;
  const venue =
    typeof args.venue === 'string' && args.venue.trim()
      ? args.venue
      : content.venue;
  const time =
    typeof args.time === 'string' && args.time.trim()
      ? args.time
      : content.time;
  const onViewGame =
    typeof args.onViewGame === 'function'
      ? (args.onViewGame as () => void)
      : () => undefined;
  const onViewResults =
    typeof args.onViewResults === 'function'
      ? (args.onViewResults as () => void)
      : () => undefined;
  const onInvitePlayers =
    typeof args.onInvitePlayers === 'function'
      ? (args.onInvitePlayers as () => void)
      : () => undefined;
  const onShareGame =
    typeof args.onShareGame === 'function'
      ? (args.onShareGame as () => void)
      : () => undefined;
  switch (args.configuration) {
    case 'compact/default':
      return { title, venue, variant: 'compact' };
    case 'completed/default':
      return {
        onViewResults,
        participants,
        time,
        title,
        variant: 'completed',
        venue,
      };
    case 'open/full':
      return {
        full: true,
        onViewGame,
        participants,
        time,
        title,
        variant: 'open',
        venue,
      };
    case 'open/default':
      return {
        full: false,
        onViewGame,
        participants: [participants[0], participants[1], participants[2]],
        time,
        title,
        variant: 'open',
        venue,
      };
    case 'next/default':
      return { onViewGame, participants, time, title, variant: 'next', venue };
    case 'illustrated/gameCreated':
      return {
        detailPrimary: 'Your court is booked and',
        detailSecondary: 'ready to share.',
        eyebrow: 'Success',
        illustration: 'gameCreated',
        onShareGame,
        participants: [participants[0], participants[1]],
        title: 'Game created!',
        variant: 'illustrated',
      };
    case 'illustrated/invitePlayers':
      return {
        detailPrimary: 'Share this game and fill',
        detailSecondary: 'the remaining player slots.',
        eyebrow: 'Players',
        illustration: 'invitePlayers',
        onInvitePlayers,
        participants: [participants[0], participants[1]],
        title: 'Bring your crew',
        variant: 'illustrated',
      };
    case 'illustrated/matchWon':
      return {
        detailPrimary: 'You won 6\u20134, 6\u20133',
        detailSecondary: 'View scores and highlights',
        eyebrow: 'You won',
        illustration: 'matchWon',
        onViewResults,
        participants,
        title: 'Great match!',
        variant: 'illustrated',
      };
    case 'illustrated/matchLost':
      return {
        detailPrimary: 'You lost 4\u20136, 3\u20136',
        detailSecondary: 'View the final score',
        eyebrow: 'You lost',
        illustration: 'matchLost',
        onViewResults,
        participants,
        title: 'Tuesday Social Padel',
        variant: 'illustrated',
      };
    case 'illustrated/nextGame':
      return {
        detailPrimary: venue,
        detailSecondary: time,
        eyebrow: 'Your next game',
        illustration: 'nextGame',
        onViewGame,
        participants,
        title,
        variant: 'illustrated',
      };
    default:
      throw new Error(
        `Unsupported Game Card story configuration: ${String(args.configuration)}.`,
      );
  }
}

function fixtureProps(fixture: (typeof fixtures)[number]): GameCardProps {
  const { state, type } = fixture.configuration;
  if (type === 'illustrated') {
    return normalizeGameCardStoryArgs({ configuration: `${type}/${state}` });
  }
  if (type === 'compact')
    return { title: content.title, venue: content.venue, variant: 'compact' };
  if (type === 'completed') {
    return {
      ...content,
      onViewResults: () => undefined,
      participants,
      variant: 'completed',
    };
  }
  if (type === 'open') {
    return state === 'full'
      ? {
          ...content,
          full: true,
          onViewGame: () => undefined,
          participants,
          variant: 'open',
        }
      : {
          ...content,
          full: false,
          onViewGame: () => undefined,
          participants: [participants[0], participants[1], participants[2]],
          variant: 'open',
        };
  }
  return {
    ...content,
    onViewGame: () => undefined,
    participants,
    variant: 'next',
  };
}

export const Canonical: Story = {
  args: {
    ...content,
    configuration: 'next/default',
    onViewGame: () => undefined,
  },
  render: (args) => (
    <Stack gap="space8">
      <GameCard {...normalizeGameCardStoryArgs(args)} />
      <Text color="textSecondary" variant="caption">
        {fixtures[4].label}
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
          <GameCard {...fixtureProps(fixture)} />
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
      <GameCard {...fixtureProps(fixtures[3])} />
      <GameCard {...fixtureProps(fixtures[0])} />
      <GameCard {...fixtureProps(fixtures[1])} />
    </Stack>
  ),
};

export const Boundaries: Story = {
  args: Canonical.args,
  render: () => (
    <Stack gap="space8" width="content">
      <GameCard
        onViewGame={() => undefined}
        participants={participants}
        time="18:30 · 90 min"
        title="Tuesday Social Padel for Łucía, Nguyễn, and friends from 東京"
        variant="next"
        venue="Padel United International Centre · The exceptionally long Court 3 name"
      />
      <Text color="textSecondary" maxFontSizeMultiplier={2} variant="caption">
        Full title and venue semantics remain available. Native 200% font-scale
        review requires native Storybook review.
      </Text>
    </Stack>
  ),
};

export const Interactive: Story = {
  args: { ...content, configuration: 'next/default' },
  parameters: { controls: { include: ['onViewGame'] } },
  render: (args) => <GameCard {...normalizeGameCardStoryArgs(args)} />,
};

export const ViewResultsInteraction: Story = {
  args: { ...content, configuration: 'completed/default' },
  parameters: { controls: { include: ['onViewResults'] } },
  render: (args) => <GameCard {...normalizeGameCardStoryArgs(args)} />,
};
