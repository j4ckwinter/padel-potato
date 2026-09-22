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
  ] as Array<[string, PlayerPreferencesCardProps]>)(
    'renders the authored %s content branch',
    async (_branch, props) => {
      const screen = await render(<PlayerPreferencesCard {...props} />);
      expect(
        flattenedStyle(
          screen.getByTestId('player-preferences-card').props.style,
        ),
      ).toEqual(expect.objectContaining({ height: 152, width: 350 }));
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
