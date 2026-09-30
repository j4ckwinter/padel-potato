create function public.transition_game_lifecycle(
  game_id uuid,
  lifecycle_command text,
  occurred_at timestamptz,
  result_data jsonb default null
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  selected_game public.games%rowtype;
  participant_count integer;
  team_one_player_one uuid;
  team_one_player_two uuid;
  team_two_player_one uuid;
  team_two_player_two uuid;
  set_data jsonb;
  set_number integer := 0;
  team_one_score integer;
  team_two_score integer;
  team_one_wins integer := 0;
  team_two_wins integer := 0;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select * into selected_game
  from public.games
  where id = game_id
  for update;

  if not found then return 'not_found'; end if;
  if selected_game.organiser_id <> current_user_id then return 'forbidden'; end if;

  if lifecycle_command = 'cancel' then
    if selected_game.status <> 'scheduled' then return 'invalid_transition'; end if;

    update public.games
    set status = 'cancelled', cancelled_at = occurred_at
    where id = game_id;
    return 'transitioned';
  end if;

  if lifecycle_command = 'finish' then
    if selected_game.status <> 'scheduled' then return 'invalid_transition'; end if;

    select count(*) into participant_count
    from public.game_participants
    where game_participants.game_id = transition_game_lifecycle.game_id;
    if participant_count <> 4 then return 'invalid_transition'; end if;

    update public.games
    set status = 'awaiting_result', ended_at = occurred_at
    where id = game_id;
    return 'transitioned';
  end if;

  if lifecycle_command <> 'record_result'
    or selected_game.status <> 'awaiting_result'
    or result_data is null
    or jsonb_typeof(result_data -> 'teams') <> 'array'
    or jsonb_array_length(result_data -> 'teams') <> 2
    or jsonb_typeof(result_data #> '{teams,0}') <> 'array'
    or jsonb_array_length(result_data #> '{teams,0}') <> 2
    or jsonb_typeof(result_data #> '{teams,1}') <> 'array'
    or jsonb_array_length(result_data #> '{teams,1}') <> 2
    or jsonb_typeof(result_data -> 'sets') <> 'array'
    or jsonb_array_length(result_data -> 'sets') not in (2, 3)
  then
    return 'invalid_transition';
  end if;

  begin
    team_one_player_one := (result_data #>> '{teams,0,0}')::uuid;
    team_one_player_two := (result_data #>> '{teams,0,1}')::uuid;
    team_two_player_one := (result_data #>> '{teams,1,0}')::uuid;
    team_two_player_two := (result_data #>> '{teams,1,1}')::uuid;
  exception when invalid_text_representation then
    return 'invalid_transition';
  end;

  if team_one_player_one is null
    or team_one_player_two is null
    or team_two_player_one is null
    or team_two_player_two is null
    or (
      select count(distinct player_id)
      from unnest(array[
        team_one_player_one,
        team_one_player_two,
        team_two_player_one,
        team_two_player_two
      ]) as players(player_id)
    ) <> 4
    or (
      select count(*)
      from public.game_participants
      where game_participants.game_id = transition_game_lifecycle.game_id
        and player_id = any(array[
          team_one_player_one,
          team_one_player_two,
          team_two_player_one,
          team_two_player_two
        ])
    ) <> 4
  then
    return 'invalid_transition';
  end if;

  for set_data in select value from jsonb_array_elements(result_data -> 'sets')
  loop
    set_number := set_number + 1;
    if jsonb_typeof(set_data) <> 'array' or jsonb_array_length(set_data) <> 2 then
      return 'invalid_transition';
    end if;

    begin
      team_one_score := (set_data ->> 0)::integer;
      team_two_score := (set_data ->> 1)::integer;
    exception when invalid_text_representation then
      return 'invalid_transition';
    end;

    if not (
      (team_one_score = 6 and team_two_score between 0 and 4)
      or (team_two_score = 6 and team_one_score between 0 and 4)
      or (team_one_score = 7 and team_two_score in (5, 6))
      or (team_two_score = 7 and team_one_score in (5, 6))
    ) then
      return 'invalid_transition';
    end if;

    if team_one_score > team_two_score then
      team_one_wins := team_one_wins + 1;
    else
      team_two_wins := team_two_wins + 1;
    end if;
  end loop;

  if greatest(team_one_wins, team_two_wins) < 2
    or team_one_wins = team_two_wins
  then
    return 'invalid_transition';
  end if;

  insert into public.game_results (game_id, submitted_by)
  values (game_id, current_user_id);

  insert into public.game_result_teams (
    game_id,
    team_number,
    player_position,
    player_id
  ) values
    (game_id, 1, 1, team_one_player_one),
    (game_id, 1, 2, team_one_player_two),
    (game_id, 2, 1, team_two_player_one),
    (game_id, 2, 2, team_two_player_two);

  set_number := 0;
  for set_data in select value from jsonb_array_elements(result_data -> 'sets')
  loop
    set_number := set_number + 1;
    insert into public.game_result_sets (
      game_id,
      set_number,
      team_one_score,
      team_two_score
    ) values (
      game_id,
      set_number,
      (set_data ->> 0)::smallint,
      (set_data ->> 1)::smallint
    );
  end loop;

  update public.games
  set status = 'completed', completed_at = occurred_at
  where id = game_id;
  return 'transitioned';
end;
$$;

revoke all on function public.transition_game_lifecycle(uuid, text, timestamptz, jsonb)
from public, anon;
grant execute on function public.transition_game_lifecycle(uuid, text, timestamptz, jsonb)
to authenticated;
