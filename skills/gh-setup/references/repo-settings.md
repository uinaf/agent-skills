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

- Prefer squash merge and automatic branch deletion when the repository wants
  a linear release-driving mainline; preserve intentional alternatives.
- Block force pushes and deletion on the default branch.
- Conversation resolution is useful even when maintainers retain direct push.
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

Do not enable CodeQL default setup as a blanket baseline. Its pull-request and
scheduled behavior is not a configurable post-merge-only scan and can block
merge state even when not required. Prefer the repository's deliberate
`actionlint`, `zizmor`, secret scanning, push protection, dependency alerts,
and tested language-specific security checks. Add CodeQL only when explicitly
chosen for a repository with an accepted cost and trigger design; do not make
it a fleet-wide required context.

## Metadata and Readback

Keep description, homepage, topics, visibility, and community files aligned
with the repository's actual public surface. After each authorized change,
read back the effective rule or setting rather than trusting a successful write
response.
