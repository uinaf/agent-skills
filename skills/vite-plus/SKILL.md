---
name: vite-plus
description: "Create, migrate, or align frontend packages and monorepos on Vite+. Use for Vite+ scaffolding, migration, upgrades, `vp` commands, consolidated Vite/Oxlint/Oxfmt/Vitest configuration, hooks, packaging, or CI. Prefer the repository-pinned Vite+ surface and its packaged documentation; preserve existing stacks and proven exceptions."
disable-model-invocation: true
---

# Vite+

Move the repository toward one coherent Vite+ toolchain without replacing
product, release, or runtime behavior Vite+ does not own.

## Establish Live Authority

Vite+ is pre-1.0 and changes quickly. Before editing:

1. Install the repository's locked dependencies.
2. Record `pnpm exec vp --version` and, when available,
   `pnpm exec vp toolchain --json`.
3. Read the relevant packaged documentation under
   `node_modules/vite-plus/docs/` and any shipped `AGENTS.md`.
4. When changing the pinned release, read the intervening upstream release
   notes and run that exact target's migrator.

The installed CLI and packaged docs override memorized command, config, action,
hook, and dependency shapes. Carry a workaround only when it reproduces on the
installed version and has a named removal condition.

## Target Contract

- The repository owns Vite+ and package-manager versions; no global `vp` is required.
- Interactive commands use the repository-local CLI. Package scripts and CI
  may use bare `vp` when their environment provides it.
- `vite.config.ts` owns Vite+, test, lint, format, pack, staged, and task config
  supported by the selected release. Remove parallel configs only after
  migration proves their settings were preserved.
- Tests use the public Vite+ test imports exposed by the installed release.
- CI uses the official setup surface when it fits and reads repo-owned runtime
  and tool versions instead of copying literals.
- Existing release, deploy, SDK generation, native packaging, and consumer
  checks remain when Vite+ does not replace them.
- Contributor and agent guidance changes with the commands it documents.

## Workflow

1. Audit manifests, lockfiles, runtime/package-manager owners, workspace shape,
   scripts, configs, tests, hooks, CI, packaging, and release/deploy paths.
2. Read [bootstrap](references/bootstrap.md) for creation, first migration, or
   target-version upgrades.
3. Read exactly one shape reference:
   [packages](references/packages.md) for a standalone package or
   [monorepos](references/monorepos.md) for a workspace.
4. Run the selected release's migrator before hand-editing generated config.
   Reconcile its result with repository-specific boundaries.
5. Read [commands](references/commands.md) before changing invocation or task
   wiring, [testing](references/testing.md) when tests change, and
   [hooks](references/hooks.md) only when hook policy changes.
6. Read [CI](references/ci-cd.md) before workflow edits. Keep secret-bearing
   release and deploy jobs fresh and cache-isolated.
7. Load [known issues](references/known-issues.md) only after unexpected
   behavior reproduces or during an affected upgrade.
8. For new config, task-graph, packaging, or CI code, open the closest
   [maintained example](references/examples.md) after selecting the repository
   shape. Adapt it to the installed Vite+ release; do not copy its pins.

## Version Ownership

Preserve one checked-in owner for each layer:

| Layer | Owner |
| --- | --- |
| runtime | existing version file, tool manager, or manifest declaration |
| package manager | `packageManager` or equivalent existing contract |
| Vite+ | dependency, catalog, or lockfile selected by migration |
| bundled Vite/Vitest/Oxc | migrator-managed alias or override verified through the installed toolchain |
| Actions | immutable action pin plus repository update policy |

Do not duplicate project versions in workflows when an action can read the
existing owner. Do not hand-maintain a static bundled-version table.

## Verification

Use the installed release's documented equivalents of:

1. frozen dependency install after the lockfile is final
2. combined format, lint, and type checks
3. test and configured coverage paths
4. build or pack plus downstream consumer proof
5. preview, browser, staged, hook, or workspace-task checks only when changed

Inspect manifests, consolidated config, and lockfile importers after migration.
Report retained legacy wiring with the reproduced incompatibility and removal
condition. Do not call a migration complete from generated files alone.
