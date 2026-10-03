import type { NotificationRepository } from '../notifications/activity';
import type { InvitationRepository } from '../invitations/invitation';
import type { OnboardingDraft } from '../../design-system/configuration/onboarding';
import { saveSupabaseOnboarding } from '../supabase/onboarding';
import {
  createContext,
  type PropsWithChildren,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react';

import { useSession } from '../authentication/SessionContext';
import type { GamePlayer } from '../games/game';
import type { GameRepository } from '../games/gameRepository';
import type { PlayerProfile } from '../players/player';
import type { PlayerRepository } from '../players/playerRepository';
import { loadSupabaseAppServices } from '../supabase/appServices';

export type AppServices = Readonly<{
  onboarding: Readonly<{ completed: boolean; draft: OnboardingDraft | null }>;
  currentPlayer: GamePlayer;
  currentUser: PlayerProfile;
  games: GameRepository;
  players: PlayerRepository;
  invitations: InvitationRepository;
  notifications: NotificationRepository;
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
  completeOnboarding: (draft: OnboardingDraft) => Promise<void>;
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
  loadServices = loadSupabaseAppServices,
  saveOnboarding = saveSupabaseOnboarding,
}: PropsWithChildren<
  Readonly<{
    loadServices?: AppServicesLoader;
    saveOnboarding?: (
      userId: string,
      draft: OnboardingDraft,
    ) => Promise<AppServices>;
  }>
>) {
  const { state: sessionState } = useSession();
  const [retryCount, setRetryCount] = useState(0);
  const [loadedState, setLoadedState] = useState<LoadedAppServicesState | null>(
    null,
  );

  const sessionUserId =
    sessionState.status === 'signedIn' ? sessionState.session.userId : null;
  const pendingRequest = useRef<{ userId: string | null; version: number }>({
    userId: null,
    version: 0,
  });

  useEffect(() => {
    const request = pendingRequest.current;
    request.userId = sessionUserId;
    if (sessionUserId === null) return undefined;

    let active = true;
    const version = ++request.version;
    const userId = sessionUserId;
    void loadServices(userId)
      .then((services) => {
        if (!active || request.version !== version) return;
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
        if (active && request.version === version) {
          setLoadedState({
            retryCount,
            state: { status: 'error' },
            userId,
          });
        }
      });

    return () => {
      active = false;
      request.version++;
    };
  }, [loadServices, retryCount, sessionUserId]);

  const retry = useCallback(() => setRetryCount((count) => count + 1), []);
  const completeOnboarding = useCallback(
    async (draft: OnboardingDraft) => {
      const request = pendingRequest.current;
      const userId = request.userId;
      if (!userId) throw new Error('Sign in before completing onboarding.');
      const version = ++request.version;
      const services = await saveOnboarding(userId, draft);
      if (request.userId !== userId || request.version !== version)
        throw new Error('Your signed-in account changed.');
      if (services.currentUser.id !== userId || !services.onboarding.completed)
        throw new Error('The profile could not be saved.');
      setLoadedState({
        userId,
        retryCount,
        state: { status: 'ready', services },
      });
    },
    [retryCount, saveOnboarding],
  );

  const state = useMemo<AppServicesState>(
    () =>
      sessionState.status !== 'signedIn'
        ? { status: 'inactive' }
        : loadedState?.userId === sessionState.session.userId &&
            loadedState.retryCount === retryCount
          ? loadedState.state
          : { status: 'loading' },
    [sessionState, loadedState, retryCount],
  );
  const loadContextValue = useMemo<AppServicesLoadContextValue>(
    () => ({ retry, completeOnboarding, state }),
    [retry, completeOnboarding, state],
  );

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
