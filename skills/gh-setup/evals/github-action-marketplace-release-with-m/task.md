# Publish a TypeScript GitHub Action to the Marketplace with Automated Releases

## Problem/Feature Description

Apex Platform has built `notify-on-failure`, a TypeScript GitHub Action that sends Slack notifications when a workflow job fails. The action is used internally across dozens of repositories, and several external teams have requested access. The team wants to publish it to the GitHub Actions Marketplace and set up automated releases using semantic-release so that every `feat:` or `fix:` commit to `main` automatically creates a new GitHub Release and advances the version.

The big challenge is distribution: users of GitHub Actions typically pin to a major version tag like `uses: apex-platform/notify-on-failure@v2` and expect that tag to always point to the latest stable release in that major line. If the team just creates `v2.1.0` but never updates the `v2` tag, all consumers are stuck on whatever version was current when they set up their workflow.

Additionally, the action is written in TypeScript, but GitHub only runs JavaScript — so the compiled output needs to be what the action actually executes. The team needs the CI pipeline to handle both the verification of the TypeScript source and the proper handoff to the marketplace runtime.

The organization requires verified commits on `main`. Pull requests must build
the checked-in `dist/` bundle and fail when rebuilding changes it. The release
Environment provides `RELEASE_APP_CLIENT_ID` and
`RELEASE_APP_PRIVATE_KEY` for an installed GitHub App. Release-time writeback
is limited to existing regular version manifests that a deterministic prepare
step actually updates, through GitHub's App-signed commit path and without
custom author/committer fields; do not pass `dist/**` to a plugin that cannot
preserve deletions and Git modes. Because plugin v1.0.1 has no atomic
expected-head precondition, use it only with an exclusive-writer policy for the
full prepare interval; a preflight head check alone is insufficient. Restore a
credential-free `origin` immediately afterward in an `if: always()` step.

The organization enforces immutable GitHub Releases. Because the compiled
bundle is committed before tagging and no asset is appended after publication,
semantic-release may publish this metadata-only release directly. The workflow
must read back `immutable: true`, run `gh release verify`, and prove the exact
release tag, signed default-branch writeback, bundled runtime, and moving major
tag all resolve to the intended release. A retry must inspect existing state and
must not mutate the published release. A later recovery run must also backfill
a missing metadata-only GitHub Release or repair the moving major tag from the
existing trusted tag even though semantic-release no longer reports a new
release.

## Output Specification

Produce the following files:

- `.github/workflows/ci.yml` — GitHub Actions workflow with verify and release jobs
- `.releaserc.json` — semantic-release configuration suitable for a marketplace action
- `action.yml` — the action manifest (you may adapt/complete the partial version provided below)

## Input Files

The following files are provided. Extract them before beginning.

=============== FILE: action.yml ===============
name: "Notify on Failure"
description: "Sends a Slack notification when a workflow job fails"
author: "Apex Platform"

inputs:
  slack-webhook-url:
    description: "Slack incoming webhook URL"
    required: true
  message:
    description: "Custom message to include in the notification"
    required: false
    default: "A workflow job failed"

runs:
  using: "node24"
  main: "src/index.ts"
=============== END FILE ===============

=============== FILE: package.json ===============
{
  "name": "notify-on-failure",
  "version": "2.0.0",
  "description": "Sends a Slack notification when a workflow job fails",
  "scripts": {
    "build": "esbuild src/index.ts --bundle --platform=node --outfile=dist/index.js",
    "test": "vitest run",
    "lint": "eslint src",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "esbuild": "^0.21.0",
    "typescript": "^5.4.0",
    "vitest": "^1.6.0",
    "eslint": "^8.57.0",
    "@actions/core": "^1.10.1"
  }
}
=============== END FILE ===============

=============== FILE: .node-version ===============
24
=============== END FILE ===============
