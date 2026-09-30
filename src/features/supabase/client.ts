import 'react-native-url-polyfill/auto';
import 'expo-sqlite/localStorage/install';

import { createClient } from '@supabase/supabase-js';

import type { SupabaseConfig } from './config';
import type { Database } from './database.types';

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
