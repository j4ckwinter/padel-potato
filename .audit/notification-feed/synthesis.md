# Notification feed design choice

Candidate A is the base. The independent same-model judge chose its durable recipient feed over reconstructing history from current state. The parent agrees. Event snapshots and read receipts share one recipient-owned row. Two repository methods hide persistence and ownership.

Candidate B contributes local-midnight grouping, deterministic ordering and account-switch checks. Its derived feed is rejected because departures delete participation history and reschedules overwrite timestamps.

The invitation backfill uses original event timestamps and unread state. Answered or closed invitations do not prove a read receipt. This supersedes the read backfill suggestion in candidate A. A failed receipt must not prevent opening invitation details.

Court-booking events wait for a real booking model. Confirmation means four players are ready. Warning/read is an additive component configuration. Existing component styles and supported configurations remain valid.
