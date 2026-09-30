import { describe, expect, it, jest } from '@jest/globals';
import { render, userEvent } from '@testing-library/react-native';
import type { ComponentProps } from 'react';

import { PrimaryTabBar } from '../src/app-shell/PrimaryTabBar';
import { flattenedStyle } from './helpers/componentTest';

type PrimaryTabBarProps = ComponentProps<typeof PrimaryTabBar>;

const routes = [
  { key: 'home-key', name: 'index' },
  { key: 'games-key', name: 'games' },
  { key: 'create-key', name: 'create' },
  { key: 'players-key', name: 'players' },
  { key: 'profile-key', name: 'profile' },
];

function tabBarProps({
  activeIndex,
  defaultPrevented = false,
  nestedState,
}: Readonly<{
  activeIndex: number;
  defaultPrevented?: boolean;
  nestedState?: Readonly<{ index: number; key: string; type: 'stack' }>;
}>) {
  const emit = jest.fn(() => ({ defaultPrevented }));
  const dispatch = jest.fn();
  const navigate = jest.fn();
  const stateRoutes = routes.map((route, index) =>
    index === activeIndex && nestedState
      ? { ...route, state: nestedState }
      : route,
  );
  const props = {
    descriptors: {},
    insets: { bottom: 0, left: 0, right: 0, top: 0 },
    navigation: { dispatch, emit, navigate },
    state: { index: activeIndex, routes: stateRoutes },
  } as unknown as PrimaryTabBarProps;

  return { dispatch, emit, navigate, props };
}

describe('PrimaryTabBar', () => {
  it('floats over tab content without blocking the surrounding screen', async () => {
    const home = tabBarProps({ activeIndex: 0 });
    const screen = await render(<PrimaryTabBar {...home.props} />);
    const tabBar = screen.getByTestId('primary-tab-bar');

    expect(tabBar.props.pointerEvents).toBe('box-none');
    expect(flattenedStyle(tabBar.props.style)).toEqual(
      expect.objectContaining({
        backgroundColor: 'transparent',
        bottom: 0,
        left: 0,
        position: 'absolute',
        right: 0,
      }),
    );
  });

  it('navigates to a pressed destination and reflects Router state', async () => {
    const home = tabBarProps({ activeIndex: 0 });
    const user = userEvent.setup();
    const screen = await render(<PrimaryTabBar {...home.props} />);

    expect(
      screen.getByRole('tab', { name: 'Home' }).props.accessibilityState
        .selected,
    ).toBe(true);

    await user.press(screen.getByRole('tab', { name: 'Games' }));

    expect(home.emit).toHaveBeenCalledWith({
      canPreventDefault: true,
      target: 'games-key',
      type: 'tabPress',
    });
    expect(home.navigate).toHaveBeenCalledWith('games', undefined);

    const games = tabBarProps({ activeIndex: 1 });
    await screen.rerender(<PrimaryTabBar {...games.props} />);

    expect(
      screen.getByRole('tab', { name: 'Games' }).props.accessibilityState
        .selected,
    ).toBe(true);
  });

  it('honours a prevented tab press', async () => {
    const home = tabBarProps({ activeIndex: 0, defaultPrevented: true });
    const user = userEvent.setup();
    const screen = await render(<PrimaryTabBar {...home.props} />);

    await user.press(screen.getByRole('tab', { name: 'Profile' }));

    expect(home.navigate).not.toHaveBeenCalled();
    expect(
      screen.getByRole('tab', { name: 'Home' }).props.accessibilityState
        .selected,
    ).toBe(true);
  });

  it('returns a selected tab to the root of its nested stack', async () => {
    const games = tabBarProps({
      activeIndex: 1,
      nestedState: { index: 2, key: 'games-stack', type: 'stack' },
    });
    const user = userEvent.setup();
    const screen = await render(<PrimaryTabBar {...games.props} />);

    await user.press(screen.getByRole('tab', { name: 'Games' }));

    expect(games.dispatch).toHaveBeenCalledWith({
      target: 'games-stack',
      type: 'POP_TO_TOP',
    });
    expect(games.navigate).not.toHaveBeenCalled();
  });
});
