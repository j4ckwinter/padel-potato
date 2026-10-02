import { describe, expect, it, jest } from '@jest/globals';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

import {
  createSupabaseAuthGateway,
  parseAuthCallback,
} from '../src/features/authentication/authGateway';
import type { PadelSupabaseClient } from '../src/features/supabase/client';

jest.mock('expo-auth-session', () => ({
  makeRedirectUri: jest.fn(() => 'padel-potato://'),
}));

jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
  openAuthSessionAsync: jest.fn(),
}));

describe('Supabase auth callback', () => {
  it('extracts the returned session tokens', () => {
    expect(
      parseAuthCallback(
        'padel-potato://#access_token=access-token&refresh_token=refresh-token',
      ),
    ).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      status: 'success',
    });
  });

  it('rejects provider errors and incomplete sessions', () => {
    expect(
      parseAuthCallback('padel-potato://#error_code=provider_disabled'),
    ).toEqual({ message: 'provider_disabled', status: 'error' });
    expect(
      parseAuthCallback('padel-potato://#access_token=access-token'),
    ).toEqual({
      message: 'The identity provider did not return a session.',
      status: 'error',
    });
  });

  it('opens Google OAuth and establishes the returned Supabase session', async () => {
    const setSession = jest.fn(() => Promise.resolve({ error: null }));
    const signInWithOAuth = jest.fn(() =>
      Promise.resolve({
        data: { provider: 'google' as const, url: 'https://auth.example' },
        error: null,
      }),
    );
    const client = {
      auth: {
        getSession: jest.fn(async () => ({
          data: { session: null },
          error: null,
        })),
        onAuthStateChange: jest.fn(),
        setSession,
        signInWithOAuth,
        signOut: jest.fn(),
      },
    } as unknown as PadelSupabaseClient;
    jest.mocked(WebBrowser.openAuthSessionAsync).mockResolvedValue({
      type: 'success',
      url: 'padel-potato://#access_token=access-token&refresh_token=refresh-token',
    });

    const result = await createSupabaseAuthGateway(client).signIn('google');

    expect(result).toEqual({ status: 'success' });
    expect(makeRedirectUri).toHaveBeenCalledWith({ scheme: 'padel-potato' });
    expect(signInWithOAuth).toHaveBeenCalledWith({
      options: {
        redirectTo: 'padel-potato://',
        skipBrowserRedirect: true,
      },
      provider: 'google',
    });
    expect(setSession).toHaveBeenCalledWith({
      access_token: 'access-token',
      refresh_token: 'refresh-token',
    });
  });
  it('signs in with email credentials without opening OAuth', async () => {
    jest.mocked(WebBrowser.openAuthSessionAsync).mockClear();
    const signInWithPassword = jest.fn(() => Promise.resolve({ error: null }));
    const client = {
      auth: { signInWithPassword },
    } as unknown as PadelSupabaseClient;
    const result = await createSupabaseAuthGateway(client).signIn({
      method: 'email',
      email: 'player@example.com',
      password: ' password ',
    });
    expect(result).toEqual({ status: 'success' });
    expect(signInWithPassword).toHaveBeenCalledWith({
      email: 'player@example.com',
      password: ' password ',
    });
    expect(WebBrowser.openAuthSessionAsync).not.toHaveBeenCalled();
  });

  it.each(['returned', 'thrown'] as const)(
    'hides %s credential errors',
    async (failure) => {
      const signInWithPassword = jest.fn(async () => {
        if (failure === 'thrown') throw new Error('private backend detail');
        return { error: { message: 'private backend detail' } };
      });
      const client = {
        auth: { signInWithPassword },
      } as unknown as PadelSupabaseClient;
      expect(
        await createSupabaseAuthGateway(client).signIn({
          method: 'email',
          email: 'player@example.com',
          password: 'password',
        }),
      ).toEqual({
        message: 'Check your email and password and try again.',
        status: 'error',
      });
    },
  );
});

describe('email registration and recovery', () => {
  const user = { id: 'recovery-user' };
  const session = { user };
  const installStorage = () => {
    const values = new Map<string, string>();
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
        removeItem: (key: string) => values.delete(key),
      },
    });
  };

  it('returns confirmationRequired without creating a signed-in session', async () => {
    const signUp = jest.fn(async () => ({
      data: { session: null },
      error: null,
    }));
    const gateway = createSupabaseAuthGateway({
      auth: { signUp },
    } as unknown as PadelSupabaseClient);
    expect(
      await gateway.signUp({
        email: ' new@example.com ',
        password: 'new-password',
      }),
    ).toEqual({ status: 'confirmationRequired' });
    expect(signUp).toHaveBeenCalledWith({
      email: 'new@example.com',
      password: 'new-password',
      options: { emailRedirectTo: 'padel-potato://auth-callback?flow=signup' },
    });
  });

  it('requests a reset using the native recovery callback', async () => {
    const resetPasswordForEmail = jest.fn(async () => ({ error: null }));
    const gateway = createSupabaseAuthGateway({
      auth: { resetPasswordForEmail },
    } as unknown as PadelSupabaseClient);
    expect(await gateway.requestPasswordReset('player@example.com')).toEqual({
      status: 'success',
    });
    expect(resetPasswordForEmail).toHaveBeenCalledWith('player@example.com', {
      redirectTo: 'padel-potato://auth-callback?flow=recovery',
    });
  });

  it('rejects other origins, wrong flow types, missing tokens, and signed-in account replacement', async () => {
    installStorage();
    const setSession = jest.fn();
    const getSession = jest.fn(async () => ({
      data: { session },
      error: null,
    }));
    const gateway = createSupabaseAuthGateway({
      auth: { getSession, setSession },
    } as unknown as PadelSupabaseClient);
    for (const url of [
      'https://evil.example/auth-callback?flow=recovery#access_token=a&refresh_token=r',
      'padel-potato://games?flow=recovery#access_token=a&refresh_token=r',
      'padel-potato://auth-callback?flow=recovery#type=signup&access_token=a&refresh_token=r',
      'padel-potato://auth-callback?flow=recovery#access_token=a',
      'padel-potato://auth-callback?flow=recovery#type=recovery&access_token=a&refresh_token=r',
    ])
      expect((await gateway.handleEmailCallback(url)).status).toBe('error');
    expect(setSession).not.toHaveBeenCalled();
  });

  it('keeps recovery gated across restarts until the password is saved', async () => {
    installStorage();
    let current: typeof session | null = null;
    const auth = {
      getSession: jest.fn(async () => ({
        data: { session: current },
        error: null,
      })),
      setSession: jest.fn(async () => {
        current = session;
        return { data: { session }, error: null };
      }),
      updateUser: jest.fn(async () => ({ error: null })),
    };
    const gateway = createSupabaseAuthGateway({
      auth,
    } as unknown as PadelSupabaseClient);
    expect(
      await gateway.handleEmailCallback(
        'padel-potato://auth-callback?flow=recovery#type=recovery&access_token=a&refresh_token=r',
      ),
    ).toEqual({ status: 'success' });
    expect(
      await createSupabaseAuthGateway({
        auth,
      } as unknown as PadelSupabaseClient).restoreSession(),
    ).toEqual({ kind: 'supabase', userId: 'recovery-user', recovery: true });
    expect(await gateway.updatePassword('new-password')).toEqual({
      status: 'success',
    });
    expect(auth.updateUser).toHaveBeenCalledWith({ password: 'new-password' });
    expect(await gateway.restoreSession()).toEqual({
      kind: 'supabase',
      userId: 'recovery-user',
    });
  });

  it('exchanges confirmation codes and does not classify signup as password recovery', async () => {
    installStorage();
    let current: typeof session | null = null;
    const exchangeCodeForSession = jest.fn(async () => {
      current = session;
      return { data: { session }, error: null };
    });
    const auth = {
      getSession: jest.fn(async () => ({
        data: { session: current },
        error: null,
      })),
      exchangeCodeForSession,
    };
    const gateway = createSupabaseAuthGateway({
      auth,
    } as unknown as PadelSupabaseClient);
    expect(
      await gateway.handleEmailCallback(
        'padel-potato://auth-callback?flow=signup&code=confirmation-code',
      ),
    ).toEqual({ status: 'success' });
    expect(exchangeCodeForSession).toHaveBeenCalledWith('confirmation-code');
    expect(await gateway.restoreSession()).toEqual({
      kind: 'supabase',
      userId: 'recovery-user',
    });
  });

  it('keeps the recovery gate after a failed password update and blocks an ordinary session', async () => {
    installStorage();
    const updateUser = jest.fn(async () => ({
      error: { message: 'private detail' },
    }));
    const auth = {
      getSession: jest.fn(async () => ({ data: { session }, error: null })),
      updateUser,
    };
    const gateway = createSupabaseAuthGateway({
      auth,
    } as unknown as PadelSupabaseClient);
    expect((await gateway.updatePassword('new-password')).status).toBe('error');
    expect(updateUser).not.toHaveBeenCalled();
    localStorage.setItem('padel-potato.password-recovery-user', user.id);
    expect(await gateway.updatePassword('new-password')).toEqual({
      status: 'error',
      message: 'Could not update your password. Try again.',
    });
    expect((await gateway.restoreSession())?.recovery).toBe(true);
  });
});

describe('auth operation overlap', () => {
  const link =
    'padel-potato://auth-callback?flow=recovery#type=recovery&access_token=a&refresh_token=r';

  it('does not accept a recovery callback while password sign-in is pending', async () => {
    let finish: (value: { error: null }) => void = () => undefined;
    const signInWithPassword = jest.fn(
      () =>
        new Promise<{ error: null }>((resolve) => {
          finish = resolve;
        }),
    );
    const setSession = jest.fn();
    const gateway = createSupabaseAuthGateway({
      auth: { signInWithPassword, setSession },
    } as unknown as PadelSupabaseClient);
    const signingIn = gateway.signIn({
      method: 'email',
      email: 'player@example.com',
      password: 'password',
    });
    expect(await gateway.handleEmailCallback(link)).toEqual({
      status: 'cancelled',
    });
    expect(setSession).not.toHaveBeenCalled();
    finish({ error: null });
    expect(await signingIn).toEqual({ status: 'success' });
  });

  it('does not accept a recovery callback while registration is pending', async () => {
    let finish: (value: {
      data: { session: null };
      error: null;
    }) => void = () => undefined;
    const signUp = jest.fn(
      () =>
        new Promise<{ data: { session: null }; error: null }>((resolve) => {
          finish = resolve;
        }),
    );
    const setSession = jest.fn();
    const gateway = createSupabaseAuthGateway({
      auth: { signUp, setSession },
    } as unknown as PadelSupabaseClient);
    const signingUp = gateway.signUp({
      email: 'player@example.com',
      password: 'password',
    });
    expect(await gateway.handleEmailCallback(link)).toEqual({
      status: 'cancelled',
    });
    expect(setSession).not.toHaveBeenCalled();
    finish({ data: { session: null }, error: null });
    expect(await signingUp).toEqual({ status: 'confirmationRequired' });
  });

  it('does not start sign-in while recovery session establishment is pending', async () => {
    let finish: (value: {
      data: { session: null };
      error: null;
    }) => void = () => undefined;
    const getSession = jest.fn(
      () =>
        new Promise<{ data: { session: null }; error: null }>((resolve) => {
          finish = resolve;
        }),
    );
    const setSession = jest.fn(async () => ({
      data: { session: null },
      error: { message: 'expired' },
    }));
    const signInWithPassword = jest.fn();
    const gateway = createSupabaseAuthGateway({
      auth: { getSession, setSession, signInWithPassword },
    } as unknown as PadelSupabaseClient);
    const recovering = gateway.handleEmailCallback(link);
    expect(
      await gateway.signIn({
        method: 'email',
        email: 'player@example.com',
        password: 'password',
      }),
    ).toEqual({ status: 'cancelled' });
    expect(signInWithPassword).not.toHaveBeenCalled();
    finish({ data: { session: null }, error: null });
    expect((await recovering).status).toBe('error');
    expect(
      await gateway.signIn({
        method: 'email',
        email: 'player@example.com',
        password: 'password',
      }),
    ).toEqual({
      status: 'error',
      message: 'Check your email and password and try again.',
    });
    expect(signInWithPassword).toHaveBeenCalledTimes(1);
  });

  it('rejects a late OAuth callback when a session already exists', async () => {
    const setSession = jest.fn();
    const auth = {
      signInWithOAuth: jest.fn(async () => ({
        data: { url: 'https://auth.example' },
        error: null,
      })),
      getSession: jest.fn(async () => ({
        data: { session: { user: { id: 'recovery-user' } } },
        error: null,
      })),
      setSession,
    };
    jest
      .mocked(WebBrowser.openAuthSessionAsync)
      .mockResolvedValue({
        type: 'success',
        url: 'padel-potato://#access_token=a&refresh_token=r',
      });
    const gateway = createSupabaseAuthGateway({
      auth,
    } as unknown as PadelSupabaseClient);
    expect(await gateway.signIn('google')).toEqual({
      status: 'error',
      message: 'Sign out before switching accounts.',
    });
    expect(setSession).not.toHaveBeenCalled();
  });
});
