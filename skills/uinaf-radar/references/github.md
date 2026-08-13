# GitHub read contract

Use the installed `gh` CLI and the active authenticated identity. Never store live node IDs, issue titles, repository inventories, or query results in this public package.

## Canonical check

Run:

```bash
./scripts/check.sh
```

The script performs only read operations:

- verifies the active identity can call GitHub;
- resolves exactly one organization Project owned by `uinaf` and titled `radar`;
- discovers live Project, view, field, option, and item IDs on every run;
- validates the private flag, five Status options, four views, and attention caps;
- returns normalized item metadata without issue bodies or raw API payloads.

Treat a missing `project` scope, inaccessible private Project, zero or ambiguous title match, or schema mismatch as an explicit boundary. Do not switch accounts, refresh credentials, or edit the Project to make the check pass.

## Consumer-supplied coverage

Only when the consumer supplies an exact repository list and start date, first verify that every repository is readable:

```bash
gh repo view OWNER/REPO --json nameWithOwner,url
```

Record failures as inaccessible; do not treat them as repositories with no work. Then query each readable repository with commands such as:

```bash
gh search issues --repo OWNER/REPO --state open --limit 1000 \
  --json repository,number,title,updatedAt,url,labels,isPullRequest

gh search prs --repo OWNER/REPO --state open --limit 1000 \
  --json repository,number,title,updatedAt,url,isDraft
```

Compare every open canonical URL against the normalized Radar output and report missing items. Read bodies and relationships before recommending attention changes. Follow [`model.md`](model.md). Without an exact repository list, report `Coverage: not audited`; this package does not infer consumer scope.

For recently shipped evidence, use the supplied start date against each readable repository instead of backfilling closed artifacts into the Project:

```bash
gh search issues --repo OWNER/REPO --state closed --closed ">=START_DATE" --limit 1000 \
  --json repository,number,title,closedAt,url

gh search prs --repo OWNER/REPO --merged --merged-at ">=START_DATE" --limit 1000 \
  --json repository,number,title,closedAt,url
```

Summarize shipped outcomes and maintenance volume without dumping every artifact unless requested. Treat these results as bounded by the supplied date, not complete history.

Do not use `gh project item-add`, `item-edit`, `item-delete`, Project mutations, issue mutations, or comments in the read-only workflow.
