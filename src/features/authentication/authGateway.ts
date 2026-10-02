import { makeRedirectUri } from 'expo-auth-session';
import { getQueryParams } from 'expo-auth-session/build/QueryParams';
import * as WebBrowser from 'expo-web-browser';

import {
  isAuthEmail,
  isNewPassword,
} from '../../design-system/configuration/authentication';
import { getSupabaseClient } from '../supabase/client';
import type { Session } from './session';

void WebBrowser.maybeCompleteAuthSession();

export type AuthProvider = 'apple' | 'google';

export type AuthSignInRequest =
  AuthProvider | Readonly<{ method: 'email'; email: string; password: string }>;

export type AuthMutationResult =
  | Readonly<{ status: 'success' }>
  | Readonly<{ status: 'cancelled' }>
  | Readonly<{ message: string; status: 'error' }>;

export type AuthGateway = Readonly<{
  restoreSession: () => Promise<Session | null>;
  signUp: (
    credentials: Readonly<{ email: string; password: string }>,
  ) => Promise<AuthRegistrationResult>;
  requestPasswordReset: (email: string) => Promise<AuthMutationResult>;
  updatePassword: (password: string) => Promise<AuthMutationResult>;
  handleEmailCallback: (url: string) => Promise<AuthMutationResult>;
  signIn: (request: AuthSignInRequest) => Promise<AuthMutationResult>;
  signOut: () => Promise<AuthMutationResult>;
  subscribe: (listener: (session: Session | null) => void) => () => void;
}>;

export type AuthRegistrationResult =
  AuthMutationResult | Readonly<{ status: 'confirmationRequired' }>;

const recoveryKey = 'padel-potato.password-recovery-user';
const emailRedirect = (flow: 'signup' | 'recovery') =>
  `padel-potato://auth-callback?flow=${flow}`;

function appSession(userId: string): Session {
  return {
    kind: 'supabase',
    userId,
    ...(localStorage.getItem(recoveryKey) === userId
      ? { recovery: true as const }
      : {}),
  };
}

export function isEmailAuthCallback(url: string): boolean {
  try {
    const callback = new URL(url);
    return (
      callback.protocol === 'padel-potato:' &&
      !callback.username &&
      !callback.password &&
      !callback.port &&
      callback.hostname === 'auth-callback' &&
      (callback.pathname === '' || callback.pathname === '/') &&
      ['signup', 'recovery'].includes(callback.searchParams.get('flow') ?? '')
    );
  } catch {
    return false;
  }
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
  let pendingOperation:
    | 'signIn'
    | 'signUp'
    | 'signOut'
    | 'emailCallback'
    | 'updatePassword'
    | null = null;
  return {
    signUp: async ({ email, password }) => {
      if (pendingOperation !== null) return { status: 'cancelled' };
      if (!isAuthEmail(email) || !isNewPassword(password))
        return {
          status: 'error',
          message:
            'Enter a valid email and a password with at least 8 characters.',
        };
      pendingOperation = 'signUp';
      try {
        const { data, error } = await client.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: emailRedirect('signup') },
        });
        if (error)
          return {
            status: 'error',
            message:
              'Could not create your account. Check your details and try again.',
          };
        return data.session
          ? { status: 'success' }
          : { status: 'confirmationRequired' };
      } catch {
        return {
          status: 'error',
          message:
            'Could not create your account. Check your details and try again.',
        };
      } finally {
        pendingOperation = null;
      }
    },
    requestPasswordReset: async (email) => {
      if (!isAuthEmail(email))
        return { status: 'error', message: 'Enter a valid email address.' };
      try {
        const { error } = await client.auth.resetPasswordForEmail(
          email.trim(),
          {
            redirectTo: emailRedirect('recovery'),
          },
        );
        return error
          ? {
              status: 'error',
              message: 'Could not request a reset. Try again shortly.',
            }
          : { status: 'success' };
      } catch {
        return {
          status: 'error',
          message: 'Could not request a reset. Try again shortly.',
        };
      }
    },
    updatePassword: async (password) => {
      if (pendingOperation !== null) return { status: 'cancelled' };
      if (!isNewPassword(password))
        return {
          status: 'error',
          message: 'Use at least 8 characters for your password.',
        };
      pendingOperation = 'updatePassword';
      try {
        const { data: current, error: sessionError } =
          await client.auth.getSession();
        if (
          sessionError ||
          !current.session ||
          localStorage.getItem(recoveryKey) !== current.session.user.id
        )
          return {
            status: 'error',
            message:
              'Open a new password reset link before changing your password.',
          };
        const { error } = await client.auth.updateUser({ password });
        if (error)
          return {
            status: 'error',
            message: 'Could not update your password. Try again.',
          };
        localStorage.removeItem(recoveryKey);
        return { status: 'success' };
      } catch {
        return {
          status: 'error',
          message: 'Could not update your password. Try again.',
        };
      } finally {
        pendingOperation = null;
      }
    },
    handleEmailCallback: async (url) => {
      const failure = {
        status: 'error',
        message: 'This email link is invalid or expired. Request a new one.',
      } as const;
      if (!isEmailAuthCallback(url)) return failure;
      const flow = new URL(url).searchParams.get('flow');
      const { params, errorCode } = getQueryParams(url);
      if (
        errorCode ||
        params.error ||
        params.error_code ||
        params.error_description
      )
        return failure;
      if (params.type && params.type !== flow) return failure;
      if (pendingOperation !== null) return { status: 'cancelled' };
      pendingOperation = 'emailCallback';
      try {
        const { data: current, error: currentError } =
          await client.auth.getSession();
        if (currentError) return failure;
        if (current.session)
          return {
            status: 'error',
            message: 'Sign out before opening an email sign-in or reset link.',
          };
        const result = params.code
          ? await client.auth.exchangeCodeForSession(params.code)
          : params.access_token && params.refresh_token
            ? await client.auth.setSession({
                access_token: params.access_token,
                refresh_token: params.refresh_token,
              })
            : null;
        if (!result || result.error || !result.data.session) return failure;
        if (flow === 'recovery')
          localStorage.setItem(recoveryKey, result.data.session.user.id);
        return { status: 'success' };
      } catch {
        return failure;
      } finally {
        pendingOperation = null;
      }
    },
    restoreSession: async () => {
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      return data.session ? appSession(data.session.user.id) : null;
    },
    signIn: async (request) => {
      if (pendingOperation !== null) return { status: 'cancelled' };
      pendingOperation = 'signIn';
      try {
        if (typeof request !== 'string') {
          try {
            const { error } = await client.auth.signInWithPassword({
              email: request.email,
              password: request.password,
            });
            return error
              ? {
                  message: 'Check your email and password and try again.',
                  status: 'error',
                }
              : { status: 'success' };
          } catch {
            return {
              message: 'Check your email and password and try again.',
              status: 'error',
            };
          }
        }
        const provider = request;
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

        const { data: current, error: currentError } =
          await client.auth.getSession();
        if (currentError || current.session)
          return {
            status: 'error',
            message: 'Sign out before switching accounts.',
          };
        const { error: sessionError } = await client.auth.setSession({
          access_token: callback.accessToken,
          refresh_token: callback.refreshToken,
        });
        return sessionError
          ? { message: sessionError.message, status: 'error' }
          : { status: 'success' };
      } catch {
        return {
          status: 'error',
          message: 'Check your connection and try again.',
        };
      } finally {
        pendingOperation = null;
      }
    },
    signOut: async () => {
      if (pendingOperation !== null) return { status: 'cancelled' };
      pendingOperation = 'signOut';
      try {
        const { error } = await client.auth.signOut();
        if (!error) localStorage.removeItem(recoveryKey);
        return error
          ? { message: error.message, status: 'error' }
          : { status: 'success' };
      } finally {
        pendingOperation = null;
      }
    },
    subscribe: (listener) => {
      const { data } = client.auth.onAuthStateChange((event, session) => {
        if (pendingOperation === 'emailCallback') return;
        if (event === 'PASSWORD_RECOVERY' && session)
          localStorage.setItem(recoveryKey, session.user.id);
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
