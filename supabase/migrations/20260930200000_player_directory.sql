create function public.update_profiles_after_completed_game()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  winning_team smallint;
begin
  if old.status = 'completed' or new.status <> 'completed' then
    return new;
  end if;

  select case
    when count(*) filter (where team_one_score > team_two_score)
      > count(*) filter (where team_two_score > team_one_score)
    then 1
    else 2
  end into winning_team
  from public.game_result_sets
  where game_id = new.id;

  update public.profiles
  set games_played = games_played + 1
  where id in (
    select player_id
    from public.game_participants
    where game_id = new.id
  );

  update public.profiles
  set games_won = games_won + 1
  where id in (
    select player_id
    from public.game_result_teams
    where game_id = new.id and team_number = winning_team
  );

  return new;
end;
$$;
create trigger games_update_completed_player_stats
after update of status on public.games
for each row execute function public.update_profiles_after_completed_game();
with winning_teams as (
  select
    game_id,
    case
      when count(*) filter (where team_one_score > team_two_score)
        > count(*) filter (where team_two_score > team_one_score)
      then 1
      else 2
    end as team_number
  from public.game_result_sets
  group by game_id
), player_stats as (
  select
    participants.player_id,
    count(distinct games.id)::integer as games_played,
    count(distinct games.id) filter (
      where result_teams.team_number = winning_teams.team_number
    )::integer as games_won
  from public.game_participants as participants
  join public.games as games
    on games.id = participants.game_id and games.status = 'completed'
  join winning_teams on winning_teams.game_id = games.id
  left join public.game_result_teams as result_teams
    on result_teams.game_id = games.id
    and result_teams.player_id = participants.player_id
  group by participants.player_id
)
update public.profiles as profiles
set
  games_played = coalesce(player_stats.games_played, 0),
  games_won = coalesce(player_stats.games_won, 0)
from (
  select
    profiles.id as player_id,
    stats.games_played,
    stats.games_won
  from public.profiles as profiles
  left join player_stats as stats on stats.player_id = profiles.id
) as player_stats
where profiles.id = player_stats.player_id;
revoke all on function public.update_profiles_after_completed_game()
from public, anon, authenticated;
create function public.set_player_favourite(
  player_id uuid,
  should_favourite boolean
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if current_user_id = player_id then return 'invalid_player'; end if;
  if not exists (select 1 from public.profiles where id = player_id) then
    return 'not_found';
  end if;

  if should_favourite then
    insert into public.player_favourites (user_id, player_id)
    values (current_user_id, player_id)
    on conflict do nothing;
  else
    delete from public.player_favourites
    where user_id = current_user_id
      and player_favourites.player_id = set_player_favourite.player_id;
  end if;

  return 'updated';
end;
$$;
revoke all on function public.set_player_favourite(uuid, boolean)
from public, anon;
grant execute on function public.set_player_favourite(uuid, boolean)
to authenticated;
revoke insert, delete on public.player_favourites from authenticated;
drop policy favourites_insert_own on public.player_favourites;
drop policy favourites_delete_own on public.player_favourites;
update public.profiles
set initials = left(trim(initials), 3)
where length(trim(initials)) > 3;
alter table public.profiles drop constraint profiles_initials_check;
alter table public.profiles add constraint profiles_initials_check
check (length(trim(initials)) between 1 and 3);
