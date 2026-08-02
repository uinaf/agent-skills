# Skill Evaluation

This repo uses Tessl as the evaluation loop for skill quality, clarity, self-activation, and impact scenarios.

## Sync

The public entrypoint remains a small compatibility wrapper around the typed
Node 24 implementation in `sync/sync.ts`:

```bash
./scripts/sync/sync.sh
```

Run the canonical local gate without pulling repositories or changing globally
installed skills:

```bash
pnpm install --frozen-lockfile
pnpm run verify
```

The gate expects ShellCheck on `PATH`; actionlint and the TypeScript toolchain
are installed from the lockfile. It runs the TypeScript, shell, workflow, sync,
autoreview, and Tessl plugin checks used by CI.

The sync tests use an isolated fixture runtime. They prove that every manifest
skill is attempted, installer failures are reported together, a partial failure
exits nonzero, invalid manifests fail before rule mutation, local overrides are
included, managed links are replaced, and unmanaged global rule files are left
untouched. CI runs the same verification command on pull requests and pushes to
`main`.

Sync refuses linked worktrees, non-`main` branches, tracked or staged changes,
and local `main` commits not published to the configured upstream before
changing global agent state. Ignored local/generated rule files remain allowed.
It preflights both global rule destinations and replaces only absent paths or
symlinks already managed by this checkout. Installer failures include a bounded
diagnostic with common credential-shaped values redacted.

## Review

Run a read-only plugin lint plus quality review across every local skill:

```bash
./scripts/skills/review.sh
```

By default this enforces `--threshold 100` in the `uinaf` workspace. Override
the workspace or CLI version only for deliberate diagnostics; the canonical
authoring and publication gate remains 100.
The wrapper defaults to an exact Tessl CLI version so the same commit uses the
same evaluator. Set `TESSL_CLI_VERSION=<version>` to test a deliberate upgrade.

CI has two trust-aware lanes:

- Pull requests run `pnpm run verify` without `TESSL_TOKEN`, so untrusted code
  gets the same deterministic local checks and plugin structure validation.
- The trusted publish workflow runs `pnpm run verify:skills` through the GitHub
  `release` environment. This is the exact local release command and performs
  one authenticated 100-point portfolio review before publishing.

Set `TESSL_REVIEW_MODE=lint` to force the pull-request lane locally. If `CI` is
set and `TESSL_TOKEN` is absent, the wrapper also falls back to lint mode.

Useful direct invocations:

```bash
pnpm dlx tessl@0.94.0 review run --workspace uinaf --threshold 100 skills/autoreview
pnpm dlx tessl@0.94.0 review run --json --workspace uinaf --threshold 100 skills/verify
pnpm dlx tessl@0.94.0 plugin lint skills/vite-plus
```

Use per-skill `--json` output directly with Tessl rather than `skills/review.sh`, because the batch wrapper emits one review per skill.

## Impact evals

Eval scenarios live under each skill's `evals/` directory. Generate missing scenarios with Tessl and merge them into the target skill:

```bash
tessl scenario generate --workspace uinaf --count 3 skills/<skill-name>
tessl scenario download --output skills/<skill-name>/evals --strategy merge <generation-id>
```

Run plugin impact evals from a skill directory when validating score-impact changes:

```bash
tessl eval run --quality-check skills/<skill-name>
```

`scripts/skills/publish.sh` publishes with `tessl plugin publish --bump patch` by default. Set `TESSL_SCENARIO_QUALITY_CHECK=true` only when Tessl's scenario-quality workflow is healthy enough to be a publish gate.

## Optimize

Apply Tessl's optimizer to one skill at a time:

```bash
./scripts/skills/optimize.sh verify
```

Direct form:

```bash
pnpm dlx tessl@0.94.0 skill review --optimize --yes --max-iterations 1 skills/verify
```

## Suggested workflow

1. Edit the skill
2. Run `pnpm run verify:skills`
3. If the score or suggestions are weak, run Tessl optimize on a single skill or apply the feedback manually
4. Re-run review and inspect the diff before keeping any optimizer changes

## Notes

- `pnpm run verify:skills` is the canonical local and trusted-remote skill gate
- `scripts/skills/review.sh` is the scored portfolio-review component of that gate
- `scripts/skills/optimize.sh` applies mutations, so run it intentionally and inspect the resulting diff
- Prefer optimizing one skill at a time rather than churning the whole repo at once
- PR CI runs the deterministic `pnpm run verify` subset without secrets; the
  trusted publish workflow runs the complete `pnpm run verify:skills` command
- Skill packages use `.tessl-plugin/plugin.json`; do not reintroduce `tile.json`
