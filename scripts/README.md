# Skill Evaluation

Use the repository wrappers for Tessl review and optimization. The exact CLI is
installed from `devDependencies` and locked by `pnpm-lock.yaml`; the wrappers
own the workspace and quality threshold.

## Verify the repository

Run the local gate without pulling repositories or changing globally installed
skills:

```bash
pnpm install --frozen-lockfile
pnpm run verify
```

The gate expects ShellCheck on `PATH`. It typechecks the scripts, lints shell
and workflow files, runs helper tests, and validates each Tessl plugin.

## Review

Run a read-only plugin lint plus quality review across every local skill:

```bash
./scripts/review.sh
```

By default, authenticated review uses the `uinaf` workspace and requires a
score of 100. The lockfile pins the CLI; Tessl still owns the remote review
service. Override `TESSL_WORKSPACE` or `TESSL_THRESHOLD` only for deliberate
diagnostics.

CI has two trust-aware lanes:

- Pull requests run `pnpm run verify` without `TESSL_TOKEN`, so untrusted code
  gets the same deterministic local checks and plugin structure validation.
- The trusted publish workflow runs `pnpm run verify:skills` through the GitHub
  `release` environment. This is the exact local release command and performs
  one authenticated 100-point portfolio review before publishing.

Set `TESSL_REVIEW_MODE=lint` to force the pull-request lane locally. If `CI` is
set and `TESSL_TOKEN` is absent, the wrapper also falls back to lint mode.

For structured output from one package, use the locked CLI directly;
`scripts/review.sh` intentionally reviews the whole portfolio and rejects
`--json`:

```bash
pnpm exec tessl review run --json --workspace uinaf --threshold 100 skills/verify
```

## Impact evals

Eval scenarios live under each skill's `evals/` directory. Generate missing scenarios with Tessl and merge them into the target skill:

```bash
pnpm exec tessl scenario generate --workspace uinaf --count 3 skills/<skill-name>
pnpm exec tessl scenario download --output skills/<skill-name>/evals --strategy merge <generation-id>
```

Run plugin impact evals from a skill directory when validating score-impact changes:

```bash
pnpm exec tessl eval run --quality-check skills/<skill-name>
```

Publishing is documented separately in [Distribution](../docs/distribution.md).

## Optimize

Apply Tessl's optimizer to one skill at a time:

```bash
./scripts/optimize.sh verify
```

The optimizer mutates one package. Inspect its diff before keeping the result.

## Workflow

1. Edit the skill
2. Run `pnpm run verify:skills`
3. If the score or suggestions are weak, optimize one skill or apply the
   feedback manually.
4. Inspect the diff and rerun both gates.

The canonical plugin metadata is `skills/<name>/.tessl-plugin/plugin.json`.
