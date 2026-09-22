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

import { playerItemFixtures, gameCardFixtures, notificationRowFixtures, settingsRowFixtures, statTileFixtures, scoreResultBlockFixtures, playerPreferencesCardFixtures } from '../src/design-system/stories/fixtures';

import * as ContentComponents from '../src/design-system/components/content';

import { colors } from '../src/design-system/tokens';

const rejectedImageSources = [
  { uri: 'ftp://example.com/player.webp' },
  { uri: 'blob:https://example.com/player-id' },
  { uri: 'ws://example.com/player.webp' },
  { uri: '//example.com/player.webp' },
  { uri: 'player.webp' },
] as const;

const participants = [
  { initials: 'AM', name: 'Alex Morgan', presence: 'online', slot: 1 },
  { initials: 'JT', name: 'Jamie Taylor', presence: 'online', slot: 2 },
  { initials: 'SK', name: 'Sam Kim', presence: 'online', slot: 3 },
  { initials: 'RB', name: 'Riley Brown', presence: 'online', slot: 4 },
] as const satisfies readonly GameCardParticipant[];

const cardContent = {
  time: '18:30 · 90 min',
  title: 'Tuesday Social Padel',
  venue: 'Padel United · Court 3',
} as const;

describe('Game Card public contract', () => {});

describe('Game Card runtime and semantic contract', () => {
  it.each([
    ['next/default', { ...cardContent, onViewGame: jest.fn(), participants, variant: 'next' }],
    ['open/default', { ...cardContent, full: false, onViewGame: jest.fn(), participants: participants.slice(0, 3), variant: 'open' }],
    ['compact/default', { title: cardContent.title, venue: cardContent.venue, variant: 'compact' }],
    ['completed/default', { ...cardContent, onViewResults: jest.fn(), participants, variant: 'completed' }],
    ['open/full', { ...cardContent, full: true, onViewGame: jest.fn(), participants, variant: 'open' }],
  ] as Array<[string, GameCardProps]>)('renders the authored %s structure', async (_tuple, props) => {
    const screen = await render(<GameCard {...props} />);
    expect(flattenedStyle(screen.getByTestId('game-card').props.style)).toEqual(
      expect.objectContaining({
        height: props.variant === 'compact' ? 112 : 176,
        width: 352,
      }),
    );
    expect(screen.getByText(cardContent.title)).toBeTruthy();
    expect(screen.getByText(cardContent.venue)).toBeTruthy();
  });

  it.each([
    ['next', 'View game'],
    ['open', 'View game'],
    ['completed', 'View results'],
  ] as Array<['next' | 'open' | 'completed', 'View game' | 'View results']>)('exposes only the authored %s action named %s', async (variant, actionName) => {
    const callback = jest.fn();
    const props = variant === 'next'
      ? { ...cardContent, onViewGame: callback, participants, variant }
      : variant === 'open'
        ? { ...cardContent, full: false as const, onViewGame: callback, participants: participants.slice(0, 3), variant }
        : { ...cardContent, onViewResults: callback, participants, variant };
    const screen = await render(<GameCard {...props as GameCardProps} />);
    const action = screen.getByRole('button', { name: actionName });

    expect(screen.getAllByRole('button')).toHaveLength(1);
    await userEvent.setup().press(action);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('keeps Compact static without a card or invented CTA activation boundary', async () => {
    const screen = await render(
      <GameCard title={cardContent.title} venue={cardContent.venue} variant="compact" />,
    );
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(screen.queryByRole('link')).toBeNull();
  });

  it.each([
    [false, participants.slice(0, 3), 'Alex Morgan, Jamie Taylor, Sam Kim'],
    [true, participants, 'Alex Morgan, Jamie Taylor, Sam Kim, Riley Brown'],
  ] as Array<[boolean, readonly GameCardParticipant[], string]>)('preserves Open participant order for full=%s', async (full, orderedParticipants, description) => {
    const props = {
      ...cardContent,
      full,
      onViewGame: jest.fn(),
      participants: orderedParticipants,
      variant: 'open',
    } as unknown as GameCardProps;
    const screen = await render(
      <GameCard {...props} />,
    );
    expect(screen.getByRole('summary')).toHaveAccessibilityValue({ text: description });
    expect(screen.queryAllByRole('image')).toHaveLength(0);
  });

  it.each([
    { ...cardContent, onViewGame: jest.fn(), participants: participants.slice(0, 3), variant: 'next' },
    { ...cardContent, full: false, onViewGame: jest.fn(), participants, variant: 'open' },
    { ...cardContent, full: true, onViewGame: jest.fn(), participants: participants.slice(0, 3), variant: 'open' },
    { ...cardContent, onViewResults: jest.fn(), participants: participants.slice(0, 3), variant: 'completed' },
    { ...cardContent, onViewGame: jest.fn(), participants: [...participants].reverse(), variant: 'next' },
    { ...cardContent, onViewGame: null, participants, variant: 'next' },
    { ...cardContent, onViewGame: jest.fn(), participants, route: '/games/1', variant: 'next' },
    { title: cardContent.title, venue: null, variant: 'compact' },
    { ...cardContent, onViewGame: jest.fn(), participants, variant: 'unknown' },
  ])('rejects unsupported cardinality, order, content, or behavior %#', (props) => {
    expect(() => GameCard(invalidProps(props))).toThrow(/Unsupported Game Card/u);
  });

  it.each(rejectedImageSources)('rejects a non-local participant image source %#', (source) => {
    expect(() => GameCard({
      ...cardContent,
      onViewGame: jest.fn(),
      participants: [
        {
          name: participants[0].name,
          presence: participants[0].presence,
          slot: participants[0].slot,
          source,
        },
        participants[1],
        participants[2],
        participants[3],
      ],
      variant: 'next',
    } as never)).toThrow(/source must be bundled or local/u);
  });

  it('retains complete long title and venue semantics with its action reachable', async () => {
    const screen = await render(
      <GameCard
        onViewGame={jest.fn()}
        participants={participants}
        time="18:30 · 90 min"
        title="Tuesday Social Padel for Łucía, Nguyễn, and friends from 東京"
        variant="next"
        venue="Padel United International Centre · The exceptionally long Court 3 name"
      />,
    );
    expect(screen.getByText('Tuesday Social Padel for Łucía, Nguyễn, and friends from 東京')).toBeTruthy();
    expect(screen.getByText('Padel United International Centre · The exceptionally long Court 3 name')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'View game' })).toBeTruthy();
  });
});

describe('Game Card Storybook contract', () => {
  it('accounts for all five categories under the exact Content title', () => {
    expect(GameCardStories.title).toBe('Content/Game Card');
    expect([
      GameCardCanonical,
      GameCardVariants,
      GameCardStates,
      GameCardBoundaries,
      GameCardInteractive,
    ]).toHaveLength(5);
    expect(GameCardVariants.render).toBeDefined();
    expect(GameCardBoundaries.render).toBeDefined();
    expect(GameCardInteractive.render).toBeDefined();
  });
});
