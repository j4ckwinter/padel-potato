import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import {
  act,
  fireEvent,
  render,
  userEvent,
} from '@testing-library/react-native';
import { BackHandler } from 'react-native';

let mockUserId = 'jack';
const mockBack = jest.fn();
const mockReplace = jest.fn();
const mockScreen = jest.fn(() => null);
jest.mock('expo-router', () => ({
  Stack: { Screen: (...args: unknown[]) => mockScreen(...(args as [])) },
  useRouter: () => ({
    canGoBack: () => false,
    back: mockBack,
    replace: mockReplace,
  }),
}));
jest.mock('../src/features/authentication/SessionContext', () => ({
  useSession: () => ({
    state: { status: 'signedIn', session: { userId: mockUserId } },
  }),
}));
jest.mock('../src/features/services/AppServicesContext', () => ({
  useAppServices: () => ({ currentUser: { identity: { name: 'Jack' } } }),
}));
jest.mock('expo-file-system', () => ({}));
jest.mock('expo-image-picker', () => ({ launchImageLibraryAsync: jest.fn() }));

import OnboardingScreen from '../src/app/onboarding';
import { loadAvailabilityDraft } from '../src/features/onboarding/availabilityDraft';
import { loadPlayDraft } from '../src/features/onboarding/playDraft';
import { loadProfileDraft } from '../src/features/onboarding/profileDraft';
const values = new Map<string, string>();
beforeEach(() => {
  mockUserId = 'jack';
  values.clear();
  mockReplace.mockClear();
  mockScreen.mockClear();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    },
  });
});

async function advance(screen: Awaited<ReturnType<typeof render>>) {
  await fireEvent.changeText(
    screen.getByLabelText('Display name, required'),
    'Jack Potato',
  );
  await fireEvent.changeText(
    screen.getByLabelText('Home location, required'),
    'London',
  );
  await userEvent
    .setup()
    .press(screen.getByRole('button', { name: 'Continue' }));
  expect(
    await screen.findByRole('header', { name: 'How you play' }),
  ).toBeVisible();
}

describe('onboarding route flow', () => {
  it('saves profile before advancing and retains both steps when going back', async () => {
    const screen = await render(<OnboardingScreen />);
    await advance(screen);
    expect(loadProfileDraft('jack')).toEqual({
      displayName: 'Jack Potato',
      homeLocation: 'London',
      photoUri: null,
    });
    await userEvent
      .setup()
      .press(screen.getByRole('radio', { name: 'Improver' }));
    await userEvent.setup().press(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByLabelText('Display name, required').props.value).toBe(
      'Jack Potato',
    );
    expect(screen.getByLabelText('Home location, required').props.value).toBe(
      'London',
    );
    await userEvent
      .setup()
      .press(screen.getByRole('button', { name: 'Continue' }));
    expect(
      screen.getByRole('radio', { name: 'Improver' }).props.accessibilityState
        .checked,
    ).toBe(true);
  });

  it('persists completed preferences and restores them on reopening with user isolation', async () => {
    const screen = await render(<OnboardingScreen />);
    await advance(screen);
    for (const name of ['Advanced', 'Either side', 'Social'])
      await userEvent.setup().press(screen.getByRole('radio', { name }));
    await userEvent
      .setup()
      .press(screen.getByRole('button', { name: 'Continue' }));
    expect(loadPlayDraft('jack')).toEqual({
      level: 'advanced',
      side: 'either',
      vibe: 'social',
    });
    await screen.unmount();
    const reopened = await render(<OnboardingScreen />);
    expect(reopened.getByLabelText('Home location, required').props.value).toBe(
      'London',
    );
    await userEvent
      .setup()
      .press(reopened.getByRole('button', { name: 'Continue' }));
    expect(
      reopened.getByRole('radio', { name: 'Advanced' }).props.accessibilityState
        .checked,
    ).toBe(true);
    mockUserId = 'other';
    await reopened.rerender(<OnboardingScreen />);
    expect(
      reopened.getByRole('header', { name: 'Your profile' }),
    ).toBeVisible();
    expect(reopened.getByLabelText('Home location, required').props.value).toBe(
      '',
    );
  });

  it('retains availability through back navigation and saves before finishing', async () => {
    const screen = await render(<OnboardingScreen />);
    await advance(screen);
    const user = userEvent.setup();
    for (const name of ['Improver', 'Either side', 'Social'])
      await user.press(screen.getByRole('radio', { name }));
    await user.press(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.getByRole('header', { name: 'When you play' })).toBeVisible();
    await user.press(screen.getByRole('checkbox', { name: 'Sunday, Weekend' }));
    await user.press(screen.getByRole('button', { name: 'Back' }));
    expect(
      screen.getByRole('radio', { name: 'Improver', checked: true }),
    ).toBeVisible();
    await user.press(screen.getByRole('button', { name: 'Continue' }));
    expect(
      screen.getByRole('checkbox', { name: 'Sunday, Weekend', checked: true }),
    ).toBeVisible();
    await user.press(
      screen.getByRole('checkbox', { name: 'Morning, Before 12' }),
    );
    await user.press(screen.getByRole('radio', { name: '1–2 games' }));
    const savedSetItem = localStorage.setItem;
    localStorage.setItem = () => {
      throw new Error('unavailable');
    };
    await user.press(screen.getByRole('button', { name: 'Finish' }));
    expect(mockReplace).not.toHaveBeenCalled();
    expect(
      screen.getByRole('alert', {
        name: /Your availability could not be saved/u,
      }),
    ).toBeVisible();
    localStorage.setItem = savedSetItem;
    await user.press(screen.getByRole('button', { name: 'Finish' }));
    expect(loadAvailabilityDraft('jack')).toEqual({
      days: ['sunday'],
      times: ['morning'],
      frequency: 'one-or-two',
    });
    expect(loadAvailabilityDraft('other')).toBeNull();
    expect(mockReplace).toHaveBeenCalledWith('/(tabs)/profile');
    await screen.unmount();
    const reopened = await render(<OnboardingScreen />);
    await user.press(reopened.getByRole('button', { name: 'Continue' }));
    await user.press(reopened.getByRole('button', { name: 'Continue' }));
    expect(
      reopened.getByRole('checkbox', {
        name: 'Sunday, Weekend',
        checked: true,
      }),
    ).toBeVisible();
  });

  it('routes Android back within the flow and disables iOS swipe dismissal', async () => {
    let hardwareBack:
      Parameters<typeof BackHandler.addEventListener>[1] | undefined;
    const listener = jest
      .spyOn(BackHandler, 'addEventListener')
      .mockImplementation((_event, callback) => {
        hardwareBack = callback;
        return { remove: jest.fn() };
      });
    try {
      const screen = await render(<OnboardingScreen />);
      await advance(screen);
      await act(() => {
        expect(
          hardwareBack?.({ type: 'hardwareBackPress', timeStamp: 1 }),
        ).toBe(true);
      });
      expect(
        screen.getByRole('header', { name: 'Your profile' }),
      ).toBeVisible();
      expect(mockScreen).toHaveBeenCalledWith(
        expect.objectContaining({ options: { gestureEnabled: false } }),
        undefined,
      );
    } finally {
      listener.mockRestore();
    }
  });

  it('keeps profile visible when persistence fails', async () => {
    localStorage.setItem = () => {
      throw new Error('unavailable');
    };
    const screen = await render(<OnboardingScreen />);
    await fireEvent.changeText(
      screen.getByLabelText('Home location, required'),
      'London',
    );
    await userEvent
      .setup()
      .press(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.getByRole('header', { name: 'Your profile' })).toBeVisible();
    expect(
      await screen.findByRole('alert', {
        name: /Your profile details could not be saved/u,
      }),
    ).toBeVisible();
  });
});
