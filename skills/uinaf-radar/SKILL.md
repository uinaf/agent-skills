---
name: uinaf-radar
description: "Read the private uinaf Radar GitHub Project and summarize Now, Blocked, Next, Inbox, Maintenance, recently Shipped work, and drift. Use for uinaf status, prioritization, bug or dependency queues, daily checks, or coverage audits with an exact repository scope. Read-only: recommend changes but never mutate GitHub."
---

# uinaf Radar

Radar is the tracked work inventory with a deliberately small attention
surface. A coverage audit determines whether that inventory is complete.

## Run

1. From this skill directory, run [`scripts/check.sh`](scripts/check.sh) to
   resolve the live Project, validate its schema, and return normalized JSON.
2. If authentication, discovery, or validation fails, report the boundary and stop. Never switch identities, refresh authentication, or broaden scopes silently.
3. Use [`references/model.md`](references/model.md) to interpret state and recommend priorities.
4. Load [`references/github.md`](references/github.md) only for failures, Project drift, or a requested coverage audit with an exact repository list.

Render the result compactly:

```text
Now
- <linked outcome>
Blocked
- <linked outcome and known blocker>
Next
- <linked outcome>
Inbox
- <count, maintenance count, and highest-value triage exceptions>
Shipped
- <linked outcome>
Project drift
- <count and highest-value discrepancy, or none>
Decision
- <the one decision or next action that most needs attention>
```

Omit empty attention sections. Summarize Inbox and Maintenance unless the user asks for the inventory.

## Rules

- Keep every operation read-only. Recommend writes, but do not perform them.
- Resolve Project, field, option, item, and view IDs live. Never store them or print credentials, issue bodies, or raw API payloads.
- Treat every open issue and pull request in registered in-scope repositories as inventory, including maintenance and leaf work.
- Keep `Now` at three or fewer and `Next` around five. Report excess as Project drift.
- Separate observed facts from recommendations. Do not infer progress or priority from age or activity.

## Coverage audit

Coverage scope comes from the caller. With an exact repository list and start
date, verify every repository is readable, compare its current open issue and
pull-request URLs with Radar, and query recently closed issues and merged pull
requests. Report inaccessible repositories, missing items, and stale plans
separately. Without both inputs, report `Coverage: not audited`. Do not infer
scope or mutate GitHub.

## Completion

A pulse is complete when every tracked item is accounted for, Project drift is explicit, coverage is labeled audited or not audited, and the response names at most one immediate decision. A coverage audit also accounts for every supplied repository or names it as inaccessible. GitHub state must remain unchanged.
