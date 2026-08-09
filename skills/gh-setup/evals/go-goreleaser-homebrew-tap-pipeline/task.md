# Automate Binary Releases for a Go CLI Tool

## Problem/Feature Description

Redwood Systems ships `vaultctl`, a Go command-line tool for secrets rotation used by their infrastructure teams. The project has grown from an internal tool to one adopted by a handful of partner companies, and the team wants to provide polished distribution: pre-built binaries for Linux/macOS/Windows, a Homebrew formula so Mac users can simply `brew install`, and signed build attestation for supply-chain compliance.

Currently releases are manually created by whoever remembers to cut one — no consistency in changelog, no binary builds, and the Homebrew cask in the separate tap repository under the `redwood-systems` GitHub organization is months out of date. The team wants the release process fully automated: commits following conventional commits on `main` should automatically determine the version, create a GitHub Release, build cross-platform binaries, and update the Homebrew tap cask. No human should need to run anything.

The cross-repo Homebrew update needs credentials beyond the default GitHub token, which only covers the source repo. Use a short-lived GitHub App installation token scoped to the source repo and tap. Both repositories require verified commits. Use GoReleaser's native GitHub App commit-author support so the tap update is signed without a separate commit job. The team also wants immutable GitHub releases and build provenance attestation for the release artifacts.

## Output Specification

Produce the following files:

- `.github/workflows/ci.yml` — complete GitHub Actions workflow with verify and release jobs
- `.releaserc.json` — semantic-release configuration
- `.goreleaser.yaml` — GoReleaser configuration including Homebrew cask automation

Include a brief `SETUP.md` at the repo root documenting the release Environment App credentials (`RELEASE_APP_CLIENT_ID` / `RELEASE_APP_PRIVATE_KEY`) and the explicit repository scope required for the minted token.

## Input Files

The following files represent the current repository state. Extract them before beginning.

=============== FILE: go.mod ===============
module github.com/redwood-systems/vaultctl

go 1.22
=============== END FILE ===============

=============== FILE: Makefile ===============
.PHONY: verify build

verify:
	go vet ./...
	go test ./...
	golangci-lint run

build:
	go build -o bin/vaultctl ./cmd/vaultctl
=============== END FILE ===============
