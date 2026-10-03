# Durable recipient activity feed

## Problem

The invitation repository exposes current invitation state. It does not preserve event time or read state. A client cannot reconstruct a trustworthy activity timeline from current games after players leave or invitations close. Existing game RPCs serialize mutations by locking the game row. Transactional triggers can preserve recipient events at that boundary without adding client write coordination.

## Usage

The feed calls `services.notifications.list()` on focus and foreground. It filters returned domain items by `readAt === null`, partitions local calendar dates into Today and Earlier, and composes AppHeader, SegmentedControl, SectionHeader and NotificationRow. Opening a row awaits `services.notifications.markRead(item.id)` and refreshes the feed. It then opens an invitation detail for invitation items and a game detail for other items. Failure to persist read state stays visible and retryable. Opening a row never accepts an invitation.

The detail loads current incoming invitations and matches the stored invitation ID. Pending invitations retain Accept and Decline. Closed or answered invitations display their current state and link to the game. A disappeared item has an explicit unavailable state.

## Shape

```ts
type ActivityKind =
  | 'invitation'
  | 'game_confirmed'
  | 'player_joined'
  | 'spot_remaining'
  | 'game_updated'
  | 'result_added'
  | 'cancelled';
type NotificationTarget =
  | Readonly<{ type: 'invitation'; invitationId: string; gameId: string }>
  | Readonly<{ type: 'game'; gameId: string }>;
type ActivityNotification = Readonly<{
  id: string;
  kind: ActivityKind;
  title: string;
  message: string;
  createdAt: string;
  readAt: string | null;
  target: NotificationTarget;
}>;
type NotificationRepository = Readonly<{
  list: () => Promise<readonly ActivityNotification[]>;
  markRead: (id: string) => Promise<void>;
}>;
```

One table `activity_notifications` owns recipient_id, kind, game_id, invitation_id, title/message snapshots, created_at and read_at. Invitation kind requires invitation_id. Other kinds forbid it. IDs are UUIDs. Title and message are nonempty. Foreign keys cascade from recipient/game. Invitation FK can cascade because invitations are durable and product does not delete them. Read is independent of invitation status. Use a deterministic key for backfilled invitations, such as unique `(recipient_id, invitation_id)` where kind is invitation. Snapshot copy keeps the feed coherent after game or profile edits. No JSON payload or public Supabase row type escapes the repository.

`createSupabaseNotificationRepository(client, userId)` maps rows to domain items and pins mark-read RPC Authorization with existing accountAuthorization. Add one account-owned repository to AppServices and demo services. `mark_activity_notification_read(notification_id uuid)` checks auth.uid, updates only the owner's row and sets read_at to coalesce(read_at, now()). Foreign and missing IDs have the same failure response. No direct client insert/update grants.

The repository hides row parsing, transport and account authorization behind two methods. Date grouping and timestamp presentation belong to one feed view model, not SQL. Invitation response remains the existing InvitationRepository operation.

## Event semantics

| Event          | Durable trigger                                                     | Recipients                                                                                                                                                                                               |
| -------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| invitation     | after game_invitations insert                                       | Invitee only.                                                                                                                                                                                            |
| player_joined  | after game_participants insert for player role                      | Other joined players, including organiser. Actor excluded.                                                                                                                                               |
| spot_remaining | same participant insert, count becomes three, scheduled future game | Organiser. Actor excluded. Message states one place remains.                                                                                                                                             |
| game_confirmed | same insert, count becomes four, scheduled future game              | All four players. Message says four players are ready, not court booked.                                                                                                                                 |
| game_updated   | games update where scheduling fields actually differ                | Joined players and pending invitees, except auth.uid actor. Existing reschedule permits organiser alone, so pending invitees are the useful recipients. Capture these before the RPC closes invitations. |
| cancelled      | games scheduled to cancelled                                        | Joined players and pending invitees, except actor. Trigger must run before existing close-inactive trigger or use a before-update capture.                                                               |
| result_added   | games transition to completed                                       | Participants except submitting actor. Result sets exist before final status update.                                                                                                                      |

Initial organiser participant insert produces no join event. Reordering positions on leave produces no join event. A rejoin is a new real event. Failed/retried RPCs produce no duplicate because no successful insert or meaningful transition occurs on the retry. A fourth join can produce both player_joined and game_confirmed for the organiser. These are different events, but omit player_joined on count four if the compact feed feels noisy. Decide this policy centrally in the trigger.

Trigger ordering is load bearing. PostgreSQL runs same-time triggers alphabetically. Use one explicitly named notification trigger ordered before `games_close_inactive_invitations`, or a before-update event trigger. Do not rely on query timing after close. Every trigger uses security definer and empty search_path, explicit public qualification, and revoked direct execution. Event failure rolls back the game mutation.

No booking event is emitted. Venue name is not evidence of a court reservation. No client-generated result confirmation claims are emitted.

## Security and backfill

RLS SELECT allows recipient_id = auth.uid only. Grant SELECT to authenticated, not anon. Mark-read RPC is the only mutable surface. Every insert happens in a privileged trigger, never with client-supplied recipient or message. Index `(recipient_id, created_at desc, id)` provides stable order. A finite 100 item limit is acceptable only if unread count is independently accurate. Prefer complete initial list for this small beta, matching existing invitations, and document pagination as future scale work.

Backfill existing invitation notifications with their original created_at and the same deterministic unique invitation identity. Preserve actual invitation status. Pending invitations begin unread. Historical answered/closed invitations can begin read at responded_at or created_at because they already required action or expired. Do not infer and fabricate joins, cancellations or bookings from current state. Migration runs backfill once, and ON CONFLICT DO NOTHING makes rerun safe.

NotificationRow currently forbids warning/read. Persistent warning items must become read, so explicitly expand that authored public configuration, matching read visual semantics for game/social. Add a warning/read story and behavior test. Booking/read does not need expansion because booking is not implemented.

## Tradeoffs

We accept a SQL migration and integration checks for durable cross-device history and read state. We accept snapshot copy in SQL for historical accuracy. We accept focus/foreground refresh for a small beta instead of introducing realtime lifecycle complexity. We accept no historical non-invitation backfill because the database lacks reliable source history.

## Alternatives

Client-derived activity can reuse current repositories, but exposes joins, lifecycle interpretation, ordering, timestamp guesses and read-key persistence to the screen. It cannot recover departed participants or previous schedule changes. It is useful for an ephemeral dashboard, but does not satisfy a durable notification feed.

## Red flag screen

Two repository methods hide persistence and ownership. No transport row type escapes. Event derivation belongs to the database mutation boundary. The view model owns presentation only. No load/validate/save pipeline wrappers or pass-through service layer are added.

## Tests

Database integration must assert invitation recipient-only reads, anon denial, no spoofed inserts, foreign read denial, idempotent own mark-read, backfill created_at/read semantics, repeated invite/join RPC no duplicate, third-player warning, fourth-player confirmation, cancelled pending invitee notification before close, reschedule pending invitee notification before close, no event for identical scheduling values, no join event for leave position updates, completed result event only after valid results, failed transition no activity, and no booking event.

UI tests must assert unread count from readAt rather than pending status, All/Unread filtering, Today/Earlier grouping at local midnight, stable newest-first order, opening invitation without accepting, detail accept/decline/current closed state, read persistence across reload, mark-read errors, account change during read mutation, and warning read row validity. Native review must cover long copy, accessibility labels, tab counts, row opening and returning to the correct filtered feed.

## Next implementation step

Build the table and transaction triggers first, prove recipient semantics against local Supabase, then wire the account-owned repository and compact feed.
