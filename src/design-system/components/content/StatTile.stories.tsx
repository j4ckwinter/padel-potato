import type { Meta, StoryObj } from '@storybook/react-native';
import { Fragment } from 'react';

import { Stack } from '../../primitives/Stack';
import { Text } from '../../primitives/Text';
import { phase4Families, phase4SourceIdentity } from '../phase4SourceRegistry';
import { StatTile, type StatTileProps } from './StatTile';

const records = phase4Families[9].records;

const sourceLabel = (recordId: string) =>
  `Penpot ${phase4SourceIdentity.fileId} / ${phase4SourceIdentity.pageId} / revision ${phase4SourceIdentity.revision} / set 482a7222-5a3b-8086-8008-a61bebc50714 / record ${recordId}`;

const meta = {
  title: 'Content/Stat Tile',
  component: StatTile,
  argTypes: {
    type: { control: 'select', options: ['compact', 'featured'] },
    content: { control: 'select', options: ['gamesPlayed', 'winRate', 'rating', 'streak'] },
    state: { control: 'select', options: ['neutral', 'positive'] },
  },
} satisfies Meta<typeof StatTile>;

export default meta;
type Story = StoryObj<typeof meta>;

type StoryArgs = Readonly<{
  content?: unknown;
  label?: unknown;
  state?: unknown;
  supportingText?: unknown;
  type?: unknown;
  value?: unknown;
}>;

const copy = (args: StoryArgs) => ({
  label: typeof args.label === 'string' && args.label.trim() ? args.label : 'Win rate',
  supportingText: typeof args.supportingText === 'string' && args.supportingText.trim()
    ? args.supportingText
    : '+8% this month',
  value: typeof args.value === 'string' && args.value.trim() ? args.value : '68%',
});

export function normalizeStatTileStoryArgs(args: StoryArgs): StatTileProps {
  const nextCopy = copy(args);
  const tuple = `${String(args.type)}/${String(args.content)}/${String(args.state)}`;
  switch (tuple) {
    case 'compact/gamesPlayed/neutral': return { ...nextCopy, content: 'gamesPlayed', state: 'neutral', type: 'compact' };
    case 'compact/rating/neutral': return { ...nextCopy, content: 'rating', state: 'neutral', type: 'compact' };
    case 'compact/streak/positive': return { ...nextCopy, content: 'streak', state: 'positive', type: 'compact' };
    case 'featured/rating/positive': return { ...nextCopy, content: 'rating', state: 'positive', type: 'featured' };
    case 'featured/streak/positive': return { ...nextCopy, content: 'streak', state: 'positive', type: 'featured' };
    default: return { ...nextCopy, content: 'winRate', state: 'positive', type: 'compact' };
  }
}

function recordProps(record: (typeof records)[number]): StatTileProps {
  const [label, value, supportingText] = record.metrics.typography.map(({ text }) => text);
  return normalizeStatTileStoryArgs({
    ...record.normalizedTuple,
    label,
    supportingText,
    value,
  });
}

export const Canonical: Story = {
  args: recordProps(records[4]),
  render: (args) => (
    <Stack gap="space8">
      <StatTile {...normalizeStatTileStoryArgs(args)} />
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
          <StatTile {...recordProps(record)} />
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
      <StatTile {...recordProps(records[5])} />
      <StatTile {...recordProps(records[4])} />
    </Stack>
  ),
};

export const Boundaries: Story = {
  args: Canonical.args,
  render: () => (
    <Stack gap="space8" style={{ width: 328 }}>
      <StatTile
        content="rating"
        label="International tournament rating for Łucía Nguyễn"
        state="positive"
        supportingText="Top 18% of players from 東京 and beyond"
        type="featured"
        value="4.6000000000000000"
      />
      <Text color="textSecondary" maxFontSizeMultiplier={2} variant="caption">
        Full accessible statistic retained. Native 200% font-scale review remains a Phase 5 backstop.
      </Text>
    </Stack>
  ),
};

export const Interactive: Story = {
  args: Canonical.args,
  parameters: {
    applicability: 'Interactive is inapplicable: Stat Tile is a presentational summary with no callbacks.',
  },
  render: (args) => (
    <Stack gap="space8">
      <StatTile {...normalizeStatTileStoryArgs(args)} />
      <Text color="textSecondary" variant="caption">
        Interactive is inapplicable because this family is presentational.
      </Text>
    </Stack>
  ),
};
