# Automate an Immutable Rust CLI Release with cargo-dist

## Problem/Feature Description

Northstar Tools ships `trailctl`, a Rust CLI distributed as cross-platform
binaries and a Homebrew formula, but not through crates.io. Conventional
commits on `main` should determine the next version automatically.

The organization enforces immutable GitHub Releases and verified commits on the
source and Homebrew tap default branches. Semantic-release may prepare the
Cargo version and create the tag, but cargo-dist's generated tag workflow must
be the sole GitHub Release and binary-asset owner. Publishing a GitHub Release
from semantic-release first would freeze it before cargo-dist uploads assets.

Cargo-dist may generate the Homebrew formula, but its built-in Homebrew
publisher uses an ordinary local commit. Configure a custom reusable
post-announce job that commits the generated formula through a full-SHA-pinned
signed API action with a short-lived GitHub App token. The recovery path must
reconcile an existing immutable release and missing tap update by exact tag.
Reject a superseded semantic-release run when the live default-branch head no
longer equals the analyzed workflow SHA.

## Output Specification

Produce:

- `.github/workflows/ci.yml` for verification and semantic-release version/tag creation
- `.releaserc.json` with deterministic Cargo preparation and signed manifest writeback, but no GitHub Release publisher
- `dist-workspace.toml` and the generated cargo-dist release workflow
- `.github/workflows/publish-homebrew.yml` as the custom post-announce signed
  tap publisher, callable by cargo-dist and manual recovery
- `SETUP.md` documenting `RELEASE_APP_CLIENT_ID`, `RELEASE_APP_PRIVATE_KEY`, source/tap repository scope, and least permissions

The workflows must prove the tag points to the signed Cargo manifest commit,
cargo-dist publishes the complete immutable release, release assets/digests
verify, and the signed tap formula references those same assets.

## Input Files

=============== FILE: Cargo.toml ===============
[package]
name = "trailctl"
version = "0.4.0"
edition = "2024"

[[bin]]
name = "trailctl"
path = "src/main.rs"
=============== END FILE ===============

=============== FILE: Cargo.lock ===============
# Existing committed lockfile for the CLI.
=============== END FILE ===============
