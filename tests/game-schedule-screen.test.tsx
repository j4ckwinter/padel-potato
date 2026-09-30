import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { render, userEvent } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import CreateGameScreen from '../src/app/(tabs)/create';
import { demoAppServices } from '../src/features/demo/demoAppServices';
import { AppServicesProvider } from '../src/features/services/AppServicesContext';
import { flattenedStyle } from './helpers/componentTest';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = jest.mocked(useRouter);

function router() {
  const value = {
    push: jest.fn(),
    replace: jest.fn(),
  } as unknown as ReturnType<typeof useRouter>;
  mockUseRouter.mockReturnValue(value);
  return value;
}

function renderCreateGame(bottomInset = 0) {
  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { height: 844, width: 390, x: 0, y: 0 },
        insets: { bottom: bottomInset, left: 0, right: 0, top: 47 },
      }}
    >
      <AppServicesProvider services={demoAppServices}>
        <CreateGameScreen />
      </AppServicesProvider>
    </SafeAreaProvider>,
  );
}

describe('create game screen', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: new Date(2026, 8, 29, 18, 12) });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('keeps the final action clear of the floating navigation', async () => {
    router();
    const screen = await renderCreateGame(34);

    expect(
      flattenedStyle(
        screen.getByTestId('create-game-scroll').props.contentContainerStyle,
      ).paddingBottom,
    ).toBe(146);
  });

  it('shows tomorrow and its start times after today has closed', async () => {
    jest.setSystemTime(new Date(2026, 8, 29, 21, 31));
    router();
    const screen = await renderCreateGame();

    expect(
      screen.queryByRole('radio', { name: /^Today, /u }),
    ).not.toBeOnTheScreen();
    expect(screen.getByRole('radio', { name: 'Wed, 30 Sept' })).toBeVisible();
    expect(
      screen.getByRole('radio', { name: '06:00, Available' }),
    ).toBeDisabled();
  });

  it('renders the confirmed product content and requires venue and schedule', async () => {
    const navigation = router();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const screen = await renderCreateGame();

    expect(screen.getByRole('header', { name: 'Padel game' })).toBeVisible();
    expect(screen.getByTestId('game-name-summary')).toBeVisible();
    expect(screen.getByTestId('schedule-controls')).toBeVisible();
    expect(screen.getByTestId('game-setup-controls')).toBeVisible();
    expect(screen.getByPlaceholderText('Search venues or clubs')).toBeVisible();
    expect(
      screen.queryByRole('header', { name: 'When' }),
    ).not.toBeOnTheScreen();
    expect(screen.getByText('Day')).toBeVisible();
    expect(screen.getByText('Start time')).toBeVisible();
    expect(
      screen.queryByRole('header', { name: 'Game setup' }),
    ).not.toBeOnTheScreen();
    expect(screen.getByText('1 player')).toBeVisible();
    expect(screen.queryByText('Intermediate level')).not.toBeOnTheScreen();
    expect(screen.getByText('Duration')).toBeVisible();
    expect(screen.getByText('Current players')).toBeVisible();
    expect(screen.getByText('Game type')).toBeVisible();
    expect(screen.queryByRole('progressbar')).not.toBeOnTheScreen();

    const daySelectors = screen.getAllByRole('radio', {
      name: /^(Today|Mon|Tue|Wed|Thu|Fri|Sat|Sun), /u,
    });
    expect(daySelectors).toHaveLength(7);
    expect(screen.getByRole('tab', { name: '60 minutes' })).toBeSelected();
    expect(screen.getByRole('tab', { name: '90 minutes' })).not.toBeSelected();
    expect(screen.getByRole('tab', { name: 'Social game' })).toBeSelected();
    expect(
      screen.getByRole('tab', { name: 'Competitive game' }),
    ).not.toBeSelected();

    await user.press(screen.getByRole('tab', { name: '90 minutes' }));
    await user.press(screen.getByRole('tab', { name: 'Competitive game' }));

    expect(screen.getByRole('tab', { name: '90 minutes' })).toBeSelected();
    expect(
      screen.getByRole('tab', { name: 'Competitive game' }),
    ).toBeSelected();

    expect(
      screen.getByRole('button', { name: 'Decrease Current players' }),
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Increase Current players' }),
    ).toBeEnabled();
    await user.press(
      screen.getByRole('button', { name: 'Increase Current players' }),
    );
    expect(screen.getByText('2 players')).toBeVisible();
    const currentFirstTime = screen.getAllByRole('radio', {
      name: /, Available$/u,
    })[0];
    expect(currentFirstTime).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Create game' })).toBeDisabled();

    await user.press(daySelectors[1]);

    expect(daySelectors[1]).toBeChecked();
    const firstTime = screen.getByRole('radio', {
      name: '06:00, Available',
    });
    expect(firstTime).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Create game' })).toBeDisabled();

    await user.press(firstTime);

    expect(firstTime).toBeChecked();
    expect(
      screen.getByRole('header', {
        name: /^[A-Z][a-z]+ (Morning|Afternoon|Evening|Night) Padel$/u,
      }),
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'Create game' })).toBeDisabled();

    await user.type(
      screen.getByLabelText('Venue, required'),
      'Potato Padel Club',
    );

    const createButton = screen.getByRole('button', { name: 'Create game' });
    expect(createButton).toBeEnabled();
    await user.press(createButton);

    expect(navigation.replace).toHaveBeenCalledWith({
      params: { created: 'true', gameId: expect.any(String) },
      pathname: '/games/[gameId]',
    });
  });

  it('opens notifications from the creation header', async () => {
    const navigation = router();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const screen = await renderCreateGame();

    await user.press(screen.getByRole('button', { name: 'Notifications' }));

    expect(navigation.push).toHaveBeenCalledWith('/notifications');
  });
});
