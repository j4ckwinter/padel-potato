# Notification feed completion

The notification screen now follows the referenced Penpot composition using the local design system. Compact activity rows show durable recipient events, unread count, All/Unread tabs and Today/Earlier sections. Invitations open a dedicated detail screen with accept, decline and game navigation. Read failures allow navigation and offer retry. Booking events are excluded because the app has no booking domain.

Implementation commits are `37c1bf1` (database and read receipts) and `688d871` (feed and invitation details). The interrupted implementation was recovered into a persistent worktree, independently reviewed and checked against all 24 recovered source hashes. Review fixes cover historical invitation lookup and empty route identifiers.

## Verification

- Full `npm run verify` passed with 94 suites and 984 tests. Existing lint warnings remain. See [verify.log](verify.log).
- All five local Supabase integration scripts passed, including recipient security, transactional events, backfill and idempotent receipts. See [database.log](database.log).
- Android and iOS production exports passed the Storybook and remote push exclusion checks. See [native-exports.log](native-exports.log).
- The hosted migration was applied successfully. Readback confirmed recipient RLS, denied direct writes, authenticated-only receipt RPC and migration registration. See [hosted-readback.log](hosted-readback.log).
- Final committed source passed 22 Android native interaction steps in Expo Go on Android 36. This covered All/Unread, invitation decline, read count changing from eight to seven, retained tab selection, Earlier grouping and game navigation from the capacity warning. See [results](android-resumed-feed-results.json).
- After two notifications were opened, a force-stop and cold launch retained six unread notifications. See [cold results](android-cold-results.json) and [screenshot](android-cold-feed.png).
- Native Storybook WarningRead passed its accessible label assertion and visual review. See [story results](android-storybook-results.json) and [screenshot](android-storybook-warning-read.png).

## Coverage limits

Native iOS visual review was unavailable. The final Android review used Expo Go, whose floating Tools control appears in screenshots. Initial resumed navigation attempts hit this development overlay; their partial result files are retained as failed harness attempts, not passing feed evidence. The final feed and Storybook result files supersede those attempts. Earlier Android debug evidence is retained separately. Existing signed beta binaries predate this feature; a new release build was not requested.

## Delivery

Source is committed locally and the hosted database is ready for it. No PR, push or release publication was requested. Independent review found no remaining actionable issue. Decision history is appended to [decisions.tsv](../decisions.tsv).
