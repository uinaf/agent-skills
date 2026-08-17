# Skill Audit Scorecard

Use this scorecard after the repository's skill lint, or as the primary manual fallback, so the audit stays evidence-based and repo-aware.

## Manual Fallback Evidence

When the repository owns no skill lint:

- record the exact unavailable boundary without repeatedly retrying it
- run every repository-owned deterministic skill check that remains available
- inspect `SKILL.md`, linked references and scripts, evals, and picker metadata in the requested scope
- cite actual files and sections for blockers and major findings
- grade every audit dimension `strong`, `mixed`, or `weak`
- report the missing lint evidence as unavailable; never synthesize a replacement

Manual review can complete the audit. A mandatory publication gate remains unverified until its required command succeeds.

## Blockers

Treat these as must-fix before calling the skill ready:

- invalid frontmatter or missing `name` or `description`
- `description` fails discovery because it does not say what the skill does and when to use it
- commands, paths, or links are stale or broken
- workflow has no clear start, no evidence loop, or no observable and exhaustive completion criteria
- the skill conflicts with the target repo's guidance or conventions
- the package names, invokes, imports, routes to, or requires a sibling skill instead of stating its own prerequisite or boundary

## Major Findings

These usually lower trust or activation even if the skill technically works:

- `name` is vague, generic, or forgettable
- `description` buries its action or repeats synonyms instead of naming distinct request branches
- `SKILL.md` is bloated with detail that belongs in `references/`
- runtime guidance begins with a source inventory or literature review instead
  of the task, decision, or workflow it exists to support
- boundaries are missing, muddy, or depend on an unnamed external workflow
- the skill asks the model to re-invent deterministic steps instead of routing
  to an existing tool or executable resource
- deterministic guidance defaults to ad-hoc shell despite an existing
  framework, plugin, schema, task graph, library, or typed project language
- examples are abstract instead of practical
- repeated deterministic work has neither a maintained executable resource nor
  a task-shaped pointer to tested implementation code
- optimizer use is suggested without explicit approval

## Minor Findings

These are worth tightening after the blockers and majors:

- wording is repetitive or over-explains obvious concepts
- instructions restate capable-model defaults without changing behavior
- output format is implied instead of stated
- references exist but are not linked from `SKILL.md`
- picker or harness metadata lags behind the skill's current wording

## Audit Dimensions

Score each dimension qualitatively as `strong`, `mixed`, or `weak`:

- Discovery: does metadata front-load the action and map distinct request branches without synonym stuffing
- Workflow: does the body tell the agent how to proceed and what evidence to gather
- Progressive disclosure: is detail placed in the right file
- Repo fit: does it match local conventions and links
- Verification: does it use the strongest available mechanical checks plus a concrete evidence loop instead of taste-only review
- Boundaries: does it state its limits and required next steps without assuming another skill exists

## Compact Review Template

```text
scope audited:
validation:
strengths:
findings:
recommended changes:
rerun:
```
