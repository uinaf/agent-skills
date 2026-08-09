# Set Up Automated Release Pipeline for npm Library

## Problem/Feature Description

The team at Fieldstone Labs has been maintaining `@fieldstone/form-validator`, a TypeScript form validation library published to npm. Right now, releases are entirely manual: a developer runs `npm version`, pushes a tag, and publishes by hand. This process is error-prone — two releases have been accidentally published without the changelog updated, and once a developer pushed to npm from their local machine with stale dependencies.

The team wants to automate this using GitHub Actions and semantic-release, so that every conventional commit pushed to `main` that warrants a release (feat, fix, or breaking change) automatically: runs the test suite, bumps the version, updates the changelog, publishes to npm through npm Trusted Publishing/OIDC, creates a GitHub Release, and commits the version bump back to the repo. They want protection against two releases accidentally racing each other, and they want the version bump commit to never retrigger CI.

The organization requires verified signatures on `main`. The release
Environment provides `RELEASE_APP_CLIENT_ID` and `RELEASE_APP_PRIVATE_KEY` for
an installed GitHub App that can write this repository. The source writeback
must use GitHub's App-signed commit path; a configured bot name or noreply email
is not a signature. Before release analysis/writeback, reject a superseded run
when the live `main` head differs from the workflow SHA; do not let the commit
plugin absorb unanalyzed concurrent pushes.

The organization also enforces immutable GitHub Releases. This package has no
post-publication release assets, so semantic-release may publish the metadata-
only release directly. The workflow must then prove `immutable: true`, run
`gh release verify`, and confirm the npm version and live default-branch files
match. Retries must inspect the existing release and registry state instead of
creating another bump or trying to mutate a published release. Include a
validated backfill path for an existing trusted tag when npm or the GitHub
Release was published but the other boundary is missing; a normal
semantic-release rerun is not sufficient recovery.

## Output Specification

Produce the following files in the workspace:

- `.github/workflows/ci.yml` — the complete GitHub Actions workflow with verify and release jobs
- `.releaserc.json` — the semantic-release configuration file

Both files should be ready to commit to the repo root as-is (no placeholders left unfilled). You may create a `package.json` stub if needed to illustrate the configuration, but it is not required.

## Input Files

The following files represent the current state of the repository. Extract them before beginning.

=============== FILE: package.json ===============
{
  "name": "@fieldstone/form-validator",
  "version": "2.3.1",
  "description": "TypeScript form validation library",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "lint": "eslint src",
    "typecheck": "tsc --noEmit",
    "verify": "npm run lint && npm run typecheck && npm run test && npm run build"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "vitest": "^1.6.0",
    "eslint": "^8.57.0"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/fieldstone/form-validator.git"
  },
  "publishConfig": {
    "access": "public"
  }
}
=============== END FILE ===============

=============== FILE: CHANGELOG.md ===============
# Changelog

## 2.3.1

- Existing release history.
=============== END FILE ===============

=============== FILE: .node-version ===============
24
=============== END FILE ===============
