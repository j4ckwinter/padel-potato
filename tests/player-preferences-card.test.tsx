import { describe, expect, it, jest } from '@jest/globals';

import { flattenedStyle, invalidProps } from './helpers/componentTest';

import { render } from '@testing-library/react-native';

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

import { colors } from '../src/design-system/tokens';

const profilePreferences = {
  content: 'profile',
  days: 'Mon–Sat',
  side: 'Either side',
  timeOfDay: 'Afternoons',
} as const satisfies PlayerPreferencesCardProps;

const fullPreferences = {
  ...profilePreferences,
  content: 'full',
  level: 'Intermediate',
} as const satisfies PlayerPreferencesCardProps;

describe('Player Preferences Card public contract', () => {});

describe('Player Preferences Card runtime and semantic contract', () => {
  it.each([
    ['profile', profilePreferences],
    ['full', fullPreferences],
  ] as [string, PlayerPreferencesCardProps][])(
    'renders the authored %s content branch',
    async (_branch, props) => {
      const screen = await render(<PlayerPreferencesCard {...props} />);
      expect(
        flattenedStyle(
          screen.getByTestId('player-preferences-card').props.style,
        ),
      ).toEqual(expect.objectContaining({ width: '100%' }));
    },
  );

  it('announces the full heading before its exact four static preferences', async () => {
    const screen = await render(<PlayerPreferencesCard {...fullPreferences} />);
    expect(
      screen.getByRole('summary', {
        name: 'Your preferences, Intermediate, Either side, Mon–Sat, Afternoons',
      }),
    ).toBeTruthy();
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(
      screen
        .getAllByTestId('status-chip-content', { includeHiddenElements: true })
        .map(({ props }) => flattenedStyle(props.style).backgroundColor),
    ).toEqual([
      colors.surfaceAccent,
      colors.info,
      colors.surfaceMuted,
      colors.surfaceMuted,
    ]);
  });

  it('omits Intermediate from the profile branch and keeps the three values static', async () => {
    const screen = await render(
      <PlayerPreferencesCard {...profilePreferences} />,
    );
    expect(
      screen.getByRole('summary', {
        name: 'Playing preferences, Either side, Mon–Sat, Afternoons',
      }),
    ).toBeTruthy();
    expect(screen.queryByText('Intermediate')).toBeNull();
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
  });

  it.each([
    { ...profilePreferences, content: 'full' },
    { ...profilePreferences, level: 'Intermediate' },
    { ...fullPreferences, level: '' },
    { ...fullPreferences, side: null },
    { ...fullPreferences, preferences: ['Intermediate', 'Either side'] },
    { ...fullPreferences, onSelectedChange: jest.fn() },
    { ...profilePreferences, content: 'Content=Profile' },
    { ...profilePreferences, content: 'unknown' },
  ])(
    'rejects partial, extra, interactive, or generic metadata branches %#',
    (props) => {
      expect(() => PlayerPreferencesCard(invalidProps(props))).toThrow(
        /Unsupported Player Preferences Card/u,
      );
    },
  );

  it('retains long Unicode preference values in heading-first order', async () => {
    const screen = await render(
      <PlayerPreferencesCard
        content="full"
        days="Monday through Saturday across 東京 holidays"
        level="International advanced level for Łucía Nguyễn"
        side="Either side of the court with a long preference"
        timeOfDay="Late afternoons and early evenings"
      />,
    );
    expect(
      screen.getByRole('summary', {
        name: 'Your preferences, International advanced level for Łucía Nguyễn, Either side of the court with a long preference, Monday through Saturday across 東京 holidays, Late afternoons and early evenings',
      }),
    ).toBeTruthy();
  });
});

describe('Player Preferences Card Storybook contract', () => {
  it('accounts for all five categories under the exact Content title', () => {
    expect(PlayerPreferencesCardStories.title).toBe(
      'Content/Player Preferences Card',
    );
    expect([
      PlayerPreferencesCardCanonical,
      PlayerPreferencesCardVariants,
      PlayerPreferencesCardStates,
      PlayerPreferencesCardBoundaries,
      PlayerPreferencesCardInteractive,
    ]).toHaveLength(5);
    expect(PlayerPreferencesCardVariants.render).toBeDefined();
    expect(PlayerPreferencesCardBoundaries.render).toBeDefined();
    expect(PlayerPreferencesCardInteractive.parameters?.applicability).toMatch(
      /presentational|inapplicable/iu,
    );
  });
});
