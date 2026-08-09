# Add a Signed Homebrew Fallback for a Non-Go CLI

## Problem/Feature Description

Acme Tools publishes `envctl`, a non-Go CLI, and needs its release workflow to
update `acme-tools/homebrew-tap`. Its existing formula generator ends with an
ordinary local commit and push. The tap now requires verified commits, so a bot
name and noreply email are insufficient.

The generator has no native GitHub App-signed commit mode. Preserve its useful
formula-generation behavior, but prevent it from committing. After a release is
published, a dependent Linux job must mint a short-lived App token scoped only
to the source and tap repositories, deterministically prepare only
`Formula/envctl.rb`, and commit that path with the full-SHA-pinned
`planetscale/ghcommit-action`. Read back the resulting tap commit and fail if
GitHub does not report `verification.verified: true`.

The handoff must use durable state. It should run whenever the exact trusted
release tag is published and immutable but tap parity is missing, including a
later recovery run. Do not gate repair solely on semantic-release's
`new_release_published` output.

## Output Specification

Update `.github/workflows/release.yml` and write a short `SETUP.md`. Document
the release Environment's `RELEASE_APP_CLIENT_ID` variable and
`RELEASE_APP_PRIVATE_KEY` secret, the two-repository installation scope, and
`contents: write`. Do not add a PAT, custom bot identity, ordinary `git push`,
or a manual tap PR.

## Input Files

The current workflow publishes through semantic-release and exposes
`new_release_published` and `new_release_version` as job outputs. It currently
runs a formula generator directly after semantic-release using the default
repository token. Replace only that Homebrew handoff; preserve the existing
release system, but replace the transient output gate with exact release-state
discovery and an idempotent parity check.
