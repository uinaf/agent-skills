# Runner Cost

Runner minutes are billed compute except on standard GitHub-hosted runners
for public repositories, where only latency and the concurrent-job cap cost
([billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions)).
Every trigger, runner size, and rerun is a cost or latency decision; default to
the cheapest shape that still proves the contract.

- Follow the target owner's runner policy. Compare live pricing, included
  minutes, repository visibility, and runner availability before choosing a
  provider or size. Preserve each job's required OS and architecture; reusable
  workflows must support the caller's policy and platform needs.
- Use Linux for portable checks. macOS and other large runners are reserved for
  platform-bound jobs (native apps, Darwin-only APIs, Homebrew taps) and are
  gated at job level or restricted to `pull_request` + `workflow_dispatch`;
  macOS bills about ten times Linux on GitHub-hosted runners and twenty
  2-vCPU minutes per minute on Blacksmith, whose smallest macOS size is 6 vCPU
  ([rates](https://docs.github.com/en/billing/concepts/product-billing/github-actions),
  [Blacksmith](https://docs.blacksmith.sh/blacksmith-runners/overview)). Runner changes preserve required proof, scan coverage,
  triggers, permissions, and Environments.
- Public repositories stay on standard GitHub-hosted runners, where minutes are
  free. Private repositories draw on the owner's included minutes, and GitHub
  refuses to dispatch their GitHub-hosted jobs once that quota is spent or a
  payment fails
  ([billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions));
  the owner's runner policy says whether they move to a third-party runner. A
  repository declaring a non-GitHub runner label lists it under
  `self-hosted-runner.labels` in `.github/actionlint.yaml`
  ([actionlint](https://github.com/rhysd/actionlint/blob/main/docs/config.md)).
- Provider requirements override that policy: npm trusted publishing supports
  cloud-hosted runners only
  ([npm](https://docs.npmjs.com/trusted-publishers)), so a repository on
  third-party runners keeps that job GitHub-hosted. Use the
  [npm publish contract](release-targets.md#npm).
- Secret and history scans trigger on `pull_request`, a weekly `schedule`, and
  `workflow_dispatch`, never on `push`, which would repeat the pull-request run. On PRs, scan only commits introduced
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
- Jitter cron minutes away from the top of the hour, where GitHub drops queued
  scheduled jobs under load
  ([schedule](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows));
  weekly is the default scan cadence.
- Expensive-per-run jobs (simulators, cross-compiles, e2e) sit behind
  `dorny/paths-filter` lanes or `workflow_dispatch`, with an `always()` result
  job that fails on any result other than success or an expected skip when
  branch protection needs a stable check.
- Watch failure rates: a failed run bills its full minutes and a rerun bills
  them again
  ([billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions)).
  Fix or gate flaky jobs instead of rerunning them.

## Critical Path

The slowest chain of required jobs sets the wait. Where a change-detection
job gates other jobs, its duration is paid on every run
([Linear](https://linear.app/blog/ci-bottleneck-reworked), gate 94s to 20s).
In a small repository the verify job is the whole chain, and runner start,
checkout, and toolchain install are most of it; measure that share before
choosing a technique below.

- Fetch only what the job reads. Verification, lint, and build jobs keep the
  default depth of one
  ([actions/checkout](https://github.com/actions/checkout/blob/main/README.md));
  full history is for release version analysis, signed writeback, and history
  scans. The saving is proportional to history size, so on a small repository
  it is seconds.
- A paths filter on `pull_request` events lists files through the API, so the
  job needs `pull-requests: read` and no checkout step; on `push` events it
  fetches the base commit by SHA into a default-depth checkout, and on
  `merge_group` events it needs a checkout and reads the event SHAs
  ([paths-filter](https://github.com/dorny/paths-filter/blob/ceb8a2b8f2d89434be7ff52d3de7ec3738c5cc9d/README.md)).
  That fetch runs without credentials when the checkout persists none, so a
  private repository in that state keeps `fetch-depth: 0` on every non-PR
  event. The [uinaf changes action](https://github.com/uinaf/.github/blob/main/.github/actions/changes/action.yml)
  packages these rules behind a `full-history` input. The API
  returns at most 3,000 files and the action reports no truncation
  ([REST](https://docs.github.com/en/rest/pulls/pulls?apiVersion=2022-11-28)),
  so a job that skips lanes adds a catch-all `'**'` filter, compares its
  count with the pull request's `changed_files`, and runs everything when
  they differ.
- In a monorepo, affected-package detection checks out with
  `filter: blob:none` and a small `fetch-depth`, then deepens until the merge
  base resolves; a clone that is too shallow marks every package changed
  ([Turborepo](https://turborepo.dev/docs/reference/run)), and `fetch-depth: 2`
  is not enough in the general case.
- A job whose work is shorter than the measured runner start, checkout, and
  install on its runner shape is a candidate to merge into a sibling job on
  the same runner and trust level, with the tasks run concurrently. The
  overhead is real but unpublished by GitHub; measure it per runner shape
  ([Depot](https://depot.dev/blog/reducing-queue-time-with-cached-schemas),
  runner init p99 39s). Concurrent tasks share one runner's cores and memory,
  so compare the batched job with the parallel jobs before keeping it, and
  say whether latency or runner minutes is the target. Keep separate jobs for
  different runners, trust boundaries, or multi-minute work.
- Measure caches before keeping them. Record hit or miss, restore, install,
  and save seconds in the step summary; a dependency cache stays only when its
  expected cost from those numbers beats always installing cold. Published
  numbers conflict by an order of magnitude
  ([BuildPulse](https://buildpulse.io/blog/github-actions-cache-optimization-benchmarks),
  [Linear](https://linear.app/blog/ci-bottleneck-reworked)). Try the
  package-manager store cache first; pnpm itself says it is not guaranteed
  faster ([pnpm](https://pnpm.io/continuous-integration)). Keep a
  `node_modules` cache only where the arithmetic favours it. In a monorepo,
  measure a filtered install of the affected packages against restoring
  everything.
- When sharding, wall time cannot drop below one setup plus the largest
  shard, and every added shard bills one more setup; Vitest and Playwright
  split by file or test count, never by duration
  ([Vitest](https://vitest.dev/guide/cli.html),
  [Playwright](https://playwright.dev/docs/test-sharding)). State the measured
  setup time and both figures before proposing shards, and cut setup first
  when it dominates.
- Work that gates nothing (cache markers, coverage upload, summaries,
  notifications) moves to a job after the required check when latency is the
  target; the second job pays another runner start
  ([GitHub](https://github.blog/engineering/infrastructure/making-github-ci-workflow-3x-faster/),
  deferred compliance).
- Speedups that reduce test isolation (shared module state, reused containers,
  skipped teardown) are opt-in per project or file with written eligibility
  rules ([Vitest isolate](https://vitest.dev/config/isolate.md)), and the
  test-writing guidance carries those rules so new tests comply by default.

Read [merge queue](merge-queue.md) only when the repository runs one.
