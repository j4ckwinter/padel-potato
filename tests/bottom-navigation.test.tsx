import { describe, expect, it, jest } from '@jest/globals';

import { flattenedStyle } from './helpers/componentTest';

import { render, userEvent } from '@testing-library/react-native';

import {
  BottomNavigation,
  type BottomNavigationDestination,
  type BottomNavigationProps,
} from '../src/design-system/components/navigation/BottomNavigation';

describe('BottomNavigation source, order, and controlled intent', () => {
  it('renders five individually named tabs in component-defined visual order', async () => {
    const screen = await render(
      <BottomNavigation
        activeDestination="games"
        onDestinationPress={jest.fn()}
      />,
    );
    const tabs = screen.getAllByRole('tab');

    expect(tabs.map((tab) => tab.props.accessibilityLabel)).toEqual([
      'Home',
      'Games',
      'Create',
      'Players',
      'Profile',
    ]);
    expect(tabs.map((tab) => tab.props.accessibilityState.selected)).toEqual([
      false,
      true,
      false,
      false,
      false,
    ]);
    expect(screen.queryAllByRole('image')).toHaveLength(0);
    expect(
      flattenedStyle(screen.getByTestId('bottom-navigation').props.style),
    ).toEqual(expect.objectContaining({ height: 76, width: 390 }));
    for (const tab of tabs) {
      expect(flattenedStyle(tab.props.style)).toEqual(
        expect.objectContaining({
          flexBasis: 0,
          flexGrow: 1,
          height: 76,
          minHeight: 44,
        }),
      );
    }
  });

  it('emits only the requested destination and remains controlled until rerender', async () => {
    const onDestinationPress =
      jest.fn<(destination: BottomNavigationDestination) => void>();
    const user = userEvent.setup();
    const screen = await render(
      <BottomNavigation
        activeDestination="home"
        onDestinationPress={onDestinationPress}
      />,
    );
    await user.press(screen.getByRole('tab', { name: 'Players' }));

    expect(onDestinationPress).toHaveBeenCalledTimes(1);
    expect(onDestinationPress).toHaveBeenCalledWith('players');
    expect(
      screen.getByRole('tab', { name: 'Home' }).props.accessibilityState
        .selected,
    ).toBe(true);
    expect(
      screen.getByRole('tab', { name: 'Players' }).props.accessibilityState
        .selected,
    ).toBe(false);

    await screen.rerender(
      <BottomNavigation
        activeDestination="players"
        onDestinationPress={onDestinationPress}
      />,
    );
    expect(
      screen.getByRole('tab', { name: 'Players' }).props.accessibilityState
        .selected,
    ).toBe(true);
  });

  it('rejects unknown destinations, callbacks, and router-shaped props', () => {
    expect(() =>
      BottomNavigation({
        activeDestination: 'settings' as BottomNavigationDestination,
        onDestinationPress: jest.fn(),
      }),
    ).toThrow(/Unsupported design-system value: settings/u);
    expect(() =>
      BottomNavigation({
        activeDestination: 'home',
        onDestinationPress: undefined as never,
      }),
    ).toThrow(/Unsupported design-system value: undefined/u);
    expect(() =>
      BottomNavigation({
        activeDestination: 'home',
        navigate: jest.fn(),
        onDestinationPress: jest.fn(),
      } as unknown as BottomNavigationProps),
    ).toThrow(/Unsupported design-system value: navigate/u);
  });
});
