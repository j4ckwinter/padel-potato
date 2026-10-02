# Complete the friends beta

## Workflow

1. Read the Principles section of the poteto-mode skill.
2. Phase A: Frame.
3. Phase B: Design the workflow.
4. Phase C: Run the loop.
5. Phase D: Keep the audit trail.
6. Phase E: Verify and hand back.

## Exit condition

Each roadmap item has a committed implementation and passing behavior checks. Any unavailable external check has reproducible evidence and a documented blocker. Full automated verification and local database integration pass after integration. Native evidence is required before declaring native review complete.

## Delivery units

- Commit the existing verified onboarding and backend changes. Preserve unrelated edits.
- Replace demo player data with real profiles and persistent favourites.
- Connect game invitations, responses, and the in-app inbox.
- Add player departure, organiser cancellation, and safe rescheduling.
- Add email registration and recovery, persisted preferences, and local reminders.
- Configure native beta builds and CI. Exercise the complete flow on available native targets.
- Review the integrated diff and audit log. Document external blockers and remaining product choices.

## Defaults

Results remain organiser-submitted for the friends beta. Opponent confirmation, disputes, and calculated ratings are future product work rather than implied additions to this run. Reminders are local scheduled notifications. Invitations have a real in-app inbox; remote push delivery requires separate server and credential setup.

## Verification

Use focused React Native behavior tests for each slice, real local Supabase integration for database permissions and concurrency, and npm run verify for the integrated app. Keep all evidence pointers in decisions.tsv.

## Coordination

The parent owns shared service wiring, dependency files, migrations integration, the decision log, and commits. Independent writers use isolated worktrees. Reviewers have read-only scope.
