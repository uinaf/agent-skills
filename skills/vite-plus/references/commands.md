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

## Built-ins vs Scripts

- Built-in commands such as `vp dev`, `vp build`, `vp preview`, `vp test`, `vp lint`, `vp fmt`, and `vp check` bypass same-named `package.json` scripts.
- Use `vp run <script>` for repo-defined scripts that Vite+ does not replace directly.
- If a task needs caching, dependency ordering, or environment/input control, define it in the `run.tasks` block in `vite.config.ts`. Tasks defined in `vite.config.ts` are cached by default; `package.json` scripts are not.
- For one-off cache opt-in on a script, use `vp run --cache <script>` or set `run.cache.scripts: true` in `vite.config.ts`.

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

- Do not install or upgrade a global CLI. Use `pnpm exec vp migrate` from the project root to move the local `vite-plus` package forward. On projects already using Vite+, this defaults to a version-only upgrade and skips first-time setup unless `--full` is passed.
- If the repository does not yet contain `vite-plus`, use `pnpm dlx vite-plus migrate` for the initial migration, then use the installed CLI for every subsequent command.
- Keep the package-manager `vite` alias mapped to the matching `npm:@voidzero-dev/vite-plus-core@<version>`. `vp migrate` should re-pin it; verify the manifest, catalog or override, and lockfile importer before calling the upgrade done.
- For Vite+ 0.2.x and newer, remove the old `@voidzero-dev/vite-plus-test` alias/wrapper instead of updating it. `vp test` uses upstream Vitest through `vite-plus`; direct `vitest` and `@vitest/*` packages are only for repos that use upstream Vitest APIs, coverage/UI packages, or browser providers directly.
- Use `pnpm exec vp outdated` to confirm whether any Vite+ packages remain behind the intended release.

## Validation Path

- Prefer the standard migration validation sequence: `pnpm install --frozen-lockfile`, `pnpm exec vp check`, `pnpm exec vp test`, then `pnpm exec vp build` or `pnpm exec vp pack` as appropriate.
