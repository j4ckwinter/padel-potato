create type public.game_invitation_status as enum (
  'pending',
  'accepted',
  'declined',
  'closed'
);
create table public.game_invitations (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games (id) on delete cascade,
  inviter_id uuid not null references public.profiles (id) on delete cascade,
  invitee_id uuid not null references public.profiles (id) on delete cascade,
  status public.game_invitation_status not null default 'pending',
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  constraint cannot_invite_self check (inviter_id <> invitee_id),
  constraint invitation_response_matches_status check (
    (status in ('pending', 'closed') and responded_at is null)
    or (status in ('accepted', 'declined') and responded_at is not null)
  )
);
create unique index game_invitations_pending_player_idx
on public.game_invitations (game_id, invitee_id)
where status = 'pending';
create index game_invitations_invitee_idx
on public.game_invitations (invitee_id, created_at desc);
create index game_invitations_inviter_idx
on public.game_invitations (inviter_id, created_at desc);
alter table public.game_invitations enable row level security;
create policy game_invitations_read_involved
on public.game_invitations for select to authenticated
using (
  auth.uid() is not null
  and auth.uid() in (inviter_id, invitee_id)
);
grant select on public.game_invitations to authenticated;
create function public.send_game_invitation(
  game_id uuid,
  player_id uuid
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
  if selected_game.status <> 'scheduled' then return 'unavailable'; end if;
  if current_user_id = player_id then return 'invalid_player'; end if;
  if not exists (select 1 from public.profiles where id = player_id) then
    return 'invalid_player';
  end if;
  if exists (
    select 1 from public.game_participants
    where game_participants.game_id = send_game_invitation.game_id
      and game_participants.player_id = send_game_invitation.player_id
  ) then
    return 'already_joined';
  end if;

  select count(*) into participant_count
  from public.game_participants
  where game_participants.game_id = send_game_invitation.game_id;
  if participant_count >= 4 then return 'full'; end if;

  if exists (
    select 1 from public.game_invitations
    where game_invitations.game_id = send_game_invitation.game_id
      and invitee_id = player_id
      and status = 'pending'
  ) then
    return 'already_invited';
  end if;

  insert into public.game_invitations (
    game_id,
    inviter_id,
    invitee_id
  ) values (
    game_id,
    current_user_id,
    player_id
  );
  return 'invited';
end;
$$;
create function public.respond_to_game_invitation(
  invitation_id uuid,
  response text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  selected_invitation public.game_invitations%rowtype;
  selected_game public.games%rowtype;
  participant_count integer;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if response not in ('accept', 'decline') then return 'invalid_response'; end if;

  select * into selected_invitation
  from public.game_invitations
  where id = invitation_id;

  if not found then return 'not_found'; end if;
  if selected_invitation.invitee_id <> current_user_id then return 'forbidden'; end if;

  select * into selected_game
  from public.games
  where id = selected_invitation.game_id
  for update;

  if not found then return 'not_found'; end if;

  select * into selected_invitation
  from public.game_invitations
  where id = invitation_id
  for update;

  if not found then return 'not_found'; end if;
  if selected_invitation.invitee_id <> current_user_id then return 'forbidden'; end if;
  if selected_invitation.status <> 'pending' then return 'already_responded'; end if;
  if selected_game.status <> 'scheduled' then return 'unavailable'; end if;

  if response = 'decline' then
    update public.game_invitations
    set status = 'declined', responded_at = now()
    where id = invitation_id;
    return 'declined';
  end if;

  if exists (
    select 1 from public.game_participants
    where game_id = selected_invitation.game_id
      and player_id = current_user_id
  ) then
    update public.game_invitations
    set status = 'accepted', responded_at = now()
    where id = invitation_id;
    return 'accepted';
  end if;

  select count(*) into participant_count
  from public.game_participants
  where game_id = selected_invitation.game_id;
  if participant_count >= 4 then return 'full'; end if;

  insert into public.game_participants (game_id, player_id, role, position)
  values (
    selected_invitation.game_id,
    current_user_id,
    'player',
    participant_count + 1
  );

  update public.game_invitations
  set status = 'accepted', responded_at = now()
  where id = invitation_id;
  return 'accepted';
end;
$$;
create function public.close_pending_game_invitations()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.game_invitations
  set status = 'accepted', responded_at = now()
  where game_id = new.game_id
    and invitee_id = new.player_id
    and status = 'pending';

  if (
    select count(*)
    from public.game_participants
    where game_id = new.game_id
  ) >= 4 then
    update public.game_invitations
    set status = 'closed'
    where game_id = new.game_id and status = 'pending';
  end if;
  return new;
end;
$$;
create trigger game_participants_close_full_game_invitations
after insert on public.game_participants
for each row execute function public.close_pending_game_invitations();
create function public.close_inactive_game_invitations()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.status = 'scheduled' and new.status <> 'scheduled' then
    update public.game_invitations
    set status = 'closed'
    where game_id = new.id and status = 'pending';
  end if;
  return new;
end;
$$;
create trigger games_close_inactive_invitations
after update of status on public.games
for each row execute function public.close_inactive_game_invitations();
revoke all on function public.send_game_invitation(uuid, uuid)
from public, anon;
grant execute on function public.send_game_invitation(uuid, uuid)
to authenticated;
revoke all on function public.respond_to_game_invitation(uuid, text)
from public, anon;
grant execute on function public.respond_to_game_invitation(uuid, text)
to authenticated;
revoke all on function public.close_pending_game_invitations()
from public, anon, authenticated;
revoke all on function public.close_inactive_game_invitations()
from public, anon, authenticated;
