# AGENTS.md

Contributor guidance for this reusable skill catalog.

- Keep top-level docs short. Put skill depth in `skills/<name>/references/` only when it earns its keep.
- Skill frontmatter has `name` and `description` only unless a supported
  invocation-control field is required to keep a manual workflow user-invoked.
- Descriptions should self-activate: what it does, when to use it, and the main boundary.
- Put shared repo-wide guidance here; keep package-specific guidance inside its owning skill.
- Keep every skill package standalone. Do not identify, invoke, import, route to, require, or sequence against a sibling package as a skill in frontmatter, picker metadata, bodies, references, scripts, or evals. State prerequisites, boundaries, and next steps as capabilities and evidence instead of skill identities. Ordinary package, tool, and technology references remain valid.
- Keep this repository standalone. Do not add package, script, CI, checkout, or
  validation dependencies on external setup or workspace repositories.
  Composition belongs to the consumer. The owner's `.github` repository is the
  one sanctioned exception: inherited community files and the shared scan
  workflow are org trust-root defaults, not workspace coupling.
- Check reality before editing docs or examples; keep commands and paths repo-valid.
- Optimize runtime Markdown for decision value per token. Measure the common
  reference path for a realistic request, not only package totals or line count.
- Give every reference one task-shaped retrieval job. Remove research digests,
  generic tutorials, copied upstream manuals, and doctrine repeated in both the
  entrypoint and references.
- Do not lead runtime guidance with a `Sources` bibliography. Attach a source
  to the claim or decision it supports; keep required attribution in a narrow
  upstream notice rather than making every reader cross a research inventory.
- Keep volatile commands, versions, and provider details in their current
  upstream or repository-owned source when a short lookup contract is safer.
- Eval fixtures are test data, not runtime context. Do not prune them for size;
  change or remove one only when its scenario is stale, redundant, unsafe, or
  outside the package contract.
- For deterministic or repeatedly scaffolded work, point to a maintained script,
  config, workflow, or public reference implementation. State what to reuse and
  what must be adapted; do not replace working code with prose or copy it into
  the skill as a second source of truth.
- Deterministic does not mean shell. Prefer the target repository's structured
  libraries, framework plugins, schemas, task graph, and primary typed language.
  Add shell only for small linear orchestration of existing commands, never as
  a parser, policy engine, state machine, retry loop, or duplicate test runner.
- Run `pnpm run verify` before handoff; CI (PR and monthly lint) runs the same
  keyless gate: workflow lint plus `skillcheck lint`.
- Skill eval scenarios live in `skills/<name>/evals/<scenario>/` as `task.md`
  plus `criteria.json`. Eval sweeps need model credentials and stay
  operator-run; see [Skill fleet](docs/skill-fleet.md).
- Use repo-relative links in checked-in Markdown. No absolute local paths, `file://`, or editor URIs.
