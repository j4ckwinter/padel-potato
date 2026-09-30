create extension if not exists pgcrypto with schema extensions;

create type public.player_presence as enum ('online', 'away', 'offline');
create type public.player_level as enum ('Beginner', 'Intermediate', 'Advanced');
create type public.player_side as enum ('Left', 'Right', 'Either');
create type public.game_format as enum ('Social game', 'Competitive game');
create type public.game_status as enum (
  'scheduled',
  'awaiting_result',
  'completed',
  'cancelled'
);
create type public.game_participant_role as enum ('organiser', 'player');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (length(trim(display_name)) between 1 and 80),
  initials text not null check (length(trim(initials)) between 1 and 4),
  avatar_url text,
  presence public.player_presence not null default 'offline',
  bio text not null default '' check (length(bio) <= 500),
  level public.player_level not null default 'Beginner',
  rating numeric(2, 1) not null default 0 check (rating between 0 and 5),
  games_played integer not null default 0 check (games_played >= 0),
  games_won integer not null default 0 check (games_won between 0 and games_played),
  preferred_side public.player_side not null default 'Either',
  preferred_days text not null default 'Any day' check (length(preferred_days) <= 80),
  preferred_time_of_day text not null default 'Any time' check (length(preferred_time_of_day) <= 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.games (
  id uuid primary key default gen_random_uuid(),
  organiser_id uuid not null references public.profiles (id),
  name text not null check (length(trim(name)) between 1 and 120),
  venue_name text not null check (length(trim(venue_name)) between 1 and 160),
  starts_at timestamptz not null,
  duration_minutes integer not null check (duration_minutes in (60, 90)),
  format public.game_format not null,
  status public.game_status not null default 'scheduled',
  ended_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint game_lifecycle_timestamps check (
    (status = 'scheduled' and ended_at is null and completed_at is null and cancelled_at is null)
    or (status = 'awaiting_result' and ended_at is not null and completed_at is null and cancelled_at is null)
    or (status = 'completed' and ended_at is not null and completed_at is not null and cancelled_at is null)
    or (status = 'cancelled' and completed_at is null and cancelled_at is not null)
  )
);

create table public.game_participants (
  game_id uuid not null references public.games (id) on delete cascade,
  player_id uuid not null references public.profiles (id),
  role public.game_participant_role not null,
  position smallint not null check (position between 1 and 4),
  joined_at timestamptz not null default now(),
  primary key (game_id, player_id),
  unique (game_id, position),
  constraint organiser_occupies_first_position check (
    (role = 'organiser' and position = 1)
    or (role = 'player' and position > 1)
  )
);

create table public.game_results (
  game_id uuid primary key references public.games (id) on delete cascade,
  submitted_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

create table public.game_result_teams (
  game_id uuid not null references public.game_results (game_id) on delete cascade,
  team_number smallint not null check (team_number in (1, 2)),
  player_position smallint not null check (player_position in (1, 2)),
  player_id uuid not null references public.profiles (id),
  primary key (game_id, team_number, player_position),
  unique (game_id, player_id)
);

create table public.game_result_sets (
  game_id uuid not null references public.game_results (game_id) on delete cascade,
  set_number smallint not null check (set_number between 1 and 3),
  team_one_score smallint not null check (team_one_score between 0 and 7),
  team_two_score smallint not null check (team_two_score between 0 and 7),
  primary key (game_id, set_number),
  constraint different_set_scores check (team_one_score <> team_two_score)
);

create table public.player_favourites (
  user_id uuid not null references public.profiles (id) on delete cascade,
  player_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, player_id),
  constraint cannot_favourite_self check (user_id <> player_id)
);

create index games_starts_at_idx on public.games (starts_at);
create index games_organiser_id_idx on public.games (organiser_id);
create index game_participants_player_id_idx on public.game_participants (player_id);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger games_set_updated_at
before update on public.games
for each row execute function public.set_updated_at();

create function public.profile_initials(display_name text)
returns text
language sql
immutable
set search_path = ''
as $$
  select upper(
    left(split_part(trim(display_name), ' ', 1), 1)
    || case
      when strpos(trim(display_name), ' ') > 0
      then left(regexp_replace(trim(display_name), '^.*\s', ''), 1)
      else ''
    end
  );
$$;

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  resolved_name text;
begin
  resolved_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
    'Player'
  );

  insert into public.profiles (id, display_name, initials, avatar_url)
  values (
    new.id,
    resolved_name,
    public.profile_initials(resolved_name),
    nullif(new.raw_user_meta_data ->> 'avatar_url', '')
  );
  return new;
end;
$$;

create trigger auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create function public.create_game(
  game_name text,
  venue_name text,
  starts_at timestamptz,
  duration_minutes integer,
  format public.game_format
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  created_game_id uuid;
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  insert into public.games (
    organiser_id,
    name,
    venue_name,
    starts_at,
    duration_minutes,
    format
  )
  values (
    current_user_id,
    trim(game_name),
    trim(venue_name),
    starts_at,
    duration_minutes,
    format
  )
  returning id into created_game_id;

  insert into public.game_participants (game_id, player_id, role, position)
  values (created_game_id, current_user_id, 'organiser', 1);

  return created_game_id;
end;
$$;

create function public.join_game(game_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  selected_game public.games%rowtype;
  participant_count integer;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select * into selected_game
  from public.games
  where id = game_id
  for update;

  if not found then return 'not_found'; end if;
  if selected_game.status <> 'scheduled' then return 'unavailable'; end if;
  if exists (
    select 1 from public.game_participants
    where game_participants.game_id = join_game.game_id
      and player_id = current_user_id
  ) then
    return 'already_joined';
  end if;

  select count(*) into participant_count
  from public.game_participants
  where game_participants.game_id = join_game.game_id;

  if participant_count >= 4 then return 'full'; end if;

  insert into public.game_participants (game_id, player_id, role, position)
  values (game_id, current_user_id, 'player', participant_count + 1);
  return 'joined';
end;
$$;

alter table public.profiles enable row level security;
alter table public.games enable row level security;
alter table public.game_participants enable row level security;
alter table public.game_results enable row level security;
alter table public.game_result_teams enable row level security;
alter table public.game_result_sets enable row level security;
alter table public.player_favourites enable row level security;

create policy profiles_read_authenticated
on public.profiles for select to authenticated
using (true);

create policy profiles_update_self
on public.profiles for update to authenticated
using (auth.uid() is not null and auth.uid() = id)
with check (auth.uid() is not null and auth.uid() = id);

create policy games_read_authenticated
on public.games for select to authenticated
using (true);

create policy game_participants_read_authenticated
on public.game_participants for select to authenticated
using (true);

create policy game_results_read_authenticated
on public.game_results for select to authenticated
using (true);

create policy game_result_teams_read_authenticated
on public.game_result_teams for select to authenticated
using (true);

create policy game_result_sets_read_authenticated
on public.game_result_sets for select to authenticated
using (true);

create policy favourites_read_own
on public.player_favourites for select to authenticated
using (auth.uid() is not null and auth.uid() = user_id);

create policy favourites_insert_own
on public.player_favourites for insert to authenticated
with check (auth.uid() is not null and auth.uid() = user_id);

create policy favourites_delete_own
on public.player_favourites for delete to authenticated
using (auth.uid() is not null and auth.uid() = user_id);

revoke all on all tables in schema public from anon;
revoke all on all functions in schema public from public, anon;

grant usage on schema public to authenticated;
grant select on public.profiles to authenticated;
grant update (
  display_name,
  initials,
  avatar_url,
  presence,
  bio,
  level,
  preferred_side,
  preferred_days,
  preferred_time_of_day
) on public.profiles to authenticated;
grant select on public.games to authenticated;
grant select on public.game_participants to authenticated;
grant select on public.game_results to authenticated;
grant select on public.game_result_teams to authenticated;
grant select on public.game_result_sets to authenticated;
grant select, insert, delete on public.player_favourites to authenticated;
grant execute on function public.create_game(text, text, timestamptz, integer, public.game_format) to authenticated;
grant execute on function public.join_game(uuid) to authenticated;
