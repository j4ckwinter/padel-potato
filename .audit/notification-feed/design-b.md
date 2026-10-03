# Candidate B. Derived feed with durable read receipts.

## Ground.

`src/app/notifications.tsx` lists incoming invitations and responds inline. `invitationRepository.ts` sorts database rows by created_at but discards both created_at and responded_at in its domain projection. `games` has created_at, updated_at, completed_at and cancelled_at. `game_participants` has joined_at but leave physically deletes participation. Reschedule overwrites starts_at and duration and closes pending invitations. No court booking model exists.

## Usage sketch.

The screen receives `services.notifications`. It calls `list()` on focus and foreground. Rows already contain event identity, date, read state and navigation target. Selecting a row calls `markRead(id)` and opens either the existing invitation detail flow or game detail. Screen filters All and Unread, groups by the device-local calendar date, and passes presentation props into NotificationRow. Header count is derived from the complete loaded snapshot rather than pending invitation state.

## Data shape and interface.

```ts
type DerivedNotification = Readonly<{
  id: string;
  occurredAt: string;
  readAt: string | null;
  gameId: string;
}> &
  (
    | Readonly<{ kind: 'invitation'; invitationId: string; actorName: string }>
    | Readonly<{ kind: 'playerJoined'; playerId: string; actorName: string }>
    | Readonly<{ kind: 'resultRecorded' }>
    | Readonly<{ kind: 'gameCancelled' }>
  );
type NotificationRepository = Readonly<{
  list: () => Promise<readonly DerivedNotification[]>;
  markRead: (notificationId: string) => Promise<void>;
}>;
```

Read receipts use `(recipient_id, notification_key)` as primary key. Keys are `invitation:{uuid}`, `join:{gameId}:{playerId}:{joinedAt}`, `result:{gameId}:{completedAt}`, and `cancel:{gameId}:{cancelledAt}`. Server-side list RPC builds candidates from authoritative source tables, joins recipient-owned receipts, and sorts timestamp then key. Do not scatter reconstruction in the screen or expose database rows.

## Recipient and security policy.

Invitation event belongs to the invitee. Joined events are visible to the organiser and currently joined members, excluding the joining actor. Result and cancel events belong to currently joined members, excluding the mutation actor only when that actor is recorded reliably. RLS restricts receipt reads to auth.uid(). markRead validates the supplied key against the same derived source query and inserts a receipt idempotently. An arbitrary client insert policy would allow fake receipt keys and storage flooding. Pin mutation authorization with existing accountAuthorization before RPC. UI request generation guards prevent cross-account stale lists and writes.

## Fidelity limits.

A current-state projection cannot reconstruct a historical feed reliably. Deleted participation erases joined notifications. A later join can expose old events to a member who was absent when they happened. `games.updated_at` is overwritten by all updates and cannot distinguish reschedule from lifecycle changes. Accepted invitations can give an organiser response event using responded_at, but generic direct joins need retained joined_at rows. Full-game confirmation can be inferred from four current participants only; the actual full transition timestamp and recipient set are not stored. An organiser can see a full event disappear after someone leaves, along with its stable meaning. Warnings about remaining places are current-state hints rather than dated activity. Never convert arbitrary updated_at to a booking update. There is no booking record to prove court confirmation.

## Tests.

Test read receipts across cold reload, two accounts and repeated markRead. Test old requests finishing after an account switch. Test local midnight grouping with UTC-crossing timestamps and newest-first stable ties. Test All/Unread filtering independently of invitation status. Test accepting a previously read invitation does not increase unread count. Demonstrate the candidate's historical loss by joining, reading, leaving and listing again. Demonstrate that two reschedules cannot both survive reconstruction.

## Red flag screen.

One repository concentrates projection and receipt policy. No public load/parse/save stages and no transport reexports are needed. However, historical ownership leaks into ad hoc reconstruction rules. Adding more event types makes the projection increasingly shallow because callers still need to know which histories disappear and why. Resolving this with client snapshots would duplicate source truth across devices and introduce unreliable delivery ownership.

## Synthesis recommendation.

Reject candidate B for the requested complete notifications experience. Its small schema is attractive for an invitation-only inbox, but it loses the history that Today/Earlier promises. Choose a recipient-scoped durable trigger-populated event feed. Retain read state on the notification row, not a separate receipt table, unless multiple recipients intentionally share one event row. Write events within the same SQL transaction as their source mutation. Store stable source IDs and occurred_at, plus minimal event snapshots needed to preserve historical copy. Enforce recipient read/update policy and server-owned event creation. Backfill only facts whose original timestamp and recipient can be proven. Future real events are preferable to fabricated full-board examples. Omit booking events until booking exists. The existing NotificationRow currently supports warning only unread; adding durable warning events requires an intentional compatible extension to support warning/read or a decision to render capacity activity as game type.
