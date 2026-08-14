# Skill Authoring Best Practices

Use it when an audit finds weak activation, a bloated `SKILL.md`, or unclear workflow boundaries.

## Metadata And Discovery

- `name` should be concrete and easy to say out loud
- `description` should be in third person and include both what the skill does and when to use it
- treat `description` as an always-loaded retrieval pointer: front-load the concrete action or domain that should activate it
- give each materially distinct request branch one trigger; collapse synonyms that only rename the same branch
- the main overlap boundary should be explicit without naming another skill
- generic names like `helper`, `tools`, or `utils` are usually a discovery smell

## Body Shape

- keep `SKILL.md` focused on the workflow, principles, boundaries, and routing
- lead with the task, not a bibliography or research recap; attach external
  evidence to the decision it supports
- assume the model is already smart; spend tokens on repo-specific judgment
- keep always-loaded guidance small and move repeatable task workflows into skills or scoped rules
- match the level of instruction to the task:
  - high freedom for contextual judgment
  - medium freedom when a preferred pattern exists
  - low freedom for fragile or high-risk operations
- say what evidence to gather and what a complete result should include
- end each workflow step with an observable completion condition; prefer exhaustive bounds over vague states such as "understood" or "handled"
- delete instructions that would not change a capable model's behavior; generic encouragement is context cost, not guidance

## Progressive Disclosure

- put durable detail, rubrics, and long examples in `references/`
- judge eval fixtures on realism, coverage, safety, and answer leakage rather
  than runtime token budget; their size does not affect skill retrieval
- keep references one hop away from `SKILL.md`
- keep material every execution path needs inline; disclose reference needed by only one branch behind a pointer that names that branch
- for repeated deterministic work, first use the target's existing framework,
  plugin, schema, task graph, or library; otherwise add a tested module in its
  primary language rather than defaulting to shell
- when executable code belongs to another maintained project, link the exact
  public script, config, workflow, or template and state what contract it
  demonstrates; do not fork it into prose
- if a reference is not worth loading on demand, it probably does not belong in the skill
- if a skill only repeats broad behavior rules, move that guidance to `AGENTS.md`, `CLAUDE.md`, or the owning repo docs instead
- keep each package independently usable: state prerequisite evidence and out-of-scope next steps locally rather than invoking or requiring sibling skills

## Repo Conventions To Enforce

- frontmatter must contain only `name` and `description`
- checked-in Markdown should use repo-relative links for local files
- practical, review-oriented examples beat generic filler
- if a mechanical check exists, prefer it over prose
- metadata, bodies, references, scripts, and evals must not invoke, route to, import, require, or assume sibling skills, or reference their package paths; ordinary package and technology names remain valid
- after changing a skill, rerun the strongest available audit surface and the repo's normal gate; use Tessl when available and the manual scorecard when it is not

## Audit Questions

- Would a realistic user request trigger this skill from metadata alone
- Does each trigger phrase represent a distinct request branch rather than a synonym added for reassurance
- Does the first screenful tell the agent how to begin
- Is any paragraph teaching common knowledge instead of repo-specific judgment
- Would removing each instruction materially change behavior
- Does every workflow step have a checkable completion condition with enough demand to prevent premature completion
- Are there stale commands, dead paths, or duplicated doctrine
- Is there a concrete evaluation loop, or only style advice
