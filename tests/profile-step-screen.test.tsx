import {
  act,
  fireEvent,
  render,
  userEvent,
} from '@testing-library/react-native';
import { describe, expect, it, jest } from '@jest/globals';

import { ProfileStepScreen } from '../src/features/onboarding/ProfileStepScreen';

const emptyDraft = { displayName: '', homeLocation: '', photoUri: null };
const validDraft = {
  displayName: 'Jack',
  homeLocation: 'London',
  photoUri: null,
};

function props(initialDraft = emptyDraft) {
  return {
    initialDraft,
    onContinue: jest.fn(async (): Promise<void> => undefined),
    onPickPhoto: jest.fn(async (): Promise<string | null> => null),
  };
}

describe('profile onboarding step', () => {
  it('shows first-step progress and required field errors without saving', async () => {
    const callbacks = props();
    const screen = await render(<ProfileStepScreen {...callbacks} />);
    expect(screen.getByRole('header', { name: 'Your profile' })).toBeVisible();
    expect(
      screen.getByRole('progressbar', { name: 'Step 1 of 3' }),
    ).toBeVisible();
    await userEvent
      .setup()
      .press(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.getByText('Enter your display name.')).toBeVisible();
    expect(screen.getByText('Enter your home location.')).toBeVisible();
    expect(callbacks.onContinue).not.toHaveBeenCalled();
  });

  it('enforces name and location limits before saving', async () => {
    const callbacks = props({
      displayName: 'N'.repeat(81),
      homeLocation: 'L'.repeat(121),
      photoUri: null,
    });
    const screen = await render(<ProfileStepScreen {...callbacks} />);
    await userEvent
      .setup()
      .press(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.getByText('Use 80 characters or fewer.')).toBeVisible();
    expect(screen.getByText('Use 120 characters or fewer.')).toBeVisible();
    expect(callbacks.onContinue).not.toHaveBeenCalled();
  });

  it('saves trimmed details and clears the step-two confirmation when edited', async () => {
    const callbacks = props({
      displayName: ' Jack ',
      homeLocation: ' London ',
      photoUri: null,
    });
    const screen = await render(<ProfileStepScreen {...callbacks} />);
    await userEvent
      .setup()
      .press(screen.getByRole('button', { name: 'Continue' }));
    expect(callbacks.onContinue).toHaveBeenCalledWith(validDraft);
    expect(
      screen.getByRole('alert', {
        name: 'Profile details saved. Ready for step 2.',
      }),
    ).toBeVisible();
    await fireEvent.changeText(
      screen.getByLabelText('Display name, required'),
      'Alex',
    );
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('accepts a synchronous draft save and immediately confirms success', async () => {
    const onContinue = jest.fn(() => undefined);
    const screen = await render(
      <ProfileStepScreen {...props(validDraft)} onContinue={onContinue} />,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Continue' }));
    expect(onContinue).toHaveBeenCalledWith(validDraft);
    expect(
      screen.getByRole('button', { name: 'Continue', busy: false }),
    ).toBeEnabled();
    expect(
      screen.getByRole('alert', { name: /Ready for step 2/u }),
    ).toBeVisible();
  });

  it('catches a synchronous save failure and allows retry', async () => {
    const onContinue = jest
      .fn<() => void>()
      .mockImplementationOnce(() => {
        throw new Error('Private storage error');
      })
      .mockImplementationOnce(() => undefined);
    const screen = await render(
      <ProfileStepScreen {...props(validDraft)} onContinue={onContinue} />,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Continue' }));
    expect(
      screen.getByRole('alert', {
        name: /Your profile details could not be saved/u,
      }),
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled();
    await fireEvent.press(screen.getByRole('button', { name: 'Continue' }));
    expect(onContinue).toHaveBeenCalledTimes(2);
    expect(
      screen.getByRole('alert', { name: /Ready for step 2/u }),
    ).toBeVisible();
  });

  it('keeps an optional photo on cancellation and allows changing it', async () => {
    const callbacks = props(validDraft);
    callbacks.onPickPhoto
      .mockResolvedValueOnce('file:///photo.png')
      .mockResolvedValueOnce(null);
    const screen = await render(<ProfileStepScreen {...callbacks} />);
    const user = userEvent.setup();
    await user.press(
      screen.getByRole('button', { name: 'Add a profile photo' }),
    );
    await user.press(
      screen.getByRole('button', { name: 'Change profile photo' }),
    );
    await user.press(screen.getByRole('button', { name: 'Continue' }));
    expect(callbacks.onContinue).toHaveBeenCalledWith({
      ...validDraft,
      photoUri: 'file:///photo.png',
    });
  });

  it('blocks editing and repeat actions while saving, then allows retry after failure', async () => {
    let rejectSave: (reason: Error) => void = () => undefined;
    const callbacks = props(validDraft);
    callbacks.onContinue.mockImplementationOnce(
      () =>
        new Promise<void>((_resolve, reject) => {
          rejectSave = reject;
        }),
    );
    const screen = await render(<ProfileStepScreen {...callbacks} />);
    const user = userEvent.setup();
    await user.press(screen.getByRole('button', { name: 'Continue' }));
    expect(
      screen.getByRole('button', { name: 'Continue', busy: true }),
    ).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Back' })).toBeNull();
    expect(screen.getByLabelText('Display name, required')).toBeDisabled();
    await user.press(screen.getByRole('button', { name: 'Continue' }));
    expect(callbacks.onContinue).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByRole('button', { name: 'Add a profile photo' }),
    ).toBeNull();
    expect(callbacks.onPickPhoto).not.toHaveBeenCalled();
    await act(async () => rejectSave(new Error('Secret failure')));
    expect(
      screen.getByRole('alert', {
        name: /Your profile details could not be saved/u,
      }),
    ).toBeVisible();
    expect(screen.queryByText('Secret failure')).toBeNull();
    await user.press(screen.getByRole('button', { name: 'Continue' }));
    expect(callbacks.onContinue).toHaveBeenCalledTimes(2);
    expect(
      screen.getByRole('alert', { name: /Ready for step 2/u }),
    ).toBeVisible();
  });

  it('reports photo selection failure', async () => {
    const callbacks = props();
    callbacks.onPickPhoto.mockRejectedValueOnce(
      new Error('Choose a JPG or PNG under 5 MB'),
    );
    const screen = await render(<ProfileStepScreen {...callbacks} />);
    const user = userEvent.setup();
    await user.press(
      screen.getByRole('button', { name: 'Add a profile photo' }),
    );
    expect(
      screen.getByRole('alert', { name: /Choose a JPG or PNG under 5 MB/u }),
    ).toBeVisible();
  });
});
