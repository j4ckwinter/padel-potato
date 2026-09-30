import { describe, expect, it, jest } from '@jest/globals';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { SessionProvider } from '../src/features/authentication/SessionContext';
import { createDemoSession } from '../src/features/authentication/session';
import type { SessionStorage } from '../src/features/authentication/sessionStorage';
import { demoAppServices } from '../src/features/demo/demoAppServices';
import {
  SessionAppServicesProvider,
  useAppServices,
  useAppServicesLoadState,
} from '../src/features/services/AppServicesContext';

function ServicesProbe() {
  const { state } = useAppServicesLoadState();
  if (state.status !== 'ready') return <Text>{state.status}</Text>;

  return <ReadyServicesProbe />;
}

function ReadyServicesProbe() {
  const { currentUser } = useAppServices();
  return <Text>{currentUser.identity.name}</Text>;
}

function restoredSessionStorage(): SessionStorage {
  return {
    clear: jest.fn(() => Promise.resolve()),
    read: jest.fn(() => Promise.resolve(createDemoSession())),
    write: jest.fn(() => Promise.resolve()),
  };
}

describe('app services', () => {
  it('resolves the current profile from the restored session', async () => {
    const screen = await render(
      <SessionProvider storage={restoredSessionStorage()}>
        <SessionAppServicesProvider>
          <ServicesProbe />
        </SessionAppServicesProvider>
      </SessionProvider>,
    );

    expect(await screen.findByText('Alex Morgan')).toBeVisible();
  });

  it('keeps a missing profile distinct from a loading profile', async () => {
    const screen = await render(
      <SessionProvider storage={restoredSessionStorage()}>
        <SessionAppServicesProvider loadServices={() => Promise.resolve(null)}>
          <ServicesProbe />
        </SessionAppServicesProvider>
      </SessionProvider>,
    );

    expect(await screen.findByText('profileMissing')).toBeVisible();
  });

  it('provides session-bound repositories with the current profile', async () => {
    await expect(demoAppServices.games.list()).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'demo-my-next-game' }),
      ]),
    );
    expect(demoAppServices.currentUser.identity.name).toBe('Alex Morgan');
    expect(demoAppServices.currentPlayer.id).toBe('alex-morgan');
  });
});
