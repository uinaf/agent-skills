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
5. Run the repository-local verification, test, and build or pack surfaces.

Use the closest stock template. Add repository-specific release, deployment,
or consumer behavior only after the generated project works.

## Existing Repository

1. Install the current lockfile and audit scripts, configs, imports, hooks, CI,
   packaging, and workspace ownership.
2. If the installed CLI is already the intended version, run its documented
   migration command from the workspace root.
3. To adopt a newer release, run the exact target package's `vp migrate`
   binary: `pnpm --package=vite-plus@<target> dlx vp migrate`. Substitute the
   selected exact version. An older installed migrator cannot select a newer
   toolchain; `vp upgrade` manages the standalone installation, not this path.
4. Use noninteractive, agent, editor, or full-setup flags only when supported by
   that exact release and required by the task.
5. Reinstall after manifest or lockfile changes.
6. Confirm migrated imports, aliases or overrides, consolidated config, and
   removed legacy dependencies against the installed toolchain report.

Prefer migration over hand conversion, but never treat generated output as
authoritative over repository-specific release and runtime contracts.

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

## Completion

- project and package-manager versions have one owner
- no unintended global CLI dependency exists
- old configs or dependencies remain only with a reproduced reason
- repository guidance documents the actual command surface
- checks, tests, build or pack, and relevant consumer/runtime proof pass
