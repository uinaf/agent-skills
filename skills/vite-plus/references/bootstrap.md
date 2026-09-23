# Bootstrap and Migration

Use for a new Vite+ repository, first migration, or pinned-version upgrade.

## New Repository

1. Select an exact Vite+ target compatible with the intended Vite and test
   surface.
2. Run that target's documented `vp create` through the package manager without
   installing a global CLI.
3. In automation, answer Git, editor, agent, package-manager, and other prompts
   explicitly.
4. Install the generated lockfile and inspect every skipped or pre-existing
   editor, hook, agent, and config file.

Use the closest stock template. Add repository-specific release, deployment,
or consumer behavior only after the generated project works.

## Existing Repository

1. After the initial install and audit, if the installed CLI is the target, run its
   migration command from the workspace root.
2. To adopt a newer release, run the exact target package's `vp migrate`
   binary: `pnpm --package=vite-plus@<target> dlx vp migrate`. Substitute the
   selected exact version. An older installed migrator cannot select a newer
   toolchain; `vp upgrade` manages the standalone installation, not this path.
3. Use noninteractive, agent, editor, or full-setup flags only when supported by
   that exact release and required by the task.
4. Reinstall after manifest or lockfile changes.
5. Confirm migrated imports, aliases or overrides, consolidated config, and
   removed legacy dependencies against the installed toolchain report.

Preserve `catalog:` references. [0.3.0 fixes `vp up` replacing Vite catalog
references with aliases](https://github.com/voidzero-dev/vite-plus/releases/tag/v0.3.0);
run the target migrator to repair affected projects and inspect the catalog owner.

Run formatting before the final checks and review the diff.

## 1.0 Upgrades

[1.0.0-rc.0](https://github.com/voidzero-dev/vite-plus/releases/tag/v1.0.0-rc.0)
moves `vp test` to Vitest 5. Follow the
[Vitest 5 guide](https://viteplus.dev/guide/vitest-v5):

- Run the target migrator before any manual dependency edit, with the original
  lockfile and install in place; it detects the source Vitest from them. Move
  projects below Vitest 4 to a 0.x release first. Save the per-file review
  report before reinstalling.
- `BLOCK` stops dependency updates: fix it and rerun. `REVIEW` still exits
  successfully; resolve every item before committing.
- Node becomes `^22.18.0 || ^24.11.0 || >=26.0.0`. The migrator bumps version
  files and manifest runtime fields, but not CI images, containers, or the
  published `engines.node`; update those at their owner. When a published
  range must keep admitting Node 20 or 25, constrain contributors with
  `devEngines.runtime` instead.
- `vite-plus/test/runners` and `vite-plus/test/suite` are gone; the bundled
  WebdriverIO provider moves to the community `@vitest/browser-webdriverio`.
- The migrator moves toolchain pins into catalog entries and adds
  compatibility settings, such as `test.clearMocks: false` and
  `pack.deps.resolveDepSubpath`, each with a removal comment. Keep one only
  while its stated condition holds.
- The package no longer ships `oxlint` or `oxfmt` binaries. Repoint editor and
  script integrations to `vp lint --lsp`, `vp fmt --lsp`, and
  `vp fmt --stdin-filepath`; the migrator leaves editor settings alone unless
  its editor setup runs.
- `vp staged` needs Node `^22.22.1 || ^24.11.0 || >=26.0.0` and Git 2.32+ on
  every machine and CI job that runs the hook.

Keep a project on its 0.x pin until its runtime and test types pass on the
target.

## pnpm 12+ Upgrades

Read the selected release's [pnpm notes](https://github.com/pnpm/pnpm/releases).
For the [12.0 boundary](https://github.com/pnpm/pnpm/releases/tag/v12.0.0):

- Fix unknown `pnpm-workspace.yaml` settings: they fail when the running pnpm
  satisfies the project pin. Keep non-pnpm metadata elsewhere.
- Hosted Git dependencies normalize to HTTPS identities. Exercise private
  dependency access in CI; preserve machine-owned transport/auth configuration.
- Inspect peer-cycle lockfile changes and `engineStrict` failures through
  optional dependency trees instead of weakening the install policy.
- Check the generated package-manager declaration; pnpm initialization can
  select the registry's latest version rather than the invoking version.

Reinstall with the selected pin to regenerate the lockfile, then prove a frozen
install. Keep the runtime under its existing owner when pnpm or Vite+ offers
to manage it.
