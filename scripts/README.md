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

Tessl has two lanes. Prefer the free one unless you need a numeric score:

| Command | Credits | Scope |
| --- | --- | --- |
| `pnpm run verify` / `TESSL_REVIEW_MODE=lint ./scripts/review.sh` | no | plugin lint for every skill |
| `./scripts/review.sh` / `pnpm run verify:skills` | yes | lint + authenticated review at 100 for **changed** skills |
| `TESSL_REVIEW_ALL=true ./scripts/review.sh` | yes | lint + authenticated review at 100 for the full portfolio |

```bash
# free structure lane
TESSL_REVIEW_MODE=lint ./scripts/review.sh

# review only skills changed vs origin/main (or CI before/sha)
./scripts/review.sh

# review one package
./scripts/review.sh skills/agent-readiness

# intentional full portfolio gate
TESSL_REVIEW_ALL=true ./scripts/review.sh
```

Authenticated review uses the `uinaf` workspace and requires score 100 for each
reviewed package. The lockfile pins the CLI; Tessl still owns the remote review
service. Override `TESSL_WORKSPACE` or `TESSL_THRESHOLD` only for deliberate
diagnostics. Do not burn portfolio credits for trivial one-skill edits.

CI stays on the free lint lane:

- Pull requests and main `Publish Skills` quality both run `pnpm run verify`
  (typecheck, shell/action lint, tests, `tessl plugin lint`). No cloud review.
- A monthly scheduled workflow also runs `pnpm run verify` only — never cloud
  review. See [Skill fleet](../docs/skill-fleet.md).
- Main still publishes changed plugins after that gate; Tessl registry publish
  uses `TESSL_TOKEN` in the publish job only and sets
  `TESSL_PUBLISH_SKIP_EVALS=true` so automatic publishing stays credit-free.
  Eval fixtures remain in Git; publish them locally only when a paid eval run is
  intentional.
- Run authenticated 100-point review locally with `pnpm run verify:skills` or
  `TESSL_REVIEW_ALL=true ./scripts/review.sh` when you intentionally want scores.
  Do not put that on a cron.

Set `TESSL_REVIEW_MODE=lint` to force the lint lane locally. If `CI` is set and
`TESSL_TOKEN` is absent, the wrapper also falls back to lint mode.

For structured output from one package, use the locked CLI directly;
`scripts/review.sh` rejects `--json`:

```bash
pnpm exec tessl review run --json --workspace uinaf --threshold 100 skills/agent-readiness
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
./scripts/optimize.sh agent-readiness
```

The optimizer mutates one package. Inspect its diff before keeping the result.

## Workflow

1. Edit the skill
2. Run `pnpm run verify` (free lint/structure gate; what CI runs)
3. Optionally run `pnpm run verify:skills` when you want a fresh local 100-point
   cloud score for changed skills
4. If the score or suggestions are weak, optimize one skill or apply the
   feedback manually; rerun the changed-skill review
5. Use `TESSL_REVIEW_ALL=true` only for an intentional portfolio audit

The canonical plugin metadata is `skills/<name>/.tessl-plugin/plugin.json`.
