import { describe, expect, it, jest } from '@jest/globals';
import { render, userEvent } from '@testing-library/react-native';
import type { ComponentProps } from 'react';

import { PrimaryTabBar } from '../src/app-shell/PrimaryTabBar';

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
}: Readonly<{
  activeIndex: number;
  defaultPrevented?: boolean;
}>) {
  const emit = jest.fn(() => ({ defaultPrevented }));
  const navigate = jest.fn();
  const props = {
    descriptors: {},
    insets: { bottom: 0, left: 0, right: 0, top: 0 },
    navigation: { emit, navigate },
    state: { index: activeIndex, routes },
  } as unknown as PrimaryTabBarProps;

  return { emit, navigate, props };
}

describe('PrimaryTabBar', () => {
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
});
