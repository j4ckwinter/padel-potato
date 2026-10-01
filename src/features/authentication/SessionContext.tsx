import {
  createContext,
  type PropsWithChildren,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  type AuthGateway,
  type AuthMutationResult,
  type AuthSignInRequest,
  getDeviceAuthGateway,
} from './authGateway';
import type { Session } from './session';

export type SessionState =
  | Readonly<{ status: 'loading' }>
  | Readonly<{ status: 'signedOut' }>
  | Readonly<{ session: Session; status: 'signedIn' }>;

export type SessionMutationResult = AuthMutationResult;

type SessionContextValue = Readonly<{
  signIn: (request: AuthSignInRequest) => Promise<SessionMutationResult>;
  signOut: () => Promise<SessionMutationResult>;
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

  useEffect(() => {
    let active = true;
    const unsubscribe = gateway.subscribe((session) => {
      if (!active) return;
      setState(
        session === null
          ? { status: 'signedOut' }
          : { session, status: 'signedIn' },
      );
    });
    void gateway
      .restoreSession()
      .then((session) => {
        if (!active) return;
        setState(
          session === null
            ? { status: 'signedOut' }
            : { session, status: 'signedIn' },
        );
      })
      .catch(() => {
        if (active) setState({ status: 'signedOut' });
      });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [gateway]);

  const signIn = useCallback(
    (request: AuthSignInRequest) => gateway.signIn(request),
    [gateway],
  );

  const signOut = useCallback(() => gateway.signOut(), [gateway]);

  const value = useMemo(
    () => ({ signIn, signOut, state }),
    [signIn, signOut, state],
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
