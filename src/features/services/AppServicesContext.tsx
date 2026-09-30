import {
  createContext,
  type PropsWithChildren,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useSession } from '../authentication/SessionContext';
import { loadDemoAppServices } from '../demo/demoAppServices';
import type { GamePlayer } from '../games/game';
import type { GameRepository } from '../games/gameRepository';
import type { PlayerProfile } from '../players/player';
import type { PlayerRepository } from '../players/playerRepository';

export type AppServices = Readonly<{
  currentPlayer: GamePlayer;
  currentUser: PlayerProfile;
  games: GameRepository;
  players: PlayerRepository;
}>;

export type AppServicesState =
  | Readonly<{ status: 'inactive' }>
  | Readonly<{ status: 'loading' }>
  | Readonly<{ services: AppServices; status: 'ready' }>
  | Readonly<{ status: 'profileMissing' }>
  | Readonly<{ status: 'error' }>;

type AppServicesLoader = (userId: string) => Promise<AppServices | null>;

type AppServicesLoadContextValue = Readonly<{
  retry: () => void;
  state: AppServicesState;
}>;

type LoadedAppServicesState = Readonly<{
  retryCount: number;
  state: Extract<
    AppServicesState,
    Readonly<{
      status: 'ready' | 'profileMissing' | 'error';
    }>
  >;
  userId: string;
}>;

const AppServicesContext = createContext<AppServices | null>(null);
const AppServicesLoadContext =
  createContext<AppServicesLoadContextValue | null>(null);

export function AppServicesProvider({
  children,
  services,
}: PropsWithChildren<Readonly<{ services: AppServices }>>) {
  return (
    <AppServicesContext.Provider value={services}>
      {children}
    </AppServicesContext.Provider>
  );
}

export function SessionAppServicesProvider({
  children,
  loadServices = loadDemoAppServices,
}: PropsWithChildren<Readonly<{ loadServices?: AppServicesLoader }>>) {
  const { state: sessionState } = useSession();
  const [retryCount, setRetryCount] = useState(0);
  const [loadedState, setLoadedState] = useState<LoadedAppServicesState | null>(
    null,
  );

  useEffect(() => {
    if (sessionState.status !== 'signedIn') return undefined;

    let active = true;
    const userId = sessionState.session.userId;
    void loadServices(userId)
      .then((services) => {
        if (!active) return;
        setLoadedState({
          retryCount,
          state:
            services === null
              ? { status: 'profileMissing' }
              : { services, status: 'ready' },
          userId,
        });
      })
      .catch(() => {
        if (active) {
          setLoadedState({
            retryCount,
            state: { status: 'error' },
            userId,
          });
        }
      });

    return () => {
      active = false;
    };
  }, [loadServices, retryCount, sessionState]);

  const retry = useCallback(() => setRetryCount((count) => count + 1), []);
  const loadContextValue = useMemo<AppServicesLoadContextValue>(() => {
    const state: AppServicesState =
      sessionState.status !== 'signedIn'
        ? { status: 'inactive' }
        : loadedState?.userId === sessionState.session.userId &&
            loadedState.retryCount === retryCount
          ? loadedState.state
          : { status: 'loading' };
    return { retry, state };
  }, [loadedState, retry, retryCount, sessionState]);
  const { state } = loadContextValue;

  return (
    <AppServicesLoadContext.Provider value={loadContextValue}>
      {state.status === 'ready' ? (
        <AppServicesProvider services={state.services}>
          {children}
        </AppServicesProvider>
      ) : (
        children
      )}
    </AppServicesLoadContext.Provider>
  );
}

export function useAppServices() {
  const services = use(AppServicesContext);
  if (services === null) {
    throw new Error('useAppServices requires ready app services.');
  }
  return services;
}

export function useAppServicesLoadState() {
  const value = use(AppServicesLoadContext);
  if (value === null) {
    throw new Error(
      'useAppServicesLoadState must be used inside SessionAppServicesProvider.',
    );
  }
  return value;
}
