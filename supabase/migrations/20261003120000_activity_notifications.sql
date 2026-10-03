create type public.activity_kind as enum ('invitation', 'game_confirmed', 'player_joined', 'spot_remaining', 'game_updated', 'result_added', 'cancelled');
create table public.activity_notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  kind public.activity_kind not null,
  game_id uuid not null references public.games(id) on delete cascade,
  invitation_id uuid references public.game_invitations(id) on delete cascade,
  title text not null check (length(trim(title)) > 0),
  message text not null check (length(trim(message)) > 0),
  created_at timestamptz not null default now(),
  read_at timestamptz,
  constraint activity_target_matches_kind check ((kind = 'invitation') = (invitation_id is not null))
);
create unique index activity_invitation_identity on public.activity_notifications(recipient_id, invitation_id) where kind = 'invitation';
create index activity_recipient_order on public.activity_notifications(recipient_id, created_at desc, id desc);
alter table public.activity_notifications enable row level security;
create policy activity_recipient_read on public.activity_notifications for select to authenticated using (recipient_id = auth.uid());
revoke all on public.activity_notifications from anon, authenticated;
grant select on public.activity_notifications to authenticated;

create function public.mark_activity_notification_read(notification_id uuid) returns boolean
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  update public.activity_notifications set read_at = coalesce(read_at, now()) where id = notification_id and recipient_id = auth.uid();
  return found;
end;
$$;
revoke all on function public.mark_activity_notification_read(uuid) from public, anon;
grant execute on function public.mark_activity_notification_read(uuid) to authenticated;

create function public.activity_invitation_insert() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.activity_notifications(recipient_id, kind, game_id, invitation_id, title, message, created_at)
    select new.invitee_id, 'invitation', new.game_id, new.id, 'Game invitation', p.display_name || ' invited you to ' || g.name || ' at ' || g.venue_name || '.', new.created_at
    from public.games g join public.profiles p on p.id = new.inviter_id where g.id = new.game_id;
  return new;
end;
$$;
create trigger invitations_activity after insert on public.game_invitations for each row execute function public.activity_invitation_insert();

create function public.activity_participant_insert() returns trigger
language plpgsql security definer set search_path = '' as $$
declare selected_game public.games; players integer; actor_name text;
begin
  if new.role <> 'player' then return new; end if;
  select * into selected_game from public.games where id = new.game_id;
  if selected_game.status <> 'scheduled' or selected_game.starts_at <= now() then return new; end if;
  select count(*) into players from public.game_participants where game_id = new.game_id;
  select display_name into actor_name from public.profiles where id = new.player_id;
  if players < 4 then
    insert into public.activity_notifications(recipient_id, kind, game_id, title, message)
      select player_id, 'player_joined', new.game_id, 'Player joined', actor_name || ' joined ' || selected_game.name || '.'
      from public.game_participants where game_id = new.game_id and player_id <> new.player_id;
  end if;
  if players = 3 and selected_game.organiser_id <> new.player_id then
    insert into public.activity_notifications(recipient_id, kind, game_id, title, message)
      values(selected_game.organiser_id, 'spot_remaining', new.game_id, 'One spot remaining', selected_game.name || ' needs one more player.');
  elsif players = 4 then
    insert into public.activity_notifications(recipient_id, kind, game_id, title, message)
      select player_id, 'game_confirmed', new.game_id, 'Game confirmed', 'All four players are ready for ' || selected_game.name || '.'
      from public.game_participants where game_id = new.game_id;
  end if;
  return new;
end;
$$;
create trigger participants_activity after insert on public.game_participants for each row execute function public.activity_participant_insert();

create function public.activity_game_update() returns trigger
language plpgsql security definer set search_path = '' as $$
declare event_kind public.activity_kind; event_title text; event_message text;
begin
  if old.status = 'scheduled' and new.status = 'cancelled' then
    event_kind := 'cancelled'; event_title := 'Game cancelled'; event_message := new.name || ' has been cancelled.';
  elsif old.status <> 'completed' and new.status = 'completed' then
    event_kind := 'result_added'; event_title := 'Result added'; event_message := 'The result for ' || new.name || ' is ready to view.';
  elsif new.status = 'scheduled' and (old.starts_at, old.duration_minutes, old.venue_name) is distinct from (new.starts_at, new.duration_minutes, new.venue_name) then
    event_kind := 'game_updated'; event_title := 'Game updated'; event_message := 'The schedule or venue for ' || new.name || ' has changed. Check the game details.';
  else return new;
  end if;
  insert into public.activity_notifications(recipient_id, kind, game_id, title, message)
    select recipient, event_kind, new.id, event_title, event_message from (
      select player_id as recipient from public.game_participants where game_id = new.id
      union
      select invitee_id from public.game_invitations where game_id = new.id and status = 'pending' and event_kind <> 'result_added'
    ) recipients where recipient is distinct from auth.uid();
  return new;
end;
$$;
create trigger games_activity_before_close after update on public.games for each row execute function public.activity_game_update();
revoke all on function public.activity_invitation_insert(), public.activity_participant_insert(), public.activity_game_update() from public, anon, authenticated;

insert into public.activity_notifications(recipient_id, kind, game_id, invitation_id, title, message, created_at)
  select i.invitee_id, 'invitation', i.game_id, i.id, 'Game invitation', p.display_name || ' invited you to ' || g.name || ' at ' || g.venue_name || '.', i.created_at
  from public.game_invitations i join public.games g on g.id = i.game_id join public.profiles p on p.id = i.inviter_id
  on conflict do nothing;
