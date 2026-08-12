# Bootstrap

Use this reference when starting a new repo on Vite+ or converting an existing one.

## Prerequisites

- Vite 8 or newer.
- Vitest 4.1 or newer only when the repo directly depends on `vitest` or `@vitest/*`.

Vite+ does not support older upstream versions. In Vite+ 0.2.x and newer, node-mode tests normally get upstream Vitest transitively through `vite-plus`; upgrade direct Vitest ecosystem dependencies only when the project actually uses them.

## New Repo

1. Use `pnpm --package=vite-plus@<target> dlx vp create` to scaffold the closest stock shape without installing a global CLI. Name the `vp` binary explicitly because Vite+ also publishes `vpr`, `oxlint`, and `oxfmt` binaries. `create` ships built-in templates (`vite:monorepo`, `vite:application`, `vite:library`, `vite:generator`) plus shorthand and remote sources. Pass `--git` or `--no-git` explicitly in automation so the scaffold does not stop on the interactive Git prompt.
2. Keep package manager and workspace settings consistent with the repo standard.
3. Prefer `pnpm exec vp check`, `pnpm exec vp test`, and `pnpm exec vp build` or `pnpm exec vp pack` for interactive commands from day one. Keep bare `vp` in package scripts.
4. Let `vp create` own the first tooling pass when possible: recent Vite+ releases can migrate ESLint/Prettier-era defaults toward oxlint/oxfmt, select multiple editors, and write language-specific formatter overrides into editor settings. Vite+ 0.2.9+ also supports JetBrains IDE setup by writing the Oxc plugin ID to `.idea/externalDependencies.xml`; preserve the project's chosen `.idea` gitignore policy. Non-interactive setup skips existing JetBrains XML files instead of overwriting them, so report skipped files and reconcile them manually when the generated setting is still required.
5. `vp create` writes `npm.scriptRunner: "vp"` into `.vscode/settings.json` automatically. Keep it unless the team has not adopted `vp` locally.
6. With npm 12 on Vite+ 0.2.9+, inspect the blocked-install-script list from `vp create` and let its `vp pm approve-builds` plus `vp pm rebuild` flow finish. Do not treat an installed-but-unbuilt dependency as a successful scaffold.

## Existing Repo

1. Audit current scripts, CI, test imports, package manager, and packaging flow before migrating.
2. Install the current lockfile, then use `pnpm exec vp migrate` as the default starting point when the installed CLI is already the intended version instead of a hand-rolled conversion. Pass `--agent <name>` and `--editor <name>` to write agent and editor config in the same pass; pass `--no-interactive` for non-interactive runs. If the repo does not yet depend on Vite+, use `pnpm --package=vite-plus@<target> dlx vp migrate` once, then switch to the installed CLI.
3. After running `vp migrate`, confirm `vite` imports were rewritten to `vite-plus` and `vitest` imports were rewritten to `vite-plus/test` before removing the old dependencies.
   - In a monorepo, prefer running `vp create` and `vp migrate` against the workspace root with `--editor <name>` once. Use `--no-editor` when generating per-package apps or libraries so each leaf does not generate its own `.vscode/` or `.zed/` settings that conflict with the root configuration.
4. If Vite+ is already installed, inspect its packaged guidance files first. Recent releases ship docs directly at `node_modules/vite-plus/docs/`, and a common guidance entry is `node_modules/vite-plus/AGENTS.md`. Use whatever `AGENTS.md`, `CLAUDE.md`, or rules file ships with the installed toolchain.
5. Reconcile generated files with the repo's real guardrails and release flow instead of assuming stock output is final.
6. Keep useful generated agent guidance, but merge it into the repo's real guidance files such as `AGENTS.md`, `CLAUDE.md`, or repo rules instead of accepting generic Vite+ boilerplate unchanged.
7. Do not require or install a machine-global `vp`. The repository's `vite-plus` dependency is the authoritative CLI. Project dependencies should normally move with `pnpm exec vp migrate` from the workspace root.
8. For existing Vite+ projects, run the exact target migrator as `pnpm --package=vite-plus@<target> dlx vp migrate` when advancing beyond the installed release. It re-pins `vite-plus`, the `vite` -> `@voidzero-dev/vite-plus-core` alias, and Vitest-related pins across workspace packages without re-running first-time setup. The installed `pnpm exec vp migrate` remains useful for idempotence or full setup at its own version, but it cannot choose a newer toolchain. Use `--full` only when you intentionally want hooks, editor files, agent files, and lint migration touched again.
9. For 0.1.x to 0.2.x upgrades, still inspect the result instead of trusting migration as a black box. Remove `@voidzero-dev/vite-plus-test`, keep the `vite` -> `@voidzero-dev/vite-plus-core` alias plus the exact upstream `vitest` override written by migration, and classify any direct Vitest, coverage, UI, or browser-provider usage before deciding which upstream Vitest packages must remain direct dependencies.

## Notes

- Vite+ detects the package manager from the workspace in this order: `packageManager`, `devEngines.packageManager`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `yarn.lock` / `.yarnrc.yml`, `package-lock.json`, `bun.lock` / `bun.lockb`, then config-only fallbacks. With none of those, `vp` falls back to `pnpm`. Preserve an existing explicit declaration instead of adding a competing source.
- `vp migrate` merges tool-specific config such as `.oxlintrc*`, `.oxfmtrc*`, and lint-staged config into `vite.config.ts`. Prefer that merge path before deleting old config files.
- Prefer a single coherent migration over partial adoption that leaves scripts, imports, and CI out of sync.
- Validate migrations with `pnpm install --frozen-lockfile`, `pnpm exec vp check`, `pnpm exec vp test`, and then `pnpm exec vp build` or `pnpm exec vp pack` as appropriate. Diagnose Node and Corepack through the repo's declared runtime manager; `vp env` belongs to the standalone launcher and is not part of this repository-local workflow.
