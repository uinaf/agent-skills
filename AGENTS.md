# AGENTS.md

Repo-local contributor guidance. Global agent behavior lives in [`rules/agents.md`](rules/agents.md).

- Keep top-level docs short. Put skill depth in `skills/<name>/references/` only when it earns its keep.
- Skill frontmatter has `name` and `description` only.
- Descriptions should self-activate: what it does, when to use it, and the main boundary.
- Put shared repo-wide guidance here; keep package-specific guidance inside its owning skill.
- Keep every skill package standalone. Do not identify, invoke, import, route to, require, or sequence against a sibling package as a skill in frontmatter, picker metadata, bodies, references, scripts, or evals. State prerequisites, boundaries, and next steps as capabilities and evidence instead of skill identities. Ordinary package, tool, and technology references remain valid.
- Keep this repository standalone. Do not add package, script, CI, checkout, or
  validation dependencies on `uinaf/dotfiles` or `uinaf/workspace-kit`.
  Optional documentation links are fine; composition belongs to the consumer.
- Check reality before editing docs or examples; keep commands and paths repo-valid.
- Run `pnpm run verify` before handoff; CI uses the same repository gate.
- Run `pnpm dlx tessl@0.92.0 review run --workspace uinaf skills/<name>` for skill changes, or `./scripts/skills/review.sh` for broad changes.
- Use repo-relative links in checked-in Markdown. No absolute local paths, `file://`, or editor URIs.
