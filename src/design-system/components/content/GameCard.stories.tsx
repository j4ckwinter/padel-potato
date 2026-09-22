import type { Meta, StoryObj } from '@storybook/react-native';
import { Fragment } from 'react';

import { Stack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { phase4Families, phase4SourceIdentity } from '../phase4SourceRegistry';
import {
  GameCard,
  type GameCardParticipant,
  type GameCardProps,
} from './GameCard';

const records = phase4Families[6].records;
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

const sourceLabel = (recordId: string) =>
  `Penpot ${phase4SourceIdentity.fileId} / ${phase4SourceIdentity.pageId} / revision ${phase4SourceIdentity.revision} / set 482a7222-5a3b-8086-8008-a6100d35e8ef / record ${recordId}`;

type StoryArgs = Readonly<{
  configuration?: unknown;
  onViewGame?: unknown;
  onViewResults?: unknown;
  time?: unknown;
  title?: unknown;
  venue?: unknown;
}>;

export const gameCardStoryConfigurations = Object.freeze(
  records.map(({ normalizedTuple }) => (
    `${normalizedTuple.type}/${normalizedTuple.state}`
  )),
);

const meta = {
  title: 'Content/Game Card',
  excludeStories: /(?:^normalize|Configurations$)/u,
  argTypes: {
    configuration: { control: 'select', options: gameCardStoryConfigurations },
    onViewGame: { action: 'view game' },
    onViewResults: { action: 'view results' },
  },
  parameters: { controls: { include: ['configuration'] } },
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<StoryArgs>;

export function normalizeGameCardStoryArgs(args: StoryArgs): GameCardProps {
  const title = typeof args.title === 'string' && args.title.trim() ? args.title : content.title;
  const venue = typeof args.venue === 'string' && args.venue.trim() ? args.venue : content.venue;
  const time = typeof args.time === 'string' && args.time.trim() ? args.time : content.time;
  const onViewGame = typeof args.onViewGame === 'function'
    ? args.onViewGame as () => void
    : () => undefined;
  const onViewResults = typeof args.onViewResults === 'function'
    ? args.onViewResults as () => void
    : () => undefined;
  switch (args.configuration) {
    case 'compact/default': return { title, venue, variant: 'compact' };
    case 'completed/default': return { onViewResults, participants, time, title, variant: 'completed', venue };
    case 'open/full': return { full: true, onViewGame, participants, time, title, variant: 'open', venue };
    case 'open/default': return {
      full: false,
      onViewGame,
      participants: [participants[0], participants[1], participants[2]],
      time,
      title,
      variant: 'open',
      venue,
    };
    case 'next/default': return { onViewGame, participants, time, title, variant: 'next', venue };
    default: throw new Error(`Unsupported Game Card story configuration: ${String(args.configuration)}.`);
  }
}

function recordProps(record: (typeof records)[number]): GameCardProps {
  const { state, type } = record.normalizedTuple;
  if (type === 'compact') return { title: content.title, venue: content.venue, variant: 'compact' };
  if (type === 'completed') {
    return { ...content, onViewResults: () => undefined, participants, variant: 'completed' };
  }
  if (type === 'open') {
    return state === 'full'
      ? { ...content, full: true, onViewGame: () => undefined, participants, variant: 'open' }
      : {
          ...content,
          full: false,
          onViewGame: () => undefined,
          participants: [participants[0], participants[1], participants[2]],
          variant: 'open',
        };
  }
  return { ...content, onViewGame: () => undefined, participants, variant: 'next' };
}

export const Canonical: Story = {
  args: { ...content, configuration: 'next/default', onViewGame: () => undefined },
  render: (args) => (
    <Stack gap="space8">
      <GameCard {...normalizeGameCardStoryArgs(args)} />
      <Text color="textSecondary" variant="caption">{sourceLabel(records[4].id)}</Text>
    </Stack>
  ),
};

export const Variants: Story = {
  args: Canonical.args,
  render: () => (
    <Stack gap="space16">
      {records.map((record) => (
        <Fragment key={record.id}>
          <GameCard {...recordProps(record)} />
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
      <GameCard {...recordProps(records[3])} />
      <GameCard {...recordProps(records[0])} />
      <GameCard {...recordProps(records[1])} />
    </Stack>
  ),
};

export const Boundaries: Story = {
  args: Canonical.args,
  render: () => (
    <Stack gap="space8" style={{ width: 352 }}>
      <GameCard
        onViewGame={() => undefined}
        participants={participants}
        time="18:30 · 90 min"
        title="Tuesday Social Padel for Łucía, Nguyễn, and friends from 東京"
        variant="next"
        venue="Padel United International Centre · The exceptionally long Court 3 name"
      />
      <Text color="textSecondary" maxFontSizeMultiplier={2} variant="caption">
        Full title and venue semantics remain available. Native 200% font-scale review remains a Phase 5 backstop.
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
