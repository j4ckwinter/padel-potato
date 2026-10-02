export type Session = Readonly<{
  kind: 'supabase';
  userId: string;
  recovery?: true;
}>;
