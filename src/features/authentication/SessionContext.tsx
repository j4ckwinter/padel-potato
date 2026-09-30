import {
  createContext,
  type PropsWithChildren,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { createDemoSession, type Session } from './session';
import { deviceSessionStorage, type SessionStorage } from './sessionStorage';

export type SessionState =
  | Readonly<{ status: 'loading' }>
  | Readonly<{ status: 'signedOut' }>
  | Readonly<{ session: Session; status: 'signedIn' }>;

export type SessionMutationResult =
  Readonly<{ status: 'success' }> | Readonly<{ status: 'storageError' }>;

type SessionContextValue = Readonly<{
  signInDemo: () => Promise<SessionMutationResult>;
  signOut: () => Promise<SessionMutationResult>;
  state: SessionState;
}>;

const SessionContext = createContext<SessionContextValue | null>(null);

type SessionProviderProps = PropsWithChildren<
  Readonly<{ storage?: SessionStorage }>
>;

export function SessionProvider({
  children,
  storage = deviceSessionStorage,
}: SessionProviderProps) {
  const [state, setState] = useState<SessionState>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    void storage
      .read()
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
    };
  }, [storage]);

  const signInDemo = useCallback(async (): Promise<SessionMutationResult> => {
    const session = createDemoSession();
    try {
      await storage.write(session);
      setState({ session, status: 'signedIn' });
      return { status: 'success' };
    } catch {
      return { status: 'storageError' };
    }
  }, [storage]);

  const signOut = useCallback(async (): Promise<SessionMutationResult> => {
    try {
      await storage.clear();
      setState({ status: 'signedOut' });
      return { status: 'success' };
    } catch {
      return { status: 'storageError' };
    }
  }, [storage]);

  const value = useMemo(
    () => ({ signInDemo, signOut, state }),
    [signInDemo, signOut, state],
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
