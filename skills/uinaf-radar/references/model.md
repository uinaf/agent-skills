# Radar model

Radar is the tracked inventory with a deliberately small attention surface.
Coverage reconciliation determines whether every in-scope open item is present.

## Work hierarchy

- **Goal:** a direction or desired change, not necessarily a tracker item.
- **Project:** a durable, multi-session outcome represented by one owning GitHub Issue and shown in Radar.
- **Issue:** a delivery slice when the project needs independently resumable or shippable work.
- **Pull request:** delivery evidence linked to the owning issue; never a substitute for outcome state.

Track the project-level owning issue and its delivery work. Only one canonical item per outcome may occupy `Next`, `Now`, or `Blocked`; keep its child issues and pull requests in Inbox unless they are standalone outcomes. Native issue hierarchy remains canonical.

## Status

- **Inbox:** known open work not yet committed to attention. Inbox is visibility, not a promise.
- **Next:** worth doing soon, but not currently consuming attention. Keep it around five outcomes; move excess back to Inbox rather than growing a permanent priority queue.
- **Now:** actively moving. Keep at most three; prefer one primary human focus and at most two genuinely asynchronous outcomes.
- **Blocked:** waiting on a real external decision, dependency, credential, or capability. Ordinary unfinished work is not blocked.
- **Done:** shipped and verified against the owning issue's completion contract.

Moving an issue between statuses is a write. This skill may recommend a change but must not perform it.

## Coverage and attention

Every open issue and pull request from registered in-scope repositories belongs in Radar. Nothing open is omitted merely because it is a dependency bump, bug, incident, leaf issue, or one-session fix.

The Project's Done items preserve durable completed outcomes. Recently shipped evidence comes from bounded closed-issue and merged-pull-request queries over the consumer-supplied repositories; do not copy every delivery artifact into the Project merely to count it.

Move an Inbox item into Next, Now, or Blocked only when at least one is true:

- work will span sessions and needs a reliable resume point;
- multiple independently shippable slices contribute to one result;
- another agent or system can advance it asynchronously;
- losing awareness of the outcome would create meaningful operational or product risk.

Dependency updates, isolated bugs, review queues, incidents, and other KTLO remain visible in Inbox and the Maintenance view. Their repository labels, author, hierarchy, and pull-request state provide classification; do not invent a second taxonomy unless live evidence shows it is required.

## Reconciliation

Treat the owning GitHub Issue as canonical truth. Radar is only the cross-repository view. During a broad audit:

1. Require an exact repository list and start date from the consumer; do not infer either.
2. Verify every supplied repository is readable and report any that are not.
3. Compare every current open issue and pull-request URL with tracked Radar URLs.
4. Classify missing open work as coverage drift, regardless of size or type.
5. Query closed issues and merged pull requests since the supplied date.
6. Inspect recent activity, but do not equate recency with priority.
7. Flag stale plans whose outcome already shipped, was superseded, or needs an owning issue.
8. Recommend only a small set for attention; the remainder stays visible in Inbox.
