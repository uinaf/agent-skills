# Workflows

Use when aligning GitHub Actions release workflow files.

## File Layout

- Default: a single `.github/workflows/ci.yml` with verification and release jobs.
- Split into `verify.yml` + `release.yml` only when verification must run on a different cadence (e.g., scheduled) or when release needs a runner the verification path does not.
- Keep a single release workflow by default. Add a third "tag-driven backstop" workflow only with a documented reason, because two active release paths make provenance and retry behavior harder to reason about.
- Before changing layout, read existing workflows and any same-org repo that already publishes the same artifact type. Keep its action choice, token naming, and tap handling when the target matches.

## Triggers

- Verification: `pull_request`, `merge_group` when the repo uses merge queue, and `push` to `main`.
- Release: `push` to `main` only. Encode this as an `if:` on the release job rather than a separate `on:` block, so verification and release stay coupled.
- Do not use `pull_request_target` for any workflow that checks out, installs, builds, tests, packages, signs, publishes, or otherwise executes project code. Keep fork and outsider code on `pull_request` with read-only credentials and no release secrets.
- Manual `workflow_dispatch` is fine to add for verification; release paths still honor the `[skip ci]` gate.
- Secret-bearing manual release/backfill workflows use trusted checkout refs: `main`, a published `v*` tag, or a separately validated protected ref.
- GitHub Environment branch/tag policies gate the workflow run ref; they do not prove that a later `actions/checkout` `with.ref` or `git checkout` input is trusted. Treat run ref and checkout ref as separate trust boundaries.

## Manual Inputs

- Pass `workflow_dispatch` inputs through `env:` into a secretless validation step. Validate shape/length/allowed values, emit the sanitized value as a step output, then use that output downstream.
- Use `actions/checkout` with `with: { ref: ${{ steps.validate.outputs.ref }} }` after validation.
- Keep untrusted multiline input out of `$GITHUB_ENV` unless it is sanitized or written with a heredoc-safe delimiter.
- Do metadata prep and input validation before loading registry, signing, store, or release secrets.

## Concurrency

- Workflow-level cancellable group for verification:

  ```yaml
  concurrency:
    group: verify-${{ github.workflow }}-${{ github.ref }}
    cancel-in-progress: true
  ```

- Job-level non-cancellable group for release:

  ```yaml
  concurrency:
    group: release-${{ github.repository }}-main
    cancel-in-progress: false
  ```

  Cancelling a release mid-tag corrupts the tag/release pairing. Always queue.

## Permissions

- Workflow default: `permissions: {}`. Jobs opt into only the scopes they need.
- Release job:

  ```yaml
  permissions:
    contents: write
  ```

- Add `id-token: write` only when the job uses npm trusted publishing, provider OIDC, or keyless provenance. Add `issues: write` and `pull-requests: write` only when semantic-release is configured to comment on issues or pull requests. Add `attestations: write` only when producing GitHub build provenance:

  ```yaml
  id-token: write
  attestations: write
  ```

## Runners

- Use GitHub-hosted floating runner labels for routine CI and release jobs: `ubuntu-latest`, `windows-latest`, and `macos-latest`.
- Pin a runner image only when the OS image is part of the tested toolchain contract, and document that reason next to the workflow or in the repo release docs.

## Settings and Secrets

- Check live settings before severity or remediation calls: `main` rules, allowed push actors, release tag rules, Actions permission policy, Environment reviewers/branch policy, and publish secret location.
- Continuous releases should use Environment-scoped secrets without approval gates. Use separate reviewer-gated environments only when a human must approve signing, production promotion, or store submission.
- Package/library/CLI/marketplace release jobs may use an approval-free `release` Environment to read publish secrets and vars. GitHub creates deployment records for jobs that declare an Environment; there is no supported `deployment: false` key. If deployment records are unacceptable, use trusted publishing/OIDC without a GitHub Environment or another narrowly scoped secret boundary the repo can justify.
- Keep deployment records enabled for running-service/app deploys and for Environments that use custom deployment protection rules.
- Do not add CODEOWNERS as a blanket default for small repos. Use it only when the repo's maintainers explicitly want owner-gated workflow or release-file review.

## Release Tooling

- Pin high-trust release, publish, upload, and signing actions to full commit SHAs with a trailing same-line version comment. Dependabot can update SHA-pinned GitHub Actions when the ref line carries the version comment; stale SHAs that no longer exist upstream should be fixed before relying on the updater.
- When a release action installs plugins at runtime, pin each requested plugin to an exact version in jobs with registry, signing, or repository-write secrets.
- Keep CI/CD-only release tooling out of the repo dependency graph by default. Use action inputs such as `extra_plugins` for workflow-owned release plugins, and reserve `devDependencies` for tooling the repo intentionally exposes through local scripts or lockfile-owned release wrappers.

## Checkout

- Both jobs: `actions/checkout@<full-sha> # v6.0.2` with `fetch-depth: 0`. Semantic-release walks history to compute the next version; a shallow clone breaks it.
- Keep `persist-credentials: false` through checkout, install, build, and pack steps whenever possible, especially before package-manager lifecycle scripts run. If `@semantic-release/git` must push a bump commit, add write credentials only at the narrow release boundary: use a release bot or GitHub App token that branch rules explicitly allow, configure the git remote or credential helper immediately before semantic-release, and avoid exposing that token to dependency install steps.
- Do not assume a later `GITHUB_TOKEN` or `GH_TOKEN` environment variable overrides checkout authentication. With persisted credentials, Git can keep using checkout's default token and push as `github-actions[bot]` even after a GitHub App token is minted. Disable credential persistence at checkout, then configure Git authentication with the intended token at the release boundary.

## `[skip ci]` Gate

Both jobs must short-circuit when the head commit is the bot's bump commit:

```yaml
if: ${{ !contains(github.event.head_commit.message, '[skip ci]') }}
```

Apply on **both** verification and release jobs. Skipping it on verification means the bump commit re-runs the verification suite for nothing; skipping it on release means the bump commit recursively triggers a new release.

## Signed Bot Commits

Prefer a narrowly scoped GitHub App installation token for release GitHub
writes. For commits, use GraphQL `createCommitOnBranch`: GitHub authors the
commit as the authenticated App, signs it, and returns signature metadata that
the workflow can assert. This avoids storing a signing key and lets the App
obey required-signature rules without a bypass.

Use the current non-deprecated inputs declared by the pinned action version.

```yaml
- name: Create release bot token
  id: release-bot
  uses: actions/create-github-app-token@<full-sha> # v3.2.0
  with:
    client-id: ${{ vars.RELEASE_APP_CLIENT_ID }}
    private-key: ${{ secrets.RELEASE_APP_PRIVATE_KEY }}
    owner: ${{ github.repository_owner }}
    repositories: ${{ github.event.repository.name }}
    permission-contents: write

- name: Create signed version commit
  env:
    GH_TOKEN: ${{ steps.release-bot.outputs.token }}
  run: node scripts/create-signed-commit.ts "chore: sync version [skip ci]" package.json
```

- Keep the mutation in a small repo-owned script with tests; workflow YAML
  should only provide the App token, commit message, and intended paths.
- Set `expectedHeadOid` to the checked-out HEAD so concurrent default-branch
  updates fail closed instead of being overwritten.
- Pass only intended additions/deletions and reject unexpected generated paths.
- Query `signature { isValid wasSignedByGitHub signer { login } }` and fail the
  job unless GitHub confirms a valid GitHub signature.
- Do not provide custom author, committer, or signature fields; that disables
  GitHub's authenticated bot-signing path.
- Use `gh auth setup-git` only for remaining tag, ref, or asset operations that
  actually require Git transport.
- If a third-party action commits internally and cannot use this API, document
  the incompatibility before granting the App an Integration bypass.
- Org-specific Environment variable/secret names (`RELEASE_APP_*` above) are examples — keep whatever naming contract the owning org documents.

## Caches

- Verification jobs may use dependency caches. Secret-bearing release, publish, signing, and promotion jobs do fresh dependency installs by default.
- Do not share package-manager caches between `pull_request` and privileged `push: main`, `workflow_dispatch`, or tag-driven jobs. The dangerous shape is outsider-controlled code populating a cache that a later publish job consumes.
- Release caches are only for unavoidable download/tool caches, not package-manager stores, generated dependency trees, or build outputs that become signed/published artifacts.
- Regenerate or verify generated trees such as `Pods/`, `vendor/`, `dist/`, build directories, or packaged runtime bundles inside secret-bearing release jobs.
- If a cache is unavoidable, namespace it by workflow, event/trust level, platform, and lockfile. Release jobs must consume only caches from the same trusted event class and must regenerate or verify generated trees before signing or publishing.

## Release-to-deploy handoff

- Prefer the published release boundary as the deploy input: GitHub Release asset, package registry version, container digest, or provider-native artifact.
- Avoid `actions/upload-artifact` / `actions/download-artifact` as the bridge from release to deploy when the payload is already published somewhere durable. Actions artifacts are CI scratch storage with quota and retention failure modes.
- If a deploy job downloads a GitHub Release asset, verify it before promotion with a checksum, archive integrity check, signature/provenance check, or target-specific validator.
- In repos that both release and deploy, the release job is the only builder for deployable artifacts. Deploy consumes the published immutable ref; it does not run a second source build from the same commit.

## Pipeline optimization

- Add explicit `timeout-minutes` to verification and release jobs so stuck package managers, signing tools, or registry calls do not burn the default six-hour window.
- Use `fail-fast: false` for release matrices when every OS/archive result is useful evidence; use `max-parallel` when signing services, package registries, or tap repos rate-limit concurrent publishes.
- Keep one stable required check for conditional or matrixed release workflows. Use an internal no-op/result job instead of trigger-level path filters when branch protection requires the workflow.
- If same-run Actions artifacts are unavoidable before publish, keep `retention-days` to `1-3`, set `if-no-files-found: error`, use lane/package-specific names, and record the artifact digest.

## npm Supply-Chain Incident Checks

- For active npm compromise response, scan manifests and lockfiles before installing. Look for affected versions from the advisory, unexpected git dependencies, malicious `optionalDependencies`, and package-root payloads such as `router_init.js`.
- If an affected package was installed on a developer machine or CI runner, treat that host as compromised and rotate registry, GitHub, cloud, SSH, Vault, and package-manager credentials reachable from the host before publishing again.
- npm trusted publishing is the default for public npm packages published from GitHub-hosted Actions: configure the package on npm for the repo, workflow filename, and optional Environment; grant `id-token: write`; remove `NPM_TOKEN`; and rely on npm's automatic provenance for public packages from public repos.
- SLSA or npm provenance proves the package came from a workflow identity, not that the workflow runner was clean. Keep provenance, but do not let it replace trusted refs, fresh release installs, and cache separation.

## Multi-Job Verification Composition

When the verification path has parallel jobs (e.g., `verify-unit`, `verify-consumer-surface`):

```yaml
release:
  needs: [verify-unit, verify-consumer-surface]
```

Release waits for **all** verification jobs. Adding a new verification job means adding it to `needs:` explicitly.

## Bootstrap Snippets

Pick one matching the repo's toolchain and place it after `actions/checkout`. Use the repo's existing verification command (`make verify`, `vp run verify`, `mise run verify`, etc.).

For Node / TypeScript workflows, check in `.node-version` with the latest active LTS line, currently Node 24.x. Use `.node-version` consistently; do not introduce alternate Node version files or hardcode an older Node major in workflow YAML.

```yaml
# Node / TypeScript
- uses: actions/setup-node@<full-sha> # v6.4.0
  with: { node-version-file: ".node-version" }
- run: npm ci
```

```yaml
# Node via the Vite+ toolchain
- uses: voidzero-dev/setup-vp@<full-sha> # v1.10.0
  with: { node-version-file: ".node-version", cache: false, run-install: false }
- run: vp install
```

```yaml
# Go CLI
- uses: jdx/mise-action@<full-sha> # v4.0.1
- run: mise run verify
```

```yaml
# Swift (CocoaPods + SwiftPM)
- uses: maxim-lobanov/setup-xcode@<full-sha> # v1.7.0
  with: { xcode-version: latest-stable }
- uses: ruby/setup-ruby@<full-sha> # v1.310.0
  with: { bundler-cache: false }
```
