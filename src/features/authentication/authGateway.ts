import { makeRedirectUri } from 'expo-auth-session';
import { getQueryParams } from 'expo-auth-session/build/QueryParams';
import * as WebBrowser from 'expo-web-browser';

import { getSupabaseClient } from '../supabase/client';
import type { Session } from './session';

void WebBrowser.maybeCompleteAuthSession();

export type AuthProvider = 'apple' | 'google';

export type AuthMutationResult =
  | Readonly<{ status: 'success' }>
  | Readonly<{ status: 'cancelled' }>
  | Readonly<{ message: string; status: 'error' }>;

export type AuthGateway = Readonly<{
  restoreSession: () => Promise<Session | null>;
  signIn: (provider: AuthProvider) => Promise<AuthMutationResult>;
  signOut: () => Promise<AuthMutationResult>;
  subscribe: (listener: (session: Session | null) => void) => () => void;
}>;

function appSession(userId: string): Session {
  return { kind: 'supabase', userId };
}

type AuthCallback =
  | Readonly<{
      accessToken: string;
      refreshToken: string;
      status: 'success';
    }>
  | Readonly<{ message: string; status: 'error' }>;

export function parseAuthCallback(url: string): AuthCallback {
  const { errorCode, params } = getQueryParams(url);
  const providerError =
    errorCode ?? params.error_description ?? params.error_code ?? params.error;
  if (providerError) return { message: providerError, status: 'error' };

  const accessToken = params.access_token;
  const refreshToken = params.refresh_token;
  if (!accessToken || !refreshToken) {
    return {
      message: 'The identity provider did not return a session.',
      status: 'error',
    };
  }

  return { accessToken, refreshToken, status: 'success' };
}

export function createSupabaseAuthGateway(
  client = getSupabaseClient(),
): AuthGateway {
  return {
    restoreSession: async () => {
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      return data.session ? appSession(data.session.user.id) : null;
    },
    signIn: async (provider) => {
      const redirectTo = makeRedirectUri({ scheme: 'padel-potato' });
      const { data, error } = await client.auth.signInWithOAuth({
        options: { redirectTo, skipBrowserRedirect: true },
        provider,
      });
      if (error) return { message: error.message, status: 'error' };

      const browserResult = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectTo,
      );
      if (browserResult.type !== 'success') return { status: 'cancelled' };

      const callback = parseAuthCallback(browserResult.url);
      if (callback.status === 'error') return callback;

      const { error: sessionError } = await client.auth.setSession({
        access_token: callback.accessToken,
        refresh_token: callback.refreshToken,
      });
      return sessionError
        ? { message: sessionError.message, status: 'error' }
        : { status: 'success' };
    },
    signOut: async () => {
      const { error } = await client.auth.signOut();
      return error
        ? { message: error.message, status: 'error' }
        : { status: 'success' };
    },
    subscribe: (listener) => {
      const { data } = client.auth.onAuthStateChange((_event, session) => {
        listener(session ? appSession(session.user.id) : null);
      });
      return () => data.subscription.unsubscribe();
    },
  };
}

let deviceGateway: AuthGateway | undefined;

export function getDeviceAuthGateway() {
  deviceGateway ??= createSupabaseAuthGateway();
  return deviceGateway;
}
