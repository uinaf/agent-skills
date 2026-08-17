# Distribution

This repo publishes each skill as its own public Tessl plugin in the `uinaf` workspace.

## Plugin names

Do not maintain a hardcoded list here. The source of truth is the `name` field in each `skills/*/.tessl-plugin/plugin.json`.

To inspect the current published plugin names locally:

```bash
jq -r '.name' skills/*/.tessl-plugin/plugin.json
```

## Publish flow

1. `.github/workflows/publish-skills.yml` runs the free repository gate
   (`pnpm run verify`: typecheck, shell/action lint, tests, `tessl plugin lint`).
   CI does not run credit-burning Tessl cloud review.
2. On pushes to `main`, `scripts/publish.sh` lints and publishes only changed
   plugins without running or uploading registry eval scenarios. This keeps the
   automatic lane credit-free; eval fixtures remain canonical in Git. A manual
   `workflow_dispatch` on `main` publishes every plugin with the same policy.
3. Publishing defaults to a patch bump. Set `TESSL_PUBLISH_BUMP=minor` or
   `major` only for an intentional release change.
4. After publishing, the release bot writes updated plugin versions back to
   `main` with a skip-CI commit. Writeback also runs after a publish error, but
   not after cancellation, so a version that reached the registry cannot remain
   ahead of the repository. The publish job still fails and reports the
   underlying error.

Publish uses non-cancellable concurrency so version probing and writeback cannot
race. Publish-path actions are pinned to full commit SHAs with same-line version
comments.

Both jobs install the frozen pnpm lockfile. Publish invokes the exact Tessl
`devDependency` through `pnpm exec tessl`.

For an intentional 100-point Tessl cloud score before a sensitive skill change,
run `pnpm run verify:skills` locally (changed skills) or
`TESSL_REVIEW_ALL=true pnpm run review:skills` for the portfolio. See
[Skill evaluation](../scripts/README.md).

To publish one plugin with its eval scenarios when credits are intentionally
available, run `./scripts/publish.sh skills/<name>` locally. The hosted workflow
sets `TESSL_PUBLISH_SKIP_EVALS=true`; the wrapper's local default is false.

Fleet inventory, monthly free lint, and the ban on scheduled cloud review live
in [Skill fleet](skill-fleet.md).

## Required GitHub Environment

Configure a GitHub Environment named `release` for the **publish** job only:

- Do not add required reviewers; releases should stay continuously publishable after `pnpm run verify` passes on `main`
- Limit Environment deployment branches to `main`
- Store the Tessl publish token as the Environment secret `TESSL_TOKEN`; do not store it as a plain repository Actions secret
- Use a GitHub App release actor for version-writeback when branch push restrictions require an allowed actor
- Protect `main` with force-push and branch deletion blocked where GitHub supports those controls

Create a Tessl API key for the `uinaf` workspace, then add it to the `release` Environment as `TESSL_TOKEN`. Use a `uinaf` workspace key, not a token from another Tessl workspace.

```bash
pnpm exec tessl api-key create --workspace uinaf --name github-actions-publish --role publisher
```

The publish job references `${{ secrets.TESSL_TOKEN }}` from the `release`
Environment. The quality job and pull-request workflow do not declare that
environment and never call cloud review.

## Dry-run one plugin

```bash
TESSL_DRY_RUN=true ./scripts/publish.sh skills/gh-setup
```

The wrapper uses the same CLI, workspace, lint, and bump defaults as the hosted
publish path.
