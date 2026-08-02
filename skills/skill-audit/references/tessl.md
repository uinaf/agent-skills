# Tessl Audit Commands

Use the repo wrappers when present; they own the locked Tessl version and batch
behavior.

```bash
./scripts/review.sh
```

For a formal single-skill audit or a repo without wrappers, use its locked,
repository-local Tessl executable:

```bash
skill_dir="skills/<name>"
pnpm exec tessl plugin lint "$skill_dir"
pnpm exec tessl review run --workspace uinaf --threshold 0 --json "$skill_dir"
```

Capture the score, summary, and concrete suggestions before proposing edits.
Prefer per-skill `--json` for a narrow or structured loop. If the repo does not
own Tessl yet, add an exact development dependency and lockfile entry or follow
its existing tool-version policy. Do not let `dlx`, `npx`, or another fallback
silently resolve the latest release. Use the
[CLI documentation](https://docs.tessl.io/reference/cli-commands) for setup.

Use optimization only when explicitly requested:

```bash
./scripts/optimize.sh <name>
```

If the repo has no optimizer wrapper, use the same locked executable:

```bash
pnpm exec tessl skill review --optimize --yes --max-iterations 1 skills/<name>
```
