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

describe('SegmentedControl tuple boundary and controlled selection', () => {
  const validOptions = [
    ['Upcoming', 'Open'],
    ['Upcoming', 'Open', 'Past'],
    ['Upcoming', 'Open', 'Past', 'All'],
  ] as const satisfies readonly SegmentOptions[];  it.each(validOptions)('renders an ordered named tuple with deterministic equal allocation', async (...options) => {
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
