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
