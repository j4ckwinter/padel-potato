import 'react-native-url-polyfill/auto';
import 'expo-sqlite/localStorage/install';

import { createClient } from '@supabase/supabase-js';

import { readSupabaseConfig, type SupabaseConfig } from './config';
import type { Database } from './database.types';

let client: PadelSupabaseClient | undefined;

export function createSupabaseClient({ publishableKey, url }: SupabaseConfig) {
  return createClient<Database>(url, publishableKey, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: false,
      persistSession: true,
      storage: localStorage,
    },
  });
}

export type PadelSupabaseClient = ReturnType<typeof createSupabaseClient>;

export function getSupabaseClient(): PadelSupabaseClient {
  client ??= createSupabaseClient(readSupabaseConfig());
  return client;
}
