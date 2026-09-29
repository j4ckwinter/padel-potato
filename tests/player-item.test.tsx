import { describe, expect, it, jest } from '@jest/globals';

import { flattenedStyle, invalidProps } from './helpers/componentTest';

import { render, userEvent } from '@testing-library/react-native';

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

const player = {
  initials: 'AM',
  name: 'Alex Morgan',
  presence: 'away',
  supportingText: 'Intermediate · Rating 4.6',
} as const satisfies PlayerItemIdentity;

const rejectedImageSources = [
  { uri: 'ftp://example.com/player.webp' },
  { uri: 'blob:https://example.com/player-id' },
  { uri: 'ws://example.com/player.webp' },
  { uri: '//example.com/player.webp' },
  { uri: 'player.webp' },
] as const;

describe('Player Item public contract', () => {});

describe('Player Item runtime and semantic contract', () => {
  it.each([
    [
      'list/default',
      {
        identity: player,
        onSelectedChange: jest.fn(),
        selected: false,
        variant: 'list',
      },
    ],
    [
      'list/selected',
      {
        identity: player,
        onSelectedChange: jest.fn(),
        selected: true,
        variant: 'list',
      },
    ],
    [
      'game slot/default',
      {
        identity: { ...player, supportingText: 'Confirmed · Intermediate' },
        onViewPlayer: jest.fn(),
        variant: 'game-slot',
      },
    ],
    [
      'profile link/default',
      {
        identity: player,
        onViewPlayer: jest.fn(),
        variant: 'profile-link',
      },
    ],
    ['game slot/empty', { onInvite: jest.fn(), variant: 'empty-game-slot' }],
    [
      'invite result/default',
      {
        disabled: false,
        identity: player,
        onInvite: jest.fn(),
        variant: 'invite-result',
      },
    ],
    [
      'invite result/disabled',
      { disabled: true, identity: player, variant: 'invite-result' },
    ],
  ] as [string, PlayerItemProps][])(
    'renders the authored %s branch at 328x80',
    async (_tuple, props) => {
      const screen = await render(<PlayerItem {...props} />);
      expect(
        flattenedStyle(screen.getByTestId('player-item').props.style),
      ).toEqual(expect.objectContaining({ minHeight: 80, width: '100%' }));
    },
  );

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
    const row = screen.getByRole('checkbox', {
      name: 'Alex Morgan, Intermediate · Rating 4.6, selected',
    });

    expect(row).toBeChecked();
    expect(screen.queryAllByRole('image')).toHaveLength(0);
    await userEvent.setup().press(row);
    expect(onSelectedChange).toHaveBeenCalledWith(false);
    expect(row).toBeChecked();
  });

  it('names the empty invitation action and keeps nested icon content decorative', async () => {
    const onInvite = jest.fn();
    const screen = await render(
      <PlayerItem onInvite={onInvite} variant="empty-game-slot" />,
    );
    const action = screen.getByRole('button', {
      name: 'Invite player to open slot',
    });

    await userEvent.setup().press(action);
    expect(onInvite).toHaveBeenCalledTimes(1);
    expect(screen.queryAllByRole('image')).toHaveLength(0);
  });

  it('emits only the authored profile, game-slot, and invite-result intents', async () => {
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
      gameSlot.getByRole('button', {
        name: 'View Alex Morgan, Confirmed · Intermediate',
      }),
    );
    expect(onViewPlayer).toHaveBeenCalledTimes(1);

    const profileLink = await render(
      <PlayerItem
        identity={player}
        onViewPlayer={onViewPlayer}
        variant="profile-link"
      />,
    );
    await userEvent.setup().press(
      profileLink.getByRole('button', {
        name: 'View Alex Morgan, Intermediate · Rating 4.6',
      }),
    );
    expect(onViewPlayer).toHaveBeenCalledTimes(2);

    const invite = await render(
      <PlayerItem
        disabled={false}
        identity={player}
        onInvite={onInvite}
        variant="invite-result"
      />,
    );
    await userEvent.setup().press(
      invite.getByRole('button', {
        name: 'Invite Alex Morgan, Intermediate · Rating 4.6',
      }),
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
    const screen = await render(<PlayerItem {...disabledProps} />);
    const row = screen.getByRole('button', {
      name: 'Invite Alex Morgan, Intermediate · Rating 4.6',
    });
    expect(row).toBeDisabled();
    expect(flattenedStyle(row.props.style)).toEqual(
      expect.objectContaining({ opacity: 0.4 }),
    );
    await userEvent.setup().press(row);
    expect(malformedCallback).not.toHaveBeenCalled();
  });

  it.each([
    { identity: player, selected: false, variant: 'list' },
    {
      identity: player,
      onSelectedChange: jest.fn(),
      selected: null,
      variant: 'list',
    },
    { identity: null, onViewPlayer: jest.fn(), variant: 'game-slot' },
    { identity: player, variant: 'profile-link' },
    { onInvite: null, variant: 'empty-game-slot' },
    { disabled: false, identity: player, variant: 'invite-result' },
    {
      identity: { ...player, extra: true },
      onViewPlayer: jest.fn(),
      variant: 'game-slot',
    },
    {
      identity: player,
      onViewPlayer: jest.fn(),
      style: {},
      variant: 'game-slot',
    },
    { identity: player, onViewPlayer: jest.fn(), variant: 'unknown' },
  ])('rejects an unsupported branch or content contract %#', (props) => {
    expect(() => PlayerItem(invalidProps(props))).toThrow(
      /Unsupported Player Item/u,
    );
  });

  it.each(rejectedImageSources)(
    'rejects a non-local player image source %#',
    (source) => {
      expect(() =>
        PlayerItem({
          identity: {
            name: player.name,
            presence: player.presence,
            source,
            supportingText: player.supportingText,
          },
          onViewPlayer: jest.fn(),
          variant: 'game-slot',
        } as never),
      ).toThrow(/source must be bundled or local/u);
    },
  );

  it('retains complete long Unicode semantics inside the constrained row', async () => {
    const longIdentity = {
      initials: 'ŁN',
      name: 'Łucía Nguyễn from 東京',
      presence: 'away',
      supportingText:
        'Intermediate player with a deliberately long supporting description',
    } as const satisfies PlayerItemIdentity;
    const screen = await render(
      <PlayerItem
        identity={longIdentity}
        onViewPlayer={jest.fn()}
        variant="game-slot"
      />,
    );
    expect(
      screen.getByRole('button', {
        name: 'View Łucía Nguyễn from 東京, Intermediate player with a deliberately long supporting description',
      }),
    ).toBeTruthy();
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
