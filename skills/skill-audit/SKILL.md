---
name: skill-audit
description: "Audit, score, or improve an existing skill using repository checks, free Tessl lint, optional credit-aware Tessl review, metadata discovery, progressive disclosure, eval coverage, and repo conventions. Use for skill quality, activation failures, package comparisons, or publish readiness. Do not use for general code review, application verification, or unrelated documentation cleanup."
---

# Skill Audit

Audit the requested package against its actual repository and validation
surface. Evidence beats stylistic preference.

## Choose the Mode

- **Routine:** structure, activation, pruning, or light edits. Run free plugin
  lint plus the manual scorecard; do not spend cloud credits.
- **Formal:** explicit publish readiness, Tessl score, or a substantive
  discovery/workflow rewrite that must reach 100. Run one narrow cloud review
  only when the repository-owned launcher, authentication, and credits exist.
- **Experiential:** a recent task exposed wrong activation, missing guidance,
  excessive ceremony, or a fragile workflow. Reconstruct that failure and make
  the smallest change that would alter behavior.

Read [Tessl policy](references/tessl.md) for exact formal commands, credit
boundaries, fallbacks, and optimizer approval.

## Baseline

1. Read repository guidance and the target `SKILL.md` completely.
2. Inspect linked references, scripts, evals, picker metadata, and package
   manifest only as required by the audit scope.
3. Discover repository-owned verification.
4. Run the free structural baseline:

   ```bash
   pnpm exec tessl plugin lint skills/<name>
   ```

5. Apply [the scorecard](references/scorecard.md) and
   [authoring guidance](references/best-practices.md).

If formal review is unavailable, record the boundary once and continue with
lint plus the manual scorecard. Never install, authenticate, resolve a different
CLI, invent a score, or spend credits silently.

## Audit Dimensions

- **Discovery:** name and description identify the action, distinct triggers,
  and main boundary without synonym stuffing.
- **Workflow:** the body has a clear start, evidence loop, stop condition, and
  observable completion.
- **Progressive disclosure:** core decisions stay inline; each reference has a
  task-shaped retrieval job; repeated deterministic work is scripted.
- **Repo fit:** links, commands, metadata, and conventions are current and the
  package remains independently usable.
- **Verification:** the strongest available mechanical check and realistic
  evidence loop are explicit.
- **Boundaries:** the package neither absorbs unrelated work nor depends on a
  sibling skill identity.

Invalid metadata, broken links or commands, missing completion, repo conflicts,
and sibling-package dependencies are blockers. Bloated bodies, vague discovery,
abstract examples, duplicated doctrine, and prose replacing deterministic
scripts are major findings.

## Improve

Fix blockers and highest-leverage majors first. Prefer the smallest change that
improves activation, decision quality, or proof. When pruning, measure the
common-path context for representative requests; package totals and line count
alone do not reveal retrieval cost.

After edits, rerun the same lint and repository gate. Use forward tests only
when they can evaluate the skill without leaked conclusions or unsafe external
effects.

## Output

```text
scope: package or portfolio
validation: commands and Tessl score, or explicit no-score boundary
strengths: highest-signal dimensions
findings: blockers and major findings only
changes: files changed or smallest recommended change; include rerun status
```
