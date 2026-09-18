import { describe, expect, it, jest } from '@jest/globals';
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
  Variants as SegmentedControlVariants,
} from '../src/design-system/components/navigation/SegmentedControl.stories';
import {
  SegmentedControl,
  type SegmentedControlProps,
  type SegmentOptions,
} from '../src/design-system/components/navigation/SegmentedControl';
import { phase3Families } from '../src/design-system/components/sourceRegistry';
import AppHeaderStories, {
  Boundaries as AppHeaderBoundaries,
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

const flattenedStyle = (style: unknown) =>
  StyleSheet.flatten(
    style as Parameters<typeof StyleSheet.flatten>[0],
  ) as Record<string, unknown>;

const bottomNavigationRecords = phase3Families[9].records;
const segmentedControlRecords = phase3Families[10].records;

describe('BottomNavigation source, order, and controlled intent', () => {
  it('retains all five records and the fixed visual/focus destination order', () => {
    expect(phase3Families[9]).toEqual(expect.objectContaining({
      key: 'bottomNavigation',
      recordCount: 5,
      sourceId: '482a7222-5a3b-8086-8008-a61a5487bd61',
    }));
    expect(bottomNavigationRecords.map((record) => record.normalizedTuple.active)).toEqual([
      'create',
      'profile',
      'players',
      'games',
      'home',
    ]);
    expect(bottomNavigationDestinations.map(({ destination, label, icon }) => ({ destination, label, icon }))).toEqual([
      { destination: 'home', label: 'Home', icon: 'home' },
      { destination: 'games', label: 'Games', icon: 'calendar' },
      { destination: 'create', label: 'Create', icon: 'add' },
      { destination: 'players', label: 'Players', icon: 'players' },
      { destination: 'profile', label: 'Profile', icon: 'profile' },
    ]);
    expect(bottomNavigationDestinations).toBe(Object.freeze(bottomNavigationDestinations));
  });

  it('renders five individually named tabs in source-defined visual order', async () => {
    const screen = await render(
      <BottomNavigation activeDestination="games" onDestinationPress={jest.fn()} />,
    );
    const tabs = screen.getAllByRole('tab');

    expect(tabs.map((tab) => tab.props.accessibilityLabel)).toEqual([
      'Home', 'Games', 'Create', 'Players', 'Profile',
    ]);
    expect(tabs.map((tab) => tab.props.accessibilityState.selected)).toEqual([
      false, true, false, false, false,
    ]);
    expect(screen.queryAllByRole('image')).toHaveLength(0);
    expect(flattenedStyle(screen.getByTestId('bottom-navigation').props.style)).toEqual(
      expect.objectContaining({ height: 76, width: 390 }),
    );
    for (const tab of tabs) {
      expect(flattenedStyle(tab.props.style)).toEqual(expect.objectContaining({
        flexBasis: 0,
        flexGrow: 1,
        height: 76,
        minHeight: 44,
      }));
    }
  });

  it('emits only the requested destination and remains controlled until rerender', async () => {
    const onDestinationPress = jest.fn<(destination: BottomNavigationDestination) => void>();
    const user = userEvent.setup();
    const screen = await render(
      <BottomNavigation activeDestination="home" onDestinationPress={onDestinationPress} />,
    );
    await user.press(screen.getByRole('tab', { name: 'Players' }));

    expect(onDestinationPress).toHaveBeenCalledTimes(1);
    expect(onDestinationPress).toHaveBeenCalledWith('players');
    expect(screen.getByRole('tab', { name: 'Home' }).props.accessibilityState.selected).toBe(true);
    expect(screen.getByRole('tab', { name: 'Players' }).props.accessibilityState.selected).toBe(false);

    await screen.rerender(
      <BottomNavigation activeDestination="players" onDestinationPress={onDestinationPress} />,
    );
    expect(screen.getByRole('tab', { name: 'Players' }).props.accessibilityState.selected).toBe(true);
  });

  it('rejects unknown destinations, callbacks, and router-shaped props', () => {
    expect(() => BottomNavigation({
      activeDestination: 'settings' as BottomNavigationDestination,
      onDestinationPress: jest.fn(),
    })).toThrow(/Unsupported design-system value: settings/u);
    expect(() => BottomNavigation({
      activeDestination: 'home',
      onDestinationPress: undefined as never,
    })).toThrow(/Unsupported design-system value: undefined/u);
    expect(() => BottomNavigation({
      activeDestination: 'home',
      navigate: jest.fn(),
      onDestinationPress: jest.fn(),
    } as unknown as BottomNavigationProps)).toThrow(/Unsupported design-system value: navigate/u);
  });
});

describe('SegmentedControl tuple boundary and controlled selection', () => {
  const validOptions = [
    ['Upcoming', 'Open'],
    ['Upcoming', 'Open', 'Past'],
    ['Upcoming', 'Open', 'Past', 'All'],
  ] as const satisfies readonly SegmentOptions[];

  it('retains the exact four source records and accepts only unique 2/3/4 tuples', () => {
    expect(phase3Families[10]).toEqual(expect.objectContaining({
      key: 'segmentedControl',
      recordCount: 4,
      sourceId: '482a7222-5a3b-8086-8008-a60ede25d147',
    }));
    expect(segmentedControlRecords.map((record) => record.normalizedTuple)).toEqual([
      { options: 3, state: 'disabled' },
      { options: 4, state: 'focused' },
      { options: 3, state: 'selected' },
      { options: 2, state: 'default' },
    ]);

    for (const options of validOptions) {
      expect(() => SegmentedControl({
        onValueChange: jest.fn(),
        options,
        value: options[0],
      })).not.toThrow();
    }
    for (const options of [[], ['One'], ['One', 'Two', 'Three', 'Four', 'Five'], ['One', 'One']]) {
      expect(() => SegmentedControl({
        onValueChange: jest.fn(),
        options: options as unknown as SegmentOptions,
        value: options[0] ?? 'One',
      })).toThrow(/exactly 2, 3, or 4 unique non-empty options/u);
    }
  });

  it.each(validOptions)('renders an ordered named tuple with deterministic equal allocation', async (...options) => {
    const tuple = options as unknown as SegmentOptions;
    const screen = await render(
      <SegmentedControl onValueChange={jest.fn()} options={tuple} value={tuple[0]} />,
    );
    const tabs = screen.getAllByRole('tab');

    expect(tabs.map((tab) => tab.props.accessibilityLabel)).toEqual([...tuple]);
    expect(flattenedStyle(screen.getByTestId('segmented-control').props.style)).toEqual(
      expect.objectContaining({ height: 48, width: 350 }),
    );
    for (const tab of tabs) {
      expect(flattenedStyle(tab.props.style)).toEqual(expect.objectContaining({
        flexBasis: 0,
        flexGrow: 1,
        height: 48,
        minHeight: 48,
        minWidth: 48,
        width: 0,
      }));
    }
  });

  it('emits one next value, remains controlled, and blocks every tab when disabled', async () => {
    const options = ['Upcoming', 'Open', 'Past'] as const;
    const onValueChange = jest.fn<(value: string) => void>();
    const user = userEvent.setup();
    const screen = await render(
      <SegmentedControl onValueChange={onValueChange} options={options} value="Upcoming" />,
    );
    await user.press(screen.getByRole('tab', { name: 'Past' }));

    expect(onValueChange).toHaveBeenCalledWith('Past');
    expect(screen.getByRole('tab', { name: 'Upcoming' }).props.accessibilityState.selected).toBe(true);
    expect(screen.getByRole('tab', { name: 'Past' }).props.accessibilityState.selected).toBe(false);

    await screen.rerender(
      <SegmentedControl disabled onValueChange={onValueChange} options={options} value="Past" />,
    );
    for (const tab of screen.getAllByRole('tab')) {
      expect(tab.props.accessibilityState.disabled).toBe(true);
      await user.press(tab);
    }
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  it('rejects missing selected values and broad or routing-shaped runtime props', () => {
    expect(() => SegmentedControl({
      onValueChange: jest.fn(),
      options: ['Upcoming', 'Open'],
      value: 'Past',
    })).toThrow(/Unsupported design-system value: Past/u);
    expect(() => SegmentedControl({
      onValueChange: undefined as never,
      options: ['Upcoming', 'Open'],
      value: 'Upcoming',
    })).toThrow(/Unsupported design-system value: undefined/u);
    expect(() => SegmentedControl({
      navigate: jest.fn(),
      onValueChange: jest.fn(),
      options: ['Upcoming', 'Open'],
      value: 'Upcoming',
    } as unknown as SegmentedControlProps)).toThrow(/Unsupported design-system value: navigate/u);
  });
});

describe('Navigation composite Storybook contract', () => {
  it('publishes exact groups, bounded controls, and source-record variant counts', () => {
    expect(BottomNavigationStories.title).toBe('Navigation/Bottom Navigation');
    expect(BottomNavigationStories.argTypes).toEqual(expect.objectContaining({
      activeDestination: { control: 'select', options: ['home', 'games', 'create', 'players', 'profile'] },
      onDestinationPress: { action: 'destination pressed' },
    }));
    expect(SegmentedControlStories.title).toBe('Navigation/Segmented Control');
    expect(SegmentedControlStories.argTypes).toEqual(expect.objectContaining({
      disabled: { control: 'boolean' },
      onValueChange: { action: 'value changed' },
    }));

    const bottomVariants = BottomNavigationVariants.render?.({} as never, {} as never) as React.ReactElement<{ children: React.ReactNode }>;
    const segmentVariants = SegmentedControlVariants.render?.({} as never, {} as never) as React.ReactElement<{ children: React.ReactNode }>;
    expect(Children.toArray(bottomVariants.props.children)).toHaveLength(bottomNavigationRecords.length);
    expect(Children.toArray(segmentVariants.props.children)).toHaveLength(segmentedControlRecords.length);
  });

  it('discloses native width, long labels, 200% scale, and adjacent-target boundaries', () => {
    const serialized = JSON.stringify([
      BottomNavigationBoundaries.render?.({} as never, {} as never),
      SegmentedControlBoundaries.render?.({} as never, {} as never),
    ]);
    expect(serialized).toContain('390');
    expect(serialized).toContain('350');
    expect(serialized).toContain('long');
    expect(serialized).toContain('200%');
    expect(serialized).toMatch(/adjacent|overlap/u);
    expect(serialized).toContain('Phase 5');
  });
});

const appHeaderRecords = phase3Families[11].records;
const sectionHeaderRecords = phase3Families[12].records;

describe('AppHeader closed page configurations', () => {
  it('retains all nine records and the resolved source-defined page map', () => {
    expect(phase3Families[11]).toEqual(expect.objectContaining({
      key: 'appHeader',
      recordCount: 9,
      sourceId: '482a7222-5a3b-8086-8008-a61da61c2e7f',
    }));
    expect(appHeaderRecords.map((record) => record.normalizedTuple.page)).toEqual([
      'settings',
      'playerDetails',
      'gameDetails',
      'notifications',
      'profile',
      'players',
      'create',
      'games',
      'home',
    ]);
    expect(appHeaderPages).toEqual([
      'home', 'games', 'create', 'players', 'profile',
      'notifications', 'gameDetails', 'playerDetails', 'settings',
    ]);
  });

  it.each([
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

describe('SectionHeader optional action pair', () => {
  it('retains the exact singleton and renders a header without an empty target', async () => {
    expect(phase3Families[12]).toEqual(expect.objectContaining({
      key: 'sectionHeader',
      recordCount: 1,
      sourceId: '482a7222-5a3b-8086-8008-a608c3bde79a',
    }));
    const screen = await render(<SectionHeader title="Open games near you" />);
    expect(screen.getByRole('header', { name: 'Open games near you' })).toBeTruthy();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(flattenedStyle(screen.getByTestId('section-header').props.style)).toEqual(
      expect.objectContaining({ minHeight: 44, width: 350 }),
    );
  });

  it('leaves enough parent clearance for the separately named effective 44-point action target', async () => {
    const onActionPress = jest.fn();
    const user = userEvent.setup();
    const screen = await render(
      <SectionHeader actionLabel="See all ›" onActionPress={onActionPress} title="Open games near you" />,
    );
    const action = screen.getByRole('button', { name: 'See all ›' });
    expect(action.props.hitSlop).toEqual({ bottom: 2, left: 2, right: 2, top: 2 });
    expect(flattenedStyle(action.props.style)).toEqual(expect.objectContaining({
      minHeight: 40,
      minWidth: 40,
    }));
    expect(flattenedStyle(screen.getByTestId('section-header').props.style)).toEqual(
      expect.objectContaining({ minHeight: 44 }),
    );
    await user.press(action);
    expect(onActionPress).toHaveBeenCalledTimes(1);
  });

  it('rejects partial, blank, and routing-shaped action contracts', () => {
    expect(() => SectionHeader({ actionLabel: 'See all ›', title: 'Games' } as unknown as SectionHeaderProps)).toThrow(
      /actionLabel and onActionPress must both be present or both be absent/u,
    );
    expect(() => SectionHeader({ onActionPress: jest.fn(), title: 'Games' } as unknown as SectionHeaderProps)).toThrow(
      /actionLabel and onActionPress must both be present or both be absent/u,
    );
    expect(() => SectionHeader({ actionLabel: ' ', onActionPress: jest.fn(), title: 'Games' })).toThrow(
      /non-empty action label/u,
    );
    expect(() => SectionHeader({ navigate: jest.fn(), title: 'Games' } as unknown as SectionHeaderProps)).toThrow(
      /Unsupported design-system value: navigate/u,
    );
  });
});

describe('Header Storybook contract', () => {
  it('publishes exact groups, bounded callbacks, and source-order variants', () => {
    expect(AppHeaderStories.title).toBe('Navigation/App Header');
    expect(AppHeaderStories.argTypes).toEqual(expect.objectContaining({
      page: { control: 'select', options: appHeaderPages },
    }));
    expect(JSON.stringify(AppHeaderStories.argTypes)).not.toMatch(/overflow|router|navigate/iu);
    expect(SectionHeaderStories.title).toBe('Navigation/Section Header');

    const appVariants = AppHeaderVariants.render?.({} as never, {} as never) as React.ReactElement<{ children: React.ReactNode }>;
    const sectionVariants = SectionHeaderVariants.render?.({} as never, {} as never) as React.ReactElement<{ children: React.ReactNode }>;
    expect(Children.toArray(appVariants.props.children)).toHaveLength(appHeaderRecords.length);
    expect(Children.toArray(sectionVariants.props.children)).toHaveLength(sectionHeaderRecords.length);
  });

  it('discloses long text, 200% scale, action overlap, and Profile no-overflow boundaries', () => {
    const serialized = JSON.stringify([
      AppHeaderBoundaries.render?.({} as never, {} as never),
      SectionHeaderBoundaries.render?.({} as never, {} as never),
    ]);
    expect(serialized).toContain('long');
    expect(serialized).toContain('200%');
    expect(serialized).toMatch(/overlap|clearance/u);
    expect(serialized).toContain('Profile');
    expect(serialized).toContain('no overflow');
    expect(serialized).toContain('Phase 5');
  });
});
