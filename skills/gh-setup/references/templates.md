# Templates

Use this reference when deciding whether to create or align GitHub-facing templates and contributor policy docs.

This reference owns baseline existence and shape. General docs cleanup may keep
these files accurate, but the decision to introduce them should follow the
repo's collaboration model.

## Organization Defaults

For repositories owned by an organization or personal account, inspect the
public `<owner>/.github` repository before treating a missing local community
file as a gap. GitHub's
[default community-health files](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/creating-a-default-community-health-file)
act as fallbacks only when the target repository has no file of the same type;
repository-local files take precedence. Defaults are not copied into target
repositories or included in their clones, packages, or downloads.

Use shared defaults only for policy that is true across every target
repository. A conservative starting set is:

- `SECURITY.md`
- `CONTRIBUTING.md`
- `PULL_REQUEST_TEMPLATE.md`

Keep these constraints explicit:

- Creating `<owner>/.github` is a public change; obtain authorization before
  creating it or changing shared policy.
- A shared `SECURITY.md` must work for both public and private repositories.
  Prefer GitHub private vulnerability reporting when the target exposes it and
  fall back to an existing private maintainer channel otherwise.
- Any local issue-template file or config disables the shared issue-template
  set for that repository. Add shared issue templates only when the triage
  contract is truly universal.
- Do not use the defaults repository for licenses; licenses must remain in each
  repository so clones and packages include them.
- Do not add a default code of conduct without an actual enforcement and
  contact owner.

## Pull Request Template

Use a compact template for non-trivial repos:

```md
## Summary

## Changed

## Risks

## Verification

## Complexity
```

Guidance:

- Summary names the net change.
- Changed lists files or surfaces by intent, not a noisy commit log.
- Risks names what could regress and what reviewers should verify.
- Verification lists meaningful local, CI, preview, or live proof.
- Complexity is reduced, neutral, or increased; justify increased complexity.

Avoid long template checklists that authors learn to ignore.

## Issue Templates

Create issue templates only when they improve triage.

Useful split:

- bug report
- feature request
- support or question, only when the repo accepts that kind of issue

Security vulnerabilities should route to `SECURITY.md`, not public issues.

## Security Policy

`SECURITY.md` should be short and private-first:

- Tell reporters not to open public issues for vulnerabilities.
- Provide the private reporting route that actually works for this visibility.
- Ask for affected version or component, impact, minimal reproduction, and
  known mitigations.
- Avoid promising response times unless the maintainer can meet them.
- Keep product- or organization-specific contact details in the owning overlay,
  not in this generic base skill.

Choose the route from repository visibility. Do not copy a public template into
a private repo.

**Public repositories** — GitHub private vulnerability reporting:

1. Enable it (`PUT /repos/{owner}/{repo}/private-vulnerability-reporting`)
   before or with shipping `SECURITY.md`.
2. Verify `GET .../private-vulnerability-reporting` returns `enabled: true`.
3. Point reporters at the Security tab / Report a vulnerability control.

```md
# Security

Do not open a public issue for a suspected vulnerability.

Use GitHub's private vulnerability reporting from this repository's Security
tab (Report a vulnerability). Include the affected version or component, impact,
minimal reproduction, and any known mitigations. Do not include live credentials
or private source code.

Security fixes are applied on a best-effort basis to the latest release and the
latest code on `main`.
```

**Private repositories** — no public PVR surface. Point at an existing private
maintainer channel. Do not mention the Security-tab reporting button.

```md
# Security

Do not open a public issue for a suspected vulnerability.

This repository is private. Report suspected vulnerabilities to a repository
maintainer through an existing private channel before sharing sensitive details.
Include the affected version or component, impact, minimal reproduction, and any
known mitigations. Do not include live credentials or private source code.

Security fixes are applied on a best-effort basis to the latest release and the
latest code on `main`.
```

## Contributor Docs

`CONTRIBUTING.md` should explain:

- setup
- validation commands
- branch and PR workflow
- release/deploy documentation pointers, when contributors need them

Keep release/deploy mechanics in deeper docs such as `docs/DISTRIBUTION.md` or deployment runbooks. Do not copy the same workflow checklist into README, CONTRIBUTING, templates, and AGENTS.

## Repository Metadata

Repository descriptions and topics should help humans route the repo quickly:

- one-sentence description
- homepage or docs URL when there is a canonical public surface
- topics that reflect language, framework, artifact type, and purpose

Do not encode private org, client, machine, or unrelated repo facts into public metadata.
