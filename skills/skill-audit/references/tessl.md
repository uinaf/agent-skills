# Tessl Audit Commands

Tessl is preferred evidence, not a prerequisite for auditing. Use the repo
wrappers when present; they own the locked version and batch behavior.

## Detect the Available Path

Use this precedence:

1. repository review or validation wrapper
2. repository package script that invokes a locked Tessl dependency
3. locked repository-local Tessl executable
4. manual fallback

Do not use `dlx`, `npx`, a global executable, or another implicit latest-version
fallback. Do not add a dependency, configure a workspace, spend credits, or
start an authentication flow unless the user explicitly requested setup.

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
Prefer per-skill `--json` for a narrow or structured loop.

## Fall Back Explicitly

Fall back when Tessl is absent, has no repository-owned configuration, lacks
authentication, cannot reach its service, has exhausted its usable quota, or
fails before producing review evidence.

1. Record the attempted repository-owned command and the shortest exact failure
   that identifies the boundary. Do not repeatedly retry the same unavailable
   surface.
2. If the locked binary can still run local plugin lint without the failed
   remote capability, run that lint. Otherwise skip it.
3. Run existing repository checks for frontmatter, links, file shape, scripts,
   metadata, and eval structure. Do not invent a replacement command when the
   repo has none.
4. Apply [scorecard.md](scorecard.md) manually to the actual files. Cite each
   blocker or major finding by file and section, and grade every audit dimension
   `strong`, `mixed`, or `weak`.
5. Report `Tessl unavailable: <reason>; manual fallback used`. Do not report a
   numeric Tessl score or convert qualitative grades into one.

After edits, repeat the same available checks and manual scorecard. If the repo
requires Tessl for publication, the audit may be complete while publish
readiness remains unverified or blocked.

Use optimization only when explicitly requested:

```bash
./scripts/optimize.sh <name>
```

If the repo has no optimizer wrapper, use the same locked executable:

```bash
pnpm exec tessl skill review --optimize --yes --max-iterations 1 skills/<name>
```

If Tessl is unavailable, optimization is unavailable too. Do not substitute an
unversioned optimizer or describe ordinary manual edits as optimizer output.
