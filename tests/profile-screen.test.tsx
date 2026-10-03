import { appServicesFromProfileRow } from '../src/features/supabase/appServices';
import type { PadelSupabaseClient } from '../src/features/supabase/client';
import { onboardingProfileRow } from './helpers/onboarding';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, render, userEvent, waitFor } from '@testing-library/react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import ProfileScreen from '../src/app/(tabs)/profile';
import SettingsScreen from '../src/app/settings';
import {
  type SessionMutationResult,
  useSession,
} from '../src/features/authentication/SessionContext';
import { demoAppServices } from '../src/features/demo/demoAppServices';
import type { PlayerProfile } from '../src/features/players/player';
import type { AppServices } from '../src/features/services/AppServicesContext';
import { AppServicesProvider } from '../src/features/services/AppServicesContext';
import { flattenedStyle } from './helpers/componentTest';

jest.mock('../src/features/notifications/ReminderProvider', () => ({
  useReminders: () => ({
    enabled: false,
    pending: false,
    error: null,
    setEnabled: jest.fn(async () => undefined),
    dismissError: jest.fn(),
  }),
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useFocusEffect: jest.fn(),
}));

jest.mock('../src/features/authentication/SessionContext', () => ({
  useSession: jest.fn(),
}));

const mockUseRouter = jest.mocked(useRouter);
const mockUseSession = jest.mocked(useSession);

function successfulSessionAction() {
  return jest.fn(() =>
    Promise.resolve({ status: 'success' } satisfies SessionMutationResult),
  );
}

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
      <AppServicesProvider services={demoAppServices}>
        {node}
      </AppServicesProvider>
    </SafeAreaProvider>,
  );
}

it('shows saved onboarding fields and an HTTPS photo on Profile', async () => {
  router();
  const services = appServicesFromProfileRow(
    { ...onboardingProfileRow, avatar_url: 'https://example.com/avatar.jpg' },
    {} as PadelSupabaseClient,
  );
  const screen = await renderWithSafeArea(
    <AppServicesProvider services={services}>
      <ProfileScreen />
    </AppServicesProvider>,
  );
  expect(screen.getByRole('header', { name: 'Jack Potato' })).toBeVisible();
  expect(screen.getByText('London')).toBeVisible();
  expect(
    screen.getByRole('summary', {
      name: 'Your preferences, Improver, Either, Weekdays, Saturday, Afternoon, Evening',
    }),
  ).toBeVisible();
  expect(screen.getByText('Game vibe: Social')).toBeVisible();
  expect(screen.getByText('Each week: 3+ games')).toBeVisible();
  expect(
    screen.getByRole('image', { name: 'Jack Potato profile photo' }),
  ).toBeVisible();
});

describe('profile screen', () => {
  beforeEach(() => {
    mockUseSession.mockReturnValue({
      signUp: jest.fn(async () => ({
        status: 'confirmationRequired' as const,
      })),
      requestPasswordReset: successfulSessionAction(),
      updatePassword: successfulSessionAction(),
      callbackError: null,
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
  });

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
    await user.press(
      screen.getByRole('button', { name: 'Set up your profile' }),
    );
    expect(navigation.push).toHaveBeenCalledWith('/onboarding');
    expect(
      flattenedStyle(
        screen.getByTestId('profile-scroll').props.contentContainerStyle,
      ).paddingBottom,
    ).toBe(146);
  });

  it('returns Settings to Profile', async () => {
    const navigation = router();
    const user = userEvent.setup();
    const screen = await renderWithSafeArea(<SettingsScreen />);

    expect(screen.getByRole('header', { name: 'Settings' })).toBeVisible();
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

  it('signs out from account settings', async () => {
    router();
    const signOut = successfulSessionAction();
    mockUseSession.mockReturnValue({
      signUp: jest.fn(async () => ({
        status: 'confirmationRequired' as const,
      })),
      requestPasswordReset: successfulSessionAction(),
      updatePassword: successfulSessionAction(),
      callbackError: null,
      signIn: successfulSessionAction(),
      signOut,
      state: {
        session: {
          kind: 'supabase',
          userId: '00000000-0000-4000-8000-000000000001',
        },
        status: 'signedIn',
      },
    });
    const user = userEvent.setup();
    const screen = await renderWithSafeArea(<SettingsScreen />);

    await user.press(screen.getByRole('button', { name: 'Sign out' }));

    await waitFor(() => expect(signOut).toHaveBeenCalledTimes(1));
  });
});

function profileWithServices(services: AppServices) {
  return (
    <SafeAreaProvider
      initialMetrics={{
        frame: { height: 844, width: 390, x: 0, y: 0 },
        insets: { bottom: 34, left: 0, right: 0, top: 47 },
      }}
    >
      <AppServicesProvider services={services}>
        <ProfileScreen />
      </AppServicesProvider>
    </SafeAreaProvider>
  );
}
it('refreshes persisted result stats on focus and keeps the last profile during a failed refresh', async () => {
  router();
  let latest: PlayerProfile = {
    ...demoAppServices.currentUser,
    stats: { rating: '4.7', gamesPlayed: '0', winRate: '0%' },
  };
  const findProfileById = jest.fn(async () => latest);
  const services = {
    ...demoAppServices,
    currentUser: latest,
    players: { ...demoAppServices.players, findProfileById },
  };
  const screen = await render(profileWithServices(services));
  await waitFor(() => expect(findProfileById).toHaveBeenCalled());
  latest = {
    ...latest,
    stats: { rating: '4.7', gamesPlayed: '1', winRate: '100%' },
  };
  const focus = jest.mocked(useFocusEffect).mock.calls.at(-1)?.[0];
  await act(async () => {
    focus?.();
  });
  expect(
    await screen.findByRole('summary', { name: 'Games, 1, Games played' }),
  ).toBeVisible();
  expect(
    screen.getByRole('summary', {
      name: 'Win rate, 100%, All-time win rate, positive trend',
    }),
  ).toBeVisible();
  findProfileById.mockRejectedValueOnce(new Error('offline'));
  await act(async () => {
    focus?.();
  });
  expect(
    screen.getByRole('summary', { name: 'Games, 1, Games played' }),
  ).toBeVisible();
});
it('ignores a delayed profile reply from the previous account', async () => {
  router();
  let finish: (profile: PlayerProfile) => void = () => undefined;
  const firstProfile = {
    ...demoAppServices.currentUser,
    id: 'first-account',
    identity: {
      ...demoAppServices.currentUser.identity,
      name: 'First Account',
    },
  };
  const firstServices = {
    ...demoAppServices,
    currentUser: firstProfile,
    players: {
      ...demoAppServices.players,
      findProfileById: jest.fn(
        () =>
          new Promise<PlayerProfile>((resolve) => {
            finish = resolve;
          }),
      ),
    },
  };
  const secondProfile = {
    ...demoAppServices.currentUser,
    id: 'second-account',
    identity: {
      ...demoAppServices.currentUser.identity,
      name: 'Second Account',
    },
    stats: { rating: '3.0', gamesPlayed: '2', winRate: '50%' },
  };
  const secondServices = {
    ...demoAppServices,
    currentUser: secondProfile,
    players: {
      ...demoAppServices.players,
      findProfileById: jest.fn(async () => secondProfile),
    },
  };
  const screen = await render(profileWithServices(firstServices));
  await screen.rerender(profileWithServices(secondServices));
  await act(async () => {
    finish({
      ...firstProfile,
      stats: { rating: '9.9', gamesPlayed: '99', winRate: '99%' },
    });
  });
  expect(screen.getByRole('header', { name: 'Second Account' })).toBeVisible();
  expect(screen.queryByText('First Account')).toBeNull();
  expect(
    screen.getByRole('summary', { name: 'Games, 2, Games played' }),
  ).toBeVisible();
  expect(screen.queryByText('99')).toBeNull();
});
