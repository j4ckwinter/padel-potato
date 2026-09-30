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
        getSession: jest.fn(),
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
});
