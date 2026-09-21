# Runner Cost

Runner minutes are billed compute. Every trigger, runner size, and rerun is a
cost decision; default to the cheapest shape that still proves the contract.

- Follow the target owner's runner policy. Compare live pricing, included
  minutes, repository visibility, and runner availability before choosing a
  provider or size. Preserve each job's required OS and architecture; reusable
  workflows must support the caller's policy and platform needs.
- Use Linux for portable checks. macOS and other large runners are reserved for
  platform-bound jobs (native apps, Darwin-only APIs, Homebrew taps) and must be
  gated behind path filters or restricted to `pull_request` +
  `workflow_dispatch`. Runner changes preserve required proof, scan coverage,
  triggers, permissions, and Environments.
- Private repositories run on Blacksmith self-hosted labels
  (`blacksmith-2vcpu-ubuntu-2404`, `-arm` for arm jobs), because GitHub-hosted
  Actions do not dispatch for them under the $0 paid-usage budget. Public
  repositories stay GitHub-hosted, where minutes are free. A repository
  declaring a Blacksmith label also needs `.github/actionlint.yaml` listing it.
- Provider requirements override that default: npm trusted publishing requires
  GitHub-hosted runners, so a private repository publishing to npm keeps that
  job GitHub-hosted and accepts that it cannot run until the budget allows it.
  Use the [npm publish contract](release-targets.md#npm).
- Secret and history scans trigger on `pull_request`, a weekly `schedule`, and
  `workflow_dispatch` — never on `push`. On PRs, scan only commits introduced
  by the PR when the scanner supports a complete revision range; include secrets
  added and removed between commits. Check range semantics against the selected
  scanner version's upstream source and verify diverged branches and merges
  before narrowing it. Keep a full scan where complete range coverage is
  unproven; the [maintained shared workflow](https://github.com/uinaf/.github/blob/main/.github/workflows/scan.yml)
  records the current TruffleHog constraint. Otherwise reserve full-history
  scans for weekly/manual runs. A shallow
  checkout or missing base must not silently turn the PR scan into an empty
  success. Reuse the target owner’s shared scanning workflow when available;
  keep its reference consistent with the repository’s pinning policy. Avoid
  copying scanner jobs or building scanner images per run.
- Gate Actionlint and Zizmor jobs on changes to workflows, local actions, and
  their configuration; keep weekly/manual runs unconditional. Reuse changed-file
  detection in an already-required job instead of paying for a filter-only
  runner. Detect renames and deletions too; unknown or incomplete file lists must
  run the checks or fail visibly. Gate at job level so unrelated PRs allocate no
  linter runner. Preserve required-check names and successful skipped-job
  behavior; workflow-level path filters can leave required checks pending.
- Every verification workflow declares workflow-level concurrency:
  `group: ${{ github.workflow }}-${{ github.ref }}`,
  `cancel-in-progress: ${{ github.event_name == 'pull_request' }}`. Release,
  publish, and deploy critical sections keep their own non-cancellable keys.
- A workflow triggered on both `push: [main]` and `pull_request` pays twice per
  merged change. Keep push-to-main lanes for release/deploy work and for repos
  whose policy allows direct pushes; do not add a push trigger to re-verify a
  tree a required PR check already verified.
- Jitter cron minutes away from :00/:30; weekly is the default scan cadence.
- Expensive-per-run jobs (simulators, cross-compiles, e2e) sit behind
  `dorny/paths-filter` lanes or `workflow_dispatch`, with an `always()` result
  job when branch protection needs a stable check.
- Watch failure rates: a workflow that fails half its runs bills full minutes
  for red. Fix or gate flaky jobs instead of rerunning them.

## Critical Path

The slowest chain of required jobs sets the wait, and small gating jobs sit
ahead of every shard. Setup cost, not test volume, limits parallelism.

- Fetch only what the job reads. Verification, lint, and build jobs use the
  default checkout depth. A paths filter on `pull_request` events lists files
  through the API, so the job needs `pull-requests: read` and no checkout
  step; on `push` events the filter fetches the missing base commit by SHA
  itself, so a default-depth checkout suffices where that fetch can
  authenticate; a private repository whose checkout persists no credentials
  keeps `fetch-depth: 0` on push. The API path lists at most 3,000 changed
  files and the action does not report truncation, so a job that skips lanes
  compares the listed count with the pull request's `changed_files` and runs
  everything when they differ. `merge_group` events take the git path: keep
  a checkout and an explicit `base` there. Affected-package detection checks
  out with `filter: blob:none` and a small `fetch-depth`, then runs
  `git fetch --deepen` until the merge base resolves; `fetch-depth: 2` never
  reaches a pull request's merge base. Full history is reserved for release
  version analysis, signed writeback, and history scans.
- A job with under about half a minute of real work merges into a sibling
  job on the same runner and trust level, with the tasks run concurrently;
  a separate runner start, checkout, and install cost more than the work.
  Keep separate jobs for different runners, trust boundaries, or multi-minute
  work.
- Measure caches before keeping them. Record install and setup duration in
  the step summary; a dependency cache stays only when restore beats a cold
  install on the same runner for the same lockfile churn. GitHub-hosted
  cache restores run at roughly 30 to 90 MB/s, so cache the package-manager
  store, never `node_modules`, and expect a filtered install of the affected
  packages to beat restoring everything.
- Per-shard setup bounds sharding. Wall time cannot drop below one setup
  plus the largest shard, and every added shard bills one more setup. State
  the measured setup time and both figures before proposing shards, and cut
  setup first when it dominates.
- Work that gates nothing (cache markers, coverage upload, summaries,
  notifications) runs in a job after the required check, never inside it.
- Speedups that reduce test isolation (shared module state, reused
  containers, skipped teardown) are opt-in per file with written eligibility
  rules, and the test-writing guidance carries those rules so new tests
  comply by default.

## Merge Queue

- Batch entries and bisect failures; batching relaxes per-commit correctness,
  so enable it only where a broken intermediate commit is acceptable.
- Size batches from arrival rate, with a minimum and maximum, not a constant.
- Tier the checks: lint, type check, and affected unit tests before the queue;
  deterministic integration in the queue; end-to-end and performance after
  merge with a fast revert path.
- Quarantine flaky tests instead of retrying entries; cascade rate follows
  flake rate. Give automated authors a retry budget of two queue entries.
- Queue-required workflows never use workflow-level `paths` filters; skip
  inside the job so the required check still reports on the queue branch.
