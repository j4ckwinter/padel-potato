import { describe, expect, it, jest } from '@jest/globals';

import { flattenedStyle, invalidProps } from './helpers/componentTest';

import { render, userEvent } from '@testing-library/react-native';

import { StyleSheet } from 'react-native';

import GameCardStories, {
  Boundaries as GameCardBoundaries,
  Canonical as GameCardCanonical,
  Interactive as GameCardInteractive,
  States as GameCardStates,
  Variants as GameCardVariants,
} from '../src/design-system/components/content/GameCard.stories';

import {
  GameCard,
  type GameCardParticipant,
  type GameCardProps,
} from '../src/design-system/components/content/GameCard';

import NotificationRowStories, {
  Boundaries as NotificationRowBoundaries,
  Canonical as NotificationRowCanonical,
  Interactive as NotificationRowInteractive,
  States as NotificationRowStates,
  Variants as NotificationRowVariants,
} from '../src/design-system/components/content/NotificationRow.stories';

import {
  NotificationRow,
  type NotificationRowProps,
} from '../src/design-system/components/content/NotificationRow';

import PlayerPreferencesCardStories, {
  Boundaries as PlayerPreferencesCardBoundaries,
  Canonical as PlayerPreferencesCardCanonical,
  Interactive as PlayerPreferencesCardInteractive,
  States as PlayerPreferencesCardStates,
  Variants as PlayerPreferencesCardVariants,
} from '../src/design-system/components/content/PlayerPreferencesCard.stories';

import {
  PlayerPreferencesCard,
  type PlayerPreferencesCardProps,
} from '../src/design-system/components/content/PlayerPreferencesCard';

import SettingsRowStories, {
  Boundaries as SettingsRowBoundaries,
  Canonical as SettingsRowCanonical,
  Interactive as SettingsRowInteractive,
  States as SettingsRowStates,
  Variants as SettingsRowVariants,
} from '../src/design-system/components/content/SettingsRow.stories';

import {
  SettingsRow,
  type SettingsRowProps,
} from '../src/design-system/components/content/SettingsRow';

import ScoreResultBlockStories, {
  Boundaries as ScoreResultBlockBoundaries,
  Canonical as ScoreResultBlockCanonical,
  Interactive as ScoreResultBlockInteractive,
  States as ScoreResultBlockStates,
  Variants as ScoreResultBlockVariants,
} from '../src/design-system/components/content/ScoreResultBlock.stories';

import {
  ScoreResultBlock,
  type ScoreResultBlockProps,
  type ScoreResultTeam,
} from '../src/design-system/components/content/ScoreResultBlock';

import StatTileStories, {
  Boundaries as StatTileBoundaries,
  Canonical as StatTileCanonical,
  Interactive as StatTileInteractive,
  States as StatTileStates,
  Variants as StatTileVariants,
} from '../src/design-system/components/content/StatTile.stories';

import {
  StatTile,
  type StatTileProps,
} from '../src/design-system/components/content/StatTile';

import PlayerItemStories, {
  Boundaries as PlayerItemBoundaries,
  Canonical as PlayerItemCanonical,
  Interactive as PlayerItemInteractive,
  States as PlayerItemStates,
  Variants as PlayerItemVariants,
} from '../src/design-system/components/content/PlayerItem.stories';

import {
  PlayerItem,
  type PlayerItemIdentity,
  type PlayerItemProps,
} from '../src/design-system/components/content/PlayerItem';

import {
  playerItemFixtures,
  gameCardFixtures,
  notificationRowFixtures,
  settingsRowFixtures,
  statTileFixtures,
  scoreResultBlockFixtures,
  playerPreferencesCardFixtures,
} from '../src/design-system/stories/fixtures';

import * as ContentComponents from '../src/design-system/components/content';

import { colors } from '../src/design-system/tokens';

const statContent = {
  label: 'Win rate',
  supportingText: '+8% this month',
  value: '68%',
} as const;

describe('Stat Tile public contract', () => {});

describe('Stat Tile runtime and semantic contract', () => {
  it.each([
    [
      'compact/games played/neutral',
      {
        ...statContent,
        content: 'gamesPlayed',
        label: 'Games played',
        state: 'neutral',
        supportingText: 'All time',
        type: 'compact',
        value: '24',
      },
    ],
    [
      'compact/win rate/positive',
      {
        ...statContent,
        content: 'winRate',
        state: 'positive',
        type: 'compact',
      },
    ],
    [
      'compact/rating/neutral',
      {
        ...statContent,
        content: 'rating',
        label: 'Rating',
        state: 'neutral',
        supportingText: 'Intermediate',
        type: 'compact',
        value: '4.6',
      },
    ],
    [
      'compact/streak/positive',
      {
        ...statContent,
        content: 'streak',
        label: 'Streak',
        state: 'positive',
        supportingText: 'Weeks active',
        type: 'compact',
        value: '5',
      },
    ],
    [
      'featured/rating/positive',
      {
        ...statContent,
        content: 'rating',
        label: 'Rating',
        state: 'positive',
        supportingText: 'Top 18% of players',
        type: 'featured',
        value: '4.6',
      },
    ],
    [
      'featured/streak/positive',
      {
        ...statContent,
        content: 'streak',
        label: 'Streak',
        state: 'positive',
        supportingText: 'Personal best',
        type: 'featured',
        value: '5 weeks',
      },
    ],
  ] as Array<[string, StatTileProps]>)(
    'renders the authored %s branch',
    async (_tuple, props) => {
      const screen = await render(<StatTile {...props} />);
      expect(
        flattenedStyle(screen.getByTestId('stat-tile').props.style),
      ).toEqual(
        expect.objectContaining({
          height: 112,
          width: props.type === 'featured' ? 328 : 160,
        }),
      );
    },
  );

  it('reads positive meaning with label/value/supporting content and exposes no action', async () => {
    const screen = await render(
      <StatTile
        {...statContent}
        content="winRate"
        state="positive"
        type="compact"
      />,
    );
    expect(
      screen.getByRole('summary', {
        name: 'Win rate, 68%, +8% this month, positive trend',
      }),
    ).toBeTruthy();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(screen.queryAllByRole('image')).toHaveLength(0);
  });

  it('does not infer positivity from numeric display content', async () => {
    const screen = await render(
      <StatTile
        content="gamesPlayed"
        label="Games played"
        state="neutral"
        supportingText="+200 this month"
        type="compact"
        value="999%"
      />,
    );
    expect(
      screen.getByRole('summary', {
        name: 'Games played, 999%, +200 this month',
      }),
    ).toBeTruthy();
    expect(screen.queryByText('Positive trend')).toBeNull();
  });

  it.each([
    {
      ...statContent,
      content: 'gamesPlayed',
      state: 'positive',
      type: 'compact',
    },
    { ...statContent, content: 'winRate', state: 'neutral', type: 'compact' },
    {
      ...statContent,
      content: 'gamesPlayed',
      state: 'neutral',
      type: 'featured',
    },
    {
      ...statContent,
      content: 'winRate',
      onPress: jest.fn(),
      state: 'positive',
      type: 'compact',
    },
    { ...statContent, content: 'winRate', state: 'positive', type: 'unknown' },
    {
      ...statContent,
      content: 'winRate',
      label: '',
      state: 'positive',
      type: 'compact',
    },
    {
      ...statContent,
      content: 'winRate',
      state: 'positive',
      type: 'compact',
      value: Number.NaN,
    },
  ])('rejects unsupported tuples, callbacks, or scalar content %#', (props) => {
    expect(() => StatTile(invalidProps(props))).toThrow(
      /Unsupported Stat Tile/u,
    );
  });

  it('retains a long textual numeric witness in stable semantic order', async () => {
    const screen = await render(
      <StatTile
        content="rating"
        label="International tournament rating for Łucía Nguyễn"
        state="positive"
        supportingText="Top 18% of players from 東京 and beyond"
        type="featured"
        value="4.6000000000000000"
      />,
    );
    expect(
      screen.getByRole('summary', {
        name: 'International tournament rating for Łucía Nguyễn, 4.6000000000000000, Top 18% of players from 東京 and beyond, positive trend',
      }),
    ).toBeTruthy();
  });
});

describe('Stat Tile Storybook contract', () => {
  it('accounts for all five categories under the exact Content title', () => {
    expect(StatTileStories.title).toBe('Content/Stat Tile');
    expect([
      StatTileCanonical,
      StatTileVariants,
      StatTileStates,
      StatTileBoundaries,
      StatTileInteractive,
    ]).toHaveLength(5);
    expect(StatTileVariants.render).toBeDefined();
    expect(StatTileBoundaries.render).toBeDefined();
    expect(StatTileInteractive.parameters?.applicability).toMatch(
      /presentational|inapplicable/iu,
    );
  });
});
