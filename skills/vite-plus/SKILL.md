---
name: vite-plus
description: "Set up, migrate, upgrade, or debug Vite+ tooling and configuration. Use for Vite+ commands, tests, hooks, packaging, and CI; excludes application behavior and release policy."
disable-model-invocation: true
---

# Vite+

## Check the Installed Release

Use the repository's pinned release and installed CLI as authority. Reuse a
working installation; install locked dependencies only when missing or when
manifest or lockfile changes require it. Inspect `pnpm exec vp --version` and
use `pnpm exec vp toolchain --json` when bundled-tool relationships matter.
Read the relevant packaged docs under `node_modules/vite-plus/docs/` and shipped
`AGENTS.md` for the surface being changed. Upgrades also need the intervening
[release notes](https://github.com/voidzero-dev/vite-plus/releases).

The installed CLI and packaged docs override memorized command, config, action,
hook, and dependency shapes. Carry a workaround only when it reproduces on the
installed version and has a named removal condition.

## Target Contract

- For pnpm creation or package-manager upgrades, target pnpm 12 or newer and
  pin the selected version. Bootstrap existing projects with their current pin
  first; preserve another package manager when migration is outside scope.
- Use the repository-local CLI interactively; no global `vp` is required.
  Package scripts and CI may use bare `vp` when their environment provides it.
- `vite.config.ts` owns Vite+, test, lint, format, pack, staged, and task config
  supported by the selected release. Remove parallel configs only after
  migration proves their settings were preserved.
- Tests use the public Vite+ test imports exposed by the installed release.
- Existing release, deploy, SDK generation, native packaging, and consumer
  checks remain when Vite+ does not replace them.
- Contributor and agent guidance changes with the commands it documents.

## Choose the Task

- **Creation, migration, or upgrade:** inspect manifests, version owners,
  workspace shape, and affected scripts, configs, tests, hooks, CI, and packaging.
  Read [bootstrap](references/bootstrap.md) and the matching shape:
  [packages](references/packages.md) or [monorepos](references/monorepos.md).
  For migration or upgrade, run the selected release's migrator before reconciling
  generated config with repository-specific boundaries.
- **Maintenance or debugging:** inspect the affected config, command, and callers.
  Preserve the installed toolchain and unrelated wiring. A configuration fix
  does not require a migrator or a repository-wide migration audit.

Read [commands](references/commands.md) when invocation or task wiring changes,
[testing](references/testing.md) for test configuration,
[hooks](references/hooks.md) for hook policy, and [CI](references/ci-cd.md) for
workflow edits. Use a package or monorepo reference when packaging or workspace
behavior is involved. Load [known issues](references/known-issues.md) only after
unexpected behavior reproduces or during an affected upgrade.

Use [maintained examples](references/examples.md) only to resolve a concrete
implementation question repository code and installed docs do not answer.

## Version Ownership

Preserve one checked-in owner for each layer:

| Layer | Owner |
| --- | --- |
| runtime | existing version file, tool manager, or manifest declaration |
| package manager | `packageManager` or `devEngines.packageManager`; one consistent declaration |
| Vite+ | dependency, catalog, or lockfile selected by migration |
| bundled Vite/Vitest/Oxc | migrator-managed alias or override verified through the installed toolchain |
| Actions | immutable action pin plus repository update policy |

Do not duplicate project versions in workflows when an action can read the
existing owner. Do not hand-maintain a static bundled-version table.

## Verification

For maintenance, run repository-required gates and checks for the affected
behavior; reuse still-valid proof. For creation, migration, or upgrades, use the
selected release's documented equivalents of:

1. frozen dependency install after the lockfile is final
2. combined format, lint, and type checks
3. test and configured coverage paths
4. build or pack plus downstream consumer proof
5. preview, browser, staged, hook, or workspace-task checks only when changed

Inspect manifests, consolidated config, and lockfile importers after migration.
Report retained legacy wiring with its incompatibility and removal condition.
