# Known Issues

Vite+ is pre-1.0 and still moving quickly. Carry a caveat only when its failure reproduces on the installed release. Inspect the upstream issue or release notes to identify the first fixed version and preferred upgrade path; a closed report can still describe a bug in an older pinned release. Document the exact affected version and reproduction, then re-check the exception when upgrading.

## TanStack Start / SSR `instanceof` failures

Some package managers (notably bun, sometimes npm) install two physical copies of `@voidzero-dev/vite-plus-core`: one via the `vite` alias and one via `vite-plus`'s direct dependency. The duplicate breaks SSR `isRunnableDevEnvironment()` checks.

- If SSR fails after migration, run `vp dedupe` and confirm only one `@voidzero-dev/vite-plus-core` exists under `node_modules`.
- Tracking: [voidzero-dev/vite-plus#1391](https://github.com/voidzero-dev/vite-plus/issues/1391).

## Vite+ 0.2.x Vitest wrapper removal

Vite+ 0.2.x removed `@voidzero-dev/vite-plus-test` and runs upstream Vitest directly.

- On 0.1.x to 0.2.x upgrades, delete the wrapper from package manifests, lockfiles, catalogs, overrides, resolutions, and peer-tweak rules.
- Plain node-mode tests should not add a direct `vitest` dependency; direct Vitest users and browser-mode projects may still need pinned upstream Vitest packages that match the bundled version.
- If browser tests fail with `vitest/internal/browser` resolution errors under pnpm, add direct `vitest` in the package that runs browser tests at the bundled version, then reinstall cleanly if stale peer variants remain.

## Vitest 5 jest-dom matcher types

On [1.0.0-rc.0](https://github.com/voidzero-dev/vite-plus/releases/tag/v1.0.0-rc.0),
loading browser declarations first can reject valid Node jest-dom assertions
(jest-dom 6.9.1 and 7.0.1).

- Load `@testing-library/jest-dom/vitest` through `compilerOptions.types` or an
  included setup file, then type-check Node and browser matchers separately.
- If either still fails, keep the project on its 0.x pin
  ([Vitest 5 guide](https://viteplus.dev/guide/vitest-v5)).

## Cloudflare Workers test pool on Vitest 5

`@cloudflare/vitest-pool-workers` 0.22.0 peers on Vitest 4. After a
1.0.0-rc.0 migration every Worker test file fails to start (`Failed to start
cloudflare-pool worker`). Keep Worker-tested projects on their 0.x pin until
[workers-sdk#15618](https://github.com/cloudflare/workers-sdk/issues/15618)
ships.

## Oxc VS Code extension and `vp fmt --lsp`

The released Oxc extension cannot launch `vp fmt --lsp` until
[oxc-vscode#384](https://github.com/oxc-project/oxc-vscode/pull/384) ships, so
format-on-save stops after 1.0 removes the `oxfmt` binary. `vp fmt` and staged
hooks still format.
