---
name: agent-readiness
description: "Audit and build repository and runner infrastructure for autonomous agent work and unattended triage-to-result flows — implementation, QA, reproducible bootstrap, machine identities, real-surface proof, artifacts, CI gates, observability, isolation, recovery, and result submission. Use when a repo cannot boot or verify reliably, a React or Effect repo needs agent-facing enforcement or runtime proof, agents need human setup, a devbox or orchestrator will execute or QA tasks, credentials or worktrees block automation, or teams want to raise measured readiness toward B or A. Do not use for reviewing an existing diff or for documentation-only cleanup."
---

# Agent-Readiness

Make a repository and its declared runner dependable for autonomous work. Build
toward the requested target; default to B and treat C only as a checkpoint.

## Boundaries

- Source diff or PR review is out of scope; preparing repeatable application QA is in scope.
- Build execution, proof, and result contracts without making ship decisions or
  authorizing public, destructive, or cross-system actions.
- Grade platform-owned tools, network access, and machine authentication as
  runner capabilities, not automatically as repository debt.
- Count guidance and product or architecture contracts only when agents need
  them to understand tasks; unrelated documentation cleanup does not count.
- Mock-only tests, docs-only claims, and builder self-evaluation are not empirical proof.

## Readiness Model

Grade these applicable capabilities using [references/grading.md](references/grading.md):

1. **Legibility** — agents can discover ownership, architecture, task contracts,
   commands, and relevant sources of truth without relying on chat or memory
2. **Executability** — a clean workspace can install, configure, boot, seed, and
   tear down through documented, noninteractive entrypoints
3. **Feedback** — agents can exercise real surfaces, run canonical gates, inspect
   artifacts, and diagnose failures without opening a dashboard
4. **Safety** — credentials, permissions, network access, and destructive actions
   are scoped and enforced by infrastructure
5. **Durability** — work survives session loss through explicit state, idempotent
   setup, bounded retries, cleanup, and actionable recovery
6. **Scale** — concurrent agents have isolated workspaces and resources, and an
   orchestrator can submit and reconcile results without collisions

Report three different things rather than hiding them in one letter:

- **repository grade**: what the checkout makes possible
- **runner grade**: what the declared devbox, CI worker, or automation host provides
- **evidence level**: how strongly the claim has been exercised

The lowest applicable capability sets each grade; never average away a blocker.
Do not collapse a missing runner prerequisite into repository setup debt.

## Automation Path

For unattended work, inspect the entire path even if the requested change
touches only one part:

**Triage → Dispatch → Provision → Execute → Prove → Submit → Reconcile → Recover**

- **Triage** produces an owned, unambiguous task with acceptance criteria and risk
- **Dispatch** selects a compatible runner and records task and attempt identity
- **Provision** creates an isolated workspace and supplies tools and scoped machine identity
- **Execute** runs the declared task class, such as implementation, QA, or investigation
- **Prove** grades final state and produces inspectable, attributable artifacts
- **Submit** sends the required result: a change handoff, PR, QA report, artifact bundle, or provider update
- **Reconcile** follows CI, review, acceptance, or provider state to the declared terminal condition
- **Recover** detects stalls and failures, preserves evidence, retries safely, or escalates

Treat no-diff tasks as first-class work. Their contract names the result type,
evidence, target, terminal condition, and side effects; never invent a PR for QA.

Do not invent an orchestrator when the task only asks to prepare a repository.
Instead, define the stable repository-runner contract the future orchestrator
can call.

## Workflow

### 1. Audit the declared execution boundary

Establish the target grade, intended task classes, and runner before grading.
Then:

1. Read the repository-owned entrypoint and follow its links to relevant contracts.
2. Run the cold-start, boot, smoke, interaction, verification, and teardown paths
   that exist; static file presence alone is weak evidence.
3. Grade every applicable capability from F through A with evidence, gap, and owner.
4. Walk the automation path and record missing transitions, inputs, outputs, and terminal states.
5. Assign an evidence level using [references/autonomy-evidence.md](references/autonomy-evidence.md).

The runner injects short-lived machine access, the repository consumes it
noninteractively, and humans provision, rotate, revoke, and recover it. Scoped
Infisical, workload, or CI identities are positive runner evidence. Human login,
profile switching, pasted or copied secrets, and printed tokens are gaps. A
missing identity promised by the runner contract is a runner mismatch.

Inspect `.worktreeinclude` only when managed worktrees need ignored local files.
Prefer generated configuration or identity injection over copied secrets;
manual worktrees and custom hooks need their own provisioning path.

For React and existing Effect repositories, apply the mechanical enforcement
and runtime guidance in [references/react-enforcement.md](references/react-enforcement.md)
and [references/effect-readiness.md](references/effect-readiness.md). Do not
introduce Effect solely for readiness.

### 2. Build the missing contract

Prioritize work in this order:

**Legibility → Runner contract → Cold start → Real-surface feedback → Enforcement → Isolation → Recovery and result submission → Repeated trials**

Prefer three stable repository entrypoints when the capability is in scope:

```bash
./scripts/agent-bootstrap.sh
./scripts/agent-verify.sh
./scripts/agent-teardown.sh
```

Bootstrap validates prerequisites and becomes ready; verification is canonical
and reused by CI; teardown handles success, failure, timeout, and cancellation.
Automation artifacts are keyed by task and attempt.

Keep deterministic operations deterministic: workspace creation, tool install,
secret injection, test invocation, artifact manifests, allowed-target checks,
branch setup, submission mechanics, and cleanup should not depend on model
judgment. Let agents reason about implementation, QA exploration, diagnosis,
review feedback, and recovery within enforced boundaries.

When readiness work includes agent entrypoints, keep `AGENTS.md` as the canonical
authored guide and place `CLAUDE.md` beside it as a symlink to `AGENTS.md`.

Use [references/setup-patterns.md](references/setup-patterns.md) for boot,
verification, machine identities, observability, isolation, unattended runs,
proof artifacts, and result contracts.

### 3. Prove outcomes, not recipes

- Exercise at least one success path and one actionable failure path.
- Grade final environment or repository state, not the agent's completion claim.
- Accept equivalent implementations that satisfy the contract; do not require a
  particular tool, hook, port algorithm, or retry count without an external reason.
- Use multiple trials for B or A autonomy claims and record success, human
  interventions, duration, cost or resource class, retries, and failure class.
- Test parallel isolation and crash or stall recovery when claiming unattended
  or orchestrated readiness.
- Inspect transcripts and artifacts for false success, grader defects, secret
  exposure, and ambiguous task requirements.

### 4. Finish at the requested outcome

Finish at the requested target or an evidenced blocker. Report the path to A
and relevant documentation drift without expanding into unrelated cleanup.

## Output

Keep the handoff compact:

```text
- grades: repository and runner, before → after
- evidence: level plus the strongest exercised outcomes
- automation path: first missing or newly proven transition
- files changed: readiness infrastructure only
- remaining gaps: highest-impact gaps with owner, or none
- next: next capability or none
```

Name exact commands only for failures, reproduction, or when asked. Do not
repeat capability evidence in the footer when it already appears in an audit table.

## References

- [references/grading.md](references/grading.md) — repository and runner grades, capability matrix, ceilings, and blockers
- [references/autonomy-evidence.md](references/autonomy-evidence.md) — evidence levels, representative trials, outcome graders, and reliability metrics
- [references/setup-patterns.md](references/setup-patterns.md) — bootstrap, gates, credentials, observability, isolation, artifacts, recovery, and result patterns
- [references/react-enforcement.md](references/react-enforcement.md) — React-specific lint, local-gate, and CI adoption
- [references/effect-readiness.md](references/effect-readiness.md) — Effect-specific source, runtime, test, observability, and cleanup proof
- [references/industry-examples.md](references/industry-examples.md) — current harness, eval, and orchestration patterns
