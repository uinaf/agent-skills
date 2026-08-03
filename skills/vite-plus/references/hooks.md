# Commit Hooks

Use this reference when migrating, disabling, or removing Vite+ commit hooks.

## Default Shape

- Put staged-file commands in the root `vite.config.ts` `staged` block.
- Use `vp config` to install one repo-wide hooks directory, normally `.vite-hooks`.
- Run staged checks with `vp staged`; use `--fail-on-changes` when CI or automation must reject autofix mutations.
- Use `pnpm exec vp config --no-hooks` when config or agent setup should leave existing hooks unchanged.

## Disable Without Removing

Use the environment variable documented by the installed Vite+ release. Vite+ 0.2.7 uses `VITE_GIT_HOOKS=0`; current post-0.2.7 upstream uses `VP_GIT_HOOKS=0`. Do not copy the newest name into an older pinned project without checking `node_modules/vite-plus/docs/guide/commit-hooks.md`.

`HUSKY=0` remains the compatibility fallback on both sides of the rename. Verify both lifecycle-time hook installation and commit-time hook execution in the exact environment being changed.

## Remove Completely

Undo each piece installed by `vp config`:

1. Unset the repository's `core.hooksPath`.
2. Remove the configured hooks directory.
3. Remove `vp config` from the `prepare` or other lifecycle script so the next install does not restore hooks.
4. Remove the `staged` block only if the repository no longer needs staged checks.
5. Verify the effective Git config and exercise a staged commit path.
