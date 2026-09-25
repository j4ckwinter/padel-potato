import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render, waitFor } from '@testing-library/react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import RootLayout from '../src/app/_layout';

jest.mock('expo-font', () => ({
  useFonts: jest.fn(),
}));

jest.mock('expo-router', () => {
  const { View } =
    jest.requireActual<typeof import('react-native')>('react-native');

  return {
    ErrorBoundary: () => null,
    Stack: () => <View testID="app-router" />,
  };
});

jest.mock('expo-splash-screen', () => ({
  hideAsync: jest.fn(() => Promise.resolve(true)),
  preventAutoHideAsync: jest.fn(() => Promise.resolve(true)),
}));

jest.mock('react-native-safe-area-context', () => {
  const { View } =
    jest.requireActual<typeof import('react-native')>('react-native');

  return {
    SafeAreaProvider: ({ children }: { children?: React.ReactNode }) => (
      <View testID="safe-area-provider">{children}</View>
    ),
  };
});

const mockUseFonts = jest.mocked(useFonts);
const mockPreventAutoHideAsync = jest.mocked(SplashScreen.preventAutoHideAsync);
const mockHideAsync = jest.mocked(SplashScreen.hideAsync);

describe('application shell startup', () => {
  beforeEach(() => {
    mockUseFonts.mockReset();
    mockHideAsync.mockClear();
  });

  it('keeps the native splash visible while fonts load', async () => {
    mockUseFonts.mockReturnValue([false, null]);

    const screen = await render(<RootLayout />);

    expect(screen.toJSON()).toBeNull();
    expect(mockPreventAutoHideAsync).toHaveBeenCalledTimes(1);
    expect(mockHideAsync).not.toHaveBeenCalled();
  });

  it('renders the router inside the safe-area provider after fonts load', async () => {
    mockUseFonts.mockReturnValue([true, null]);

    const screen = await render(<RootLayout />);

    expect(screen.getByTestId('safe-area-provider')).toBeOnTheScreen();
    expect(screen.getByTestId('app-router')).toBeOnTheScreen();
    await waitFor(() => expect(mockHideAsync).toHaveBeenCalledTimes(1));
  });
});
