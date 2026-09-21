import type { Meta, StoryObj } from '@storybook/react-native';
import { Fragment } from 'react';

import { Stack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { phase4Families, phase4SourceIdentity } from '../phase4SourceRegistry';
import {
  PlayerPreferencesCard,
  type PlayerPreferencesCardProps,
} from './PlayerPreferencesCard';

const records = phase4Families[11].records;
const values = {
  days: 'Mon–Sat',
  level: 'Intermediate',
  side: 'Either side',
  timeOfDay: 'Afternoons',
} as const;

const sourceLabel = (recordId: string) =>
  `Penpot ${phase4SourceIdentity.fileId} / ${phase4SourceIdentity.pageId} / revision ${phase4SourceIdentity.revision} / set ab02a31f-1852-80be-8008-a6fde66e54b7 / record ${recordId}`;

const meta = {
  title: 'Content/Player Preferences Card',
  component: PlayerPreferencesCard,
  argTypes: {
    content: { control: 'select', options: ['full', 'profile'] },
  },
} satisfies Meta<typeof PlayerPreferencesCard>;

export default meta;
type Story = StoryObj<typeof meta>;

type StoryArgs = Readonly<{
  content?: unknown;
  days?: unknown;
  level?: unknown;
  side?: unknown;
  timeOfDay?: unknown;
}>;

const normalizedText = (value: unknown, fallback: string) =>
  typeof value === 'string' && value.trim() ? value : fallback;

export function normalizePlayerPreferencesCardStoryArgs(args: StoryArgs): PlayerPreferencesCardProps {
  const shared = {
    days: normalizedText(args.days, values.days),
    side: normalizedText(args.side, values.side),
    timeOfDay: normalizedText(args.timeOfDay, values.timeOfDay),
  };
  return args.content === 'profile'
    ? { ...shared, content: 'profile' }
    : { ...shared, content: 'full', level: normalizedText(args.level, values.level) };
}

function recordProps(record: (typeof records)[number]): PlayerPreferencesCardProps {
  return normalizePlayerPreferencesCardStoryArgs({
    ...values,
    content: record.normalizedTuple.content,
  });
}

export const Canonical: Story = {
  args: recordProps(records[1]),
  render: (args) => (
    <Stack gap="space8">
      <PlayerPreferencesCard {...normalizePlayerPreferencesCardStoryArgs(args)} />
      <Text color="textSecondary" variant="caption">{sourceLabel(records[1].id)}</Text>
    </Stack>
  ),
};

export const Variants: Story = {
  args: Canonical.args,
  render: () => (
    <Stack gap="space16">
      {records.map((record) => (
        <Fragment key={record.id}>
          <PlayerPreferencesCard {...recordProps(record)} />
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
      <PlayerPreferencesCard {...recordProps(records[0])} />
      <PlayerPreferencesCard {...recordProps(records[1])} />
    </Stack>
  ),
};

export const Boundaries: Story = {
  args: Canonical.args,
  render: () => (
    <Stack gap="space8" style={{ width: 350 }}>
      <PlayerPreferencesCard
        content="full"
        days="Monday through Saturday across 東京 holidays"
        level="International advanced level for Łucía Nguyễn"
        side="Either side of the court with a long preference"
        timeOfDay="Late afternoons and early evenings"
      />
      <Text color="textSecondary" maxFontSizeMultiplier={2} variant="caption">
        Full preference semantics remain available. Native 200% font-scale review remains a Phase 5 backstop.
      </Text>
    </Stack>
  ),
};

export const Interactive: Story = {
  args: Canonical.args,
  parameters: {
    applicability: 'Interactive is inapplicable: Player Preferences Card composes only static Status Chips.',
  },
  render: (args) => (
    <Stack gap="space8">
      <PlayerPreferencesCard {...normalizePlayerPreferencesCardStoryArgs(args)} />
      <Text color="textSecondary" variant="caption">
        Interactive is inapplicable because the composed preference chips are static text.
      </Text>
    </Stack>
  ),
};
