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
- Provider requirements still apply to private repositories: npm trusted
  publishing requires GitHub-hosted runners; use the [npm publish
  contract](release-targets.md#npm).
- Secret and history scans trigger on `pull_request`, a weekly `schedule`, and
  `workflow_dispatch` — never on `push`. The merge commit's tree was already
  scanned in the pull request; the weekly cron covers history and new detector
  rules. Reuse the target owner’s shared scanning workflow when available;
  keep its reference consistent with the repository’s pinning policy. Avoid
  copying scanner jobs or building scanner images per run.
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

