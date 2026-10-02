import { File } from 'expo-file-system';

import {
  isCompleteOnboardingDraft,
  type OnboardingDraft,
} from '../../design-system/configuration/onboarding';
import {
  availabilityDayOptions,
  availabilityTimeOptions,
} from '../../design-system/configuration/availability';
import { profilePhotoMaximumBytes } from '../../design-system/configuration/profile';
import { appServicesFromProfileRow } from './appServices';
import { getSupabaseClient, type PadelSupabaseClient } from './client';
import type { Database } from './database.types';

type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
const levels = {
  beginner: 'Beginner',
  improver: 'Improver',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
} as const;
const sides = { left: 'Left', right: 'Right', either: 'Either' } as const;

export function onboardingProfileUpdate(draft: OnboardingDraft): ProfileUpdate {
  if (!isCompleteOnboardingDraft(draft))
    throw new Error('Complete all onboarding preferences.');
  const name = draft.profile.displayName.trim();
  const words = name.split(/\s+/u);
  return {
    display_name: name,
    initials:
      `${words[0][0]}${words.length > 1 ? words[words.length - 1][0] : ''}`.toLocaleUpperCase(),
    home_location: draft.profile.homeLocation.trim(),
    level: levels[draft.play.level],
    preferred_side: sides[draft.play.side],
    play_vibe: draft.play.vibe,
    weekly_frequency: draft.availability.frequency,
    availability_days: availabilityDayOptions
      .filter((option) => draft.availability.days.includes(option.value))
      .map((option) => option.value),
    availability_times: availabilityTimeOptions
      .filter((option) => draft.availability.times.includes(option.value))
      .map((option) => option.value),
    preferred_days: availabilityDayOptions
      .filter((option) => draft.availability.days.includes(option.value))
      .map((option) => option.label)
      .join(', '),
    preferred_time_of_day: availabilityTimeOptions
      .filter((option) => draft.availability.times.includes(option.value))
      .map((option) => option.label)
      .join(', '),
    onboarding_completed_at: new Date().toISOString(),
  };
}

export async function saveSupabaseOnboarding(
  userId: string,
  draft: OnboardingDraft,
  client: PadelSupabaseClient = getSupabaseClient(),
) {
  const update = onboardingProfileUpdate(draft);
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError) throw userError;
  if (!userId || userData.user?.id !== userId)
    throw new Error('Your signed-in account changed.');

  if (draft.profile.photoUri !== null) {
    const file = new File(draft.profile.photoUri);
    const extension = file.uri.split('.').pop()?.toLowerCase();
    if (
      !file.exists ||
      file.size <= 0 ||
      file.size > profilePhotoMaximumBytes ||
      !['jpg', 'jpeg', 'png'].includes(extension ?? '')
    )
      throw new Error('Choose a JPEG or PNG photo no larger than 5 MB.');
    const path = `${userId}/${file.name}`;
    const bucket = client.storage.from('profile-photos');
    const { error } = await bucket.upload(path, await file.arrayBuffer(), {
      contentType: extension === 'png' ? 'image/png' : 'image/jpeg',
      upsert: true,
    });
    if (error) throw error;
    update.avatar_url = bucket.getPublicUrl(path).data.publicUrl;
  }

  const { data, error } = await client
    .from('profiles')
    .update(update)
    .eq('id', userId)
    .select('*')
    .single();
  if (error) throw error;
  if (!data || data.id !== userId)
    throw new Error('The profile could not be saved.');
  return appServicesFromProfileRow(data, client);
}
