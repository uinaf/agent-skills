# Distribution

This repo is the source of truth for its skills. There is no publish pipeline;
consumers read the `skills/` tree directly.

## How skills reach consumers

- `uinaf/dotfiles` syncs skills onto hosts with `agents:sync`, which copies
  from this repo's `skills/` tree.
- Other consumers install straight from the repo, for example:

  ```bash
  pnpm dlx skills add uinaf/agent-skills -g -y -a codex -a claude-code -s gh-setup
  ```

Edit skills here and let consumers re-sync. Do not hand-copy skill trees
between repos or treat harness-local copies (`~/.agents`, `.agents/skills/`)
as sources of truth.

## Quality gate

Every skill passes `pnpm run verify` (workflow lint plus `skillcheck lint`) on
pull requests and a monthly schedule. See [Skill fleet](skill-fleet.md) for the
cross-repo inventory.
