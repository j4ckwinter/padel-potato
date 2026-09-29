import { describe, expect, it, jest } from '@jest/globals';

import { flattenedStyle, invalidProps } from './helpers/componentTest';

import { render, userEvent } from '@testing-library/react-native';

import GameCardStories, {
  Boundaries as GameCardBoundaries,
  Canonical as GameCardCanonical,
  Interactive as GameCardInteractive,
  States as GameCardStates,
  Variants as GameCardVariants,
  normalizeGameCardStoryArgs,
} from '../src/design-system/components/content/GameCard.stories';

import { gameCardFixtures } from '../src/design-system/stories/fixtures';

import {
  GameCard,
  type GameCardParticipant,
  type GameCardProps,
} from '../src/design-system/components/content/GameCard';

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

type IllustratedGameCardProps = Extract<
  GameCardProps,
  { variant: 'illustrated' }
>;

const illustratedCardExamples = {
  gameCreated: {
    detailPrimary: 'Your court is booked and',
    detailSecondary: 'ready to share.',
    eyebrow: 'Success',
    illustration: 'gameCreated',
    onShareGame: jest.fn(),
    participants: [participants[0], participants[1]],
    title: 'Game created!',
    variant: 'illustrated',
  },
  invitePlayers: {
    detailPrimary: 'Share this game and fill',
    detailSecondary: 'the remaining player slots.',
    eyebrow: 'Players',
    illustration: 'invitePlayers',
    onInvitePlayers: jest.fn(),
    participants: [participants[0], participants[1]],
    title: 'Bring your crew',
    variant: 'illustrated',
  },
  matchResult: {
    detailPrimary: 'You won 6\u20134, 6\u20133',
    detailSecondary: 'View scores and highlights',
    eyebrow: 'Completed',
    illustration: 'matchResult',
    onViewResults: jest.fn(),
    participants,
    title: 'Great match!',
    variant: 'illustrated',
  },
  nextGame: {
    detailPrimary: 'Padel United \u00b7 Court 3',
    detailSecondary: '18:30 \u00b7 90 min',
    eyebrow: 'Your next game',
    illustration: 'nextGame',
    onViewGame: jest.fn(),
    participants,
    title: 'Tuesday Social Padel',
    variant: 'illustrated',
  },
} as const satisfies Record<string, IllustratedGameCardProps>;

describe('Game Card public contract', () => {});

describe('Game Card runtime and semantic contract', () => {
  it.each([
    [
      'next/default',
      { ...cardContent, onViewGame: jest.fn(), participants, variant: 'next' },
    ],
    [
      'open/default',
      {
        ...cardContent,
        full: false,
        onViewGame: jest.fn(),
        participants: participants.slice(0, 3),
        variant: 'open',
      },
    ],
    [
      'compact/default',
      {
        title: cardContent.title,
        venue: cardContent.venue,
        variant: 'compact',
      },
    ],
    [
      'completed/default',
      {
        ...cardContent,
        onViewResults: jest.fn(),
        participants,
        variant: 'completed',
      },
    ],
    [
      'open/full',
      {
        ...cardContent,
        full: true,
        onViewGame: jest.fn(),
        participants,
        variant: 'open',
      },
    ],
  ] as [string, GameCardProps][])(
    'renders the authored %s structure',
    async (_tuple, props) => {
      const screen = await render(<GameCard {...props} />);
      expect(
        flattenedStyle(screen.getByTestId('game-card').props.style),
      ).toEqual(
        expect.objectContaining({
          minHeight: props.variant === 'compact' ? 112 : 176,
          width: '100%',
        }),
      );
      expect(screen.getByText(cardContent.title)).toBeTruthy();
      expect(screen.getByText(cardContent.venue)).toBeTruthy();
    },
  );

  it.each([
    ['next', 'View game'],
    ['open', 'View game'],
    ['completed', 'View results'],
  ] as ['next' | 'open' | 'completed', 'View game' | 'View results'][])(
    'exposes only the authored %s action named %s',
    async (variant, actionName) => {
      const callback = jest.fn();
      const props =
        variant === 'next'
          ? { ...cardContent, onViewGame: callback, participants, variant }
          : variant === 'open'
            ? {
                ...cardContent,
                full: false as const,
                onViewGame: callback,
                participants: participants.slice(0, 3),
                variant,
              }
            : {
                ...cardContent,
                onViewResults: callback,
                participants,
                variant,
              };
      const screen = await render(<GameCard {...(props as GameCardProps)} />);
      const action = screen.getByRole('button', { name: actionName });

      expect(screen.getAllByRole('button')).toHaveLength(1);
      await userEvent.setup().press(action);
      expect(callback).toHaveBeenCalledTimes(1);
    },
  );

  it('keeps Compact static without a card or invented CTA activation boundary', async () => {
    const screen = await render(
      <GameCard
        title={cardContent.title}
        venue={cardContent.venue}
        variant="compact"
      />,
    );
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(screen.queryByRole('link')).toBeNull();
  });

  it.each([
    [
      illustratedCardExamples.nextGame,
      'View game',
      'artwork-illustrated-card-next-game',
    ],
    [
      illustratedCardExamples.matchResult,
      'View results',
      'artwork-illustrated-card-match-result',
    ],
    [
      illustratedCardExamples.invitePlayers,
      'Invite players',
      'artwork-illustrated-card-invite-players',
    ],
    [
      illustratedCardExamples.gameCreated,
      'Share game',
      'artwork-illustrated-card-game-created',
    ],
  ] as [IllustratedGameCardProps, string, string][])(
    'renders an illustrated Game Card with one mapped action and artwork %#',
    async (props, actionName, artworkTestId) => {
      const screen = await render(<GameCard {...props} />);
      expect(screen.getByText(props.title)).toBeTruthy();
      expect(screen.getByRole('button', { name: actionName })).toBeTruthy();
      expect(
        screen.getByTestId(artworkTestId, { includeHiddenElements: true }),
      ).toBeTruthy();
      expect(screen.queryAllByRole('button')).toHaveLength(1);
      expect(screen.getByRole('summary')).toHaveAccessibilityValue({
        text:
          props.participants.length === 2
            ? 'Alex Morgan, Jamie Taylor, 2 open spots'
            : 'Alex Morgan, Jamie Taylor, Sam Kim, Riley Brown',
      });
    },
  );

  it.each([
    [illustratedCardExamples.nextGame, 'View game'],
    [illustratedCardExamples.matchResult, 'View results'],
    [illustratedCardExamples.invitePlayers, 'Invite players'],
    [illustratedCardExamples.gameCreated, 'Share game'],
  ] as [IllustratedGameCardProps, string][])(
    'emits the illustrated action for %#',
    async (props, actionName) => {
      const screen = await render(<GameCard {...props} />);
      await userEvent
        .setup()
        .press(screen.getByRole('button', { name: actionName }));
      const callback =
        props.illustration === 'nextGame'
          ? props.onViewGame
          : props.illustration === 'matchResult'
            ? props.onViewResults
            : props.illustration === 'invitePlayers'
              ? props.onInvitePlayers
              : props.onShareGame;
      expect(callback).toHaveBeenCalledTimes(1);
    },
  );

  it.each([
    [false, participants.slice(0, 1), 'Alex Morgan, 3 open spots', 3],
    [
      false,
      participants.slice(0, 2),
      'Alex Morgan, Jamie Taylor, 2 open spots',
      2,
    ],
    [
      false,
      participants.slice(0, 3),
      'Alex Morgan, Jamie Taylor, Sam Kim, 1 open spot',
      1,
    ],
    [true, participants, 'Alex Morgan, Jamie Taylor, Sam Kim, Riley Brown', 0],
  ] as [boolean, readonly GameCardParticipant[], string, number][])(
    'preserves Open participant order for full=%s',
    async (full, orderedParticipants, description, emptyCount) => {
      const props = {
        ...cardContent,
        full,
        onViewGame: jest.fn(),
        participants: orderedParticipants,
        variant: 'open',
      } as unknown as GameCardProps;
      const screen = await render(<GameCard {...props} />);
      expect(screen.getByRole('summary')).toHaveAccessibilityValue({
        text: description,
      });
      expect(
        screen.queryAllByTestId('avatar-group-empty-identity', {
          includeHiddenElements: true,
        }),
      ).toHaveLength(emptyCount);
      expect(screen.queryAllByRole('image')).toHaveLength(0);
    },
  );

  it.each([
    {
      ...cardContent,
      onViewGame: jest.fn(),
      participants: participants.slice(0, 3),
      variant: 'next',
    },
    {
      ...cardContent,
      full: false,
      onViewGame: jest.fn(),
      participants: [],
      variant: 'open',
    },
    {
      ...cardContent,
      full: false,
      onViewGame: jest.fn(),
      participants,
      variant: 'open',
    },
    {
      ...cardContent,
      full: true,
      onViewGame: jest.fn(),
      participants: participants.slice(0, 3),
      variant: 'open',
    },
    {
      ...cardContent,
      onViewResults: jest.fn(),
      participants: participants.slice(0, 3),
      variant: 'completed',
    },
    {
      ...cardContent,
      onViewGame: jest.fn(),
      participants: [...participants].reverse(),
      variant: 'next',
    },
    { ...cardContent, onViewGame: null, participants, variant: 'next' },
    {
      ...cardContent,
      onViewGame: jest.fn(),
      participants,
      route: '/games/1',
      variant: 'next',
    },
    { title: cardContent.title, venue: null, variant: 'compact' },
    { ...cardContent, onViewGame: jest.fn(), participants, variant: 'unknown' },
    { ...illustratedCardExamples.nextGame, detailPrimary: '' },
    { ...illustratedCardExamples.nextGame, onViewResults: jest.fn() },
    {
      ...illustratedCardExamples.nextGame,
      participants: participants.slice(0, 3),
    },
    {
      ...illustratedCardExamples.gameCreated,
      participants: participants,
    },
    { ...illustratedCardExamples.nextGame, illustration: 'unknown' },
  ])(
    'rejects unsupported cardinality, order, content, or behavior %#',
    (props) => {
      expect(() => GameCard(invalidProps(props))).toThrow(
        /Unsupported Game Card/u,
      );
    },
  );

  it.each(rejectedImageSources)(
    'rejects a non-local participant image source %#',
    (source) => {
      expect(() =>
        GameCard({
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
        } as never),
      ).toThrow(/source must be bundled or local/u);
    },
  );

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
    expect(
      screen.getByText(
        'Tuesday Social Padel for Łucía, Nguyễn, and friends from 東京',
      ),
    ).toBeTruthy();
    expect(
      screen.getByText(
        'Padel United International Centre · The exceptionally long Court 3 name',
      ),
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: 'View game' })).toBeTruthy();
  });
});

describe('Game Card Storybook contract', () => {
  it('accounts for standard and illustrated configurations under the exact Content title', () => {
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
    expect(gameCardFixtures).toHaveLength(9);
    expect(
      normalizeGameCardStoryArgs({
        configuration: 'illustrated/invitePlayers',
      }),
    ).toEqual(
      expect.objectContaining({
        illustration: 'invitePlayers',
        participants: [participants[0], participants[1]],
        variant: 'illustrated',
      }),
    );
  });
});
