import { act, render, userEvent } from '@testing-library/react-native';
import { describe, expect, it, jest } from '@jest/globals';
import { AvailabilityStepScreen } from '../src/features/onboarding/AvailabilityStepScreen';
import type { AvailabilityDraft } from '../src/design-system/configuration/availability';

const complete: AvailabilityDraft = {
  days: ['weekdays', 'saturday'],
  times: ['afternoon', 'evening'],
  frequency: 'three-or-more',
};
const props = (
  initialDraft: AvailabilityDraft = { days: [], times: [], frequency: null },
) => ({
  initialDraft,
  onDraftChange: jest.fn(),
  onBack: jest.fn(),
  onFinish: jest.fn(async (): Promise<void> => undefined),
});

describe('when you play', () => {
  it('requires each group and allows toggling multiple days and times', async () => {
    const callbacks = props();
    const screen = await render(<AvailabilityStepScreen {...callbacks} />);
    const user = userEvent.setup();
    expect(
      screen.getByRole('progressbar', { name: 'Step 3 of 3' }),
    ).toBeVisible();
    await user.press(screen.getByRole('button', { name: 'Finish' }));
    expect(screen.getByText('Choose at least one day.')).toBeVisible();
    expect(screen.getByText('Choose at least one time window.')).toBeVisible();
    expect(
      screen.getByText('Choose how often you want to play.'),
    ).toBeVisible();
    expect(callbacks.onFinish).not.toHaveBeenCalled();
    for (const name of [
      'Weekdays, Mon–Fri',
      'Saturday, Weekend',
      'Sunday, Weekend',
      'Sunday, Weekend',
      'Afternoon, 12–5',
      'Evening, After 5',
    ]) {
      await user.press(screen.getByRole('checkbox', { name }));
    }
    await user.press(screen.getByRole('radio', { name: '1–2 games' }));
    await user.press(screen.getByRole('radio', { name: '3+ games' }));
    expect(screen.getAllByRole('checkbox', { checked: true })).toHaveLength(4);
    expect(screen.getAllByRole('radio', { checked: true })).toHaveLength(1);
    expect(callbacks.onDraftChange).toHaveBeenLastCalledWith(complete);
    await user.press(screen.getByRole('button', { name: 'Finish' }));
    expect(callbacks.onFinish).toHaveBeenCalledWith(complete);
  });

  it('blocks edits and back while saving and retains choices after failure for retry', async () => {
    const callbacks = props(complete);
    let rejectSave: (error: Error) => void = () => undefined;
    callbacks.onFinish.mockImplementationOnce(
      () =>
        new Promise<void>((_resolve, reject) => {
          rejectSave = reject;
        }),
    );
    const screen = await render(<AvailabilityStepScreen {...callbacks} />);
    const user = userEvent.setup();
    await user.press(screen.getByRole('button', { name: 'Finish' }));
    expect(screen.queryByRole('button', { name: 'Back' })).toBeNull();
    expect(screen.queryByRole('checkbox')).toBeNull();
    await act(() => rejectSave(new Error('private error')));
    expect(
      screen.getByRole('alert', {
        name: /Your availability could not be saved/u,
      }),
    ).toBeVisible();
    expect(screen.queryByText('private error')).toBeNull();
    expect(screen.getAllByRole('checkbox', { checked: true })).toHaveLength(4);
    await user.press(screen.getByRole('button', { name: 'Finish' }));
    expect(callbacks.onFinish).toHaveBeenCalledTimes(2);
    expect(
      screen.getByRole('alert', { name: /Availability saved/u }),
    ).toBeVisible();
  });
});
