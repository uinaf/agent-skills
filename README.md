# skills

Reusable agent skills with deterministic review and publishing gates.

Each directory under `skills/` is a standalone package. Consumers can install
one skill without adopting this repository's tooling or another skill package.

## Install

List or install packages with the Agent Skills CLI:

```bash
pnpm dlx skills@1.5.7 add uinaf/skills --list
pnpm dlx skills@1.5.7 add uinaf/skills -g -y -a codex -a claude-code -s verify
```

Machine-global selection, instructions, and additive synchronization belong to
[`uinaf/dotfiles`](https://github.com/uinaf/dotfiles). Repository-local skills
remain owned by their consumer repository.

## Layout

- `skills/` contains the independent skill packages.
- `scripts/skills/` contains Tessl review, optimization, and publishing helpers.
- `docs/distribution.md` documents the publication contract.

## Verify

```bash
corepack enable pnpm
pnpm install --frozen-lockfile
pnpm run verify
```

The local gate typechecks scripts, runs helper and autoreview tests, lints shell
and GitHub Actions, and validates every skill package. It expects ShellCheck on
`PATH`; CI runs the same command.

For any skill change, run the authenticated release gate too:

```bash
pnpm run verify:skills
```

See [Skill evaluation](scripts/README.md) and
[Distribution](docs/distribution.md) for the focused workflows.
