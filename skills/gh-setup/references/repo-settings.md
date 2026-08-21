# Repository Settings

Use when the task changes live GitHub repository policy. Read effective state
through the API or UI; checked-in files do not prove settings.

## Inspect First

Read default branch, merge methods, protections and rulesets, required checks,
merge queue, conversation resolution, signed-commit and tag rules, allowed
writers, Actions policy, Environments, visibility, security features, and
repository metadata. Preserve current policy unless the request owns it.

Before requiring pull requests or checks, inventory every default-branch
writer: maintainers, release and dependency bots, generated-data jobs, deploy
writebacks, and GitHub Apps. Each must move through a PR or have an explicit,
scoped compatible path.

## Collaboration Policy

- Pull requests are a review mechanism, not a default prerequisite. When direct
  updates are authorized, keep the local gate and default-branch CI aligned and
  allow verified fast-forward pushes.
- Post-push CI detects a broken commit after the branch moves. Run the local
  gate before a direct push and monitor CI; require pre-merge checks when the
  default branch cannot tolerate that detection window.
- Prefer squash merge and automatic branch deletion when the repository wants
  a linear release-driving mainline; preserve intentional alternatives.
- Block force pushes and deletion on the default branch.
- Require conversation resolution only where pull requests are already the
  delivery path; do not use it merely to force pull-request creation.
- Require signed commits when every protected-branch writer can satisfy the
  rule. An unavailable or plan-gated API is an unconfirmed gap, not evidence
  that no rule exists.
- Merge queue requires required workflows to handle `merge_group`.
- Protect release tag families. Document intentional mutable pointers such as
  a marketplace major tag separately from immutable release tags.

Running a check does not enforce it. Require the smallest stable voting surface
that represents the repository's real gate. When matrices, conditional lanes,
or no-op paths make raw job names unstable, use one final `always()` gate that
fails closed on unexpected skips. Keep advisory dependency, release, deploy,
and report jobs non-blocking unless policy explicitly makes them voting.

Use non-strict required checks by default. Require up-to-date branches or merge
queue only when integration risk justifies the extra executions. Roll fleet
policy out to a small verified cohort before enabling an organization-wide
required context.

## Actions and Environments

- Default Actions permissions to read-only; widen per job.
- Allow only intended remote and local Actions. Require full-SHA pins when the
  repository has an updater path for them.
- Fork pull requests remain read-only and receive no delivery secrets.
- Use `release` for publish credentials and environment-specific names for
  running services. Keep deployment records enabled for service deploys.
- Environment branch policy constrains the workflow run ref, not an arbitrary
  ref checked out later by a manual workflow.

## Security Surfaces

Public repositories whose `SECURITY.md` routes reporters to GitHub private
vulnerability reporting must have that setting enabled and read back. Private
repositories do not expose the same public reporting surface; route them to an
existing private maintainer channel.

For an organization that wants useful free defaults without per-active-committer
Advanced Security charges, suggest one enforced organization security
configuration with this baseline:

- apply it to all current repositories and make it the default for all new
  repositories;
- do not allow repository owners to modify the configured features;
- disable the paid **Secret Protection** bundle;
- disable the paid **Code Security** bundle and legacy blanket
  `advanced_security` enablement;
- disable CodeQL default setup;
- enable the dependency graph, Dependabot alerts, and Dependabot security
  updates.

This is a billing-safe baseline, not a claim that every overlapping public-repo
security feature is off. GitHub may provide some secret scanning or other
security capabilities for public repositories without consuming a paid
license. Read back both the effective repository settings and Advanced Security
license usage instead of inferring them from the configuration label.

Treat repository visibility changes as billing-sensitive:

- Before and after a public-to-private transition, read back the attached
  security configuration, effective paid features, active-committer license
  usage, and projected billing.
- A feature that was free for a public repository can become billable when
  that repository becomes private.
- If a repository genuinely needs Secret Protection, Code Security, or CodeQL,
  use a separate narrow configuration or explicit repository opt-in with
  accepted cost, owner, and trigger design; do not weaken the organization
  baseline for the whole fleet.

Do not enable CodeQL default setup as a blanket baseline:

- Its pull-request and scheduled behavior is not a configurable
  post-merge-only scan and can block merge state even when not required.
- Prefer the repository's deliberate `actionlint`, `zizmor`, secret scanning,
  push protection, dependency alerts, and tested language-specific security
  checks.
- Add CodeQL only when explicitly chosen for a repository with an accepted
  cost and trigger design; do not make it a fleet-wide required context.

## Metadata and Readback

Keep description, homepage, topics, visibility, and community files aligned
with the repository's actual public surface. After each authorized change,
read back the effective rule or setting rather than trusting a successful write
response.
