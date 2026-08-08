# Tessl Audit Commands

Tessl is preferred evidence, not a prerequisite for auditing. Use the repo
wrappers when present; they own the locked version and batch behavior.

## Credit Tiers

Tessl has a free local lane and a credit-burning cloud lane. Do not spend org
credits on trivial audits.

| Surface | Credits | Use when |
| --- | --- | --- |
| `tessl plugin lint` | no | default for routine audits, structure checks, and every handoff |
| `tessl review run` | yes | publish readiness, explicit score asks, or after substantive `name` / `description` / workflow edits aiming for 100 |
| `tessl eval run` | yes | only when the user asks for impact evals |
| optimizer (`./scripts/optimize.sh` / `--optimize`) | yes | only when the user explicitly requests optimization |

Default loop:

```bash
skill_dir="skills/<name>"
pnpm exec tessl plugin lint "$skill_dir"
```

Escalate to authenticated review only when the mode requires a numeric score or
publish proof:

```bash
pnpm exec tessl review run --workspace uinaf --threshold 100 --json "$skill_dir"
```

Never run a full-portfolio cloud review for a one-skill tweak. Prefer the
changed-skill path from `./scripts/review.sh`. Use `TESSL_REVIEW_ALL=true` only
for an intentional portfolio gate. Publish readiness still means **100** for
every skill that is reviewed.

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
# free local structure lane (also used by pnpm run verify and CI)
TESSL_REVIEW_MODE=lint ./scripts/review.sh

# authenticated review of changed skills (100-point gate; local / intentional)
./scripts/review.sh

# intentional full portfolio review
TESSL_REVIEW_ALL=true ./scripts/review.sh
```

CI does not run cloud review. The monthly portfolio workflow is lint-only too.
Treat `pnpm run verify:skills` as a human-owned publish-readiness check when
credits and scores matter. Never schedule fleet-wide cloud review across this
catalog or the distributed skill shippers in [Skill fleet](../../../docs/skill-fleet.md).

For a formal single-skill score or a repo without wrappers, use its locked,
repository-local Tessl executable:

```bash
skill_dir="skills/<name>"
pnpm exec tessl plugin lint "$skill_dir"
pnpm exec tessl review run --workspace uinaf --threshold 0 --json "$skill_dir"
```

Capture the score, summary, and concrete suggestions before proposing edits.
Prefer per-skill `--json` for a narrow or structured loop. Do not re-run review
after every cosmetic edit; lint first, then one review when the package looks
ready for 100.

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
