import { describe, expect, it, jest } from '@jest/globals';
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
import { phase4Families } from '../src/design-system/components/phase4SourceRegistry';

const playerItemRecords = phase4Families[5].records;

const player = {
  initials: 'AM',
  name: 'Alex Morgan',
  presence: 'away',
  supportingText: 'Intermediate · Rating 4.6',
} as const satisfies PlayerItemIdentity;

const flattenedStyle = (style: unknown) => StyleSheet.flatten(
  style as Parameters<typeof StyleSheet.flatten>[0],
) as Record<string, unknown>;

describe('Player Item source contract', () => {
  it('retains all six authored records in revision-296 source order', () => {
    expect(playerItemRecords.map(({ normalizedTuple }) => normalizedTuple)).toEqual([
      { type: 'inviteResult', state: 'disabled' },
      { type: 'inviteResult', state: 'default' },
      { type: 'gameSlot', state: 'empty' },
      { type: 'gameSlot', state: 'default' },
      { type: 'list', state: 'selected' },
      { type: 'list', state: 'default' },
    ]);
    expect(playerItemRecords.map(({ metrics }) => metrics.normalized)).toEqual(
      Array.from({ length: 6 }, () => ({ height: 80, width: 328 })),
    );
  });
});

describe('Player Item runtime and semantic contract', () => {
  it.each([
    ['list/default', { identity: player, onSelectedChange: jest.fn(), selected: false, variant: 'list' }],
    ['list/selected', { identity: player, onSelectedChange: jest.fn(), selected: true, variant: 'list' }],
    ['game slot/default', { identity: { ...player, supportingText: 'Confirmed · Intermediate' }, onViewPlayer: jest.fn(), variant: 'game-slot' }],
    ['game slot/empty', { onInvite: jest.fn(), variant: 'empty-game-slot' }],
    ['invite result/default', { disabled: false, identity: player, onInvite: jest.fn(), variant: 'invite-result' }],
    ['invite result/disabled', { disabled: true, identity: player, variant: 'invite-result' }],
  ] as Array<[string, PlayerItemProps]>)('renders the authored %s branch at 328x80', async (_tuple, props) => {
    const screen = await render(<PlayerItem {...props} />);
    expect(flattenedStyle(screen.getByTestId('player-item').props.style)).toEqual(
      expect.objectContaining({ height: 80, width: 328 }),
    );
  });

  it('keeps list selection controlled and exposes one coherent checkbox boundary', async () => {
    const onSelectedChange = jest.fn();
    const screen = await render(
      <PlayerItem
        identity={player}
        onSelectedChange={onSelectedChange}
        selected
        variant="list"
      />,
    );
    const row = screen.getByRole('checkbox', { name: 'Alex Morgan, Intermediate · Rating 4.6, selected' });

    expect(row).toBeChecked();
    expect(screen.queryAllByRole('image')).toHaveLength(0);
    await userEvent.setup().press(row);
    expect(onSelectedChange).toHaveBeenCalledWith(false);
    expect(row).toBeChecked();
  });

  it('names the empty invitation action and keeps nested icon content decorative', async () => {
    const onInvite = jest.fn();
    const screen = await render(<PlayerItem onInvite={onInvite} variant="empty-game-slot" />);
    const action = screen.getByRole('button', { name: 'Invite player to open slot' });

    await userEvent.setup().press(action);
    expect(onInvite).toHaveBeenCalledTimes(1);
    expect(screen.queryAllByRole('image')).toHaveLength(0);
  });

  it('emits only the authored game-slot and invite-result intents', async () => {
    const onViewPlayer = jest.fn();
    const onInvite = jest.fn();
    const gameSlot = await render(
      <PlayerItem
        identity={{ ...player, supportingText: 'Confirmed · Intermediate' }}
        onViewPlayer={onViewPlayer}
        variant="game-slot"
      />,
    );
    await userEvent.setup().press(
      gameSlot.getByRole('button', { name: 'View Alex Morgan, Confirmed · Intermediate' }),
    );
    expect(onViewPlayer).toHaveBeenCalledTimes(1);

    const invite = await render(
      <PlayerItem disabled={false} identity={player} onInvite={onInvite} variant="invite-result" />,
    );
    await userEvent.setup().press(
      invite.getByRole('button', { name: 'Invite Alex Morgan, Intermediate · Rating 4.6' }),
    );
    expect(onInvite).toHaveBeenCalledTimes(1);
  });

  it('suppresses disabled invite-result activation and exposes disabled state', async () => {
    const malformedCallback = jest.fn();
    const disabledProps = {
      disabled: true,
      identity: player,
      onInvite: malformedCallback,
      variant: 'invite-result',
    } as unknown as PlayerItemProps;
    const screen = await render(
      <PlayerItem {...disabledProps} />,
    );
    const row = screen.getByRole('button', { name: 'Invite Alex Morgan, Intermediate · Rating 4.6' });
    expect(row).toBeDisabled();
    expect(flattenedStyle(row.props.style)).toEqual(expect.objectContaining({ opacity: 0.4 }));
    await userEvent.setup().press(row);
    expect(malformedCallback).not.toHaveBeenCalled();
  });

  it.each([
    { identity: player, selected: false, variant: 'list' },
    { identity: player, onSelectedChange: jest.fn(), selected: null, variant: 'list' },
    { identity: null, onViewPlayer: jest.fn(), variant: 'game-slot' },
    { onInvite: null, variant: 'empty-game-slot' },
    { disabled: false, identity: player, variant: 'invite-result' },
    { identity: { ...player, extra: true }, onViewPlayer: jest.fn(), variant: 'game-slot' },
    { identity: player, onViewPlayer: jest.fn(), style: {}, variant: 'game-slot' },
    { identity: player, onViewPlayer: jest.fn(), variant: 'unknown' },
  ])('rejects an unsupported branch or content contract %#', (props) => {
    expect(() => PlayerItem(props as never)).toThrow(/Unsupported Player Item/u);
  });

  it('retains complete long Unicode semantics inside the constrained row', async () => {
    const longIdentity = {
      initials: 'ŁN',
      name: 'Łucía Nguyễn from 東京',
      presence: 'away',
      supportingText: 'Intermediate player with a deliberately long supporting description',
    } as const satisfies PlayerItemIdentity;
    const screen = await render(
      <PlayerItem
        identity={longIdentity}
        onViewPlayer={jest.fn()}
        variant="game-slot"
      />,
    );
    expect(screen.getByRole('button', {
      name: 'View Łucía Nguyễn from 東京, Intermediate player with a deliberately long supporting description',
    })).toBeTruthy();
  });
});

describe('Player Item Storybook contract', () => {
  it('accounts for all five categories under the exact Content title', () => {
    expect(PlayerItemStories.title).toBe('Content/Player Item');
    expect([
      PlayerItemCanonical,
      PlayerItemVariants,
      PlayerItemStates,
      PlayerItemBoundaries,
      PlayerItemInteractive,
    ]).toHaveLength(5);
    expect(PlayerItemVariants.render).toBeDefined();
    expect(PlayerItemBoundaries.render).toBeDefined();
    expect(PlayerItemInteractive.render).toBeDefined();
  });
});

const gameCardRecords = phase4Families[6].records;
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

describe('Game Card source contract', () => {
  it('retains all five authored records and exact frames in source order', () => {
    expect(gameCardRecords.map(({ normalizedTuple }) => normalizedTuple)).toEqual([
      { type: 'open', state: 'full' },
      { type: 'completed', state: 'default' },
      { type: 'compact', state: 'default' },
      { type: 'open', state: 'default' },
      { type: 'next', state: 'default' },
    ]);
    expect(gameCardRecords.map(({ metrics }) => metrics.normalized)).toEqual([
      { height: 176, width: 352 },
      { height: 176, width: 352 },
      { height: 112, width: 352 },
      { height: 176, width: 352 },
      { height: 176, width: 352 },
    ]);
  });
});

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
    expect(() => GameCard(props as never)).toThrow(/Unsupported Game Card/u);
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
