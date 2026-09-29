import { describe, expect, it, jest } from '@jest/globals';
import { render, userEvent } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import ProfileScreen from '../src/app/(tabs)/profile';
import SettingsScreen from '../src/app/settings';
import { flattenedStyle } from './helpers/componentTest';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = jest.mocked(useRouter);

function router(canGoBack = true) {
  const value = {
    back: jest.fn(),
    canGoBack: jest.fn(() => canGoBack),
    push: jest.fn(),
    replace: jest.fn(),
  } as unknown as ReturnType<typeof useRouter>;

  mockUseRouter.mockReturnValue(value);
  return value;
}

async function renderWithSafeArea(node: React.ReactNode) {
  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { height: 844, width: 390, x: 0, y: 0 },
        insets: { bottom: 34, left: 0, right: 0, top: 47 },
      }}
    >
      {node}
    </SafeAreaProvider>,
  );
}

describe('profile screen', () => {
  it('shows the current player and opens account settings', async () => {
    const navigation = router();
    const user = userEvent.setup();
    const screen = await renderWithSafeArea(<ProfileScreen />);

    expect(screen.getByRole('header', { name: 'Profile' })).toBeVisible();
    expect(screen.getByRole('header', { name: 'Alex Morgan' })).toBeVisible();
    expect(screen.getByLabelText('Alex Morgan profile photo')).toBeVisible();
    expect(screen.getByText('Intermediate · Rating 4.7')).toBeVisible();
    expect(
      screen.getByRole('summary', {
        name: 'Rating, 4.7, Current player rating, positive trend',
      }),
    ).toBeVisible();
    expect(
      screen.getByRole('summary', {
        name: 'Your preferences, Intermediate, Right, Weekdays, Evenings',
      }),
    ).toBeVisible();

    await user.press(screen.getByRole('button', { name: 'Account settings' }));
    expect(navigation.push).toHaveBeenCalledWith('/settings');
    expect(
      flattenedStyle(
        screen.getByTestId('profile-scroll').props.contentContainerStyle,
      ).paddingBottom,
    ).toBe(146);
  });

  it('changes the game reminder preference and returns to Profile', async () => {
    const navigation = router();
    const user = userEvent.setup();
    const screen = await renderWithSafeArea(<SettingsScreen />);

    expect(screen.getByRole('header', { name: 'Settings' })).toBeVisible();
    const reminders = screen.getByRole('switch', { name: 'Game reminders' });
    expect(reminders).toBeChecked();

    await user.press(reminders);
    expect(reminders).not.toBeChecked();

    await user.press(screen.getByRole('button', { name: 'Back' }));
    expect(navigation.back).toHaveBeenCalledTimes(1);
    expect(navigation.replace).not.toHaveBeenCalled();
  });

  it('returns a directly opened Settings screen to Profile', async () => {
    const navigation = router(false);
    const user = userEvent.setup();
    const screen = await renderWithSafeArea(<SettingsScreen />);

    await user.press(screen.getByRole('button', { name: 'Back' }));

    expect(navigation.back).not.toHaveBeenCalled();
    expect(navigation.replace).toHaveBeenCalledWith('/profile');
  });
});
