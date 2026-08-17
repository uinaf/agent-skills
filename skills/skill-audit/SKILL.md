---
name: skill-audit
description: "Audit or improve an existing skill using repository checks, skillcheck lint, metadata discovery, progressive disclosure, eval coverage, and repo conventions. Use for skill quality, activation failures, or package comparisons. Do not use for general code review, application verification, or unrelated documentation cleanup."
---

# Skill Audit

Audit the requested package against its actual repository and validation
surface. Evidence beats stylistic preference.

## Choose the Mode

- **Routine:** structure, activation, pruning, or light edits. Run the
  repository's skill lint plus the manual scorecard.
- **Experiential:** a recent task exposed wrong activation, missing guidance,
  excessive ceremony, or a fragile workflow. Reconstruct that failure and make
  the smallest change that would alter behavior.

## Baseline

1. Read repository guidance and the target `SKILL.md` completely.
2. Inspect linked references, scripts, evals, picker metadata, and package
   manifest only as required by the audit scope.
3. Discover repository-owned verification.
4. Run the repository's structural skill lint. uinaf repos pin
   `@uinaf/skillcheck` and expose it as a script:

   ```bash
   pnpm run skills:lint
   ```

5. Apply [the scorecard](references/scorecard.md) and
   [authoring guidance](references/best-practices.md).

If the repository owns no skill lint, record the boundary once and continue
with the manual scorecard. Never install a new tool, resolve a different CLI,
or invent lint results silently.

## Audit Dimensions

- **Discovery:** name and description identify the action, distinct triggers,
  and main boundary without synonym stuffing.
- **Workflow:** the body has a clear start, evidence loop, stop condition, and
  observable completion.
- **Progressive disclosure:** core decisions stay inline; each reference has a
  task-shaped retrieval job; repeated deterministic work routes to an existing
  tool or maintained executable resource.
- **Repo fit:** links, commands, metadata, and conventions are current and the
  package remains independently usable.
- **Verification:** the strongest available mechanical check and realistic
  evidence loop are explicit.
- **Boundaries:** the package neither absorbs unrelated work nor depends on a
  sibling skill identity.

Invalid metadata, broken links or commands, missing completion, repo conflicts,
and sibling-package dependencies are blockers. Bloated bodies, vague discovery,
abstract examples, duplicated doctrine, and prose replacing an existing
deterministic implementation are major findings.

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
validation: lint commands and findings, or the explicit no-lint boundary
strengths: highest-signal dimensions
findings: blockers and major findings only
changes: files changed or smallest recommended change; include rerun status
```
