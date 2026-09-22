import { describe, expect, it, jest } from '@jest/globals';

import { flattenedStyle, invalidProps } from './helpers/componentTest';

import { render, userEvent } from '@testing-library/react-native';

import { Children } from 'react';

import { StyleSheet } from 'react-native';

import BottomNavigationStories, {
  Boundaries as BottomNavigationBoundaries,
  Variants as BottomNavigationVariants,
} from '../src/design-system/components/navigation/BottomNavigation.stories';

import {
  BottomNavigation,
  bottomNavigationDestinations,
  type BottomNavigationDestination,
  type BottomNavigationProps,
} from '../src/design-system/components/navigation/BottomNavigation';

import SegmentedControlStories, {
  Boundaries as SegmentedControlBoundaries,
  normalizeSegmentedControlStoryArgs,
  Variants as SegmentedControlVariants,
} from '../src/design-system/components/navigation/SegmentedControl.stories';

import {
  SegmentedControl,
  type SegmentedControlProps,
  type SegmentOptions,
} from '../src/design-system/components/navigation/SegmentedControl';

import { bottomNavigationFixtures, segmentedControlFixtures, appHeaderFixtures, sectionHeaderFixtures } from '../src/design-system/stories/fixtures';

import AppHeaderStories, {
  Boundaries as AppHeaderBoundaries,
  normalizeAppHeaderStoryArgs,
  Variants as AppHeaderVariants,
} from '../src/design-system/components/navigation/AppHeader.stories';

import {
  AppHeader,
  appHeaderPages,
  type AppHeaderProps,
} from '../src/design-system/components/navigation/AppHeader';

import SectionHeaderStories, {
  Boundaries as SectionHeaderBoundaries,
  Variants as SectionHeaderVariants,
} from '../src/design-system/components/navigation/SectionHeader.stories';

import {
  SectionHeader,
  type SectionHeaderProps,
} from '../src/design-system/components/navigation/SectionHeader';

describe('AppHeader closed page configurations', () => {  it.each([
    ['home', 'Hi, Alex', 'Ready for your next match?', 'wave'],
    ['games', 'Games', 'Find your next match', 'search'],
    ['create', 'Create game', 'Set up your next match', 'create'],
    ['players', 'Players', 'Find your next partner', 'players'],
  ] as Array<['home' | 'games' | 'create' | 'players', string, string, string]>)('renders %s with decorative mascot and notification-only intent', async (page, title, subtitle, mascot) => {
    const onNotificationPress = jest.fn();
    const user = userEvent.setup();
    const screen = await render(
      <AppHeader page={page} onNotificationPress={onNotificationPress} />,
    );

    expect(screen.getByRole('header', { name: title })).toBeTruthy();
    expect(screen.getByText(subtitle)).toBeTruthy();
    expect(screen.getByTestId(`phase3-artwork-${mascot}`, { includeHiddenElements: true })).toBeTruthy();
    expect(screen.queryAllByRole('image')).toHaveLength(0);
    expect(screen.getAllByRole('button').map((button) => button.props.accessibilityLabel)).toEqual(['Notifications']);
    await user.press(screen.getByRole('button', { name: 'Notifications' }));
    expect(onNotificationPress).toHaveBeenCalledTimes(1);
    expect(flattenedStyle(screen.getByTestId('app-header').props.style)).toEqual(
      expect.objectContaining({ height: 112, width: 390 }),
    );
  });

  it('renders Profile with its decorative mascot and no overflow or empty action', async () => {
    const screen = await render(<AppHeader page="profile" />);

    expect(screen.getByRole('header', { name: 'Profile' })).toBeTruthy();
    expect(screen.getByTestId('phase3-artwork-profile', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(screen.queryByLabelText(/overflow|more/iu)).toBeNull();
  });

  it.each([
    ['notifications', 'Notifications', 'Updates and activity'],
    ['gameDetails', 'Game details', 'Open game · 1 spot left'],
    ['settings', 'Settings', 'Manage your account'],
  ] as Array<['notifications' | 'gameDetails' | 'settings', string, string]>)('renders %s with only a 40-point back visual and effective 44 target', async (page, title, subtitle) => {
    const onBackPress = jest.fn();
    const user = userEvent.setup();
    const screen = await render(<AppHeader page={page} onBackPress={onBackPress} />);
    const back = screen.getByRole('button', { name: 'Back' });

    expect(screen.getByRole('header', { name: title })).toBeTruthy();
    expect(screen.getByText(subtitle)).toBeTruthy();
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(back.props.hitSlop).toEqual({ bottom: 2, left: 2, right: 2, top: 2 });
    expect(flattenedStyle(back.props.style)).toEqual(expect.objectContaining({
      height: 40,
      minHeight: 40,
      minWidth: 40,
      width: 40,
    }));
    await user.press(back);
    expect(onBackPress).toHaveBeenCalledTimes(1);
  });

  it('renders Player Details with isolated back and controlled favourite callbacks', async () => {
    const onBackPress = jest.fn();
    const onFavouriteChange = jest.fn<(checked: boolean) => void>();
    const user = userEvent.setup();
    const screen = await render(
      <AppHeader
        favouriteChecked={false}
        onBackPress={onBackPress}
        onFavouriteChange={onFavouriteChange}
        page="playerDetails"
      />,
    );
    const favourite = screen.getByRole('checkbox', { name: 'Favourite player' });

    expect(screen.getByRole('header', { name: 'Player profile' })).toBeTruthy();
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(favourite.props.accessibilityState.checked).toBe(false);
    await user.press(favourite);
    expect(onFavouriteChange).toHaveBeenCalledWith(true);
    expect(onBackPress).not.toHaveBeenCalled();
    expect(favourite.props.accessibilityState.checked).toBe(false);

    await screen.rerender(
      <AppHeader
        favouriteChecked
        onBackPress={onBackPress}
        onFavouriteChange={onFavouriteChange}
        page="playerDetails"
      />,
    );
    expect(screen.getByRole('checkbox', { name: 'Favourite player' }).props.accessibilityState.checked).toBe(true);
  });

  it('permits copy customization but rejects unsupported action slots and partial favourite state', async () => {
    const screen = await render(
      <AppHeader
        onNotificationPress={jest.fn()}
        page="home"
        subtitle="Welcome back to the tournament"
        title="Hi, Alexandra"
      />,
    );
    expect(screen.getByRole('header', { name: 'Hi, Alexandra' })).toBeTruthy();
    expect(screen.getByText('Welcome back to the tournament')).toBeTruthy();

    expect(() => AppHeader({ page: 'profile', onOverflowPress: jest.fn() } as unknown as AppHeaderProps)).toThrow(
      /Unsupported design-system value: onOverflowPress/u,
    );
    expect(() => AppHeader({ page: 'home', onBackPress: jest.fn() } as unknown as AppHeaderProps)).toThrow(
      /Unsupported design-system value: onBackPress/u,
    );
    expect(() => AppHeader({ page: 'playerDetails', favouriteChecked: false, onBackPress: jest.fn() } as unknown as AppHeaderProps)).toThrow(
      /Unsupported design-system value: undefined/u,
    );
    expect(() => AppHeader({ page: 'profile', title: '  ' })).toThrow(
      /non-empty title/u,
    );
  });
});
