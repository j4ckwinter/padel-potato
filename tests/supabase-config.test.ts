import { describe, expect, it } from '@jest/globals';

import { parseSupabaseConfig } from '../src/features/supabase/config';

describe('Supabase configuration', () => {
  it('accepts a hosted project URL and removes its trailing slash', () => {
    expect(
      parseSupabaseConfig({
        publishableKey: 'sb_publishable_example',
        url: 'https://example.supabase.co/',
      }),
    ).toEqual({
      publishableKey: 'sb_publishable_example',
      url: 'https://example.supabase.co',
    });
  });

  it('accepts HTTP only for local development', () => {
    expect(
      parseSupabaseConfig({
        publishableKey: 'local-key',
        url: 'http://127.0.0.1:54321',
      }),
    ).toEqual({
      publishableKey: 'local-key',
      url: 'http://127.0.0.1:54321',
    });

    expect(() =>
      parseSupabaseConfig({
        publishableKey: 'public-key',
        url: 'http://example.com',
      }),
    ).toThrow('must use HTTPS');
  });

  it('rejects missing configuration', () => {
    expect(() =>
      parseSupabaseConfig({ publishableKey: undefined, url: undefined }),
    ).toThrow(
      'Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY.',
    );
  });
});
