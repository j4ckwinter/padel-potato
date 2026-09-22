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

import {
  bottomNavigationFixtures,
  segmentedControlFixtures,
  appHeaderFixtures,
  sectionHeaderFixtures,
} from '../src/design-system/stories/fixtures';

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

describe('SectionHeader optional action pair', () => {
  it('declares an effective 44-point action within independent wrapper clearance', async () => {
    const onActionPress = jest.fn();
    const user = userEvent.setup();
    const screen = await render(
      <SectionHeader
        actionLabel="See all ›"
        onActionPress={onActionPress}
        title="Open games near you"
      />,
    );
    const action = screen.getByRole('button', { name: 'See all ›' });
    expect(action.props.hitSlop).toEqual({
      bottom: 2,
      left: 2,
      right: 2,
      top: 2,
    });
    expect(flattenedStyle(action.props.style)).toEqual(
      expect.objectContaining({
        height: 40,
        minHeight: 40,
        minWidth: 40,
      }),
    );
    const visualRowStyle = flattenedStyle(
      screen.getByTestId('section-header-visual-row').props.style,
    );
    const wrapperStyle = flattenedStyle(
      screen.getByTestId('section-header').props.style,
    );
    expect(visualRowStyle).toEqual(
      expect.objectContaining({ height: 28, width: 350 }),
    );
    expect(wrapperStyle).toEqual(
      expect.objectContaining({ height: 44, width: 354 }),
    );
    expect(
      (wrapperStyle.width as number) - (visualRowStyle.width as number),
    ).toBe(4);
    expect(action.props.hitSlop.left + action.props.hitSlop.right).toBe(4);
    expect(
      (flattenedStyle(action.props.style).height as number) +
        action.props.hitSlop.top +
        action.props.hitSlop.bottom,
    ).toBe(44);
    await user.press(action);
    expect(onActionPress).toHaveBeenCalledTimes(1);
  });

  it('rejects partial, blank, and routing-shaped action contracts', () => {
    expect(() =>
      SectionHeader({
        actionLabel: 'See all ›',
        title: 'Games',
      } as unknown as SectionHeaderProps),
    ).toThrow(
      /actionLabel and onActionPress must both be present or both be absent/u,
    );
    expect(() =>
      SectionHeader({
        onActionPress: jest.fn(),
        title: 'Games',
      } as unknown as SectionHeaderProps),
    ).toThrow(
      /actionLabel and onActionPress must both be present or both be absent/u,
    );
    expect(() =>
      SectionHeader({
        actionLabel: ' ',
        onActionPress: jest.fn(),
        title: 'Games',
      }),
    ).toThrow(/non-empty action label/u);
    expect(() =>
      SectionHeader({
        navigate: jest.fn(),
        title: 'Games',
      } as unknown as SectionHeaderProps),
    ).toThrow(/Unsupported design-system value: navigate/u);
  });
});
