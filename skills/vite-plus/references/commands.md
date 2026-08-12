# Commands

Use this reference before changing command invocations, package-manager usage, or script wiring in a Vite+ repo.

## Defaults

- Do not require a machine-global `vp`. Install dependencies with the package manager pinned by `package.json#packageManager` or `devEngines.packageManager`, then invoke the repository-local CLI as `pnpm exec vp ...` interactively.
- Keep bare `vp` inside `package.json` scripts: the package manager adds `node_modules/.bin` to the script environment. Bare `vp` is also correct in CI after `voidzero-dev/setup-vp`.
- Use the built-in `pnpm exec vp test`, `pnpm exec vp lint`, `pnpm exec vp fmt`, and `pnpm exec vp check` commands interactively.
- Built-in commands cannot be overridden by same-named scripts. `vp build` always runs the built-in Vite build; use `vp run build` (or `vpr build`) to execute a `package.json` `build` script.
- `vpr` is a standalone shorthand for `vp run`. Use whichever spelling the repo already prefers in a given scripts block.

## Runtime and Package Manager

- Let the repo's runtime manager own Node and honor its existing package-manager declaration (`packageManager` or `devEngines.packageManager`). Verify with `node --version`, `corepack --version`, and the selected package manager's version command.
- Bootstrap with `pnpm install --frozen-lockfile`; use `pnpm install --no-frozen-lockfile` only when the task intentionally changes manifests or the lockfile.
- The standalone launcher's `vp env`, `vp install`, and self-upgrade surface are outside this workflow. Do not add a global launcher just to use them.

## Toolchain Inspection

- On Vite+ 0.2.9+, use `pnpm exec vp toolchain` to print the tools, exact versions, and bundling or compilation relationships from the repository-local `vite-plus` package.
- Filter the tree with one or more tool names, such as `pnpm exec vp toolchain vitest`, and use `--json` when another command must inspect the result.
- Prefer `vp toolchain` over static version tables or `vp why` for code bundled or compiled into Vite+. Keep `vp why <package>` for package-manager dependency graphs.
- Do not pass `--global` in a repository-local workflow; it intentionally reports the standalone release instead of the project's active toolchain.
- The JSON report includes an absolute local `source.path`, and filtered reports keep relationship context rather than returning one bare version. Select nodes by `id`, and strip or redact `source.path` before saving the report in docs, logs, or review artifacts.

## Built-ins vs Scripts

- Built-in commands such as `vp dev`, `vp build`, `vp preview`, `vp test`, `vp lint`, `vp fmt`, and `vp check` bypass same-named `package.json` scripts.
- Use `vp run <script>` for repo-defined scripts that Vite+ does not replace directly.
- If a task needs caching, dependency ordering, or environment/input control, define it in the `run.tasks` block in `vite.config.ts`. Tasks defined in `vite.config.ts` are cached by default; `package.json` scripts are not.
- For one-off cache opt-in on a script, use `vp run --cache <script>` or set `run.cache.scripts: true` in `vite.config.ts`.
- Vite+ 0.2.9+ supports task IPC and automatic file-access tracking in the default Codex CLI and Claude Code sandboxes. If an older release fails before task code starts with `Failed to set up task communication: Operation not permitted`, upgrade rather than granting broader sandbox access or turning off caching.

## Check Commands

- `vp check` runs format, lint, and type checks together.
- Use `vp check --no-lint` for a type-check-only workflow when Vite+ owns the repo.
- Use `vp lint` or `vp fmt` only when the workflow genuinely needs the narrower pass; `vp check` is the default gate.

## Test Commands

- `vp test` does a one-shot run by default — unlike raw Vitest, it does not stay in watch mode.
- Use `vp test watch` for watch mode and `vp test run --coverage` for coverage.
- See `references/testing.md` for import surface and config rules.

## Native Modules and Binaries

- `vpx <pkg[@version]>` runs a local or remote binary, downloading on demand.
- `vp exec <bin>` runs a binary from the project's `node_modules/.bin`.
- `vp dlx <pkg>` runs a one-off package binary without adding it to dependencies.

## Upgrades

- Do not install or upgrade a global CLI for this workflow. Determine and pin the exact intended release, then run `pnpm --package=vite-plus@<target> dlx vp migrate` from the workspace root. The explicit `--package` and `vp` binary avoid pnpm's multiple-binary ambiguity. Migration pins to the version of the CLI executing it; an older `pnpm exec vp migrate` only reapplies that older toolchain and cannot select a newer release by itself.
- On projects already using Vite+, target-pinned migration defaults to a version-only upgrade and skips first-time setup unless `--full` is passed. After reinstalling the migrated lockfile, return to `pnpm exec vp ...` for every project command.
- If the repository does not yet contain `vite-plus`, use `pnpm --package=vite-plus@<target> dlx vp migrate` for the initial migration, then use the installed CLI for every subsequent command.
- Keep the package-manager `vite` alias mapped to the matching `npm:@voidzero-dev/vite-plus-core@<version>`. `vp migrate` should re-pin it; verify the manifest, catalog or override, and lockfile importer before calling the upgrade done.
- Let `vp migrate` re-pin the package-manager `vitest` override to the exact bundled version even when a node-mode-only project does not declare `vitest` directly. On 0.2.9+, verify that pin with `pnpm exec vp toolchain vitest`.
- For Vite+ 0.2.x and newer, remove the old `@voidzero-dev/vite-plus-test` alias/wrapper instead of updating it. `vp test` uses upstream Vitest through `vite-plus`; direct `vitest` and `@vitest/*` packages are only for repos that use upstream Vitest APIs, coverage/UI packages, or browser providers directly.
- Use the local CLI version, `vp toolchain`, manifest or catalog values, and lockfile importer as proof of the selected target. `pnpm exec vp outdated` is only an optional package-manager drift report: it can include unrelated dependencies and can flag a newer release even when the deliberately selected target is installed correctly.
- When release notes report Oxfmt or Oxlint upgrades, run `pnpm exec vp fmt` after reinstalling and review the formatting diff before `pnpm exec vp check`; code that passed the previous tool versions may produce new findings.

## Validation Path

- Prefer the standard migration validation sequence: `pnpm install --frozen-lockfile`, `pnpm exec vp check`, `pnpm exec vp test`, then `pnpm exec vp build` or `pnpm exec vp pack` as appropriate.
