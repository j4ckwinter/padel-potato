create function public.leave_game(game_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_game public.games;
  departing_position smallint;
  participant record;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select * into selected_game from public.games where id = game_id for update;
  if not found then return 'not_found'; end if;
  if selected_game.organiser_id = auth.uid() then return 'organiser'; end if;
  select position into departing_position from public.game_participants
    where game_participants.game_id = leave_game.game_id and player_id = auth.uid();
  if not found then return 'already_left'; end if;
  if selected_game.status <> 'scheduled' or selected_game.starts_at <= now() then return 'unavailable'; end if;
  delete from public.game_participants
    where game_participants.game_id = leave_game.game_id and player_id = auth.uid();
  for participant in select player_id, position from public.game_participants
    where game_participants.game_id = leave_game.game_id and position > departing_position order by position
  loop
    update public.game_participants set position = participant.position - 1
      where game_participants.game_id = leave_game.game_id and player_id = participant.player_id;
  end loop;
  return 'left';
end;
$$;

create function public.reschedule_game(game_id uuid, starts_at timestamptz)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare selected_game public.games;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select * into selected_game from public.games where id = game_id for update;
  if not found then return 'not_found'; end if;
  if selected_game.organiser_id <> auth.uid() then return 'forbidden'; end if;
  if selected_game.status <> 'scheduled' or selected_game.starts_at <= now()
    or starts_at is null or not isfinite(starts_at) or starts_at <= now() then return 'unavailable'; end if;
  if (select count(*) from public.game_participants where game_participants.game_id = reschedule_game.game_id) <> 1 then return 'players_joined'; end if;
  update public.games set starts_at = reschedule_game.starts_at where id = game_id;
  update public.game_invitations set status = 'closed'
    where game_invitations.game_id = reschedule_game.game_id and status = 'pending';
  return 'rescheduled';
end;
$$;
revoke all on function public.leave_game(uuid), public.reschedule_game(uuid, timestamptz) from public, anon;
grant execute on function public.leave_game(uuid), public.reschedule_game(uuid, timestamptz) to authenticated;
