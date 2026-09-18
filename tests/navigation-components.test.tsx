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
        minHeight: 76,
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

  it.each(validOptions)('renders %i ordered named tabs with deterministic equal allocation', async (...options) => {
    const tuple = options as unknown as SegmentOptions;
    const screen = await render(
      <SegmentedControl onValueChange={jest.fn()} options={tuple} value={tuple[0]} />,
    );
    const tabs = screen.getAllByRole('tab');

    expect(tabs.map((tab) => tab.props.accessibilityLabel)).toEqual([...tuple]);
    expect(flattenedStyle(screen.getByTestId('segmented-control').props.style)).toEqual(
      expect.objectContaining({ height: 48, width: 350 }),
    );
    expect(tabs.map((tab) => flattenedStyle(tab.props.style))).toEqual(
      tuple.map(() => expect.objectContaining({
        flexBasis: 0,
        flexGrow: 1,
        height: 48,
        minHeight: 48,
        minWidth: 0,
      })),
    );
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
