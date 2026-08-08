![skills — reusable agent skills with deterministic review and publishing gates.](https://uinaf.dev/og/banner/skills.png)

# uinaf/skills

A small catalog of standalone skills for coding agents. Install only what you
need; each skill works independently of this repository's development tooling
and the other skills in the catalog.

## Catalog

| Skill | Use it for |
| --- | --- |
| [`agent-readiness`](skills/agent-readiness/SKILL.md) | Making repositories and runners dependable for autonomous work. |
| [`docs`](skills/docs/SKILL.md) | Auditing and rewriting repository documentation and agent guidance. |
| [`gh-setup`](skills/gh-setup/SKILL.md) | Setting up GitHub collaboration, CI, releases, and deployments. |
| [`planning`](skills/planning/SKILL.md) | Saving agreed work as resumable plans in the repository's preferred tracker. |
| [`react-ban-use-effect`](skills/react-ban-use-effect/SKILL.md) | Replacing direct React `useEffect` with clearer patterns and enforcement. |
| [`skill-audit`](skills/skill-audit/SKILL.md) | Auditing skill activation, packaging, instructions, and quality. |
| [`verify`](skills/verify/SKILL.md) | Proving a completed change works before independent review. |
| [`vite-plus`](skills/vite-plus/SKILL.md) | Migrating frontend packages and monorepos to Vite+. |

## Install

Browse the catalog:

```bash
pnpm dlx skills add uinaf/skills --list
```

Install one skill globally for Codex and Claude Code:

```bash
pnpm dlx skills add uinaf/skills -g -y -a codex -a claude-code -s verify
```

Replace `verify` with any catalog name. Omit `-g` for a repository-local
installation.

## Contributing

```bash
corepack enable pnpm
pnpm install --frozen-lockfile
pnpm run verify
```

CI uses that same free lint/structure gate. For an intentional local 100-point
Tessl cloud score before a sensitive skill change:

```bash
pnpm run verify:skills
```

See [Skill evaluation](scripts/README.md) for lint vs review lanes,
[Distribution](docs/distribution.md) for publication and release setup, and
[Skill fleet](docs/skill-fleet.md) for the cross-repo inventory and monthly
lint cadence (no scheduled cloud review).
