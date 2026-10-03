# Independent notification feed review

A read-only agent reviewed the restored implementation against `7c528e1`. It used the parent model. The final verdict found no remaining actionable issue.

The first review found that a historical invitation could appear in the fully paged feed but disappear from details loaded through the capped inbox query. `findIncomingById` now queries both recipient and invitation ID. A second boundary check found that an empty ID could skip the filter. The filter now applies whenever the ID is supplied. Missing route IDs return an unavailable state without a query. Regression tests cover both fixes.

The review checked recipient RLS, direct write denial, pinned read mutation authorization, atomic event creation, trigger ordering before invitation closure, original-time unread backfill, date grouping, full feed paging, unread counts, navigation errors and stale account or route completions. No booking activity is invented.

The comment review found zero deletion flags, zero mandatory restructure flags and no added suppressions. Final automated and database evidence is stored beside this file. Native review is recorded separately.
