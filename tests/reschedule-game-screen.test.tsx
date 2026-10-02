import { expect, it, jest } from '@jest/globals';
import { act, render, userEvent } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RescheduleGameScreen from '../src/app/(tabs)/games/reschedule';
import { demoAppServices } from '../src/features/demo/demoAppServices';
import { useAppServices } from '../src/features/services/AppServicesContext';
import { upcomingScheduleDays } from '../src/features/game-creation/scheduleOptions';
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ gameId: 'game' }),
  useRouter: () => ({ replace: mockReplace, back: jest.fn() }),
}));
jest.mock('../src/features/services/AppServicesContext', () => ({
  useAppServices: jest.fn(),
}));
it('holds the selected schedule and prevents duplicate saves while saving', async () => {
  let finish: (value: unknown) => void = () => undefined;
  const reschedule = jest.fn(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  jest.mocked(useAppServices).mockReturnValue({
    ...demoAppServices,
    games: { ...demoAppServices.games, reschedule },
  } as unknown as ReturnType<typeof useAppServices>);
  const screen = await render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { height: 844, width: 390, x: 0, y: 0 },
        insets: { bottom: 34, left: 0, right: 0, top: 47 },
      }}
    >
      <RescheduleGameScreen />
    </SafeAreaProvider>,
  );
  const user = userEvent.setup();
  const day = upcomingScheduleDays(new Date())[1];
  await user.press(
    screen.getByRole('radio', { name: `${day.dayLabel}, ${day.dateLabel}` }),
  );
  await user.press(screen.getByRole('radio', { name: '18:30, Available' }));
  await user.press(screen.getByRole('button', { name: 'Save new time' }));
  expect(screen.getByRole('button', { name: 'Save new time' })).toBeDisabled();
  for (const choice of screen.getAllByRole('radio'))
    expect(choice).toBeDisabled();
  await user.press(screen.getByRole('button', { name: 'Save new time' }));
  expect(reschedule).toHaveBeenCalledTimes(1);
  expect(reschedule).toHaveBeenCalledWith(
    'game',
    expect.objectContaining({
      date: day.date,
      time: '18:30',
      status: 'complete',
    }),
  );
  await act(async () => {
    finish({ status: 'notFound' });
  });
  expect(screen.getByRole('alert')).toHaveTextContent(
    'This game can no longer be rescheduled.',
  );
  expect(mockReplace).not.toHaveBeenCalled();
});
