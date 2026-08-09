# Publish Targets

Use this reference when wiring the publish step. Verification and completion
invariants stay consistent across targets; each target may need a different
publication transaction, owner, trigger, and credential boundary.

Before picking an action, inspect the repo's current release files and at least
one sibling repo when the organization has one. Use the sibling to discover
local contracts, not as authority: validate its action, options, signing,
publication order, and retry behavior against current upstream documentation
and a real release before reusing it.

## npm (Library or CLI)

Default to npm Trusted Publishing from GitHub Actions. Configure the package on npm with the GitHub organization/repo, workflow filename, and `release` Environment when used; then grant the release job `id-token: write` and remove `NPM_TOKEN`. Trusted publishing uses short-lived OIDC credentials and automatically produces npm provenance for public packages from public repos.

Use the npm CLI when enabling trusted publishing for one or many packages. `npm trust` requires npm `11.10.0` or newer; use the local npm when it meets that floor, otherwise pin the operator command with `npx -y npm@^11.10.0`. Login once with a package owner/admin account, then register each package's GitHub workflow identity:

```bash
npm login
npm trust github <package-name> --repo <owner>/<repo> --file <workflow-file> --env <environment> --allow-publish --yes
```

Examples:

```bash
npm trust github @scope/library --repo scope/library --file ci.yml --env release --allow-publish --yes
npm trust github cli-package --repo scope/cli-package --file release.yml --allow-publish --yes
```

- At least one permission flag is required or `npm trust` errors: `--allow-publish` for regular publishes, `--allow-stage-publish` only when the workflow uses npm's staged-release flow.
- Use `--env release` when the release job declares `environment: release` or `environment: { name: release }`. Omit `--env` only when the publishing job does not use a GitHub Environment.
- `npm trust` registers publishers on existing packages only; it fails with "package not found" for a first release. Bootstrap order for a new package: ensure the scope's npm org exists, do a one-time manual `npm publish` from a clean clone with 2FA/web login (no automation token — a `prepack` script should own verify plus a clean build), then register the trusted publisher and let the workflow own every later release.

Plugins:

```json
"@semantic-release/npm",
["@jno21/semantic-release-github-commit", {
  "files": ["package.json"],
  "commitMessage": "chore(release): ${nextRelease.version} [skip ci]"
}],
"@semantic-release/github"
```

Workflow step:

```yaml
- uses: actions/setup-node@<full-sha> # v6.4.0
  with:
    node-version-file: ".node-version"
    package-manager-cache: false
- run: npm ci
- uses: cycjimmy/semantic-release-action@<full-sha> # v6.0.0
  with:
    extra_plugins: |
      @semantic-release/npm@<exact-version>
      @jno21/semantic-release-github-commit@1.0.1
  env:
    GITHUB_TOKEN: ${{ steps.release-bot.outputs.token }}
```

- For npm package repos, check in `.node-version` with the latest active LTS line, currently Node 24.x. Migrate Node version-file examples and workflow setup to `.node-version`.
- Do not set `registry-url` for semantic-release npm publishing. With trusted publishing, npm authenticates from the job's OIDC identity rather than a registry token written by `setup-node`.
- If the package cannot use trusted publishing, use a granular automation token only as a fallback, scope it to the package, store it in the `release` Environment, and expose `NPM_TOKEN` only on the semantic-release step.
- Do not enable package-manager caches in the npm publish job. Install fresh in the secret-bearing job, then run `npm pack --dry-run` or the repo's pack smoke before publishing when the package surface is non-trivial.
- For scoped public packages set `"publishConfig": { "access": "public" }` in `package.json`.
- Ensure `package.json` has a public `repository` URL that exactly matches the GitHub repo used in the trusted publisher configuration.
- For a CLI, set `"bin"` in `package.json` and verify the published tarball includes the entry. `npm pack --dry-run` locally before the first release.
- If the release builds standalone binaries, verify every downloaded runtime or toolchain archive by digest before extracting or embedding it. Pair functional smoke tests with provenance checks.

## CocoaPods + SwiftPM

Semantic-release prepares Swift/CocoaPods version files with
`@semantic-release/exec`, commits them through GitHub's API, then publishes via a
repo script.

```json
["@semantic-release/exec", {
  "prepareCmd": "./scripts/prepare-release.sh ${nextRelease.version}",
  "publishCmd": "./scripts/publish-cocoapods.sh"
}],
["@jno21/semantic-release-github-commit", {
  "files": ["Package.swift", "<podname>.podspec"],
  "commitMessage": "chore(release): ${nextRelease.version} [skip ci]"
}],
"@semantic-release/github"
```

- `prepare-release.sh` rewrites the version string in `Package.swift` and the podspec.
- `publish-cocoapods.sh` runs `pod trunk push <podname>.podspec --allow-warnings`.
- Secrets: `COCOAPODS_TRUNK_TOKEN` exported as env on the publish step. Generate the trunk token with `pod trunk register` once, then store it as a `release` Environment secret by default. Use a repository secret only when the repo has an explicit reason not to use a release Environment.
- SwiftPM consumers pull from the git tag — no separate publish step needed.
- Treat CocoaPods and GitHub as separate immutable boundaries. If the tag
  exists and only one publication succeeded, run an exact-tag backfill for the
  missing boundary and reread podspec, tag, default-branch version, signature,
  and GitHub Release parity. Do not rely on a normal semantic-release rerun or
  create another version bump.
- Cache download artifacts only inside a single trust class. Regenerate or verify generated dependency trees such as full `Pods/` inside signed or publishing jobs before signing or publishing.

## Go (GoReleaser)

Semantic-release does not publish Go binaries. Use it as the version-decider, then hand off to GoReleaser.

Plugins (tag-only — no `@semantic-release/git`, no source bump):

```json
"@semantic-release/commit-analyzer",
"@semantic-release/release-notes-generator",
["@semantic-release/github", { "draftRelease": true }]
```

Two-step release job (mint a short-lived GitHub App installation token first; see Homebrew Tap):

```yaml
- uses: actions/create-github-app-token@<full-sha> # v3.2.0
  id: release-bot
  with:
    client-id: ${{ vars.RELEASE_APP_CLIENT_ID }}
    private-key: ${{ secrets.RELEASE_APP_PRIVATE_KEY }}
    owner: <org>
    repositories: |
      homebrew-tap
    permission-contents: write

- uses: cycjimmy/semantic-release-action@<full-sha> # v6.0.0
  id: release
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

- name: Detect release tag at HEAD
  id: tag
  run: |
    if tag="$(git describe --exact-match --tags HEAD 2>/dev/null)"; then
      echo "tag=$tag" >> "$GITHUB_OUTPUT"
      echo "present=true" >> "$GITHUB_OUTPUT"
    else
      echo "present=false" >> "$GITHUB_OUTPUT"
    fi

- name: Inspect GitHub Release state
  if: steps.tag.outputs.present == 'true'
  id: release-state
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    RELEASE_TAG: ${{ steps.tag.outputs.tag }}
  run: |
    endpoint="repos/${GITHUB_REPOSITORY}/releases/tags/${RELEASE_TAG}"
    error_file="${RUNNER_TEMP}/release-state-error"
    if release_json="$(gh api "$endpoint" 2>"$error_file")"; then
      echo "exists=true" >> "$GITHUB_OUTPUT"
      echo "published=$(jq -r '(.draft == false)' <<<"$release_json")" >> "$GITHUB_OUTPUT"
    elif grep -q '(HTTP 404)' "$error_file"; then
      echo "exists=false" >> "$GITHUB_OUTPUT"
      echo "published=false" >> "$GITHUB_OUTPUT"
    else
      cat "$error_file" >&2
      exit 1
    fi

- name: Backfill missing draft for the trusted tag
  if: steps.tag.outputs.present == 'true' && steps.release-state.outputs.exists == 'false'
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    RELEASE_TAG: ${{ steps.tag.outputs.tag }}
  run: gh release create "$RELEASE_TAG" --draft --verify-tag --generate-notes

- if: steps.tag.outputs.present == 'true' && steps.release-state.outputs.published != 'true'
  uses: goreleaser/goreleaser-action@<full-sha> # v7.2.3
  with:
    version: v2.17.1
    args: release --clean
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    HOMEBREW_TAP_TOKEN: ${{ steps.release-bot.outputs.token }}

- if: steps.tag.outputs.present == 'true' && steps.release-state.outputs.published != 'true'
  uses: actions/attest@<full-sha> # v4.2.2
  with:
    subject-path: 'dist/*.tar.gz,dist/*.zip'

- if: steps.tag.outputs.present == 'true' && steps.release-state.outputs.published != 'true'
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    RELEASE_TAG: ${{ steps.tag.outputs.tag }}
  run: gh release edit "$RELEASE_TAG" --draft=false

- if: steps.tag.outputs.present == 'true'
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    RELEASE_TAG: ${{ steps.tag.outputs.tag }}
  run: |
    release_json="$(gh api "repos/${GITHUB_REPOSITORY}/releases/tags/${RELEASE_TAG}")"
    jq -e '.draft == false and .immutable == true' <<<"$release_json"
    gh release verify "$RELEASE_TAG"
```

- Prefer an org-owned release GitHub App over a long-lived `TAP_GITHUB_TOKEN`
  PAT when publishing to a sibling Homebrew tap. Mint this token for the tap
  repository only; use the workflow's source-repository token for source
  Release operations and readback.
- For every `homebrew_casks` entry that writes to the tap, set
  `commit_author.use_github_app_token: true`. GoReleaser then omits the
  committer field so GitHub signs the commit as the App. Do not set custom bot
  identity fields; attribution is not a signature.
- Add `id-token: write`, `attestations: write`, and `artifact-metadata: write`
  to the job's `permissions:` for new `actions/attest` integrations.
- `--clean` wipes `dist/` before building so a previous run cannot poison the new release.
- Configure GoReleaser's `release` block with `draft: true`,
  `use_existing_draft: true`, `mode: keep-existing`, and
  `replace_existing_artifacts: true`. Resolve `steps.tag` and
  `steps.release-state` from the exact tag at `HEAD` plus a Releases API probe
  that distinguishes a confirmed 404 from other failures; this makes draft
  recovery and already-published retries explicit.
- Gate downstream tap, deployment, and parity work on that durable exact-tag
  state, not only a transient publisher output. A later recovery run must be
  able to reconcile missing downstream state without mutating the published
  immutable Release.
- Build and upload release artifacts from the release tag or verified release commit. If a workflow intentionally promotes an existing artifact, require recorded provenance: source commit, tag, build number/version, artifact digest, and producing workflow run.
- If a later deploy job needs the released bits, download them from the published GitHub Release, registry, image digest, or provider-native package. Do not re-upload the release payload as a GitHub Actions artifact just to bridge release and deploy jobs.

## Rust

Two flavors depending on whether you publish to crates.io. Both pair with
**[`cargo-dist`](https://axodotdev.github.io/cargo-dist/)** for cross-platform
binaries and installer generation.

### Flavor A — CLI without crates.io (Homebrew/binaries only)

Let semantic-release decide the version and create a signed manifest update plus
tag. Let cargo-dist's generated tag workflow be the **only** GitHub Release and
asset owner. If semantic-release publishes the GitHub Release first, immutable
release policy prevents cargo-dist from uploading its binaries.

Plugins:

```json
"@semantic-release/commit-analyzer",
"@semantic-release/release-notes-generator",
["@semantic-release/exec", {
  "prepareCmd": "./scripts/prepare-release.sh ${nextRelease.version}"
}],
["@jno21/semantic-release-github-commit", {
  "files": ["Cargo.toml", "Cargo.lock"],
  "commitMessage": "chore(release): ${nextRelease.version} [skip ci]"
}]
```

Do not add `@semantic-release/github`: semantic-release core creates the tag,
then cargo-dist creates the GitHub Release with its complete artifact set.
`prepare-release.sh` must update the applicable Cargo package/workspace version
and lockfile deterministically; use release-plz instead when independent
workspace versions make that script ambiguous.

Semantic-release job:

```yaml
- uses: dtolnay/rust-toolchain@<full-sha> # stable
- uses: cycjimmy/semantic-release-action@<full-sha> # v6.0.0
  id: release
  with:
    extra_plugins: |
      @semantic-release/exec@<exact-version>
      @jno21/semantic-release-github-commit@1.0.1
  env:
    GITHUB_TOKEN: ${{ steps.release-bot.outputs.token }}
```

- No `CARGO_REGISTRY_TOKEN` needed — nothing publishes to crates.io.
- `cargo-dist` is a CLI and generated workflow system, not a maintained GitHub Action. Do not use stale `axodotdev/cargo-dist-action` snippets.
- Run `dist init` or `dist generate` so cargo-dist owns the tag-triggered
  workflow. That generated workflow should cover plan, build, host, publish,
  and announce; do not replace it with only `dist build`, which leaves
  artifacts local to the runner.
- `dist init` writes the current dist configuration. Set
  `tap = "<org>/homebrew-tap"` and include `"homebrew"` in `installers`.
- Cargo-dist's built-in `publish-jobs = ["homebrew"]` currently ends with an
  ordinary local `git commit` and `git push`. When the tap requires verified
  commits, keep Homebrew installer generation, disable that publisher, and add
  a custom reusable job such as
  `post-announce-jobs = ["./publish-homebrew"]`. Post-announce jobs are
  guaranteed to run after cargo-dist has created the complete GitHub Release.
  The custom job must verify that exact Release is published and immutable,
  download its formula/assets, and use the narrow signed API fallback. Give the
  reusable workflow a validated `workflow_dispatch` recovery path so a missing
  tap update can be repaired without rerunning or mutating the Release.
- Default targets: `x86_64-unknown-linux-gnu`, `aarch64-apple-darwin`, `x86_64-apple-darwin`, `x86_64-pc-windows-msvc`. Add `x86_64-unknown-linux-musl` for static Linux; `aarch64-unknown-linux-gnu` for ARM64 Linux.
- `cargo-binstall` works out of the box — cargo-dist follows binstall's naming conventions.
- Simpler alternative if you don't need installers or Homebrew: `taiki-e/upload-rust-binary-action@<full-sha> # v1.30.2` in a matrix job.

### Flavor B — Library or dual-distribution (crates.io)

When you do publish to crates.io, swap semantic-release for
**[`release-plz`](https://release-plz.dev/)**. It understands `Cargo.toml`,
handles workspaces, runs `cargo publish` in dependency order, and generates
`CHANGELOG.md`.

```yaml
permissions:
  contents: read
  id-token: write

- uses: actions/create-github-app-token@<full-sha> # v3.2.0
  id: release-bot
  with:
    client-id: ${{ vars.RELEASE_APP_CLIENT_ID }}
    private-key: ${{ secrets.RELEASE_APP_PRIVATE_KEY }}
    owner: <org>
    repositories: <repo>
    permission-contents: write
    # Release PR job only; omit from the release-only job.
    permission-pull-requests: write

- uses: dtolnay/rust-toolchain@<full-sha> # stable
- uses: release-plz/action@<full-sha> # v0.5.129
  env:
    GITHUB_TOKEN: ${{ steps.release-bot.outputs.token }}
```

- Prefer crates.io trusted publishing: configure this repository/workflow as a
  trusted publisher, grant `id-token: write`, and omit
  `CARGO_REGISTRY_TOKEN`. Use a narrowly scoped registry token only when the
  target registry cannot use trusted publishing.
- Default mode opens a Release PR that bumps `Cargo.toml`, `Cargo.lock`, and
  changelogs. Merging it lets `release-plz release` publish the checked-in
  crate version and create the tag; it does not push another version commit to
  the default branch.
- A library-only release may keep the default `git_release_enable = true` when
  release-plz is the sole owner of a metadata-only GitHub Release.
- For dual distribution, set `git_release_enable = false` and keep
  `git_tag_enable = true` in `release-plz.toml`. Release-plz publishes crates.io
  and creates the tag; cargo-dist alone creates the GitHub Release and uploads
  binary assets. Leaving GitHub Release creation enabled in both tools is
  incompatible with immutable releases.
- Workspace repos: release-plz handles per-crate independent versioning
  natively via `[[package]]` blocks in `release-plz.toml`.
- Pass the scoped App token to both the Release PR and release jobs when their
  PR, push, release, or tag events must start another workflow. Events created
  with the repository's default `GITHUB_TOKEN` do not start those runs; in a
  dual-distribution flow that would publish crates.io and the tag without ever
  starting cargo-dist. Scope the App to this repository and the minimum
  permissions required by each release-plz job. Keep the workflow's default
  token read-only. The Release PR job needs App Contents and Pull requests
  write; the release-only job needs App Contents write but no Pull requests
  permission.

### Caveats

- Do **not** mix `release-plz` with a semantic-release writeback plugin — pick one version manager. Semantic-release does not understand `Cargo.toml` lockfile semantics.
- Commit `Cargo.lock` for CLI repos (reproducible binary builds); keep it ignored only for pure libraries that explicitly need it.
- crates.io publishes are immutable — a botched version cannot be re-pushed, only yanked. Validate via `release-plz update --dry-run` on a topic branch before the first release.

## Homebrew Tap

A Homebrew tap is a separate GitHub repo named `homebrew-<tap>` (the `homebrew-` prefix is required) containing Ruby casks under `Casks/` or legacy/source formulae under `Formula/`. End users install with `brew tap <org>/<tap>` then `brew install <name>`. The release pipeline keeps that package definition current.

### Cross-repo token

Whichever flow you pick, you need a token that can push to the tap repo from the source repo's release workflow. The default `GITHUB_TOKEN` is scoped to the source repo only.

Preferred setup:

- Use an organization-owned release GitHub App.
- Store `RELEASE_APP_CLIENT_ID` as a `release` Environment variable and
  `RELEASE_APP_PRIVATE_KEY` as a `release` Environment secret.
- Mint a short-lived installation token with SHA-pinned `actions/create-github-app-token`.
- Mint separate installation tokens per write destination. A tap publisher's
  token names only `homebrew-tap` with `permission-contents: write`; source
  release state is read with the workflow's source-repository token. When a
  source write truly needs the App, mint a separate source-only token with only
  the permissions required by that source job.
- Let GoReleaser sign its own tap commit with
  `commit_author.use_github_app_token: true`. For a publisher without a native
  signed-commit path, generate the file without committing it, then use the
  narrow signed API fallback from `release-workflows.md`.
- Use `gh auth setup-git` only for tag or ref operations that still require Git
  transport; the signed API commit does not need it.

Do not introduce org-wide long-lived `TAP_GITHUB_TOKEN` PATs for new work. Retire existing PAT consumers after an App-backed path has live release proof.

### Flow A — GoReleaser auto-update

GoReleaser can write and sign the tap update directly. For new configurations,
use `homebrew_casks`; `brews` is deprecated.

```yaml
homebrew_casks:
  - name: <cli-name>
    repository:
      owner: <org>
      name: homebrew-tap
      token: "{{ .Env.HOMEBREW_TAP_TOKEN }}"
    commit_author:
      use_github_app_token: true
    commit_msg_template: "chore(<cli-name>): update to {{ .Tag }}"
    homepage: "https://github.com/<org>/<repo>"
    description: "<one-line description>"
    license: "MIT"
    url:
      verified: "github.com/<org>/<repo>/"
```

Pass the source repository's workflow token as `GITHUB_TOKEN` and a separately
minted tap-only App token as `HOMEBREW_TAP_TOKEN`. GoReleaser v2.13 or newer
then creates the tap commit through GitHub without custom identity fields,
allowing GitHub to sign it as the App. No extra runner, formula renderer, or
commit action is needed. Migrate existing `brews` configurations using
GoReleaser's deprecation guidance instead of copying them into new repos.

With immutable GitHub releases, keep GoReleaser's release as a draft until its
artifact and tap publishers finish, verify the generated artifacts, then
publish explicitly. A rerun after publication must skip GoReleaser and resume
only downstream smoke checks; otherwise it will attempt to replace immutable
assets.

### Flow B — Non-Go CLI (Node, Ruby, etc.)

First check whether the org already has a non-Go CLI publishing to the same tap. Reuse its formula-generation shape, but audit its commit implementation before copying it. Actions that end with ordinary `git commit` and `git push` are incompatible with required-signature rules unless they create a real cryptographic signature.

For a signature-enforced tap, use a dependent Linux job after the release is published and immutable:

```yaml
- uses: actions/create-github-app-token@<full-sha> # v3.2.0
  id: release-bot
  with:
    client-id: ${{ vars.RELEASE_APP_CLIENT_ID }}
    private-key: ${{ secrets.RELEASE_APP_PRIVATE_KEY }}
    owner: <org>
    repositories: |
      homebrew-tap
    permission-contents: write

- uses: actions/checkout@<full-sha> # v7.0.1
  with:
    repository: <org>/homebrew-tap
    token: ${{ steps.release-bot.outputs.token }}
    path: homebrew-tap
    persist-credentials: false
    ref: main

- name: Generate formula or cask
  run: <deterministically update homebrew-tap/Formula/<cli-name>.rb>

- name: Commit signed tap update
  uses: planetscale/ghcommit-action@a6b150b81dca5dd027baa898604418eec9e11465 # v0.2.22
  with:
    commit_message: "<cli-name> ${{ needs.release.outputs.version }}"
    repo: <org>/homebrew-tap
    branch: main
    file_pattern: Formula/<cli-name>.rb
    repository: homebrew-tap
  env:
    GITHUB_TOKEN: ${{ steps.release-bot.outputs.token }}
```

- Compute checksums from the exact immutable release assets consumed by the formula or cask.
- For a Node CLI distributed via npm rather than a GitHub release archive, write a custom formula that uses `Language::Node::Shebang` and a `resource` block.
- Formula-generation actions and commands that end with ordinary `git commit`
  and `git push` must not own the final commit on a signature-enforced tap.
- Read back the tap's new default-branch commit and require `verification.verified: true`; checking only the source repository's release run is incomplete.

### Tap repo conventions

- Keep casks under `Casks/` and legacy/source formulae under `Formula/`.
- Add a CI job to the tap repo that runs `brew audit --online --formula …` and
  `brew audit --online --cask …` (casks need `--cask`). Prefer not to use
  `--strict` for GoReleaser-generated formulae: the generator always emits
  `version`, which GitHub release URLs already encode, and `--strict` rejects
  that as redundant.
- Pin the tap to a release branch only if you need staged rollouts. Default to publishing straight to `main`.
- A tap update commit is itself a release event for users. Let the tap's audit
  CI run by default. Add `[skip ci]` only when the tap's push workflow would
  recurse and skipping it does not suppress useful package verification.

## GitHub Action (Marketplace)

A composite or JS action is "published" by tagging — the marketplace pulls from tags. No registry push.

Plugins:

```json
"@semantic-release/commit-analyzer",
"@semantic-release/release-notes-generator",
["@semantic-release/exec", {
  "prepareCmd": "./scripts/prepare-release.sh ${nextRelease.version}"
}],
["@jno21/semantic-release-github-commit", {
  "files": ["package.json", "package-lock.json"],
  "commitMessage": "chore(release): ${nextRelease.version} [skip ci]"
}],
"@semantic-release/github"
```

- Pin `@jno21/semantic-release-github-commit@1.0.1` in the workflow, provide
  the App token as `GITHUB_TOKEN`, and omit custom author/committer fields so
  GitHub signs the source writeback. Version files must already exist and be
  regular non-executable files.
- Do not use a generated-tree glob such as `dist/**` with plugin v1.0.1. It
  cannot record deleted paths and writes every matched path as mode `100644`,
  which can retain removed bundles or corrupt executable/symlink modes. Build
  and commit `dist/` during the pull request, and make verification rebuild it
  and require `git diff --exit-code -- dist`. If release-time generation truly
  changes a tree, use a reviewed API commit implementation that preserves
  deletions and Git modes.
- A moving major tag (`@v1`) is intentionally mutable and separate from the
  immutable release tag (`v1.2.3`). Updating the major tag still needs a scoped
  release credential permitted by tag rules; commit-signature enforcement does
  not sign or freeze that tag.
- For a moving major tag (`@v1` always pointing at the latest `v1.x.y`), use a maintained semantic-release plugin or a tiny repo-owned release action. Do not paste tag parsing and force-push shell into workflow YAML.

  ```yaml
  - if: steps.release-state.outputs.published == 'true'
    uses: ./.github/actions/update-major-action-tag
    with:
      version: ${{ steps.release-state.outputs.version }}
  ```

  Derive `release-state` from the exact trusted tag and GitHub Release, not only
  semantic-release's transient output. The local action should idempotently
  update `v<major>` to the release commit and push it with the release token. A
  recovery run must repair a missing major tag after publication. If a
  maintained semantic-release major-tag plugin fits the repo, prefer that.

- The action's `action.yml` `runs:` block must reference the **bundled**
  entrypoint (`dist/index.js`), not a TypeScript source file. Build and commit
  `dist/` during the pull request; verification must rebuild it and fail on a
  diff before the release tag is created.

## Monorepo (Node)

One semantic-release run per package, each with its own `.releaserc.json` and tag prefix:

```json
{
  "tagFormat": "<package-name>-v${version}",
  "branches": ["main"]
}
```

Workflow:

```yaml
- uses: cycjimmy/semantic-release-action@<full-sha> # v6.0.0
  with:
    working_directory: packages/<package-name>
```

- Tag prefix prevents collisions when multiple packages release independently.
- For coordinated releases across packages, prefer changesets or release-please; this pipeline pattern targets independent per-package releases.
