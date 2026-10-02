import { isCompleteOnboardingDraft } from '../../design-system/configuration/onboarding';
import { gamePlayerFromProfile } from '../players/player';
import type { AppServices } from '../services/AppServicesContext';
import { getSupabaseClient, type PadelSupabaseClient } from './client';
import type { Database } from './database.types';
import { createSupabaseGameRepository } from './gameRepository';
import { playerProfileFromRow } from './playerProfile';
import { createSupabasePlayerRepository } from './playerRepository';
import { createSupabaseInvitationRepository } from './invitationRepository';
export { playerProfileFromRow } from './playerProfile';
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export async function loadSupabaseAppServices(
  userId: string,
  client: PadelSupabaseClient = getSupabaseClient(),
): Promise<AppServices | null> {
  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  return appServicesFromProfileRow(data, client);
}

export function appServicesFromProfileRow(
  data: ProfileRow,
  client: PadelSupabaseClient,
): AppServices {
  const candidate = {
    profile: {
      displayName: data.display_name,
      homeLocation: data.home_location,
      photoUri: null,
    },
    play: {
      level: data.level.toLowerCase(),
      side: data.preferred_side.toLowerCase(),
      vibe: data.play_vibe,
    },
    availability: {
      days: data.availability_days,
      times: data.availability_times,
      frequency: data.weekly_frequency,
    },
  };
  const completed = data.onboarding_completed_at !== null;
  if (completed && !isCompleteOnboardingDraft(candidate))
    throw new Error('The saved onboarding preferences are invalid.');
  const currentUser = playerProfileFromRow(data);
  const currentPlayer = gamePlayerFromProfile(currentUser);
  return {
    currentPlayer,
    currentUser,
    onboarding: {
      completed,
      draft: isCompleteOnboardingDraft(candidate) ? candidate : null,
    },
    games: createSupabaseGameRepository(client),
    players: createSupabasePlayerRepository(client, data.id),
    invitations: createSupabaseInvitationRepository(client, data.id),
  };
}
