alter type public.player_level add value if not exists 'Improver' after 'Beginner';

alter table public.profiles
  add column home_location text not null default '' check (length(trim(home_location)) <= 120),
  add column play_vibe text check (play_vibe in ('social', 'competitive')),
  add column weekly_frequency text check (weekly_frequency in ('one-or-two', 'three-or-more')),
  add column availability_days text[] not null default '{}' check (
    availability_days <@ array['weekdays', 'saturday', 'sunday']::text[]
    and array_position(availability_days, null) is null
  ),
  add column availability_times text[] not null default '{}' check (
    availability_times <@ array['morning', 'afternoon', 'evening']::text[]
    and array_position(availability_times, null) is null
  ),
  add column onboarding_completed_at timestamptz,
  add constraint onboarding_requires_complete_preferences check (
    onboarding_completed_at is null or (
      length(trim(home_location)) > 0
      and play_vibe is not null
      and weekly_frequency is not null
      and cardinality(availability_days) > 0
      and cardinality(availability_times) > 0
    )
  );

-- Keep authenticated profile edits limited to the explicitly granted columns.
revoke update on public.profiles from authenticated;

grant update (display_name, initials, avatar_url, presence, bio, level,
  preferred_side, preferred_days, preferred_time_of_day, home_location,
  play_vibe, weekly_frequency, availability_days, availability_times,
  onboarding_completed_at) on public.profiles to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('profile-photos', 'profile-photos', true, 5242880, array['image/jpeg', 'image/png']);

create policy profile_photos_insert_own on storage.objects
for insert to authenticated with check (
  bucket_id = 'profile-photos' and (storage.foldername(name))[1] = (select auth.uid())::text
);
create policy profile_photos_delete_own on storage.objects
for delete to authenticated using (
  bucket_id = 'profile-photos' and (storage.foldername(name))[1] = (select auth.uid())::text
);
create policy profile_photos_read_own on storage.objects
for select to authenticated using (
  bucket_id = 'profile-photos' and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy profile_photos_update_own on storage.objects
for update to authenticated using (
  bucket_id = 'profile-photos' and (storage.foldername(name))[1] = (select auth.uid())::text
) with check (
  bucket_id = 'profile-photos' and (storage.foldername(name))[1] = (select auth.uid())::text
);
