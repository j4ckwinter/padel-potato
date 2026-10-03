# Notification activity feed

## Feature steps

1. `how` over the affected subsystem.
2. `architect` for parallel design exploration.
3. Write the throughput checkpoint as four todo items.
4. Delegate code-writing to a subagent using your configured feature model with a specific scope.
5. Verify on the matching surface.
6. Rebase into small, ordered commits. Stack follow-ups.
7. If the design is contested, `interrogate` before shipping.
8. Run **Opening a PR**.

## Architect

- Ground. Current notification route maps invitations to large cards. NotificationRow already supplies compact accessible feed rows. Services own repositories per account. Supabase mutations capture JWT. Invitations lack read state/time in domain.
- Sketch. Two competing models under review, durable event feed and derived state/read receipts.
- Agree. No checkpoint requested.
- Implement. One coupled owner for SQL/domain/repository/UI/tests.
- Scrap. Only if implementation disproves sketch.

## Throughput checkpoint

- Blocking first steps. Inspect Penpot and shared components, compare event models before implementation.
- Independent workstreams. Parallel read-only design candidates, then one implementation owner and independent review.
- Shared mutable state. One writer owns coupled migration, types, services and screen; root owns native verification and audit files.
- Smallest safe decomposition. One owner prevents schema/domain/UI contract drift.

## Done

Real events, recipient security, durable read state, All/Unread tabs, Today/Earlier groups, timestamps and unread count. Invitation detail keeps accept/decline/view behavior. Existing tokens and component APIs retained. Relevant behavior tests, full verify, real local DB and Android native screen review. Document unavailable iOS review. No invented court-booking events.

## Final status

Steps 1–6 completed. Competing designs were judged and review fixes verified. No remaining contested design required interrogation. The Opening a PR workflow ended with direct diff review because no PR was requested. All authorized implementation, migration and available native checks are complete. iOS visual review remains a documented environment limitation.
