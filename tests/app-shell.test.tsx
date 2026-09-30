import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render, waitFor } from '@testing-library/react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import RootLayout from '../src/app/_layout';
import { demoAppServices } from '../src/features/demo/demoAppServices';
import {
  type SessionMutationResult,
  useSession,
} from '../src/features/authentication/SessionContext';
import { useAppServicesLoadState } from '../src/features/services/AppServicesContext';

jest.mock('expo-font', () => ({
  useFonts: jest.fn(),
}));

jest.mock('expo-router', () => {
  const { View } =
    jest.requireActual<typeof import('react-native')>('react-native');

  function Stack({ children }: { children?: React.ReactNode }) {
    return <View testID="app-router">{children}</View>;
  }
  function Protected({
    children,
    guard,
  }: {
    children?: React.ReactNode;
    guard: boolean;
  }) {
    return guard ? children : null;
  }
  function Screen({ name }: { name: string }) {
    return <View testID={`route-${name}`} />;
  }
  Stack.Protected = Protected;
  Stack.Screen = Screen;

  return {
    ErrorBoundary: () => null,
    Stack,
  };
});

jest.mock('../src/features/authentication/SessionContext', () => ({
  SessionProvider: ({ children }: { children?: React.ReactNode }) => children,
  useSession: jest.fn(),
}));

jest.mock('../src/features/services/AppServicesContext', () => ({
  SessionAppServicesProvider: ({ children }: { children?: React.ReactNode }) =>
    children,
  useAppServicesLoadState: jest.fn(),
}));

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
    SafeAreaView: ({ children }: { children?: React.ReactNode }) => (
      <View>{children}</View>
    ),
  };
});

const mockUseFonts = jest.mocked(useFonts);
const mockUseSession = jest.mocked(useSession);
const mockUseAppServicesLoadState = jest.mocked(useAppServicesLoadState);
const mockPreventAutoHideAsync = jest.mocked(SplashScreen.preventAutoHideAsync);
const mockHideAsync = jest.mocked(SplashScreen.hideAsync);

function successfulSessionAction() {
  return jest.fn(() =>
    Promise.resolve({ status: 'success' } satisfies SessionMutationResult),
  );
}

describe('application shell startup', () => {
  beforeEach(() => {
    mockUseFonts.mockReset();
    mockHideAsync.mockClear();
    mockUseSession.mockReturnValue({
      signIn: successfulSessionAction(),
      signOut: successfulSessionAction(),
      state: { status: 'signedOut' },
    });
    mockUseAppServicesLoadState.mockReturnValue({
      retry: jest.fn(),
      state: { status: 'inactive' },
    });
  });

  it('keeps the native splash visible while the session restores', async () => {
    mockUseFonts.mockReturnValue([true, null]);
    mockUseSession.mockReturnValue({
      signIn: successfulSessionAction(),
      signOut: successfulSessionAction(),
      state: { status: 'loading' },
    });

    const screen = await render(<RootLayout />);

    expect(screen.toJSON()).toBeNull();
    expect(mockHideAsync).not.toHaveBeenCalled();
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
    expect(screen.getByTestId('route-sign-in')).toBeOnTheScreen();
    expect(screen.queryByTestId('route-(tabs)')).toBeNull();
    await waitFor(() => expect(mockHideAsync).toHaveBeenCalledTimes(1));
  });

  it('exposes protected app routes to a restored session', async () => {
    mockUseFonts.mockReturnValue([true, null]);
    mockUseSession.mockReturnValue({
      signIn: successfulSessionAction(),
      signOut: successfulSessionAction(),
      state: {
        session: {
          kind: 'supabase',
          userId: '00000000-0000-4000-8000-000000000001',
        },
        status: 'signedIn',
      },
    });
    mockUseAppServicesLoadState.mockReturnValue({
      retry: jest.fn(),
      state: { services: demoAppServices, status: 'ready' },
    });

    const screen = await render(<RootLayout />);

    expect(screen.getByTestId('route-(tabs)')).toBeOnTheScreen();
    expect(screen.getByTestId('route-settings')).toBeOnTheScreen();
    expect(screen.queryByTestId('route-sign-in')).toBeNull();
  });

  it('does not expose app routes until the current profile is ready', async () => {
    mockUseFonts.mockReturnValue([true, null]);
    mockUseSession.mockReturnValue({
      signIn: successfulSessionAction(),
      signOut: successfulSessionAction(),
      state: {
        session: {
          kind: 'supabase',
          userId: '00000000-0000-4000-8000-000000000001',
        },
        status: 'signedIn',
      },
    });
    mockUseAppServicesLoadState.mockReturnValue({
      retry: jest.fn(),
      state: { status: 'profileMissing' },
    });

    const screen = await render(<RootLayout />);

    expect(
      screen.getByRole('header', { name: 'Profile not found' }),
    ).toBeOnTheScreen();
    expect(screen.queryByTestId('app-router')).toBeNull();
  });
});
