# Repository Settings

Use this reference when the task touches GitHub repository settings, merge policy, branch protections, rulesets, tag policy, Actions permissions, repository metadata, or Environments.

## Inspect First

Check the live repo before making severity calls or writing instructions:

- default branch
- enabled merge methods
- branch protections and repository rulesets
- required checks and merge queue
- required conversation resolution
- signed commit requirements
- allowed push actors
- protected tag rules
- Actions permissions and allowed actions policy
- GitHub Environments, reviewers, branch/tag restrictions, secrets, and vars
- repository description, homepage, topics, and visibility

Prefer `gh` or the GitHub UI/API for live settings. Checked-in workflow files are evidence, not proof of repo settings.

## Private Vulnerability Reporting

For public repositories that ship a private-first `SECURITY.md`:

- Enable GitHub private vulnerability reporting so the Security tab reporting
  route works.
- Verify with `GET /repos/{owner}/{repo}/private-vulnerability-reporting`
  (`enabled: true`) and enable with
  `PUT /repos/{owner}/{repo}/private-vulnerability-reporting`.
- Treat a missing or disabled setting as a settings gap when `SECURITY.md`
  points reporters at that route.
- Skip upstream forks and other repos that intentionally do not accept
  vulnerability reports here.

Private repositories do not expose that reporting surface. Do not enable or
document PVR there; use a private-maintainer-channel `SECURITY.md` instead
(see [templates](templates.md)).

## Merge Policy

Default posture:

- Enable squash merge for repos that value a clean mainline.
- Enable delete-branch-on-merge so merged PR branches are cleaned up automatically.
- Disable merge commits and rebase merge unless the repo intentionally supports them.
- Preserve existing merge policy when a repo has a documented reason.
- Keep PR title conventions aligned with the repo's release tooling when squash commits become release commits.

Squash-only is compatible with stacked PRs; expect a restack after each
bottom PR lands because squash rewrites those commits on the trunk.

Do not change merge methods just to satisfy taste. Tie the change to release notes, review ergonomics, auditability, or maintainer policy.

## Branch And Ruleset Policy

Preserve existing protections unless the user asks for a policy change.

Baseline checks:

- `main` should block force pushes and branch deletion.
- Required status checks should match the repo's real verify workflow.
- Required conversation resolution is useful even when direct pushes to `main` remain allowed.
- Require signed commits on protected/default branches unless release, deploy,
  or merge automation has a documented incompatible path.
- Merge queue requires workflows to include `merge_group` for required checks.
- Release bump commits need an actor that branch rules allow. Prefer a narrowly
  scoped GitHub App token with GraphQL `createCommitOnBranch`, which creates a
  GitHub-signed commit without storing a signing key. Use a bypass only when a
  documented writeback path cannot produce verified commits.
- If a ruleset requires pull requests on `main`, automated push-back release jobs will fail unless the actor is exempted or the release tool opens PRs.

Branch protection with only conversation resolution is often a better fit than a full PR-required ruleset when maintainers intentionally keep direct pushes available.

### Signed Commits

Prefer signed-commit enforcement on protected/default branches. Use an
organization ruleset for repo families when available; otherwise use repo-level
rulesets or branch protection. Before enabling it, check release bump commits,
deploy writebacks, merge automation, bot actors, and direct-push flows. Every
protected-branch writer must sign commits or move to pull requests.

If enforcement is unavailable because of visibility, plan, or permissions,
record a settings gap or blocker. Public repos can usually use signed-commit
protection on GitHub's free surface; private/internal repos and organization
rulesets may be plan-gated. Treat ruleset `403` responses such as `Upgrade to
GitHub Pro or make this repository public to enable this feature` as unconfirmed
policy state, not proof that no ruleset exists.

## Tag Policy

Protect release tags when releases or deploys depend on tags.

- Restrict `v*` tag creation and mutation to trusted release automation or release admins.
- Treat marketplace major tags such as `v1` as mutable release pointers and document that explicitly.
- Do not let manual workflows publish from arbitrary tags unless the tag pattern and actor are trusted.

## Actions Policy

Use least privilege at both repository and workflow levels:

- Actions should not have broad write permissions by default.
- Secret-bearing jobs grant scopes per job.
- Allowed actions policy should permit known pinned actions and repo-owned local actions.
- Fork PRs should run read-only checks with no release or deploy secrets.
- When the plan supports it, enable repository Actions SHA pinning
  (`sha_pinning_required` via
  `PUT /repos/{owner}/{repo}/actions/permissions`) so third-party `uses:`
  lines must be full commit SHAs. Pair this with Dependabot
  `github-actions` updates so pins do not rot. Inspect current state with
  `GET /repos/{owner}/{repo}/actions/permissions` and read
  `sha_pinning_required`.

## Environments

Use GitHub Environments as secret and policy boundaries:

- `release` for package/library/CLI/marketplace publishing secrets.
- `staging`, `production`, or provider-specific environment names for running app deploys.
- Publish-only release jobs may use an approval-free `release` Environment for secret scoping, but GitHub will create deployment records for jobs that declare an Environment. There is no supported `deployment: false` workflow key.
- Running-service deploy jobs should keep deployment records enabled.
- Reviewer-gated Environments are for human-approved production promotion, signing, store submission, or other intentional manual gates.

Environment branch/tag policies constrain the workflow run ref. They do not prove a later manually checked-out ref is safe.
