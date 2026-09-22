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

describe('Settings Row public contract', () => {});

describe('Settings Row runtime and semantic contract', () => {
  it.each([
    [
      'profile navigation',
      {
        disabled: false,
        icon: 'profile',
        label: 'Account',
        onPress: jest.fn(),
        variant: 'navigation',
      },
    ],
    [
      'disabled profile navigation',
      {
        disabled: true,
        icon: 'profile',
        label: 'Account',
        onPress: jest.fn(),
        variant: 'navigation',
      },
    ],
    [
      'court navigation',
      {
        disabled: false,
        icon: 'court',
        label: 'Courts',
        onPress: jest.fn(),
        variant: 'navigation',
      },
    ],
    [
      'value',
      {
        icon: 'location',
        label: 'Location',
        onPress: jest.fn(),
        value: 'London',
        variant: 'value',
      },
    ],
    [
      'toggle off',
      {
        checked: false,
        disabled: false,
        icon: 'notification',
        label: 'Notifications',
        onCheckedChange: jest.fn(),
        variant: 'toggle',
      },
    ],
    [
      'toggle on',
      {
        checked: true,
        disabled: false,
        icon: 'notification',
        label: 'Notifications',
        onCheckedChange: jest.fn(),
        variant: 'toggle',
      },
    ],
    [
      'toggle disabled',
      {
        checked: false,
        disabled: true,
        icon: 'notification',
        label: 'Notifications',
        onCheckedChange: jest.fn(),
        variant: 'toggle',
      },
    ],
    [
      'destructive',
      { icon: 'close', onPress: jest.fn(), variant: 'destructive' },
    ],
  ] as Array<[string, SettingsRowProps]>)(
    'renders the authored %s branch at 352x64',
    async (_branch, props) => {
      const screen = await render(<SettingsRow {...props} />);
      expect(
        flattenedStyle(screen.getByTestId('settings-row').props.style),
      ).toEqual(expect.objectContaining({ height: 64, width: 352 }));
    },
  );

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
      <SettingsRow
        disabled
        icon="profile"
        label="Account"
        onPress={onPress}
        variant="navigation"
      />,
    );
    const disabledNavigation = navigation.getByRole('button', {
      name: 'Account',
    });
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
    const disabledToggle = toggle.getByRole('switch', {
      name: 'Notifications',
    });
    expect(disabledToggle).toBeDisabled();
    await userEvent.setup().press(disabledToggle);
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it('exposes named button branches and only their supplied intent', async () => {
    const onValuePress = jest.fn();
    const value = await render(
      <SettingsRow
        icon="location"
        label="Location"
        onPress={onValuePress}
        value="London"
        variant="value"
      />,
    );
    await userEvent
      .setup()
      .press(value.getByRole('button', { name: 'Location, London' }));
    expect(onValuePress).toHaveBeenCalledTimes(1);

    const onSignOut = jest.fn();
    const destructive = await render(
      <SettingsRow icon="close" onPress={onSignOut} variant="destructive" />,
    );
    await userEvent
      .setup()
      .press(destructive.getByRole('button', { name: 'Sign out' }));
    expect(onSignOut).toHaveBeenCalledTimes(1);
    expect(destructive.queryAllByRole('image')).toHaveLength(0);
  });

  it.each([
    {
      disabled: false,
      icon: 'location',
      label: 'Account',
      onPress: jest.fn(),
      variant: 'navigation',
    },
    {
      disabled: false,
      icon: 'profile',
      label: 'Account',
      onPress: jest.fn(),
      state: 'pressed',
      variant: 'navigation',
    },
    {
      disabled: false,
      icon: 'profile',
      label: '',
      onPress: jest.fn(),
      variant: 'navigation',
    },
    {
      icon: 'location',
      label: 'Location',
      onPress: jest.fn(),
      value: null,
      variant: 'value',
    },
    {
      checked: false,
      disabled: false,
      icon: 'notification',
      label: 'Notifications',
      variant: 'toggle',
    },
    {
      checked: null,
      disabled: false,
      icon: 'notification',
      label: 'Notifications',
      onCheckedChange: jest.fn(),
      variant: 'toggle',
    },
    { icon: 'close', onPress: null, variant: 'destructive' },
    { icon: 'profile', onPress: jest.fn(), variant: 'destructive' },
    {
      icon: 'profile',
      label: 'Account',
      onPress: jest.fn(),
      variant: 'unknown',
    },
  ])(
    'rejects arbitrary icons, persistent state, or malformed branch content %#',
    (props) => {
      expect(() => SettingsRow(invalidProps(props))).toThrow(
        /Unsupported Settings Row/u,
      );
    },
  );

  it('retains complete long label and value semantics', async () => {
    const screen = await render(
      <SettingsRow
        icon="location"
        label="Preferred location for Łucía Nguyễn from 東京"
        onPress={jest.fn()}
        value="Padel United International Centre, London"
        variant="value"
      />,
    );
    expect(
      screen.getByRole('button', {
        name: 'Preferred location for Łucía Nguyễn from 東京, Padel United International Centre, London',
      }),
    ).toBeTruthy();
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
