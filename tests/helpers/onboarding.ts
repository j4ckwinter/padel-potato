import type { OnboardingDraft } from '../../src/design-system/configuration/onboarding';
import type { Database } from '../../src/features/supabase/database.types';

export const onboardingDraft: OnboardingDraft = {
  profile: {
    displayName: 'Jack Potato',
    homeLocation: 'London',
    photoUri: null,
  },
  play: { level: 'improver', side: 'either', vibe: 'social' },
  availability: {
    days: ['saturday', 'weekdays'],
    times: ['evening', 'afternoon'],
    frequency: 'three-or-more',
  },
};

export const onboardingProfileRow: Database['public']['Tables']['profiles']['Row'] =
  {
    id: '00000000-0000-4000-8000-000000000001',
    display_name: 'Jack Potato',
    initials: 'JP',
    home_location: 'London',
    avatar_url: null,
    bio: '',
    level: 'Improver',
    preferred_side: 'Either',
    play_vibe: 'social',
    weekly_frequency: 'three-or-more',
    availability_days: ['weekdays', 'saturday'],
    availability_times: ['afternoon', 'evening'],
    preferred_days: 'Weekdays, Saturday',
    preferred_time_of_day: 'Afternoon, Evening',
    onboarding_completed_at: '2026-10-02T12:00:00.000Z',
    created_at: '2026-10-01T12:00:00.000Z',
    updated_at: '2026-10-02T12:00:00.000Z',
    presence: 'offline',
    rating: 0,
    games_played: 0,
    games_won: 0,
  };
