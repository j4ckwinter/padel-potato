import { describe, expect, it } from '@jest/globals';

import { playerProfileFromRow } from '../src/features/supabase/appServices';
import type { Database } from '../src/features/supabase/database.types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

const profileRow: ProfileRow = {
  availability_days: [],
  availability_times: [],
  home_location: '',
  onboarding_completed_at: null,
  play_vibe: null,
  weekly_frequency: null,
  avatar_url: null,
  bio: 'Social player',
  created_at: '2026-09-30T12:00:00.000Z',
  display_name: 'Jordan Lee',
  games_played: 8,
  games_won: 5,
  id: '00000000-0000-4000-8000-000000000001',
  initials: 'JL',
  level: 'Intermediate',
  preferred_days: 'Weekends',
  preferred_side: 'Either',
  preferred_time_of_day: 'Evenings',
  presence: 'offline',
  rating: 4.2,
  updated_at: '2026-09-30T12:00:00.000Z',
};

describe('Supabase app services', () => {
  it('maps the authenticated profile into the app domain', () => {
    expect(playerProfileFromRow(profileRow)).toEqual({
      bio: 'Social player',
      id: profileRow.id,
      identity: {
        initials: 'JL',
        name: 'Jordan Lee',
        presence: 'offline',
        supportingText: 'Intermediate · Rating 4.2',
      },
      level: 'Intermediate',
      preferences: {
        days: 'Weekends',
        side: 'Either',
        timeOfDay: 'Evenings',
      },
      stats: { gamesPlayed: '8', rating: '4.2', winRate: '63%' },
    });
  });
});
