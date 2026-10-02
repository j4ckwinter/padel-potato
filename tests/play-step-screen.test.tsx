import { act, render, userEvent } from '@testing-library/react-native';
import { describe, expect, it, jest } from '@jest/globals';
import {
  PlayStepScreen,
  type PlayStepDraft,
} from '../src/features/onboarding/PlayStepScreen';

const empty: PlayStepDraft = { level: null, side: null, vibe: null };
const complete: PlayStepDraft = {
  level: 'improver',
  side: 'either',
  vibe: 'social',
};
const props = (initialDraft = empty) => ({
  initialDraft,
  onBack: jest.fn(),
  onDraftChange: jest.fn(),
  onContinue: jest.fn(async (): Promise<void> => undefined),
});

describe('how you play onboarding step', () => {
  it('shows step two and requires a selection in each group', async () => {
    const callbacks = props();
    const screen = await render(<PlayStepScreen {...callbacks} />);
    expect(
      screen.getByRole('progressbar', { name: 'Step 2 of 3' }),
    ).toBeVisible();
    expect(screen.getByRole('header', { name: 'How you play' })).toBeVisible();
    expect(screen.getAllByRole('radio')).toHaveLength(9);
    await userEvent
      .setup()
      .press(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.getByText('Choose an option for your level.')).toBeVisible();
    expect(
      screen.getByText('Choose an option for preferred side.'),
    ).toBeVisible();
    expect(screen.getByText('Choose an option for game vibe.')).toBeVisible();
    expect(callbacks.onContinue).not.toHaveBeenCalled();
  });

  it('switches one choice per group and keeps an already-selected choice', async () => {
    const callbacks = props();
    const screen = await render(<PlayStepScreen {...callbacks} />);
    const user = userEvent.setup();
    await user.press(screen.getByRole('radio', { name: 'Beginner' }));
    await user.press(screen.getByRole('radio', { name: 'Improver' }));
    expect(
      screen.getByRole('radio', { name: 'Beginner', checked: false }),
    ).toBeVisible();
    expect(
      screen.getByRole('radio', { name: 'Improver', checked: true }),
    ).toBeVisible();
    await user.press(screen.getByRole('radio', { name: 'Improver' }));
    await user.press(screen.getByRole('radio', { name: 'Either side' }));
    await user.press(screen.getByRole('radio', { name: 'Social' }));
    expect(screen.getAllByRole('radio', { checked: true })).toHaveLength(3);
    expect(callbacks.onDraftChange).toHaveBeenLastCalledWith(complete);
    await user.press(screen.getByRole('button', { name: 'Continue' }));
    expect(callbacks.onContinue).toHaveBeenCalledWith(complete);
    expect(
      screen.getByRole('alert', { name: /Ready for step 3/u }),
    ).toBeVisible();
    await user.press(screen.getByRole('radio', { name: 'Competitive' }));
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('blocks controls while saving and lets players retry a failed save', async () => {
    let rejectSave: (error: Error) => void = () => undefined;
    const callbacks = props(complete);
    callbacks.onContinue.mockImplementationOnce(
      () =>
        new Promise<void>((_resolve, reject) => {
          rejectSave = reject;
        }),
    );
    const screen = await render(<PlayStepScreen {...callbacks} />);
    const user = userEvent.setup();
    await user.press(screen.getByRole('button', { name: 'Continue' }));
    expect(
      screen.getByRole('button', { name: 'Continue', busy: true }),
    ).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Back' })).toBeNull();
    expect(screen.queryAllByRole('radio')).toHaveLength(0);
    await user.press(screen.getByRole('button', { name: 'Continue' }));
    expect(callbacks.onContinue).toHaveBeenCalledTimes(1);
    await act(async () => rejectSave(new Error('Private failure')));
    expect(
      screen.getByRole('alert', {
        name: /Your play preferences could not be saved/u,
      }),
    ).toBeVisible();
    expect(screen.queryByText('Private failure')).toBeNull();
    await user.press(screen.getByRole('button', { name: 'Continue' }));
    expect(callbacks.onContinue).toHaveBeenCalledTimes(2);
    expect(
      screen.getByRole('alert', { name: /Ready for step 3/u }),
    ).toBeVisible();
  });

  it('passes all edits upward before going back', async () => {
    const callbacks = props(complete);
    const screen = await render(<PlayStepScreen {...callbacks} />);
    const user = userEvent.setup();
    await user.press(screen.getByRole('radio', { name: 'Advanced' }));
    expect(callbacks.onDraftChange).toHaveBeenLastCalledWith({
      ...complete,
      level: 'advanced',
    });
    await user.press(screen.getByRole('button', { name: 'Back' }));
    expect(callbacks.onBack).toHaveBeenCalledTimes(1);
  });
});
