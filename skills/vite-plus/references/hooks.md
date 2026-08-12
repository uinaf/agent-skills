# Commit Hooks

Use this reference when migrating, disabling, or removing Vite+ commit hooks.

## Default Shape

- Put staged-file commands in the root `vite.config.ts` `staged` block.
- On Vite+ 0.2.9+, use `pnpm exec vp hooks enable` to install or refresh the generated dispatcher and `pnpm exec vp hooks status` to inspect the effective preference, `core.hooksPath`, dispatcher, and project-owned scripts.
- Use `vp config` for broader project setup. It installs the dispatcher unless hooks were explicitly disabled and may also update agent integration; pass `--no-hooks` when it must leave dispatcher state unchanged.
- Keep project-owned hook scripts in one repo-wide directory, normally `.vite-hooks`. The generated dispatcher and shims live under `.vite-hooks/_` and are recreated by Vite+.
- Run staged checks with `vp staged`; use `--fail-on-changes` when CI or automation must reject autofix mutations.
- `vp hooks` does not create, modify, or delete project-owned hook scripts, the `staged` block, or package lifecycle scripts.
- A custom hooks directory must be a relative project subdirectory; absolute paths and `..` are rejected. Vite+ also refuses symlinked, multiply linked, or non-file dispatcher paths.
- `vp hooks enable` deliberately exits successfully when an environment variable disables hooks, a foreign `core.hooksPath` already owns the repo, or the dispatcher path is unsafe. Always inspect its message and require `vp hooks status` to show an installed dispatcher owned by Vite+ before calling enablement complete.

## Disable Without Removing

On Vite+ 0.2.9+, use `pnpm exec vp hooks disable`. It removes the generated dispatcher, unsets `core.hooksPath` when Vite+ owns it, and records a local preference so lifecycle scripts and later `vp config` calls do not reinstall it. Re-enable with `pnpm exec vp hooks enable`; pass `--hooks-dir <path>` when the project uses a custom directory.

For process-specific suppression, use the environment variable documented by the installed Vite+ release. Vite+ 0.2.7 uses `VITE_GIT_HOOKS=0`; current post-0.2.7 upstream uses `VP_GIT_HOOKS=0`. Do not copy the newest name into an older pinned project without checking `node_modules/vite-plus/docs/guide/commit-hooks.md`.

`HUSKY=0` remains the compatibility fallback on both sides of the rename. Verify both lifecycle-time hook installation and commit-time hook execution in the exact environment being changed.

## Remove Project Policy

After `vp hooks disable`, remove shared project policy only when the repository no longer wants hooks:

1. Remove `vp config` from the `prepare`, `postinstall`, or other lifecycle script.
2. Remove project-owned hook scripts such as `.vite-hooks/pre-commit` only when they are no longer needed.
3. Remove the `staged` block only when the repository no longer needs staged checks.
4. Verify with `pnpm exec vp hooks status`, inspect the effective Git config, and exercise a staged commit path when hooks remain enabled.

For releases older than 0.2.9, `vp hooks` is unavailable. Follow that installed release's packaged commit-hook documentation and verify `core.hooksPath` and the generated directory manually.
