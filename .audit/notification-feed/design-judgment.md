# Feed design judgment

Scores use a five point scale. These are design judgments grounded in the two candidate documents.

| Criterion                              | A   | B   |
| -------------------------------------- | --- | --- |
| Durable historical truth               | 5   | 2   |
| Recipient security and account races   | 5   | 4   |
| Minimal public API                     | 5   | 5   |
| Penpot composition and component reuse | 5   | 4   |
| Practical behavioral tests             | 5   | 4   |
| Total                                  | 25  | 19  |

Choose A. It stores recipient ownership and event snapshots at the successful mutation boundary. History survives departures, schedule changes and invitation responses. Its two method repository preserves the account authorization pattern. Its compact rows use existing product components.

A needs one mandatory correction. Backfill every provable invitation event with its original timestamp and unread state unless an actual read receipt exists. Answered and closed invitation status does not prove that a person read a notification. Never manufacture read_at from responded_at or created_at.

Graft B's explicit device local midnight, stable timestamp tie ordering and account switch tests. Keep A's transaction rollback and pending invitee capture tests. Verify trigger ordering against the actual existing trigger names and mutation order. A reschedule event must preserve its recipient list before invitations close. Retried transitions must not produce new rows.

Omit booking activity. A venue name is not a reservation. Expand warning rows to support read state compatibly. Confirmation means four players are ready. It must not claim that a court is booked.

The full initial list is proportionate for the friends beta. Do not introduce a silent finite list limit that makes the unread badge inaccurate. Future pagination should retain an authoritative unread count.

One remaining UX decision should be deliberate. Do not strand invitation actions behind a failed mark read operation. Navigation and read errors need independently observable behavior so a temporary receipt failure cannot prevent a player responding to an invitation. The implementation can show the receipt error on the feed while retaining access to the destination.
