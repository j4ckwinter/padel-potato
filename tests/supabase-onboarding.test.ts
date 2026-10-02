import { describe, expect, it, jest } from '@jest/globals';
import { File } from 'expo-file-system';
import {
  onboardingProfileUpdate,
  saveSupabaseOnboarding,
} from '../src/features/supabase/onboarding';
import type { PadelSupabaseClient } from '../src/features/supabase/client';
import { onboardingDraft, onboardingProfileRow } from './helpers/onboarding';

jest.mock('expo-file-system', () => ({ File: jest.fn() }));

function mockClient() {
  const single = jest.fn(async () => ({
    data: onboardingProfileRow,
    error: null as Error | null,
  }));
  const select = jest.fn(() => ({ single }));
  const eq = jest.fn(() => ({ select }));
  const update = jest.fn(() => ({ eq }));
  const from = jest.fn(() => ({
    update,
    select: () => ({ eq: () => ({ maybeSingle: single }) }),
  }));
  const getUser = jest.fn(async () => ({
    data: { user: { id: onboardingProfileRow.id } },
    error: null,
  }));
  const upload = jest.fn(async () => ({ error: null as Error | null }));
  const bucket = {
    upload,
    getPublicUrl: jest.fn(() => ({
      data: { publicUrl: 'https://example.com/avatar.jpg' },
    })),
  };
  const client = {
    auth: { getUser },
    from,
    storage: { from: jest.fn(() => bucket) },
  } as unknown as PadelSupabaseClient;
  return { client, single, eq, update, getUser, upload };
}

describe('Supabase onboarding', () => {
  it('maps every input without changing match statistics or clearing an existing avatar', () => {
    expect(onboardingProfileUpdate(onboardingDraft)).toEqual({
      display_name: 'Jack Potato',
      initials: 'JP',
      home_location: 'London',
      level: 'Improver',
      preferred_side: 'Either',
      play_vibe: 'social',
      weekly_frequency: 'three-or-more',
      availability_days: ['weekdays', 'saturday'],
      availability_times: ['afternoon', 'evening'],
      preferred_days: 'Weekdays, Saturday',
      preferred_time_of_day: 'Afternoon, Evening',
      onboarding_completed_at: expect.any(String),
    });
  });

  it.each([
    {
      ...onboardingDraft,
      profile: { ...onboardingDraft.profile, homeLocation: '' },
    },
    { ...onboardingDraft, play: { ...onboardingDraft.play, level: null } },
    {
      ...onboardingDraft,
      availability: { ...onboardingDraft.availability, days: [] },
    },
    {
      ...onboardingDraft,
      availability: { ...onboardingDraft.availability, times: ['midnight'] },
    },
    {
      ...onboardingDraft,
      availability: { ...onboardingDraft.availability, frequency: null },
    },
  ])(
    'rejects incomplete or invalid data before sending it',
    async (invalid) => {
      const { client, update } = mockClient();
      await expect(
        saveSupabaseOnboarding(
          onboardingProfileRow.id,
          invalid as never,
          client,
        ),
      ).rejects.toThrow('Complete');
      expect(update).not.toHaveBeenCalled();
    },
  );

  it('saves the authenticated user and returns refreshed app services from the saved row', async () => {
    const { client, eq, update } = mockClient();
    const services = await saveSupabaseOnboarding(
      onboardingProfileRow.id,
      onboardingDraft,
      client,
    );
    expect(eq).toHaveBeenCalledWith('id', onboardingProfileRow.id);
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        display_name: 'Jack Potato',
        level: 'Improver',
      }),
    );
    expect(services.currentUser.identity.name).toBe('Jack Potato');
    expect(services.currentUser.preferences.days).toBe('Weekdays, Saturday');
    expect(services.onboarding.completed).toBe(true);
    expect(services.onboarding.draft?.availability.days).toEqual([
      'weekdays',
      'saturday',
    ]);
    expect(
      (await services.players.findProfileById(onboardingProfileRow.id))
        ?.identity.name,
    ).toBe('Jack Potato');
  });

  it('rejects account mismatch, denied writes and missing rows', async () => {
    const { client, update, single } = mockClient();
    await expect(
      saveSupabaseOnboarding('other', onboardingDraft, client),
    ).rejects.toThrow('account changed');
    expect(update).not.toHaveBeenCalled();
    single.mockResolvedValueOnce({
      data: onboardingProfileRow,
      error: new Error('denied'),
    });
    await expect(
      saveSupabaseOnboarding(onboardingProfileRow.id, onboardingDraft, client),
    ).rejects.toThrow('denied');
    single.mockResolvedValueOnce({ data: null as never, error: null });
    await expect(
      saveSupabaseOnboarding(onboardingProfileRow.id, onboardingDraft, client),
    ).rejects.toThrow('could not be saved');
  });

  it('uploads a local photo as bytes to a stable user-owned path before publishing its URL', async () => {
    jest.mocked(File).mockImplementation(
      () =>
        ({
          uri: 'file:///photos/avatar.jpg',
          name: 'avatar.jpg',
          exists: true,
          size: 3,
          arrayBuffer: async () => new ArrayBuffer(3),
        }) as never,
    );
    const { client, upload, update } = mockClient();
    const draft = {
      ...onboardingDraft,
      profile: {
        ...onboardingDraft.profile,
        photoUri: 'file:///photos/avatar.jpg',
      },
    };
    await saveSupabaseOnboarding(onboardingProfileRow.id, draft, client);
    expect(upload).toHaveBeenCalledWith(
      `${onboardingProfileRow.id}/avatar.jpg`,
      expect.any(ArrayBuffer),
      { contentType: 'image/jpeg', upsert: true },
    );
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ avatar_url: 'https://example.com/avatar.jpg' }),
    );
    upload.mockResolvedValueOnce({ error: new Error('upload failed') });
    update.mockClear();
    await expect(
      saveSupabaseOnboarding(onboardingProfileRow.id, draft, client),
    ).rejects.toThrow('upload failed');
    expect(update).not.toHaveBeenCalled();
  });
});
