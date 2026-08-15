---
name: gh-setup
description: "Set up or align a repository's GitHub collaboration and delivery surface: repo settings, branch or ruleset policy, templates, Dependabot, Actions hardening, Environments, releases, publishing, and deploy workflows. Use for GitHub setup, CI/CD policy, protected delivery, package releases, or app deployment. Do not use for product architecture, provider infrastructure internals, application security review, or repository boot/readiness work."
disable-model-invocation: true
---

# GitHub Setup

Make GitHub the enforceable shell around the repository's existing build,
verification, release, and deployment contracts.

## Inspect and Classify

Before changing files or live settings:

1. Read repository guidance, manifests, verification commands, release or deploy
   scripts, `.github/`, contributor/security docs, and any repository-owned
   delivery runbook.
2. Read live GitHub state: default branch, merge methods, effective branch
   rules, Actions policy, Environments, protected tags, security settings, and
   every human or automated default-branch writer affected by the change.
3. Record the relevant before-state and rollback path.
4. Classify the delivery shape:
   - **Versioned artifact:** read [release workflows](references/release-workflows.md)
     and only the matching section of [publish targets](references/release-targets.md).
   - **Running app or service:** read [deploy workflows](references/deploy-workflows.md),
     then [Environments](references/deploy-environments.md) or
     [credentials](references/deploy-secrets.md) when those boundaries change.
   - **Both:** publish one immutable payload, then deploy that payload instead
     of rebuilding it.

Use repo-local commands as authority. If the repository cannot reproducibly
build, verify, package, observe, or roll back the claimed surface, report that
prerequisite instead of hiding it in workflow YAML.

## Shared Contract

- Pull requests execute untrusted code with read-only credentials.
- Trusted release and deploy jobs load credentials only after verification and
  input or ref validation.
- Workflow permissions default to read-only or `{}` and widen per job.
- High-trust remote Actions use reviewed immutable pins with an update path.
- Environment secrets and policy match the release or deployment blast radius.
- Release, publish, signing, promotion, and deploy critical sections are
  non-cancellable and reconcilable.
- One verified payload crosses build, test, publish, and deploy boundaries.
- Required checks use a stable final result when matrices, conditional lanes,
  or no-op paths make individual jobs unstable.
- A green workflow is not completion until live settings and downstream state
  are read back.

Read [Actions security](references/actions-security.md) before workflows execute
project code, load secrets, publish, sign, or deploy.

When implementing rather than only auditing, read [maintained
implementations](references/implementations.md) and start from the closest
tested shape. Reuse its contract, not its literal versions, identities, or
provider details.

## Repository Policy

Read [repository settings](references/repo-settings.md) for merge methods,
rulesets, required checks, signed commits, tags, Actions policy, Environments,
the cost-safe organization security baseline, CodeQL posture, and repository
metadata.

Preserve existing approval, actor, signed-commit, tag, and status-check rules
unless the requested change owns them. Running a check and enforcing it are
separate operations. Before requiring pull requests or a check, inventory
release bots, dependency bots, generated writebacks, and maintainers who still
write the default branch.

## Collaboration Files

Read [templates](references/templates.md) when adding or aligning pull-request
templates, issue forms, `SECURITY.md`, `CONTRIBUTING.md`, or shared community
defaults.

- Prefer public owner-level defaults only for policy true across every repo.
- Keep templates short and evidence-oriented; avoid checklist theater.
- Public security guidance needs a working private reporting route. Private
  repos use an existing private maintainer channel.
- Add Dependabot configuration only for ecosystems and manifests that exist.
  Keep scheduled updates low-noise and preserve compatibility constraints.

## Release and Deploy Routes

Release work uses:

- [release workflows](references/release-workflows.md) for trust, publication,
  signed writeback, immutable releases, recovery, and completion proof
- [publish targets](references/release-targets.md) for npm, Swift/CocoaPods, Go,
  Rust, GitHub Actions, Homebrew, and monorepos
- [semantic-release](references/semantic-release.md) only when that tool is selected
- [release troubleshooting](references/release-troubleshooting.md) only after a
  concrete failure or inconsistent durable state

Deploy work uses:

- [deploy workflows](references/deploy-workflows.md) for triggers, lane
  detection, verified payloads, concurrency, and monitoring handoff
- [Environments](references/deploy-environments.md) when target selection,
  protection, OIDC, or provider boundaries change
- [credentials](references/deploy-secrets.md) when secret ownership or logging changes
- [deploy troubleshooting](references/deploy-troubleshooting.md) only after a
  concrete failure

## Verify and Finish

Run repository gates plus `actionlint` and `zizmor` when workflows changed.
Perform the narrowest safe live proof of the delivery contract. Dry-runs and
static inspection cannot prove immutable publication, signed writeback,
registry or tap parity, deployment, monitoring, or rollback.

After authorized live changes, read back every setting, Environment, rule,
release, registry, tag, deployment, or downstream pointer in scope. On partial
failure, reconcile durable state before retrying; never create a new version or
mutate an immutable release merely to make a workflow green.

## Output

```text
files: changed GitHub and documentation surfaces
settings: live changes and readback, or not checked
delivery: target and immutable payload boundary
evidence: local, workflow, and live proof actually exercised
risks: remaining authority, recovery, or downstream gaps
```
