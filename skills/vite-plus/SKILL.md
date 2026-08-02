---
name: vite-plus
description: "Migrate or align frontend package and monorepo repositories to Vite+. Use when the user asks to migrate to Vite+, standardize on `vp`, clean up a Vite+ setup, or move CI, tests, packaging, and hooks onto the stock Vite+ workflow. Prefer Vite+ commands over direct package-manager and Vitest wiring unless the repo has a proven exception."
disable-model-invocation: true
---

# Vite+

Move a frontend repo closer to the stock Vite+ toolchain while preserving repo-specific release and runtime logic. Vite+ is in beta, but still pre-1.0: install the repository dependencies first, verify behavior against `pnpm exec vp --version`, inspect packaged docs under `node_modules/vite-plus/docs/`, and check the latest [release notes](https://github.com/voidzero-dev/vite-plus/releases) instead of relying on memorized command shapes.

## Migration Targets

Default to this destination unless a repo-specific boundary clearly blocks it. If you keep an old command shape, document the reason.

- CI uses `voidzero-dev/setup-vp` on GitHub and GitLab. The GitHub Action owns Node and package-manager bootstrap; the GitLab template uses the job-provided Node runtime. Both install dependencies by default. Disable `run-install` only for an intentional explicit install step. Pin GitHub Actions to full commit SHAs when the repo requires it
- Tooling versions have one checked-in source of truth. Node comes from `.node-version`; package-manager versions come from `package.json#packageManager`; Vite+ comes from the repo's `vite-plus` dependency or workspace catalog. Do not repeat Node, pnpm, or Vite+ literals in workflows when a source file can be read
- test files use `vite-plus/test` (and `vite-plus/test/browser/context` for browser mode); Vite+ 0.2.x runs upstream Vitest directly and no longer uses `@voidzero-dev/vite-plus-test`
- scripts prefer `vp dev`, `vp test`, `vp test watch`, `vp test run --coverage`, `vp pack`, `vp build`, `vp preview`, and `vp run <script>` (or `vpr <script>`) over direct package-manager, raw Vitest, or tsdown wiring
- hooks use `vp config`, `.vite-hooks`, and `vp staged` as the default hook stack
- single-source config in `vite.config.ts`: no parallel `vitest.config.ts`, `.oxlintrc*`, `.oxfmtrc*`, or `tsdown.config.ts`
- project agent guidance comes from Vite+ itself when possible: `vp migrate --agent <name>` writes the official short `AGENTS.md`/`CLAUDE.md` block, and installed projects may expose the same guidance at `node_modules/vite-plus/AGENTS.md`
- contributor docs move to the new `vp` commands in the same change
- interactive repository commands use `pnpm exec vp ...` after `pnpm install --frozen-lockfile`; bare `vp` remains correct inside package scripts and in CI after `voidzero-dev/setup-vp`

## Workflow

1. Confirm the project is on Vite 8+ and, when it directly depends on Vitest or `@vitest/*`, Vitest 4.1+.
2. Audit current scripts, workflows, Vite config, test imports, release flow, package manager, and packaging.
3. Read [references/bootstrap.md](references/bootstrap.md) for entrypoints (`vp create`, `vp migrate`), editor/agent config, local guidance-file discovery, and validation path.
4. Pick the shape and load only that reference: [references/packages.md](references/packages.md) for standalone packages, or [references/monorepos.md](references/monorepos.md) for workspaces.
5. Migrate scripts, `vite.config.ts`, test imports, hooks, and packaging together. Verify interactively with `pnpm exec vp check && pnpm exec vp test` before moving on.
6. Update CI per [references/ci-cd.md](references/ci-cd.md).
7. Update tests and coverage per [references/testing.md](references/testing.md).
8. Check [references/commands.md](references/commands.md) before changing command invocations. Load [references/known-issues.md](references/known-issues.md) only on unexpected behavior or when upgrading Vite+.
9. Keep repo-specific release, binary, or packaging steps Vite+ does not replace. Verify jobs may use Vite+ dependency caches; secret-bearing release, publish, signing, and deploy jobs disable dependency caches and run fresh installs.
10. To adopt a newer Vite+ release, use the repository-local CLI: install the current lockfile, run `pnpm exec vp migrate`, then reinstall if migration changed manifests. Follow [references/commands.md#upgrades](references/commands.md#upgrades). Use `--full` only when first-time setup should run again. Confirm with `pnpm exec vp --version`, lockfile inspection, and `pnpm exec vp outdated`.
11. End-to-end validation: `pnpm install --frozen-lockfile`, then `pnpm exec vp check` and `pnpm exec vp test`; verify `pnpm exec vp build` or `pnpm exec vp pack` artifacts, `pnpm exec vp preview` where applicable, `pnpm exec vp test run --coverage`, and `pnpm exec vp staged` on a staged change.

## Tooling Source Of Truth

Before changing CI, preserve one canonical version owner:

- Node: `.node-version`; wire it through `node-version-file: ".node-version"`
- package manager: `package.json#packageManager`
- Vite+: the `vite-plus` dependency or workspace catalog; when CI needs an explicit `version`, derive it from that source with a structured parser
- Vite core: keep the `vite` manifest dependency plus package-manager override/catalog/resolution pointed at the matching `npm:@voidzero-dev/vite-plus-core@<version>`
- Vitest: do not add a `vitest` override for node-mode-only Vite+ 0.2.x projects; add direct Vitest and `@vitest/*` packages only when the project uses Vitest APIs, coverage packages, UI, or browser providers directly
- workflow exceptions: document why the action cannot read the repo-owned source
- Docker: for containerized builds, prefer the official `ghcr.io/voidzero-dev/vite-plus` toolchain image; do not use it as a production runtime image

Concrete shapes:

```yaml
- uses: voidzero-dev/setup-vp@<full-sha> # v1.x.y
  with:
    node-version-file: ".node-version"
    cache: true
- run: vp check
- run: vp test
- run: vp build
```

```ts
import { defineConfig } from 'vite-plus'

export default defineConfig({
  lint: {
    options: { typeAware: true, typeCheck: true },
  },
  staged: {
    "*.{js,ts,tsx,vue,svelte}": "vp check --fix",
  },
})
```

```diff
 # package.json scripts
-"test": "vitest run --coverage",
-"test:watch": "vitest",
+"test": "vp test run --coverage",
+"test:watch": "vp test watch",
```

## Guardrails

- Prefer `pnpm dlx vite-plus create` for an uninitialized repository and `pnpm exec vp migrate --agent <name> --editor <name>` once Vite+ is a local dependency, rather than hand-rolling agent or editor config.
- Preserve working release workflows, binary packaging, and publish steps while migrating the surrounding Vite+ flow.
- After editing workflows, grep for duplicated tooling literals such as `node-version:`, `pnpm@`, `corepack prepare`, and inline `version: "0.`. Keep action pins separate: GitHub Action SHAs and their same-line version comments are allowed because they identify the action, not the project toolchain.
- For cacheable `vp run` tasks, rely on automatic file tracking first. A standard `vp build` task now reports Vite inputs, outputs, and relevant env metadata to Vite Task, so do not add manual `input`, `output`, or `env` config unless the project has behavior Vite cannot report.
- If `vp check` is not running type-aware lint or type checks, confirm `lint.options.typeAware` and `lint.options.typeCheck` in `vite.config.ts`, and check for `compilerOptions.baseUrl` in `tsconfig.json` — `tsgolint` does not support `baseUrl` and Vite+ silently skips type-aware checks when it is present.

## Known Caveats

See [references/known-issues.md](references/known-issues.md) for current upstream caveats (SSR `instanceof` failures and Vite+ 0.2.x Vitest wrapper removal). Before preserving legacy wiring, reproduce the caveat on the installed release and inspect the upstream resolution for the first fixed version or upgrade path. A closed issue does not prove an older pinned release is unaffected.
