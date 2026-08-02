# skills

Reusable agent skills with deterministic review and publishing gates.

Each directory under `skills/` is a standalone package. Consumers can install
one skill without adopting this repository's tooling or another skill package.

## Install

List or install packages with the Agent Skills CLI:

```bash
pnpm dlx skills add uinaf/skills --list
pnpm dlx skills add uinaf/skills -g -y -a codex -a claude-code -s verify
```

## Develop

```bash
corepack enable pnpm
pnpm install --frozen-lockfile
pnpm run verify
```

The local gate typechecks scripts, runs helper and autoreview tests, lints shell
and GitHub Actions, and validates every skill package. It expects ShellCheck on
`PATH`; CI runs the same command.

For a skill change, also run the authenticated quality gate:

```bash
pnpm run verify:skills
```

See [Skill evaluation](scripts/README.md) for focused review and optimization,
and [Distribution](docs/distribution.md) for publication and release setup.
