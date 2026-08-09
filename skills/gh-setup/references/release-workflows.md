# Workflows

Use when aligning GitHub Actions release workflow files.

## File Layout

- Default: a single `.github/workflows/ci.yml` with verification and release jobs.
- Split into `verify.yml` + `release.yml` only when verification must run on a different cadence (e.g., scheduled) or when release needs a runner the verification path does not.
- Keep a single release workflow by default. Add a third "tag-driven backstop" workflow only with a documented reason, because two active release paths make provenance and retry behavior harder to reason about.
- Before changing layout, read existing workflows and any same-org repo that
  already publishes the same artifact type. Treat sibling choices as evidence,
  then validate them against current upstream contracts, branch policy, and a
  real release. Do not preserve an unsigned or deprecated action merely because
  it already exists nearby.

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

- Add `id-token: write` only when the job uses npm trusted publishing,
  provider OIDC, or keyless provenance. Add `issues: write` and
  `pull-requests: write` only when semantic-release is configured to comment on
  issues or pull requests. Ordinary file attestations with `actions/attest`
  also require `attestations: write`:

  ```yaml
  id-token: write
  attestations: write
  ```

  Add `artifact-metadata: write` only when the integration actually creates an
  artifact storage record, such as the applicable OCI registry flow.

## Runners

- Use GitHub-hosted floating runner labels for routine CI and release jobs: `ubuntu-latest`, `windows-latest`, and `macos-latest`.
- Pin a runner image only when the OS image is part of the tested toolchain contract, and document that reason next to the workflow or in the repo release docs.

## Settings and Secrets

- Check live settings before severity or remediation calls: `main` rules, allowed push actors, release tag rules, Actions permission policy, Environment reviewers/branch policy, and publish secret location.
- Continuous releases should use Environment-scoped secrets without approval gates. Use separate reviewer-gated environments only when a human must approve signing, production promotion, or store submission.
- Package/library/CLI/marketplace release jobs may use an approval-free `release`
  Environment to read publish secrets and vars. Set `deployment: false` in the
  job's `environment` mapping when the Environment is a credential boundary
  rather than a deployment target; secrets, variables, branch/tag policies,
  wait timers, and required reviewers still apply without creating a deployment
  record.
- Keep deployment records enabled for running-service/app deploys and for Environments that use custom deployment protection rules.
- Do not add CODEOWNERS as a blanket default for small repos. Use it only when the repo's maintainers explicitly want owner-gated workflow or release-file review.

## Release Tooling

- Pin high-trust release, publish, upload, and signing actions to full commit SHAs with a trailing same-line version comment. Dependabot can update SHA-pinned GitHub Actions when the ref line carries the version comment; stale SHAs that no longer exist upstream should be fixed before relying on the updater.
- When a release action installs plugins at runtime, pin each requested plugin to an exact version in jobs with registry, signing, or repository-write secrets.
- Keep CI/CD-only release tooling out of the repo dependency graph by default. Use action inputs such as `extra_plugins` for workflow-owned release plugins, and reserve `devDependencies` for tooling the repo intentionally exposes through local scripts or lockfile-owned release wrappers.

## Immutable GitHub Releases

Audit publication order before enabling immutable releases. A published
release locks its assets and associated tag; release notes remain editable.
The safe transaction is:

```text
create draft -> attach every asset -> verify manifest/signatures -> publish once
```

- Prefer one release-state owner. Do not publish through semantic-release and
  then append binaries to the published release.
- `gh release create TAG assets...` natively creates a temporary draft,
  uploads every asset, publishes only after successful uploads, and cleans up
  its draft on failure. Use it when all artifacts can be built first.
- When semantic-release must own version selection and notes, configure
  `@semantic-release/github` with `draftRelease: true`. A downstream publisher
  may mutate only that draft; publish explicitly after verification.
- For GoReleaser adopting semantic-release's draft, set
  `release.use_existing_draft: true`, `release.draft: true`, and
  `release.mode: keep-existing`. Enable artifact replacement only for retrying
  the mutable draft.
- Gate retries on durable GitHub state. If the release is already published,
  skip every asset mutation and resume only downstream checks or distribution.
- Remove `--clobber` from published-release paths. It is acceptable only for
  repair of an unpublished draft.
- Validate the exact expected asset names/count before publication. Verify
  checksums, code signatures, notarization, and provenance against the files
  being published.
- After publication, require both `gh release verify TAG` and the Releases
  API's `immutable: true` field. Immutable metadata-only releases still have a
  release attestation; an empty asset list is valid. Consumers can additionally
  use `gh release verify-asset TAG PATH` for downloaded assets.
- Update Homebrew taps, deployment pointers, and other downstream consumers
  only after the immutable release verifies, unless the distributor is
  intentionally part of a draft transaction with documented recovery.

Probe repository and organization policy before writes:

```bash
gh api repos/{owner}/{repo}/immutable-releases
gh api orgs/{org}/settings/immutable-releases
```

Enable repository policy with
`gh api --method PUT repos/{owner}/{repo}/immutable-releases`. For an audited
organization-wide rollout, set `enforced_repositories` to `all` through
`PUT orgs/{org}/settings/immutable-releases`, then read back both the org policy
and every current repository's `enabled` / `enforced_by_owner` state. The org
policy covers future repositories. Existing published releases are not
rewritten; prove each distinct workflow shape with a real patch release because
dry-run cannot exercise GitHub's immutable publication boundary.

## Checkout

- Both jobs: `actions/checkout@<full-sha> # v6.0.2` with `fetch-depth: 0`. Semantic-release walks history to compute the next version; a shallow clone breaks it.
- Keep `persist-credentials: false` through checkout, install, build, and pack
  steps, especially before package-manager lifecycle scripts run. Introduce a
  short-lived GitHub App token only at the release boundary. Prefer API-backed
  writeback that consumes the token directly; configure Git transport only for
  tag or ref operations that actually need it.
- Do not assume a later `GITHUB_TOKEN` or `GH_TOKEN` environment variable overrides checkout authentication. With persisted credentials, Git can keep using checkout's default token and push as `github-actions[bot]` even after a GitHub App token is minted. Disable credential persistence at checkout, then configure Git authentication with the intended token at the release boundary.

## `[skip ci]` Gate

Both jobs must short-circuit when the head commit is the bot's bump commit:

```yaml
if: ${{ !contains(github.event.head_commit.message, '[skip ci]') }}
```

Apply on **both** verification and release jobs. Skipping it on verification means the bump commit re-runs the verification suite for nothing; skipping it on release means the bump commit recursively triggers a new release.

Exception: if another workflow must run from a tag on the version commit, do
not place GitHub's recognized skip instructions in that commit. They apply to
tag `push` workflows too. Use a repo-owned marker such as `[skip release]` and
job-level conditions in the branch workflow instead.

## Signed Bot Commits

Use a narrowly scoped GitHub App installation token for release writes. An App
token authenticates the operation; it does not sign a local `git commit`.
Prefer a release tool that deliberately omits author/committer fields from a
GitHub API commit so GitHub can sign it as the App.

Before version analysis or writeback, discard a superseded push run when the
live default-branch head no longer equals `github.sha`; the newest queued run
will analyze the full commit set. This narrows stale runs but is not an atomic
lock. Release-job concurrency serializes workflows but does not stop another
direct push from advancing the branch.

### semantic-release version files

Replace `@semantic-release/git` with
[`@jno21/semantic-release-github-commit@1.0.1`](https://github.com/Jno21/semantic-release-github-commit/blob/v1.0.1/README.md).
The plugin runs in `prepare`, commits only its `files` through GitHub's API,
updates the local checkout to that commit, and lets semantic-release tag the
signed version commit. Pin the plugin to an exact version in `extra_plugins`.

```json
[
  "@semantic-release/npm",
  [
    "@jno21/semantic-release-github-commit",
    {
      "files": ["package.json"],
      "commitMessage": "chore(release): ${nextRelease.version} [skip ci]"
    }
  ],
  "@semantic-release/github"
]
```

- The plugin options are `files` and `commitMessage`. `assets` and `message`
  belong to `@semantic-release/git` and are ignored here.
- Do not set `authorName`, `authorEmail`, `committerName`, or
  `committerEmail`; custom identity disables GitHub App auto-signing.
- Let the publish or exec prepare plugin write the version files before this
  plugin. List only those deterministic files.
- In v1.0.1, list only existing regular non-executable files. The plugin does
  not emit deletions and creates every tree entry with mode `100644`; do not
  pass generated trees, executables, or symlinks.
- The plugin reads the live branch head during `prepare` and does not expose an
  atomic expected-head precondition. Use v1.0.1 only with a concrete external
  branch lease that blocks every merge and direct push from before
  semantic-release starts release analysis through the plugin's API ref update.
  Actions concurrency serializes release jobs but is not that lease. Otherwise
  use an App-signed API commit implementation that rejects any head other than
  the analyzed SHA; a preflight check alone is insufficient.
- Pass the App installation token as step-scoped `GITHUB_TOKEN` or `GH_TOKEN`.
  Do not configure a GPG key or add an extra Linux writeback job.
- Plugin v1.0.1 writes the App token into the checkout's `origin` URL while it
  fetches the new commit. Immediately after semantic-release, run an
  `if: always()` cleanup that restores a credential-free remote before any
  parity, packaging, or diagnostic step:

  ```yaml
  - name: Restore credential-free origin
    if: always()
    run: git remote set-url origin "https://github.com/${GITHUB_REPOSITORY}.git"
  ```
- The plugin commits during `prepare`, before registry and GitHub publication.
  Treat registry publication as a separate immutable boundary and verify the
  repo's retry behavior when a later publish step fails.

### GoReleaser Homebrew updates

Use GoReleaser's native `commit_author.use_github_app_token: true` under the
Homebrew publisher. GoReleaser omits the committer from its API request and
GitHub signs the tap commit as the App. Do not add a second commit action or
custom author fields. See [release targets](release-targets.md#flow-a--goreleaser-auto-update).

### Generic fallback

Use a full-SHA-pinned GitHub API commit action only for a generated file in a
repository that has no release-tool-native signed path. Keep that fallback
narrow: one deterministic file set, one explicit repository and branch, and no
custom author/committer. Read source Release state with the source workflow
token, then mint a separate App token naming only the destination repository
for the write. The action must bind its commit to the destination head observed
before generation and reject a changed head with `expectedHeadOid` or equivalent
compare-and-swap; alternatively, a concrete external lease must block every
destination writer from generation through ref update. A fresh head lookup only
at write time is insufficient because it can overwrite a concurrently changed
generated file. Do not grant an Integration bypass merely to preserve an
unsigned local-commit action.

## Release Completion Proof

Do not infer completion from a green workflow or a tag alone. For every
distinct release shape, perform one real release and require all applicable
evidence:

- The release is published (`draft: false`) and `immutable: true`.
- `gh release verify TAG` succeeds; asset names and digests match the manifest.
- The release tag resolves to the intended commit. When semantic-release writes
  a version file, the tag resolves to that GitHub-signed version commit.
- Every protected-branch writeback reports
  `commit.verification.verified: true` with `reason: valid`.
- Version-bearing files read from the peeled release-tag commit equal the
  published version, including lockfiles when the release contract updates
  them. The live default branch contains that commit; it need not still have
  identical files after later unreleased work.
- Registries, Homebrew formulae/casks, moving action tags, and deployment
  pointers reference that same version and artifact digest.
- A retry after publication performs no asset mutation and reaches the same
  verified state.

A no-release run cannot prove writeback, immutable publication, or downstream
parity. Record any unexercised boundary as unverified rather than complete.

## Partial-failure Recovery

Semantic-release is not a transaction manager, and a plain rerun is not a
universal recovery mechanism. Reconcile durable state first, then run the
smallest trusted backfill for the missing boundary:

| Durable state | Recovery |
| --- | --- |
| signed prepare commit, no tag, nothing published | validate that commit's parent, tree, version, signature, and expected tag, then create the tag directly on it and run only the missing publishers; do not rerun normal prepare/writeback from the original SHA |
| tag exists, GitHub Release missing | create the release from that trusted tag; for assets, assemble a draft from the tag and publish after verification |
| registry version exists, GitHub Release missing | never republish the registry version; backfill the GitHub Release from the matching tag |
| tag exists, registry version missing | publish the exact tagged package through a validated backfill job; do not create another bump |
| draft exists with partial assets | resume that draft, replace only draft assets, verify, then publish once |
| immutable Release exists, downstream tap/tag/deploy missing | run an idempotent downstream reconciliation job keyed by the exact release tag |

Backfill workflows may use `workflow_dispatch`, but must validate the tag before
loading secrets and must read the release, registry, and default-branch state
again afterward. Downstream repair must not depend solely on wrapper outputs
such as `new_release_published`; those are false on a later recovery run.

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
