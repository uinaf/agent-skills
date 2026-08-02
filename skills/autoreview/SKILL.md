---
name: autoreview
description: "Run the bundled Codex, Claude, or Cursor autoreview helper as a structured second-model closeout for local changes, pull requests, branch diffs, or commits: read the authoritative request, ticket, and spec; pass their acceptance criteria to the reviewer; validate findings; rerun focused tests; and repeat until clean. Use when explicitly asked for autoreview, Codex/Claude/Cursor review, or a tool-backed final review after implementation. Do not use for builder verification or an independent multi-agent ship decision."
---

# Auto Review

Run the bundled structured review helper as a closeout check. This is code review, not Guardian `auto_review` approval routing.

## Rules

- Start only with authoritative task context, completed builder guardrails, and
  real-surface proof; cite the evidence or report the missing prerequisite.
- Findings are advisory. Verify before fixing, stay inside the task scope, and
  do not make a ship decision or invoke additional reviewer workflows.
- Honor the requested engine and model. Use panels only when explicitly
  requested or justified by risk.
- Treat the validated bundle as the reviewer's only repository input. Never bypass
  its required secret scan, sensitive-path omissions, or fail-closed input guards.
- Split refused oversized bundles into dependency-connected targets, verify
  cross-target contracts directly, and never claim whole-change cleanliness
  from independent chunk reviews.
- If the source tree changes after bundle creation, discard the result and rerun against the updated tree.
- Do not push just to review. Push only when the user requested push, ship, or PR update.

Use [references/troubleshooting.md](references/troubleshooting.md) for operational
edge cases. Consult [references/scope.md](references/scope.md) before expanding
scope, touching release process, or starting a third review-triggered patch cycle.

## Task Context Precondition

Before invoking the helper:

1. Read the current user request and the PR/MR title and description when one exists.
2. Follow and read every referenced issue, ticket, spec, decision, or acceptance-criteria source. Prefer live source content over summaries copied into the branch.
3. Distill a short task contract: objective, acceptance criteria, explicit non-goals, and source identifiers.
4. Stop and report the blocker when a named source cannot be accessed or authoritative sources conflict. Do not silently infer the missing contract.
5. Pass the task contract to every reviewer with `--prompt`, or include existing repo-relative source files with `--prompt-file` or `--dataset`. Do not create or commit a context file solely for review.

If no external ticket or spec exists, use the current user request as the task contract and say that it is the only authoritative source. Never invent missing requirements.

## Core Workflow

1. Confirm the precondition above, including builder guardrails and real-surface proof.
2. Set `AUTOREVIEW` and `AUTOREVIEW_HARNESS` once for the active skill location.
3. Pick the real target: dirty local work, branch/PR base, or a single commit.
4. Run the helper with the task contract and Codex by default, or Claude/Cursor when requested.
5. Verify each finding against the code and task contract; reject weak findings
   and inspect same-scope sibling instances of repeated bug classes.
6. Fix accepted findings with the smallest change at the right ownership boundary.
7. Rerun focused tests plus autoreview with the same task contract when fixes change code.
8. Stop after the helper exits 0 with no accepted/actionable findings and report that exact clean run.

## Skill Path (set once)

Set `skill_root` to the active project-local, source-checkout, or global skill
directory, then reuse the exported commands below.

```bash
if test -z "${skill_root:-}"; then
  for candidate in \
    .agents/skills/autoreview \
    .claude/skills/autoreview \
    skills/autoreview \
    "${AGENTS_HOME:-$HOME/.agents}/skills/autoreview"; do
    if test -x "$candidate/scripts/autoreview"; then
      skill_root="$candidate"
      break
    fi
  done
fi
test -x "${skill_root:-}/scripts/autoreview" || {
  printf '%s\n' "autoreview skill not found" >&2
  exit 1
}
export AUTOREVIEW="$skill_root/scripts/autoreview"
export AUTOREVIEW_HARNESS="$skill_root/scripts/test-review-harness"
```

For Claude Code globals, set `skill_root="$HOME/.claude/skills/autoreview"`
before running the snippet.

## Pick Target

Dirty local work:

```bash
"$AUTOREVIEW" --mode local
```

Use local mode only for an actual unstaged, staged, or untracked patch;
`--mode uncommitted` is an alias. Use commit or branch mode for pushed work.

Branch/PR work:

```bash
"$AUTOREVIEW" --mode branch --base origin/main
```

Task context is required. Pass a concise contract gathered from external sources inline:

```bash
task_context='Objective: prevent duplicate payment submission. Acceptance criteria: rapid repeated clicks enqueue one payment. Non-goals: no payment architecture rewrite. Sources: current request; PR description; BILL-123.'
"$AUTOREVIEW" --mode branch --base origin/main --prompt "$task_context"
```

Existing prompt files and datasets must be repo-relative so review bundles cannot pull arbitrary host files:

```bash
"$AUTOREVIEW" --mode branch --base origin/main --prompt-file review-notes.md --dataset evidence.json
```

If an open PR exists, use its actual base:

```bash
base=$(gh pr view --json baseRefName --jq .baseRefName)
"$AUTOREVIEW" --mode branch --base "origin/$base"
```

Committed single change:

```bash
"$AUTOREVIEW" --mode commit --commit HEAD
```

Use commit review for landed or pushed `main` work. For a small stack, review
each commit or review the branch before merging.

## Parallel Closeout

Format first if formatting can change line locations. Then it is OK to run tests and review in parallel:

```bash
"$AUTOREVIEW" --parallel-tests "<focused test command>"
```

Parallel tests receive a temporary home and a sanitized environment. The helper
also fingerprints the source tree before and after review, so test mutations
invalidate the result instead of silently producing a stale clean verdict.

## Review Panels

Run multiple reviewers against one frozen bundle:

```bash
"$AUTOREVIEW" --reviewers codex,claude,cursor
```

`--panel` is shorthand for Codex plus Claude unless `--engine` changes the first reviewer:

```bash
"$AUTOREVIEW" --panel
```

Set reviewer models and thinking/effort explicitly:

```bash
"$AUTOREVIEW" --reviewers codex,claude,cursor --model codex=gpt-5.6-sol --thinking codex=high --model claude=claude-opus-5 --thinking claude=high --model cursor=cursor-grok-4.5-high-fast
```

Inline syntax is also supported for simple model IDs:

```bash
"$AUTOREVIEW" --reviewers codex:gpt-5.6-sol:high,claude:claude-opus-5:high
```

For models with slashes or extra colons, prefer keyed form:

```bash
"$AUTOREVIEW" --reviewers codex,claude,cursor --model codex=gpt-5.6-sol --model claude=claude-opus-5 --model cursor=cursor-grok-4.5-high-fast
```

Cursor Agent can also run alone; `cursor-agent` is accepted as an engine alias:

```bash
"$AUTOREVIEW" --mode branch --base origin/main --engine cursor-agent
```

## Engine Details

Use [references/engine-details.md](references/engine-details.md) for model defaults, preferred model lists, environment overrides, and engine isolation details.

## Helper

After setting `AUTOREVIEW` and `AUTOREVIEW_HARNESS` above:

```bash
"$AUTOREVIEW" --help
```

The smoke harness has thin shell wrappers over a shared Python implementation:

```bash
"$AUTOREVIEW_HARNESS" --fixture benign --engine codex
```

Use [references/upstream.md](references/upstream.md) for packaging provenance.

## Final Report

Include:

- task-context sources read and the acceptance criteria supplied to the reviewer
- review command used
- tests/proof run
- findings accepted/rejected, briefly why
- the clean review result from the final helper/review run, or why a remaining finding was consciously rejected

Do not rerun solely to improve report wording.
