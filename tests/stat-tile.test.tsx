import { describe, expect, it, jest } from '@jest/globals';

import { flattenedStyle, invalidProps } from './helpers/componentTest';

import { render } from '@testing-library/react-native';

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
  ] as [string, StatTileProps][])(
    'renders the authored %s branch',
    async (_tuple, props) => {
      const screen = await render(<StatTile {...props} />);
      expect(
        flattenedStyle(screen.getByTestId('stat-tile').props.style),
      ).toEqual(
        expect.objectContaining({
          minHeight: 112,
          ...(props.type === 'featured' ? { width: '100%' } : { flex: 1 }),
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
