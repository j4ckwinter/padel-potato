import type { AuthGateway } from '../src/features/authentication/authGateway';
import { useState } from 'react';
import { Button, Text } from 'react-native';
import { describe, expect, it, jest } from '@jest/globals';
import { act, render, userEvent } from '@testing-library/react-native';
import { SessionProvider } from '../src/features/authentication/SessionContext';
import type { Session } from '../src/features/authentication/session';
import {
  SessionAppServicesProvider,
  useAppServices,
  useAppServicesLoadState,
  type AppServices,
} from '../src/features/services/AppServicesContext';
import { appServicesFromProfileRow } from '../src/features/supabase/appServices';
import type { PadelSupabaseClient } from '../src/features/supabase/client';
import { createAuthGateway, testSession } from './helpers/authGateway';
import { onboardingDraft, onboardingProfileRow } from './helpers/onboarding';

const client = {} as PadelSupabaseClient;
const initial = appServicesFromProfileRow(
  {
    ...onboardingProfileRow,
    display_name: 'Before setup',
    onboarding_completed_at: null,
  },
  client,
);
const saved = appServicesFromProfileRow(onboardingProfileRow, client);

function Probe() {
  const { state } = useAppServicesLoadState();
  return state.status === 'ready' ? (
    <ReadyProbe />
  ) : (
    <Text>{state.status}</Text>
  );
}
function ReadyProbe() {
  const { currentUser, onboarding } = useAppServices();
  const { completeOnboarding } = useAppServicesLoadState();
  const [error, setError] = useState(false);
  return (
    <>
      <Text>{currentUser.identity.name}</Text>
      <Text>{onboarding.completed ? 'complete' : 'incomplete'}</Text>
      <Text>{currentUser.preferences.days}</Text>
      {error ? <Text>Save failed</Text> : null}
      <Button
        title="Finish"
        onPress={() => {
          setError(false);
          void completeOnboarding(onboardingDraft).catch(() => setError(true));
        }}
      />
    </>
  );
}

describe('onboarding app state', () => {
  it('keeps the loaded profile on failure and refreshes it on retry without remounting the screen', async () => {
    const save = jest
      .fn<(userId: string) => Promise<AppServices>>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue(saved);
    const load = jest.fn(async () => initial);
    const screen = await render(
      <SessionProvider gateway={createAuthGateway(testSession)}>
        <SessionAppServicesProvider loadServices={load} saveOnboarding={save}>
          <Probe />
        </SessionAppServicesProvider>
      </SessionProvider>,
    );
    expect(await screen.findByText('Before setup')).toBeVisible();
    const user = userEvent.setup();
    await user.press(screen.getByRole('button', { name: 'Finish' }));
    expect(await screen.findByText('Save failed')).toBeVisible();
    expect(screen.getByText('incomplete')).toBeVisible();
    await user.press(screen.getByRole('button', { name: 'Finish' }));
    expect(await screen.findByText('Jack Potato')).toBeVisible();
    expect(screen.getByText('complete')).toBeVisible();
    expect(screen.getByText('Weekdays, Saturday')).toBeVisible();
    expect(load).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenLastCalledWith(testSession.userId, onboardingDraft);
  });

  it('keeps a pending save valid when auth refreshes the same account', async () => {
    let notify: (session: Session | null) => void = () => undefined;
    const gateway: AuthGateway = {
      ...createAuthGateway(testSession),
      subscribe: (listener) => {
        notify = listener;
        return () => undefined;
      },
    };
    let resolveSave: (services: AppServices) => void = () => undefined;
    const save = () =>
      new Promise<AppServices>((resolve) => {
        resolveSave = resolve;
      });
    const load = jest.fn(async () => initial);
    const screen = await render(
      <SessionProvider gateway={gateway}>
        <SessionAppServicesProvider loadServices={load} saveOnboarding={save}>
          <Probe />
        </SessionAppServicesProvider>
      </SessionProvider>,
    );
    expect(await screen.findByText('Before setup')).toBeVisible();
    await userEvent
      .setup()
      .press(screen.getByRole('button', { name: 'Finish' }));
    await act(() => notify({ ...testSession }));
    await act(() => resolveSave(saved));
    expect(await screen.findByText('Jack Potato')).toBeVisible();
    expect(screen.getByText('complete')).toBeVisible();
    expect(screen.queryByText('Save failed')).toBeNull();
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('does not replace a new account with an older account’s delayed save', async () => {
    let notify: (session: Session | null) => void = () => undefined;
    const gateway: AuthGateway = {
      ...createAuthGateway(testSession),
      subscribe: (listener) => {
        notify = listener;
        return () => undefined;
      },
    };
    let resolveSave: (services: AppServices) => void = () => undefined;
    const save = () =>
      new Promise<AppServices>((resolve) => {
        resolveSave = resolve;
      });
    const other = {
      ...initial,
      currentUser: {
        ...initial.currentUser,
        id: 'other',
        identity: { ...initial.currentUser.identity, name: 'Other player' },
      },
    };
    const load = async (userId: string) =>
      userId === testSession.userId ? initial : other;
    const screen = await render(
      <SessionProvider gateway={gateway}>
        <SessionAppServicesProvider loadServices={load} saveOnboarding={save}>
          <Probe />
        </SessionAppServicesProvider>
      </SessionProvider>,
    );
    expect(await screen.findByText('Before setup')).toBeVisible();
    await userEvent
      .setup()
      .press(screen.getByRole('button', { name: 'Finish' }));
    await act(() => notify({ kind: 'supabase', userId: 'other' }));
    expect(await screen.findByText('Other player')).toBeVisible();
    await act(() => resolveSave(saved));
    expect(screen.getByText('Other player')).toBeVisible();
    expect(screen.queryByText('Jack Potato')).toBeNull();
    expect(screen.getByText('incomplete')).toBeVisible();
  });
});
