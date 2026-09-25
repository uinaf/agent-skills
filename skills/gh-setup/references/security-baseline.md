# CI and Security Baseline

The cheapest setup that still catches leaked secrets, unsafe workflows, and
vulnerable dependencies, for owners whose agents push directly to default
branches. Every job, trigger, or schedule added beyond it names its threat and
its weekly minute cost.

## Detection

- Public repositories: GitHub secret scanning and push protection on. Both are
  free and block provider-pattern secrets on command-line, web, and API pushes;
  a bypass emails the owner
  ([push protection](https://docs.github.com/en/code-security/secret-scanning/introduction/about-push-protection)).
- Private repositories: Gitleaks on the pushed range. Paid Secret Protection
  is sold per active committer on Team and Enterprise plans only
  ([Advanced Security](https://docs.github.com/en/get-started/learning-about-github/about-github-advanced-security)).
  Run the MIT Gitleaks CLI; `gitleaks-action` needs a license for
  organization repositories.
- Actionlint and Zizmor only when a push changes `.github/`, action metadata,
  or their configuration.
- Renovate plus Dependabot alerts (free on every repository); Dependabot
  security updates off. No CodeQL, dependency review, or Scorecard workflow
  unless the repository is public and its owner accepts the trigger cost.
- SHA pinning required in the Actions policy for the organization or
  repository.

## Shape

- One job per repository: `verify`, on push to the default branch, pull
  requests, and `workflow_dispatch`. A repository with nothing to verify runs
  it on push and dispatch only.
- The scan is the last step of `verify`
  ([uinaf/.github `actions/scan`](https://github.com/uinaf/.github#scan)): a
  no-op on pull requests, the pushed range on push, full history on dispatch.
  It adds seconds to a job that is already billed; GitHub rounds each job up
  to a whole minute
  ([rates](https://docs.github.com/en/billing/reference/actions-runner-pricing)).
- No separate scan workflow, no pull-request scans, no scheduled scans.
  Merges land as pushes, and new advisories arrive as Dependabot alerts and
  Renovate pull requests. Dispatch a full-history scan after a scanner-rule
  upgrade.
- A finding fails the pushed commit's `verify` run; GitHub's failed-run email
  is the notification. No local git hooks, no extra channels.

## Rules

- Require only `verify`, and only where pull requests merge without a human,
  such as Renovate platform automerge, which merges failing pull requests when
  no check is required ([Renovate](https://docs.renovatebot.com/configuration-options/#automerge)).
  Administrators keep an always-bypass so direct pushes never wait.
- Never require a check from a path-filtered workflow: a skipped workflow
  leaves the check pending, while a job skipped by `if:` reports success
  ([required checks](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/troubleshooting-required-status-checks)).
- Keep deletion, force-push, and signed-commit protections separate from
  checks.
- Before renaming or removing a required check, update the ruleset and confirm
  no open pull request waits on the old name.
