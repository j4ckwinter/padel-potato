import {
  createContext,
  type PropsWithChildren,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Linking } from 'react-native';

import {
  type AuthGateway,
  type AuthRegistrationResult,
  isEmailAuthCallback,
  type AuthMutationResult,
  type AuthSignInRequest,
  getDeviceAuthGateway,
} from './authGateway';
import type { Session } from './session';

export type SessionState =
  | Readonly<{ status: 'loading' }>
  | Readonly<{ status: 'signedOut' }>
  | Readonly<{ session: Session; status: 'signedIn' | 'passwordRecovery' }>;

export type SessionMutationResult = AuthMutationResult;

type SessionContextValue = Readonly<{
  signIn: (request: AuthSignInRequest) => Promise<SessionMutationResult>;
  signOut: () => Promise<SessionMutationResult>;
  signUp: AuthGateway['signUp'];
  requestPasswordReset: AuthGateway['requestPasswordReset'];
  updatePassword: AuthGateway['updatePassword'];
  callbackError: string | null;
  state: SessionState;
}>;

const SessionContext = createContext<SessionContextValue | null>(null);

type SessionProviderProps = PropsWithChildren<
  Readonly<{ gateway?: AuthGateway }>
>;

export function SessionProvider({
  children,
  gateway: providedGateway,
}: SessionProviderProps) {
  const [gateway] = useState(() => providedGateway ?? getDeviceAuthGateway());
  const [state, setState] = useState<SessionState>({ status: 'loading' });

  const [callbackError, setCallbackError] = useState<string | null>(null);
  const callbackBusy = useRef(false);

  useEffect(() => {
    let active = true;
    let events = 0;
    const unsubscribe = gateway.subscribe((session) => {
      if (!active) return;
      events += 1;
      setState(
        session === null
          ? { status: 'signedOut' }
          : {
              session,
              status: session.recovery ? 'passwordRecovery' : 'signedIn',
            },
      );
    });
    const restoreEvents = events;
    void gateway
      .restoreSession()
      .then((session) => {
        if (!active || events !== restoreEvents || callbackBusy.current) return;
        setState(
          session === null
            ? { status: 'signedOut' }
            : {
                session,
                status: session.recovery ? 'passwordRecovery' : 'signedIn',
              },
        );
      })
      .catch(() => {
        if (active && events === restoreEvents && !callbackBusy.current)
          setState({ status: 'signedOut' });
      });

    let lastSuccessfulLink: string | null = null;
    const handleLink = async (url: string | null) => {
      if (
        !url ||
        url === lastSuccessfulLink ||
        !isEmailAuthCallback(url) ||
        callbackBusy.current
      )
        return;
      callbackBusy.current = true;
      events += 1;
      setCallbackError(null);
      try {
        const result = await gateway.handleEmailCallback(url);
        if (!active) return;
        if (result.status === 'error') setCallbackError(result.message);
        if (result.status === 'success') lastSuccessfulLink = url;
        const callbackEvents = events;
        const session = await gateway.restoreSession();
        if (active && events === callbackEvents)
          setState(
            session
              ? {
                  session,
                  status: session.recovery ? 'passwordRecovery' : 'signedIn',
                }
              : { status: 'signedOut' },
          );
      } catch {
        if (active)
          setCallbackError(
            'This email link could not be opened. Request a new one.',
          );
      } finally {
        callbackBusy.current = false;
      }
    };
    void Linking.getInitialURL()
      .then(handleLink)
      .catch(() => undefined);
    const links = Linking.addEventListener(
      'url',
      ({ url }) => void handleLink(url),
    );
    return () => {
      links.remove();
      active = false;
      unsubscribe();
    };
  }, [gateway]);

  const signIn = useCallback(
    (request: AuthSignInRequest) => gateway.signIn(request),
    [gateway],
  );

  const signOut = useCallback(() => gateway.signOut(), [gateway]);

  const signUp = useCallback(
    (
      credentials: Parameters<AuthGateway['signUp']>[0],
    ): Promise<AuthRegistrationResult> => gateway.signUp(credentials),
    [gateway],
  );
  const requestPasswordReset = useCallback(
    (email: string) => gateway.requestPasswordReset(email),
    [gateway],
  );
  const updatePassword = useCallback(
    async (password: string) => {
      const result = await gateway.updatePassword(password);
      if (result.status === 'success') {
        const session = await gateway.restoreSession();
        setState((current) =>
          current.status === 'passwordRecovery' &&
          (!session || current.session.userId === session.userId)
            ? session
              ? {
                  session,
                  status: session.recovery ? 'passwordRecovery' : 'signedIn',
                }
              : { status: 'signedOut' }
            : current,
        );
      }
      return result;
    },
    [gateway],
  );

  const value = useMemo(
    () => ({
      signIn,
      signOut,
      signUp,
      requestPasswordReset,
      updatePassword,
      callbackError,
      state,
    }),
    [
      signIn,
      signOut,
      signUp,
      requestPasswordReset,
      updatePassword,
      callbackError,
      state,
    ],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const session = use(SessionContext);
  if (session === null) {
    throw new Error('useSession must be used inside SessionProvider.');
  }
  return session;
}
