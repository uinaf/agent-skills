# Troubleshooting

Common failure modes when standing up or operating this pipeline. Check here before rewriting the workflow.

## Release ran but produced no version

- Likely cause: no commits since the last tag matched a release-bumping type (`feat:`, `fix:`, breaking). `chore:`/`docs:`/etc. are no-ops by default.
- Verify: `npx semantic-release --dry-run --no-ci` from the release branch. The output lists analyzed commits and the decision.
- Fix: either land a `feat:` / `fix:` commit, or extend `commit-analyzer` `releaseRules` to bump on the type you care about.

## Bump commit triggers a second release (infinite loop)

- Cause: the `[skip ci]` guard is missing on the release job's `if:`, or the bump message no longer contains `[skip ci]`.
- Check: open the bump commit on `main`. Message must contain `[skip ci]`. Workflow must have `if: ${{ … !contains(github.event.head_commit.message, '[skip ci]') }}` on **both** verification and release jobs.

## GitHub commit plugin cannot write the release bump

- Cause: the semantic-release step has no App token, the App lacks `contents:
  write`, or branch rules do not allow the App to update the default branch.
- Verify: confirm `@jno21/semantic-release-github-commit@1.0.1` is installed,
  its options are `files` and `commitMessage`, and `GITHUB_TOKEN` on the release
  step is the minted App token.
- Fix: correct the App installation/repository scope or branch actor policy.
  Do not add Git credentials, a signing key, or a second commit job; this plugin
  writes through GitHub's API.

## A release path still pushes as `github-actions[bot]`

- Cause: a legacy local `git commit`/`git push` path remains, and checkout
  persisted the job's default token. Setting `GITHUB_TOKEN` later does not
  replace Git's configured credential.
- Verify: the failed operation is an actual Git push and names
  `github-actions[bot]`.
- Fix: replace source writebacks with the semantic-release GitHub commit plugin
  and GoReleaser tap updates with `use_github_app_token: true`. If a tag/ref
  operation still requires Git transport, set `persist-credentials: false` and
  configure only that operation with the scoped App token.

## Release bump exists but publication failed

- Cause: semantic-release completed its prepare/writeback phase, then a
  registry, asset, or release publication step failed.
- Verify the exact tag, GitHub Release state, registry/tap state, default-branch
  version, and commit signature before retrying.
- Do not assume a normal semantic-release rerun will resume publication after a
  tag exists. Use the state-specific backfill in
  [release workflows](release-workflows.md#partial-failure-recovery). Do not
  create a second version bump or delete an immutable release to make the run
  look clean.

## Tag created but no GitHub Release / no published artifact

- Cause: the GitHub Release or registry publisher failed after the tag was
  created, often because its credential was missing or rejected.
- Verify the exact tag target, commit signature, default-branch version,
  GitHub Release state, and registry state. Action logs may show "no GH token"
  or "ENEEDAUTH", but durable state decides recovery.
- Fix the credential for future releases, then run the state-specific backfill
  from [release workflows](release-workflows.md#partial-failure-recovery).
  Do not assume semantic-release will publish after it sees the existing tag.
  For npm, prefer trusted publishing: configure npm, grant `id-token: write`,
  and remove `NPM_TOKEN`; use a step-scoped `NPM_TOKEN` only when trusted
  publishing is unavailable.

## Release published but deploy is blocked by artifact quota

- Cause: the workflow publishes a real release artifact, then also uploads the same payload with `actions/upload-artifact` so a deploy job can download it. GitHub Actions artifact quota or retention can block deployment even though the release exists.
- Verify: the deploy handoff uses `actions/upload-artifact` / `actions/download-artifact`, and the release already has a GitHub Release asset, package version, image digest, or provider-native package.
- Fix: make deploy consume the durable release boundary directly. Download the GitHub Release asset, package registry package, image digest, or provider-native package, verify it, then promote it.

## Two releases racing produced duplicate tags or a dangling release

- Cause: the release job's concurrency group is missing or has `cancel-in-progress: true`.
- Fix: set `concurrency: { group: release-${{ github.repository }}-main, cancel-in-progress: false }` at the **job** level. The verification job's cancellable group is separate.

## Verification passes locally but fails on the bot's bump commit

- Cause: the verification job is not skipping `[skip ci]` commits and is re-running the suite on the bump.
- Fix: add the `[skip ci]` guard to the verification job too. The bot commit changes generated files (`CHANGELOG.md`, lockfiles); re-running verification on it is wasted CI minutes at best and a flake source at worst.

## Semantic-release computes the wrong version

- Cause: shallow checkout — semantic-release walks history, and `fetch-depth: 1` (the default) hides previous tags.
- Fix: `actions/checkout@<full-sha> # v6.0.2` with `fetch-depth: 0` on **both** verification and release jobs.

## npm publish fails with "ENEEDAUTH" or 403

- Trusted publishing mismatch: the npm package settings must name the GitHub owner, repo, workflow filename, and Environment exactly as the workflow runs.
- Use the npm CLI to register or repair the trusted publisher: `npx -y npm@^11.10.0 trust github <package-name> --repo <owner>/<repo> --file <workflow-file> --env <environment> --yes`.
- The release job must grant `id-token: write`, use a GitHub-hosted runner, and run a recent enough Node/npm toolchain for npm OIDC.
- For scoped packages on the public registry, `package.json` needs `"publishConfig": { "access": "public" }`.
- `package.json` needs a public `repository` URL matching the GitHub repo configured on npm.
- If trusted publishing is unavailable for the target, fall back to a granular package-scoped token stored in the `release` Environment and exposed only on the publish step.

## CocoaPods publish fails with "Unable to accept duplicate entry"

- The version was already pushed to trunk on a previous attempt that failed mid-flight. Trunk does not allow re-pushing the same version.
- Fix: bump the version (land another `feat:` / `fix:`), or `pod trunk delete <podname> <version>` (requires owner) and re-run.

## GoReleaser fails with "git is dirty"

- Generated files (`dist/`, `Package.swift` rewrite) leak into the working tree before goreleaser runs.
- Fix: ensure `goreleaser release --clean` flag is set, and that any pre-release script writes its output outside the working tree or stages it before goreleaser starts.

## GoReleaser tap commit is unsigned

- Cause: the `homebrew_casks` publisher omitted
  `commit_author.use_github_app_token: true`, used a pre-v2.13 GoReleaser, or
  supplied custom author/committer fields that prevented GitHub App signing.
- Fix: use a current GoReleaser, enable the native App-token option, remove
  custom identity fields, and read back the tap commit's
  `verification.verified` value after a real release.

## A rerun tries to replace immutable release assets

- Cause: the first run already published the release, but the retry entered the
  build/upload phase again.
- Fix: inspect the exact tag's release state before GoReleaser or any uploader.
  If it is already published, skip mutation and resume only registry, tap,
  deployment, smoke, and parity checks. Never delete or recreate the release as
  a retry mechanism.

## Marketplace consumers pinning `@v1` see no updates

- The moving major tag was not force-updated after the release.
- Fix: use a maintained semantic-release major-tag plugin, or a small repo-owned `update-major-action-tag` action/script with tests (see [release-targets.md](release-targets.md) -> GitHub Action). Verify by clicking the tag on the GitHub release page — it should match the latest `v1.x.y`.

## "GH_TOKEN env or githubToken provided" with semantic-release action v6

- v6 renamed some inputs. Preserve the repo's current full-SHA-pinned major when possible, and confirm token plumbing against that major before changing action versions.
