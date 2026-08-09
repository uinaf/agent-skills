# Semantic Release

Use this reference for the semantic-release configuration and the commit conventions that drive it.

## Conventional Commits

Semantic-release derives the next version from commit messages. The repo must commit to Conventional Commits before this pipeline is reliable.

- `feat:` → minor bump
- `fix:` → patch bump
- `feat!:` / `fix!:` / `BREAKING CHANGE:` footer → major bump
- `chore:`, `docs:`, `refactor:`, `test:`, `build:`, `ci:` → no release (unless flagged via release rules)

Use a local commit-msg hook (`commitlint` for Node, `convco` for Go, etc.) for
fast feedback, but do not treat a bypassable local hook as enforcement. Validate
direct-push subjects in CI. In squash-merge repositories, validate the PR title
because that normally becomes the release-driving commit subject.

## Plugin Order

Order matters — semantic-release runs plugins in declaration order. Canonical order for an npm package:

1. `@semantic-release/commit-analyzer` — decides next version from commit history
2. `@semantic-release/release-notes-generator` — builds the release notes body
3. `@semantic-release/changelog` — writes/updates `CHANGELOG.md` (optional)
4. Publish plugin(s) — `@semantic-release/npm`, `@semantic-release/exec`, etc.
5. `@jno21/semantic-release-github-commit` — commits prepared version files
   through GitHub's API when the default branch requires verified signatures
6. `@semantic-release/github` — creates the GitHub Release and uploads assets

Place the GitHub commit plugin after every plugin that prepares files and before
`@semantic-release/github`. It updates the checkout to the GitHub-signed commit,
so semantic-release tags that commit.

## Preset

Always pass the same preset to both analyzer and notes generator:

```json
["@semantic-release/commit-analyzer", { "preset": "conventionalcommits" }],
["@semantic-release/release-notes-generator", { "preset": "conventionalcommits" }]
```

Mismatched presets produce inconsistent version decisions and notes.

## GitHub-signed writeback

```json
["@jno21/semantic-release-github-commit", {
  "files": ["package.json", "package-lock.json", "CHANGELOG.md"],
  "commitMessage": "chore(release): ${nextRelease.version} [skip ci]"
}]
```

- Pin `@jno21/semantic-release-github-commit` to an exact version in the release
  action's `extra_plugins` input.
- `files` is the explicit list of prepared files to commit. Add
  `pnpm-lock.yaml`, `Cargo.lock`, `Package.swift`, a podspec, or other manifests
  only when the prepare step updates them deterministically.
- Plugin v1.0.1 is suitable only for existing regular non-executable files. It
  does not emit deletions and writes matched paths as mode `100644`; do not use
  it for generated trees, executable files, or symlinks. Preserve those through
  the pull-request build or a reviewed API implementation with full Git tree
  semantics.
- A preflight comparison between the live release branch and the workflow SHA
  skips superseded queued runs but is not atomic. Plugin v1.0.1 bases its commit
  on whatever branch head it reads during `prepare` and has no expected-head
  option. Use it only with a concrete external branch lease that blocks every
  merge and direct push from before semantic-release starts release analysis
  through the plugin's API ref update. Actions concurrency serializes release
  jobs but is not a branch lease. Without that control plane, use an App-signed
  API implementation that rejects a head different from the analyzed SHA.
- The option is `commitMessage`, not `message`. Keep `[skip ci]` in its subject
  so the writeback does not retrigger verification or release.
- Pass a short-lived GitHub App installation token to semantic-release. Do not
  set the plugin's author or committer overrides; GitHub signs the commit only
  when those fields are omitted.
- Immediately after semantic-release, restore `origin` to a credential-free
  URL in an `if: always()` step. Plugin v1.0.1 temporarily places its App token
  in that remote URL to fetch the new commit and does not restore it itself.
- The App must be allowed to update the default branch. Required-signature rules
  can remain enforced; PR-required or restricted-push rules still need an
  explicit compatible actor policy.
- For a tag-only release with no source bump, omit the commit plugin entirely.

`@semantic-release/git` creates an ordinary local commit. An App token and bot
noreply email provide attribution, not a cryptographic signature; do not use it
on a branch that requires verified commits.

## Branch Configuration

```json
{ "branches": ["main"] }
```

Add prerelease channels only when the repo actually publishes them:

```json
{
  "branches": [
    "main",
    { "name": "next", "prerelease": true },
    { "name": "beta", "prerelease": true }
  ]
}
```

A prerelease branch creates a separate npm dist-tag and GitHub Release. Enable it when the repo has an actual prerelease lane.

## Config File Location

- Node packages: `.releaserc.json` at repo root, or a `"release"` block in `package.json`. Pick one.
- Monorepos: per-package `.releaserc.json` next to the package, paired with `working_directory:` on the action.
- Non-Node repos (Swift, Go): `.releaserc.json` at root works fine — semantic-release is a Node tool but only needs Node available on the runner.

## Dry-Run Verification

Before the first real release, dry-run on a topic branch:

```bash
GITHUB_TOKEN=… npx semantic-release --dry-run --no-ci --branches=$(git branch --show-current)
```

The dry-run prints the computed version and notes without tagging or publishing. Confirm both look right before merging the first `feat:` commit to main.

## Action Wrapper

Use `cycjimmy/semantic-release-action@<full-sha>` with an exact same-line version comment, preserving the repo's current major unless there is a concrete migration reason. For new workflows, start from the current major and keep it on Dependabot. Inputs worth knowing:

- `working_directory` — for monorepo packages.
- `extra_plugins` — install CI/CD-only release plugins without polluting the repo's runtime or dev dependency graph. Pin every entry to an exact version such as `@semantic-release/npm@13.1.5` and `@jno21/semantic-release-github-commit@1.0.1`; use exact package specs in secret-bearing release jobs.
- `semantic_version` — pin the semantic-release major to keep release behavior reproducible.

Keep semantic-release dependencies in `package.json` only when the repo intentionally owns local release execution, such as a documented `release` script developers run or a lockfile-owned release wrapper. For normal GitHub Actions release jobs, keep release-only plugins in the action's `extra_plugins` input and pin them there.

## Immutable GitHub Releases

`@semantic-release/github` must not publish a GitHub Release before another
step uploads binaries. Configure it to create a mutable draft instead:

```json
[
  "@semantic-release/github",
  { "draftRelease": true }
]
```

Build and verify every asset before explicitly publishing that draft. A retry
must discover the existing tag/draft from GitHub state rather than depend only
on the wrapper's `new_release_published` output. If the release is already
published, skip mutation and resume downstream work.

Semantic-release does not provide an atomic transaction across GitHub and an
independent immutable registry such as npm or crates.io. The GitHub commit
plugin also runs during `prepare`, before publication. Document and exercise
partial-failure recovery for each registry instead of assuming one transaction.
A normal semantic-release rerun may stop after discovering the existing tag and
never invoke the failed publisher. Use the durable-state recovery table in
[release workflows](release-workflows.md#partial-failure-recovery); do not
promise automatic resume without an implemented backfill path.

Validate the signed writeback with a real release. Require the peeled remote tag
to resolve to the signed version commit, read the released version files from
that commit, and separately prove the live default branch contains it; later
unreleased commits may legitimately advance those files. Require the registry
to publish that version and the GitHub Release to report `immutable: true`. Run
`gh release verify` for both asset-bearing and metadata-only immutable releases;
the release attestation exists even when the asset list is empty.
