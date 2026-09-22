import type { Meta, StoryObj } from '@storybook/react-native';
import { Fragment, useState } from 'react';

import { Stack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { phase4Families } from '../../stories/componentFixtures';
import { EmptyState, type EmptyStateProps } from './EmptyState';

const records = phase4Families[13].records;
const sourceLabel = (fixtureId: string) => `Fixture ${fixtureId}`;

const meta = {
  title: 'Feedback/Empty State',
  excludeStories: /^normalize/u,
  component: EmptyState,
  argTypes: {
    content: { control: 'select', options: ['noGames', 'noNotifications', 'noPlayers'] },
    onCreateGame: { action: 'create game', if: { arg: 'content', eq: 'noGames' } },
    onInvitePlayers: { action: 'invite players', if: { arg: 'content', eq: 'noPlayers' } },
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

type StoryArgs = Readonly<{
  content?: unknown;
  onCreateGame?: unknown;
  onInvitePlayers?: unknown;
}>;

export function normalizeEmptyStateStoryArgs(args: StoryArgs): EmptyStateProps {
  if (args.content === 'noNotifications') return { content: 'noNotifications' };
  if (args.content === 'noPlayers') {
    return {
      content: 'noPlayers',
      onInvitePlayers: typeof args.onInvitePlayers === 'function'
        ? args.onInvitePlayers as () => void
        : () => undefined,
    };
  }
  return {
    content: 'noGames',
    onCreateGame: typeof args.onCreateGame === 'function'
      ? args.onCreateGame as () => void
      : () => undefined,
  };
}

function recordProps(record: (typeof records)[number]): EmptyStateProps {
  switch (record.normalizedTuple.content) {
    case 'noNotifications': return { content: 'noNotifications' };
    case 'noPlayers': return { content: 'noPlayers', onInvitePlayers: () => undefined };
    default: return { content: 'noGames', onCreateGame: () => undefined };
  }
}

export const Canonical: Story = {
  args: { content: 'noGames', onCreateGame: () => undefined },
  render: (args) => (
    <Stack gap="space8">
      <EmptyState {...normalizeEmptyStateStoryArgs(args)} />
      <Text color="textSecondary" variant="caption">{sourceLabel(records[2].id)}</Text>
    </Stack>
  ),
};

export const Variants: Story = {
  args: Canonical.args,
  render: () => (
    <Stack gap="space16">
      {records.map((record) => (
        <Fragment key={record.id}>
          <EmptyState {...recordProps(record)} />
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
      {records.map((record) => <EmptyState key={record.id} {...recordProps(record)} />)}
    </Stack>
  ),
};

export const Boundaries: Story = {
  args: Canonical.args,
  render: () => (
    <Stack gap="space8" style={{ width: 352 }}>
      <EmptyState content="noGames" onCreateGame={() => undefined} />
      <Text color="textSecondary" maxFontSizeMultiplier={2} variant="caption">
        You don’t have any games scheduled yet. Create game remains reachable at 200% host scaling. Native measurement remains a Phase 5 backstop.
      </Text>
    </Stack>
  ),
};

function InteractiveEmptyStateHarness(props: EmptyStateProps) {
  const [activations, setActivations] = useState(0);
  const interactiveProps: EmptyStateProps = props.content === 'noGames'
    ? {
        content: props.content,
        onCreateGame: () => {
          setActivations((count) => count + 1);
          props.onCreateGame();
        },
      }
    : props.content === 'noPlayers'
      ? {
          content: props.content,
          onInvitePlayers: () => {
            setActivations((count) => count + 1);
            props.onInvitePlayers();
          },
        }
      : { content: props.content };
  return (
    <Stack gap="space8">
      <EmptyState {...interactiveProps} />
      <Text variant="body">{`Activations: ${activations}`}</Text>
    </Stack>
  );
}

export const Interactive: Story = {
  args: Canonical.args,
  render: (args) => <InteractiveEmptyStateHarness {...normalizeEmptyStateStoryArgs(args)} />,
};
