import type { Meta, StoryObj } from '@storybook/react-native';
import { Fragment } from 'react';

import { Stack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { phase4Families, phase4SourceIdentity } from '../phase4SourceRegistry';
import {
  ScoreResultBlock,
  type ScoreResultBlockProps,
  type ScoreResultTeam,
} from './ScoreResultBlock';

const records = phase4Families[10].records;
const winningTeams = [
  { initials: 'AM', name: 'Alex & Jamie', scores: ['6', '6'] },
  { initials: 'RB', name: 'Riley & Sam', scores: ['4', '3'] },
] as const satisfies readonly [ScoreResultTeam, ScoreResultTeam];
const losingTeams = [
  { initials: 'AM', name: 'Alex & Jamie', scores: ['4', '3'] },
  { initials: 'RB', name: 'Riley & Sam', scores: ['6', '6'] },
] as const satisfies readonly [ScoreResultTeam, ScoreResultTeam];

const sourceLabel = (recordId: string) =>
  `Penpot ${phase4SourceIdentity.fileId} / ${phase4SourceIdentity.pageId} / revision ${phase4SourceIdentity.revision} / set 482a7222-5a3b-8086-8008-a61c4979950c / record ${recordId}`;

const meta = {
  title: 'Content/Score Result Block',
  excludeStories: /^normalize/u,
  component: ScoreResultBlock,
  argTypes: {
    type: { control: 'select', options: ['compact', 'full'] },
    state: { control: 'select', options: ['won', 'lost', 'live'] },
  },
} satisfies Meta<typeof ScoreResultBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

type StoryArgs = Readonly<{
  liveNote?: unknown;
  state?: unknown;
  teams?: unknown;
  title?: unknown;
  type?: unknown;
}>;

export function normalizeScoreResultBlockStoryArgs(args: StoryArgs): ScoreResultBlockProps {
  const type = args.type === 'full' ? 'full' : 'compact';
  const state = args.state === 'lost' || args.state === 'live' ? args.state : 'won';
  const teams: readonly [ScoreResultTeam, ScoreResultTeam] = args.teams === losingTeams
    ? losingTeams
    : winningTeams;
  const title = typeof args.title === 'string' && args.title.trim()
    ? args.title
    : 'Tuesday Social Padel';
  const liveNote = typeof args.liveNote === 'string' && args.liveNote.trim()
    ? args.liveNote
    : 'Set 2 in progress';

  if (type === 'full') {
    return state === 'live'
      ? { liveNote, state, teams, title, type }
      : { state, teams, title, type };
  }
  return state === 'live'
    ? { liveNote, state, teams, type }
    : { state, teams, type };
}

function recordProps(record: (typeof records)[number]): ScoreResultBlockProps {
  const { state, type } = record.normalizedTuple;
  return normalizeScoreResultBlockStoryArgs({
    liveNote: 'Set 2 in progress',
    state,
    teams: state === 'lost' ? losingTeams : winningTeams,
    title: 'Tuesday Social Padel',
    type,
  });
}

export const Canonical: Story = {
  args: recordProps(records[5]),
  render: (args) => (
    <Stack gap="space8">
      <ScoreResultBlock {...normalizeScoreResultBlockStoryArgs(args)} />
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
          <ScoreResultBlock {...recordProps(record)} />
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
      <ScoreResultBlock {...recordProps(records[5])} />
      <ScoreResultBlock {...recordProps(records[4])} />
      <ScoreResultBlock {...recordProps(records[3])} />
    </Stack>
  ),
};

export const Boundaries: Story = {
  args: Canonical.args,
  render: () => (
    <Stack gap="space8" style={{ width: 352 }}>
      <ScoreResultBlock
        state="won"
        teams={[
          { initials: 'ŁN', name: 'Łucía Nguyễn & 東京', scores: ['6.000', '0006'] },
          { initials: 'RS', name: 'Riley & Sam with a very long team name', scores: ['04', '3.0'] },
        ]}
        type="compact"
      />
      <Text color="textSecondary" maxFontSizeMultiplier={2} variant="caption">
        Caller-formatted score text and aggregate reading order remain unchanged. Native 200% font-scale review remains Phase 5.
      </Text>
    </Stack>
  ),
};

export const Interactive: Story = {
  args: Canonical.args,
  parameters: {
    applicability: 'Interactive is inapplicable: Score Result Block is presentational and owns no callbacks or timers.',
  },
  render: (args) => (
    <Stack gap="space8">
      <ScoreResultBlock {...normalizeScoreResultBlockStoryArgs(args)} />
      <Text color="textSecondary" variant="caption">
        Interactive is inapplicable because result state and score text are caller supplied.
      </Text>
    </Stack>
  ),
};
