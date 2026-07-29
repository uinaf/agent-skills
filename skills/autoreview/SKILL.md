---
name: autoreview
description: "Run the bundled Codex/Claude autoreview helper as a structured second-model closeout for local changes, pull requests, branch diffs, or commits: read the authoritative request, ticket, and spec; pass their acceptance criteria to the reviewer; validate findings; rerun focused tests; and repeat until clean. Use when explicitly asked for autoreview, Codex/Claude review, or a tool-backed final review after implementation. Do not use for builder verification or an independent multi-agent ship decision."
---

# Auto Review

Run the bundled structured review helper as a closeout check. This is code review, not Guardian `auto_review` approval routing.

Use when:

- user asks for Codex review / Claude review / autoreview / second-model review
- after non-trivial code edits and builder verification, when a tool-backed second-model closeout is wanted
- reviewing a local branch or PR branch after fixes

## Boundaries

- Require the authoritative task context before review: the current request plus any PR/MR description, linked ticket, referenced spec, or explicit non-goals.
- Require completed builder guardrails and real-surface proof before starting; cite the existing evidence or report the missing prerequisite.
- Report advisory findings and closeout cleanliness. Do not turn this pass into an independent ship decision or invoke additional reviewer workflows.

## Contract

- Treat review output as advisory: verify every finding against real code, adjacent files, and dependency docs/types when relevant.
- Require the reviewer to check implementation completeness against the supplied objective and acceptance criteria, not only code quality.
- Reject speculative or over-broad findings; fix accepted issues with the smallest change at the right ownership boundary.
- When a finding exposes a repeated bug class, inspect the current PR scope for sibling instances before fixing.
- Keep review-triggered fixes inside the original task scope.
- If a review-triggered fix changes code, rerun focused proof plus autoreview until the helper exits cleanly; stop there.
- Honor the requested engine/model, do not invoke nested reviewers, and use review panels only when explicitly requested or risk justifies them.
- Treat the validated bundle as the reviewer's only repository input. Before engine invocation, the helper requires TruffleHog and scans temporary snapshots of the exact added, modified, or deleted content under review using its `verified,unknown` policy. It never auto-installs the scanner.
- Sensitive paths are omitted from the review bundle. Binary, gitlink, unsafe linked, incomplete, or unsafe secret-bearing input still fails closed rather than widening filesystem access.
- Split oversized changes into coherent review targets when the helper refuses a bundle; independent chunks cannot safely prove cross-file or cross-chunk contracts.
- If the source tree changes after bundle creation, discard the result and rerun against the updated tree.
- Do not push just to review. Push only when the user requested push, ship, or PR update.

Use [references/troubleshooting.md](references/troubleshooting.md) for heartbeat patience, Gitcrawl repair, regression provenance, security-suppression, and conscious-rejection rules.

## Scope And Release Guardrails

Use [references/scope.md](references/scope.md) before accepting a fix that could expand the task, touch release process, or start a third review-triggered patch cycle.

## Task Context Precondition

Before invoking the helper:

1. Read the current user request and the PR/MR title and description when one exists.
2. Follow and read every referenced issue, ticket, spec, decision, or acceptance-criteria source. Prefer live source content over summaries copied into the branch.
3. Distill a short task contract: objective, acceptance criteria, explicit non-goals, and source identifiers.
4. Stop and report the blocker when a named source cannot be accessed or authoritative sources conflict. Do not silently infer the missing contract.
5. Pass the task contract to every reviewer with `--prompt`, or include existing repo-relative source files with `--prompt-file` or `--dataset`. Do not create or commit a context file solely for review.

If no external ticket or spec exists, use the current user request as the task contract and say that it is the only authoritative source. Never invent missing requirements.

## Core Workflow

1. Read and distill the authoritative task context.
2. Confirm builder guardrails and real-surface proof exist.
3. Set `AUTOREVIEW` and `AUTOREVIEW_HARNESS` once for the active skill location.
4. Pick the real target: dirty local work, branch/PR base, or a single commit.
5. Run the helper with the task contract and Codex by default, or Claude when requested.
6. Verify each finding against the code and task contract; reject weak findings explicitly.
7. Fix accepted findings at the right ownership boundary.
8. Rerun focused tests plus autoreview with the same task contract when fixes change code.
9. Stop after the helper exits 0 with no accepted/actionable findings and report that exact clean run.

## Skill Path (set once)

Set the skill script paths once, then use `"$AUTOREVIEW"` and `"$AUTOREVIEW_HARNESS"` in the examples below.

Choose one:

```bash
# Project-local skill in the current repo:
export AUTOREVIEW=".agents/skills/autoreview/scripts/autoreview"
export AUTOREVIEW_HARNESS=".agents/skills/autoreview/scripts/test-review-harness"
```

```bash
# Source checkout of openclaw/agent-skills:
export AUTOREVIEW="skills/autoreview/scripts/autoreview"
export AUTOREVIEW_HARNESS="skills/autoreview/scripts/test-review-harness"
```

```bash
# Global skill:
export AGENTS_HOME="${AGENTS_HOME:-$HOME/.agents}"
export AUTOREVIEW="$AGENTS_HOME/skills/autoreview/scripts/autoreview"
export AUTOREVIEW_HARNESS="$AGENTS_HOME/skills/autoreview/scripts/test-review-harness"
```

When using Claude Code, set `AGENTS_HOME="$HOME/.claude"` for global skills. Project-local skills live under `.claude/skills/` in the current repo.

## Pick Target

Dirty local work:

```bash
"$AUTOREVIEW" --mode local
```

Use this only when the patch is actually unstaged/staged/untracked in the
current checkout. `--mode uncommitted` is accepted as an alias for `--mode local`.
For committed, pushed, or PR work, point the helper at the commit
or branch diff instead; do not force dirty modes just
because the helper docs mention dirty work first. A clean local review
only proves there is no local patch.

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

Use commit review for already-landed or already-pushed work on `main`. Reviewing
clean `main` against `origin/main` is usually an empty diff after push. For a
small stack, review each commit explicitly or review the branch before merging
with `--base`.

## Large Review Bundles

The helper scans the full patch before checking its aggregate prompt limit. It
fails closed when the complete bundle does not fit one review pass, because
independent chunks can miss defects that span files or chunks. Split the change
into coherent targets and review each target explicitly.

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
"$AUTOREVIEW" --reviewers codex,claude
```

`--panel` is shorthand for Codex plus Claude unless `--engine` changes the first reviewer:

```bash
"$AUTOREVIEW" --panel
```

Set reviewer models and thinking/effort explicitly:

```bash
"$AUTOREVIEW" --reviewers codex,claude --model codex=gpt-5.6-sol --thinking codex=high --model claude=claude-opus-5 --thinking claude=high
```

Inline syntax is also supported for simple model IDs:

```bash
"$AUTOREVIEW" --reviewers codex:gpt-5.6-sol:high,claude:claude-opus-5:high
```

Codex maps thinking to `model_reasoning_effort` and accepts `none`, `minimal`,
`low`, `medium`, `high`, `xhigh`, or `max`. Claude maps thinking to `--effort`
and accepts `low`, `medium`, `high`, `xhigh`, or `max`.

For models with slashes or extra colons, prefer keyed form:

```bash
"$AUTOREVIEW" --reviewers codex,claude --model codex=gpt-5.6-sol --model claude=claude-opus-5
```

## Engine Details

Use [references/engine-details.md](references/engine-details.md) for model defaults, preferred model lists, environment overrides, and Codex/Claude isolation details.

## Context Efficiency

Run the helper directly so target selection, engine choice, structured validation, and exit status all stay in one path. If output is noisy, summarize the completed helper output after it returns; do not ask another agent or reviewer to rerun the review.

## Helper

After setting `AUTOREVIEW` and `AUTOREVIEW_HARNESS` above:

```bash
"$AUTOREVIEW" --help
```

The smoke harness has thin shell wrappers over a shared Python implementation:

```bash
"$AUTOREVIEW_HARNESS" --fixture benign --engine codex
```

## Final Report

Include:

- task-context sources read and the acceptance criteria supplied to the reviewer
- review command used
- tests/proof run
- findings accepted/rejected, briefly why
- the clean review result from the final helper/review run, or why a remaining finding was consciously rejected

Do not run another review solely to improve the final report wording. If the final helper run exited 0 and produced no accepted/actionable findings, report that exact run as clean.

## References

- [references/troubleshooting.md](references/troubleshooting.md) - security-audit suppression and other edge-case closeout notes
- [references/scope.md](references/scope.md) - scope governor and release-branch freeze rules
- [references/engine-details.md](references/engine-details.md) - model defaults, preferred model lists, environment overrides, and engine isolation details
- [references/upstream.md](references/upstream.md) - OpenClaw upstream provenance and local packaging notes
