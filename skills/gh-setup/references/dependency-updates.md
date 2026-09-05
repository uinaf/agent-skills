# Dependency Updates

Choose one update bot per repository. Running both opens duplicate pull
requests. Dependabot security alerts and security updates are a separate
GitHub feature and stay on under either choice.

## Choose

| Signal | Choice |
| --- | --- |
| Only npm, Go, Cargo, or GitHub Actions manifests | Dependabot is sufficient; Renovate is equivalent |
| Pins in `mise.toml`, OpenTofu or Terraform providers, or annotated version variables | Renovate; Dependabot has no manager for these |
| Container images pinned by digest | Either; both update tag and digest together |
| Organization already runs one bot on most repositories | Match it; one mental model beats a marginal feature |
| Fork or mirror with no owned manifests | Neither |

The hosted Mend Renovate app is free for private repositories on the
Community plan. Its `IAC`, `SAST`, and `SCA` columns are separate paid Mend
scanners, unrelated to dependency updates. Verify the current plan on the
[Mend-hosted overview](https://docs.renovatebot.com/mend-hosted/overview/)
before relying on any limit.

Neither bot rewrites a sha256 checksum stored beside a version. Ansible and
script pins with checksums stay manual, or let the target fetch the upstream
`.sha256` file at install time so only the version needs bumping.

## Renovate

- Extend one organization preset (`github>uinaf/renovate-config`) and keep
  repository files to opt-outs and approvals. Encode schedule, release age,
  grouping, commit prefixes, and registry overrides once. The preset
  repository must be public: the hosted app reads public repositories with
  a token that cannot see private presets, and the failure is a
  "Cannot find preset's package" issue on every public consumer.
- Automerge with Renovate's own `automerge` and `platformAutomerge: false`.
  Renovate then waits for every visible check and skips repositories with
  no checks. GitHub platform automerge merges immediately unless branch
  rules require status checks, which most single-owner repositories lack.
  Keep majors on `dependencyDashboardApproval`.
- Structure checks that require `.github/dependabot.yml` (for example a
  workspace-kit `workspace.json` required-files list) must require
  `renovate.json` instead, or the migration commit fails its own hook.
- Keep **Require config file** on in the Mend organization settings so
  unmigrated repositories receive nothing while they still run Dependabot.
  Turn **Create onboarding PRs** off when migrating by commit.
- Migrate a repository in one commit: add `renovate.json`, delete
  `.github/dependabot.yml`, update any documentation that names Dependabot.
  Renovate skips onboarding when a config already exists on the default
  branch.
- OpenTofu repositories set `registryUrls` to `https://registry.opentofu.org`
  for the `terraform-provider` and `terraform-module` datasources and disable
  the `hashicorp/terraform` dependency, which otherwise tracks Terraform
  releases for `required_version`.
- Use `dependencyDashboardApproval` for majors that need a planned migration
  instead of `enabled: false`; the update stays visible on the dashboard.
- Validate with `npx --yes --package renovate -- renovate-config-validator`
  before pushing. The validator checks option names only; it does not
  resolve preset names. A misspelled preset such as `:pinDigests` instead
  of `docker:pinDigests` passes locally, then opens an "Action Required"
  issue and blocks all pull requests until fixed.

## Dependabot

- Configure only ecosystems and manifests that exist.
- Use monthly or weekly schedules with a cooldown, group patch and minor
  updates, and separate majors.
- Prefix commits per ecosystem (`ci` for Actions, `deps` otherwise) so
  release tooling classifies them.
- Preserve compatibility constraints with `ignore` rules rather than closing
  pull requests repeatedly.

## Readback

After the first run, confirm the bot opened pull requests with the expected
prefix, grouping, and registry, and that the retired bot opened none. For
Renovate, the hosted job log on the Mend developer portal shows why a
repository produced nothing.
