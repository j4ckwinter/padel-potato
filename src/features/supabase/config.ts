export type SupabaseConfig = Readonly<{
  publishableKey: string;
  url: string;
}>;

export type SupabaseConfigInput = Readonly<{
  publishableKey: string | undefined;
  url: string | undefined;
}>;

export function parseSupabaseConfig({
  publishableKey,
  url,
}: SupabaseConfigInput): SupabaseConfig {
  if (!url || !publishableKey) {
    throw new Error(
      'Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY.',
    );
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new Error('EXPO_PUBLIC_SUPABASE_URL must be a valid URL.');
  }

  const localDevelopmentUrl =
    parsedUrl.protocol === 'http:' &&
    (parsedUrl.hostname === '127.0.0.1' || parsedUrl.hostname === 'localhost');
  if (parsedUrl.protocol !== 'https:' && !localDevelopmentUrl) {
    throw new Error(
      'EXPO_PUBLIC_SUPABASE_URL must use HTTPS outside local development.',
    );
  }

  if (publishableKey.trim().length === 0) {
    throw new Error('EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY cannot be empty.');
  }

  return { publishableKey, url: parsedUrl.toString().replace(/\/$/u, '') };
}

export function readSupabaseConfig() {
  return parseSupabaseConfig({
    publishableKey: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    url: process.env.EXPO_PUBLIC_SUPABASE_URL,
  });
}
