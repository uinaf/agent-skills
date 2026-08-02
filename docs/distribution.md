# Distribution

This repo publishes each skill as its own public Tessl plugin in the `uinaf` workspace.

## Plugin names

Do not maintain a hardcoded list here. The source of truth is the `name` field in each `skills/*/.tessl-plugin/plugin.json`.

To inspect the current published plugin names locally:

```bash
jq -r '.name' skills/*/.tessl-plugin/plugin.json
```

## Publish flow

1. `.github/workflows/publish-skills.yml` runs the secretless repository gate.
2. Authenticated review requires a score of 100 through the `release`
   Environment.
3. On pushes to `main`, `scripts/publish.sh` lints and publishes only changed
   plugins. A manual run on `main` publishes every plugin; other refs stop after
   the secretless gate.
4. Publishing defaults to a patch bump. Set `TESSL_PUBLISH_BUMP=minor` or
   `major` only for an intentional release change.
5. After publishing, `github-actions[bot]` writes the updated plugin versions
   back to `main` with the workflow `GITHUB_TOKEN` and a skip-CI commit.

Review and publish jobs skip version-writeback commits. Publishing uses
non-cancellable concurrency so version probing and writeback cannot race.
Publish-path actions are pinned to full commit SHAs with same-line version
comments for maintenance tooling.

Both jobs install the frozen pnpm lockfile and invoke the exact Tessl
`devDependency` through `pnpm exec tessl`.

## Required GitHub Environment

Configure a GitHub Environment named `release`:

- Do not add required reviewers; releases should stay continuously publishable after the review job passes on `main`
- Limit Environment deployment branches to `main`
- Store the Tessl publish token as the Environment secret `TESSL_TOKEN`; do not store it as a plain repository Actions secret
- Use workflow `GITHUB_TOKEN` writeback and do not enable branch push restrictions; GitHub's built-in `github-actions[bot]` actor is not a normal allowed-user entry. Repos that require push restrictions should use a narrowly scoped GitHub App release actor instead of a personal publish bot.
- Protect `main` with force-push and branch deletion blocked where GitHub supports those controls

Create a Tessl API key for the `uinaf` workspace, then add it to the `release` Environment as `TESSL_TOKEN`. Use a `uinaf` workspace key, not a token from another Tessl workspace.

You can create the key either from the Tessl web UI or with the CLI:

```bash
pnpm exec tessl api-key create --workspace uinaf --name github-actions-publish --role publisher
```

The workflows still reference the token as `${{ secrets.TESSL_TOKEN }}`; GitHub resolves that value from the `release` Environment only for jobs that declare `environment: release`. Pull-request jobs do not declare the environment and force lint mode instead.

## Dry-run one plugin

```bash
TESSL_DRY_RUN=true ./scripts/publish.sh skills/verify
```

The wrapper uses the same CLI, workspace, lint, and bump defaults as the hosted
publish path.
