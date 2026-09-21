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

const notificationRecords = phase4Families[7].records;
const notificationContent = {
  message: 'Your activity has a new update',
  timestamp: '2m',
  title: 'Game update',
} as const;

describe('Notification Row source contract', () => {
  it('retains all six authored records at 352x92 in source order', () => {
    expect(notificationRecords.map(({ normalizedTuple }) => normalizedTuple)).toEqual([
      { type: 'social', state: 'read' },
      { type: 'game', state: 'read' },
      { type: 'warning', state: 'unread' },
      { type: 'social', state: 'unread' },
      { type: 'booking', state: 'unread' },
      { type: 'game', state: 'unread' },
    ]);
    expect(notificationRecords.map(({ metrics }) => metrics.normalized)).toEqual(
      Array.from({ length: 6 }, () => ({ height: 92, width: 352 })),
    );
  });
});

describe('Notification Row runtime and semantic contract', () => {
  it.each([
    ['game/unread', { ...notificationContent, onPress: jest.fn(), read: false, type: 'game' }],
    ['booking/unread', { ...notificationContent, onPress: jest.fn(), read: false, type: 'booking' }],
    ['social/unread', { ...notificationContent, onPress: jest.fn(), read: false, type: 'social' }],
    ['warning/unread', { ...notificationContent, onPress: jest.fn(), read: false, type: 'warning' }],
    ['game/read', { ...notificationContent, onPress: jest.fn(), read: true, type: 'game' }],
    ['social/read', { ...notificationContent, onPress: jest.fn(), read: true, type: 'social' }],
  ] as Array<[string, NotificationRowProps]>)('renders the authored %s branch', async (_tuple, props) => {
    const screen = await render(<NotificationRow {...props} />);
    expect(flattenedStyle(screen.getByTestId('notification-row').props.style)).toEqual(
      expect.objectContaining({ height: 92, width: 352 }),
    );
  });

  it('emits intent once while keeping read state controlled', async () => {
    const onPress = jest.fn();
    const screen = await render(
      <NotificationRow {...notificationContent} onPress={onPress} read={false} type="game" />,
    );
    const row = screen.getByRole('button', {
      name: 'Game update, Your activity has a new update, 2m, unread',
    });
    expect(screen.queryAllByRole('image')).toHaveLength(0);
    await userEvent.setup().press(row);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', {
      name: 'Game update, Your activity has a new update, 2m, unread',
    })).toBeTruthy();

    await screen.rerender(
      <NotificationRow {...notificationContent} onPress={onPress} read type="game" />,
    );
    expect(screen.getByRole('button', {
      name: 'Game update, Your activity has a new update, 2m, read',
    })).toBeTruthy();
  });

  it.each([
    { ...notificationContent, onPress: jest.fn(), read: true, type: 'booking' },
    { ...notificationContent, onPress: jest.fn(), read: true, type: 'warning' },
    { ...notificationContent, onPress: jest.fn(), read: null, type: 'game' },
    { ...notificationContent, onPress: null, read: false, type: 'game' },
    { ...notificationContent, extra: true, onPress: jest.fn(), read: false, type: 'game' },
    { ...notificationContent, onPress: jest.fn(), read: false, type: 'unknown' },
    { ...notificationContent, message: '', onPress: jest.fn(), read: false, type: 'social' },
  ])('rejects an unsupported tuple or content contract %#', (props) => {
    expect(() => NotificationRow(props as never)).toThrow(/Unsupported Notification Row/u);
  });

  it('retains complete long Unicode content in stable title/message/timestamp/read order', async () => {
    const screen = await render(
      <NotificationRow
        message="ÅucÃ­a Nguyá»…n from æ±äº¬ has joined an exceptionally long Tuesday social padel game"
        onPress={jest.fn()}
        read={false}
        timestamp="2 minutes ago"
        title="A very long social update"
        type="social"
      />,
    );
    expect(screen.getByRole('button', {
      name: 'A very long social update, ÅucÃ­a Nguyá»…n from æ±äº¬ has joined an exceptionally long Tuesday social padel game, 2 minutes ago, unread',
    })).toBeTruthy();
  });
});

describe('Notification Row Storybook contract', () => {
  it('accounts for all five categories under the exact Content title', () => {
    expect(NotificationRowStories.title).toBe('Content/Notification Row');
    expect([
      NotificationRowCanonical,
      NotificationRowVariants,
      NotificationRowStates,
      NotificationRowBoundaries,
      NotificationRowInteractive,
    ]).toHaveLength(5);
    expect(NotificationRowVariants.render).toBeDefined();
    expect(NotificationRowBoundaries.render).toBeDefined();
    expect(NotificationRowInteractive.render).toBeDefined();
  });
});

const settingsRecords = phase4Families[8].records;

describe('Settings Row source contract', () => {
  it('retains all nine authored records at 352x64 in source order', () => {
    expect(settingsRecords.map(({ normalizedTuple }) => normalizedTuple)).toEqual([
      { icon: 'court', state: 'default', type: 'navigation' },
      { icon: 'close', state: 'default', type: 'destructive' },
      { icon: 'notification', state: 'disabled', type: 'toggle' },
      { icon: 'notification', state: 'on', type: 'toggle' },
      { icon: 'notification', state: 'off', type: 'toggle' },
      { icon: 'location', state: 'default', type: 'value' },
      { icon: 'profile', state: 'disabled', type: 'navigation' },
      { icon: 'profile', state: 'pressed', type: 'navigation' },
      { icon: 'profile', state: 'default', type: 'navigation' },
    ]);
    expect(settingsRecords.map(({ metrics }) => metrics.normalized)).toEqual(
      Array.from({ length: 9 }, () => ({ height: 64, width: 352 })),
    );
  });
});

describe('Settings Row runtime and semantic contract', () => {
  it.each([
    ['profile navigation', { disabled: false, icon: 'profile', label: 'Account', onPress: jest.fn(), variant: 'navigation' }],
    ['disabled profile navigation', { disabled: true, icon: 'profile', label: 'Account', onPress: jest.fn(), variant: 'navigation' }],
    ['court navigation', { disabled: false, icon: 'court', label: 'Courts', onPress: jest.fn(), variant: 'navigation' }],
    ['value', { icon: 'location', label: 'Location', onPress: jest.fn(), value: 'London', variant: 'value' }],
    ['toggle off', { checked: false, disabled: false, icon: 'notification', label: 'Notifications', onCheckedChange: jest.fn(), variant: 'toggle' }],
    ['toggle on', { checked: true, disabled: false, icon: 'notification', label: 'Notifications', onCheckedChange: jest.fn(), variant: 'toggle' }],
    ['toggle disabled', { checked: false, disabled: true, icon: 'notification', label: 'Notifications', onCheckedChange: jest.fn(), variant: 'toggle' }],
    ['destructive', { icon: 'close', onPress: jest.fn(), variant: 'destructive' }],
  ] as Array<[string, SettingsRowProps]>)('renders the authored %s branch at 352x64', async (_branch, props) => {
    const screen = await render(<SettingsRow {...props} />);
    expect(flattenedStyle(screen.getByTestId('settings-row').props.style)).toEqual(
      expect.objectContaining({ height: 64, width: 352 }),
    );
  });

  it('keeps toggle checked state controlled and emits only the next boolean', async () => {
    const onCheckedChange = jest.fn();
    const screen = await render(
      <SettingsRow
        checked={false}
        disabled={false}
        icon="notification"
        label="Notifications"
        onCheckedChange={onCheckedChange}
        variant="toggle"
      />,
    );
    const toggle = screen.getByRole('switch', { name: 'Notifications' });
    expect(toggle).not.toBeChecked();
    await userEvent.setup().press(toggle);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(toggle).not.toBeChecked();
    await screen.rerender(
      <SettingsRow
        checked
        disabled={false}
        icon="notification"
        label="Notifications"
        onCheckedChange={onCheckedChange}
        variant="toggle"
      />,
    );
    expect(screen.getByRole('switch', { name: 'Notifications' })).toBeChecked();
  });

  it('suppresses disabled navigation and toggle callbacks', async () => {
    const onPress = jest.fn();
    const navigation = await render(
      <SettingsRow disabled icon="profile" label="Account" onPress={onPress} variant="navigation" />,
    );
    const disabledNavigation = navigation.getByRole('button', { name: 'Account' });
    expect(disabledNavigation).toBeDisabled();
    await userEvent.setup().press(disabledNavigation);
    expect(onPress).not.toHaveBeenCalled();

    const onCheckedChange = jest.fn();
    const toggle = await render(
      <SettingsRow
        checked={false}
        disabled
        icon="notification"
        label="Notifications"
        onCheckedChange={onCheckedChange}
        variant="toggle"
      />,
    );
    const disabledToggle = toggle.getByRole('switch', { name: 'Notifications' });
    expect(disabledToggle).toBeDisabled();
    await userEvent.setup().press(disabledToggle);
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it('exposes named button branches and only their supplied intent', async () => {
    const onValuePress = jest.fn();
    const value = await render(
      <SettingsRow icon="location" label="Location" onPress={onValuePress} value="London" variant="value" />,
    );
    await userEvent.setup().press(value.getByRole('button', { name: 'Location, London' }));
    expect(onValuePress).toHaveBeenCalledTimes(1);

    const onSignOut = jest.fn();
    const destructive = await render(
      <SettingsRow icon="close" onPress={onSignOut} variant="destructive" />,
    );
    await userEvent.setup().press(destructive.getByRole('button', { name: 'Sign out' }));
    expect(onSignOut).toHaveBeenCalledTimes(1);
    expect(destructive.queryAllByRole('image')).toHaveLength(0);
  });

  it.each([
    { disabled: false, icon: 'location', label: 'Account', onPress: jest.fn(), variant: 'navigation' },
    { disabled: false, icon: 'profile', label: 'Account', onPress: jest.fn(), state: 'pressed', variant: 'navigation' },
    { disabled: false, icon: 'profile', label: '', onPress: jest.fn(), variant: 'navigation' },
    { icon: 'location', label: 'Location', onPress: jest.fn(), value: null, variant: 'value' },
    { checked: false, disabled: false, icon: 'notification', label: 'Notifications', variant: 'toggle' },
    { checked: null, disabled: false, icon: 'notification', label: 'Notifications', onCheckedChange: jest.fn(), variant: 'toggle' },
    { icon: 'close', onPress: null, variant: 'destructive' },
    { icon: 'profile', onPress: jest.fn(), variant: 'destructive' },
    { icon: 'profile', label: 'Account', onPress: jest.fn(), variant: 'unknown' },
  ])('rejects arbitrary icons, persistent state, or malformed branch content %#', (props) => {
    expect(() => SettingsRow(props as never)).toThrow(/Unsupported Settings Row/u);
  });

  it('retains complete long label and value semantics', async () => {
    const screen = await render(
      <SettingsRow
        icon="location"
        label="Preferred location for ÅucÃ­a Nguyá»…n from æ±äº¬"
        onPress={jest.fn()}
        value="Padel United International Centre, London"
        variant="value"
      />,
    );
    expect(screen.getByRole('button', {
      name: 'Preferred location for ÅucÃ­a Nguyá»…n from æ±äº¬, Padel United International Centre, London',
    })).toBeTruthy();
  });
});

describe('Settings Row Storybook contract', () => {
  it('accounts for all five categories under the exact Content title', () => {
    expect(SettingsRowStories.title).toBe('Content/Settings Row');
    expect([
      SettingsRowCanonical,
      SettingsRowVariants,
      SettingsRowStates,
      SettingsRowBoundaries,
      SettingsRowInteractive,
    ]).toHaveLength(5);
    expect(SettingsRowVariants.render).toBeDefined();
    expect(SettingsRowStates.render).toBeDefined();
    expect(SettingsRowBoundaries.render).toBeDefined();
    expect(SettingsRowInteractive.render).toBeDefined();
  });
});

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

const statTileRecords = phase4Families[9].records;
const statContent = {
  label: 'Win rate',
  supportingText: '+8% this month',
  value: '68%',
} as const;

describe('Stat Tile source contract', () => {
  it('retains all six authored tuples and exact compact/featured geometry in source order', () => {
    expect(statTileRecords.map(({ normalizedTuple }) => normalizedTuple)).toEqual([
      { content: 'streak', state: 'positive', type: 'featured' },
      { content: 'rating', state: 'positive', type: 'featured' },
      { content: 'streak', state: 'positive', type: 'compact' },
      { content: 'rating', state: 'neutral', type: 'compact' },
      { content: 'winRate', state: 'positive', type: 'compact' },
      { content: 'gamesPlayed', state: 'neutral', type: 'compact' },
    ]);
    expect(statTileRecords.map(({ metrics }) => metrics.normalized)).toEqual([
      { height: 112, width: 328 },
      { height: 112, width: 328 },
      { height: 112, width: 160 },
      { height: 112, width: 160 },
      { height: 112, width: 160 },
      { height: 112, width: 160 },
    ]);
  });
});

describe('Stat Tile runtime and semantic contract', () => {
  it.each([
    ['compact/games played/neutral', { ...statContent, content: 'gamesPlayed', label: 'Games played', state: 'neutral', supportingText: 'All time', type: 'compact', value: '24' }],
    ['compact/win rate/positive', { ...statContent, content: 'winRate', state: 'positive', type: 'compact' }],
    ['compact/rating/neutral', { ...statContent, content: 'rating', label: 'Rating', state: 'neutral', supportingText: 'Intermediate', type: 'compact', value: '4.6' }],
    ['compact/streak/positive', { ...statContent, content: 'streak', label: 'Streak', state: 'positive', supportingText: 'Weeks active', type: 'compact', value: '5' }],
    ['featured/rating/positive', { ...statContent, content: 'rating', label: 'Rating', state: 'positive', supportingText: 'Top 18% of players', type: 'featured', value: '4.6' }],
    ['featured/streak/positive', { ...statContent, content: 'streak', label: 'Streak', state: 'positive', supportingText: 'Personal best', type: 'featured', value: '5 weeks' }],
  ] as Array<[string, StatTileProps]>)('renders the authored %s branch', async (_tuple, props) => {
    const screen = await render(<StatTile {...props} />);
    expect(flattenedStyle(screen.getByTestId('stat-tile').props.style)).toEqual(
      expect.objectContaining({ height: 112, width: props.type === 'featured' ? 328 : 160 }),
    );
  });

  it('reads positive meaning with label/value/supporting content and exposes no action', async () => {
    const screen = await render(
      <StatTile {...statContent} content="winRate" state="positive" type="compact" />,
    );
    expect(screen.getByRole('summary', {
      name: 'Win rate, 68%, +8% this month, positive trend',
    })).toBeTruthy();
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
    expect(screen.getByRole('summary', {
      name: 'Games played, 999%, +200 this month',
    })).toBeTruthy();
    expect(screen.queryByText('Positive trend')).toBeNull();
  });

  it.each([
    { ...statContent, content: 'gamesPlayed', state: 'positive', type: 'compact' },
    { ...statContent, content: 'winRate', state: 'neutral', type: 'compact' },
    { ...statContent, content: 'gamesPlayed', state: 'neutral', type: 'featured' },
    { ...statContent, content: 'winRate', onPress: jest.fn(), state: 'positive', type: 'compact' },
    { ...statContent, content: 'winRate', state: 'positive', type: 'unknown' },
    { ...statContent, content: 'winRate', label: '', state: 'positive', type: 'compact' },
    { ...statContent, content: 'winRate', state: 'positive', type: 'compact', value: Number.NaN },
  ])('rejects unsupported tuples, callbacks, or scalar content %#', (props) => {
    expect(() => StatTile(props as never)).toThrow(/Unsupported Stat Tile/u);
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
    expect(screen.getByRole('summary', {
      name: 'International tournament rating for Łucía Nguyễn, 4.6000000000000000, Top 18% of players from 東京 and beyond, positive trend',
    })).toBeTruthy();
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
    expect(StatTileInteractive.parameters?.applicability).toMatch(/presentational|inapplicable/iu);
  });
});

const scoreResultRecords = phase4Families[10].records;
const scoreTeams = [
  { initials: 'AM', name: 'Alex & Jamie', scores: ['6', '6'] },
  { initials: 'RB', name: 'Riley & Sam', scores: ['4', '3'] },
] as const satisfies readonly [ScoreResultTeam, ScoreResultTeam];

describe('Score Result Block source contract', () => {
  it('retains all six compact/full result branches and exact frames in source order', () => {
    expect(scoreResultRecords.map(({ normalizedTuple }) => normalizedTuple)).toEqual([
      { state: 'live', type: 'full' },
      { state: 'lost', type: 'full' },
      { state: 'won', type: 'full' },
      { state: 'live', type: 'compact' },
      { state: 'lost', type: 'compact' },
      { state: 'won', type: 'compact' },
    ]);
    expect(scoreResultRecords.map(({ metrics }) => metrics.normalized)).toEqual([
      { height: 176, width: 352 },
      { height: 176, width: 352 },
      { height: 176, width: 352 },
      { height: 120, width: 352 },
      { height: 120, width: 352 },
      { height: 120, width: 352 },
    ]);
  });
});

describe('Score Result Block runtime and semantic contract', () => {
  it.each([
    ['compact/won', { state: 'won', teams: scoreTeams, type: 'compact' }],
    ['compact/lost', { state: 'lost', teams: scoreTeams, type: 'compact' }],
    ['compact/live', { liveNote: 'Set 2 in progress', state: 'live', teams: scoreTeams, type: 'compact' }],
    ['full/won', { state: 'won', teams: scoreTeams, title: 'Tuesday Social Padel', type: 'full' }],
    ['full/lost', { state: 'lost', teams: scoreTeams, title: 'Tuesday Social Padel', type: 'full' }],
    ['full/live', { liveNote: 'Set 2 in progress', state: 'live', teams: scoreTeams, title: 'Tuesday Social Padel', type: 'full' }],
  ] as Array<[string, ScoreResultBlockProps]>)('renders the authored %s branch', async (_tuple, props) => {
    const screen = await render(<ScoreResultBlock {...props} />);
    expect(flattenedStyle(screen.getByTestId('score-result-block').props.style)).toEqual(
      expect.objectContaining({ height: props.type === 'full' ? 176 : 120, width: 352 }),
    );
  });

  it('announces explicit won state, fixed team/set order, and winner without colour-only meaning', async () => {
    const screen = await render(
      <ScoreResultBlock state="won" teams={scoreTeams} title="Tuesday Social Padel" type="full" />,
    );
    expect(screen.getByRole('summary', {
      name: 'YOU WON, Tuesday Social Padel, Alex & Jamie, set 1 6, set 2 6, winner, Riley & Sam, set 1 4, set 2 3',
    })).toBeTruthy();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('preserves live state and note without owning a timer', async () => {
    jest.useFakeTimers();
    const screen = await render(
      <ScoreResultBlock
        liveNote="Set 2 in progress"
        state="live"
        teams={scoreTeams}
        type="compact"
      />,
    );
    expect(screen.getByRole('summary', {
      name: 'LIVE, Alex & Jamie, set 1 6, set 2 6, Riley & Sam, set 1 4, set 2 3, Set 2 in progress',
    })).toBeTruthy();
    expect(jest.getTimerCount()).toBe(0);
    jest.useRealTimers();
  });

  it.each([
    { state: 'won', teams: [scoreTeams[0]], type: 'compact' },
    { state: 'won', teams: [...scoreTeams, scoreTeams[0]], type: 'compact' },
    { state: 'won', teams: [{ ...scoreTeams[0], name: '' }, scoreTeams[1]], type: 'compact' },
    { state: 'won', teams: [{ ...scoreTeams[0], scores: ['6'] }, scoreTeams[1]], type: 'compact' },
    { state: 'won', teams: [{ ...scoreTeams[0], scores: ['6', 'NaN'] }, scoreTeams[1]], type: 'compact' },
    { state: 'won', teams: [{ ...scoreTeams[0], scores: ['6', Number.POSITIVE_INFINITY] }, scoreTeams[1]], type: 'compact' },
    { liveNote: 'Set 2 in progress', state: 'won', teams: scoreTeams, type: 'compact' },
    { state: 'live', teams: scoreTeams, type: 'compact' },
    { state: 'lost', teams: scoreTeams, title: 'Unexpected', type: 'compact' },
    { state: 'won', teams: scoreTeams, type: 'full' },
    { state: 'won', teams: scoreTeams, type: 'unknown' },
    { onPress: jest.fn(), state: 'won', teams: scoreTeams, type: 'compact' },
  ])('rejects malformed fixed structures, non-finite values, and branch contradictions %#', (props) => {
    expect(() => ScoreResultBlock(props as never)).toThrow(/Unsupported Score Result Block/u);
  });

  it('keeps caller-formatted score precision textual and stable in aggregate order', async () => {
    const preciseTeams = [
      { initials: 'ŁN', name: 'Łucía Nguyễn & 東京', scores: ['6.000', '0006'] },
      { initials: 'RS', name: 'Riley & Sam with a very long team name', scores: ['04', '3.0'] },
    ] as const satisfies readonly [ScoreResultTeam, ScoreResultTeam];
    const screen = await render(
      <ScoreResultBlock state="won" teams={preciseTeams} type="compact" />,
    );
    expect(screen.getByRole('summary', {
      name: 'YOU WON, Łucía Nguyễn & 東京, set 1 6.000, set 2 0006, winner, Riley & Sam with a very long team name, set 1 04, set 2 3.0',
    })).toBeTruthy();
  });
});

describe('Score Result Block Storybook contract', () => {
  it('accounts for all five categories under the exact Content title', () => {
    expect(ScoreResultBlockStories.title).toBe('Content/Score Result Block');
    expect([
      ScoreResultBlockCanonical,
      ScoreResultBlockVariants,
      ScoreResultBlockStates,
      ScoreResultBlockBoundaries,
      ScoreResultBlockInteractive,
    ]).toHaveLength(5);
    expect(ScoreResultBlockVariants.render).toBeDefined();
    expect(ScoreResultBlockBoundaries.render).toBeDefined();
    expect(ScoreResultBlockInteractive.parameters?.applicability).toMatch(/presentational|inapplicable/iu);
  });
});
