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

Wall time is set by the slowest chain of required jobs, and small gating jobs
sit ahead of every shard. Setup cost, not test volume, bounds how far work
can parallelize.

- Fetch only what the job reads. Verification, lint, and build jobs use the
  default checkout depth. Change detection on `pull_request` events uses the
  pull-request API and needs no checkout; on `push` events it uses a shallow
  checkout and lets the filter deepen. Affected-package detection fetches a
  blobless tree and deepens to the merge base instead of full history. Full
  history (`fetch-depth: 0`) is reserved for release version analysis, signed
  writeback, and history scans.
- A job whose real work runs under about half a minute does not earn its own
  runner start, checkout, and install. Fold it into a sibling job on the same
  runner and trust level, running the tasks concurrently. Keep separate jobs
  for different runners, trust boundaries, or multi-minute work.
- Measure caches before keeping them. Record install and setup duration in
  the step summary; a dependency cache stays only when restore beats a cold
  install on the same runner for the same lockfile churn. A filtered install
  of the affected packages often wins over restoring everything.
- Shard count is bounded by per-shard setup. State the measured setup time
  before proposing shards; doubling shards doubles setup, so shards pay off
  only when setup is a small fraction of test time.
- Work that gates nothing (cache markers, coverage upload, summaries,
  notifications) runs in a job after the required check, never inside it.
- Optimizations that trade test isolation for speed (shared module state,
  reused containers, skipped teardown) are opt-in per file with explicit
  eligibility rules, and the guidance that generates tests encodes those
  rules so new tests follow them by default.
