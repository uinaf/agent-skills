# Testing

Use when migrating tests, coverage, or browser mode.

- Confirm the installed release's public test and browser-context import paths.
- Move imports, config, scripts, coverage packages, and lockfile pins together.
- Put supported test configuration in the `test` block of `vite.config.ts`.
- Use the installed `vp test` help for one-shot, watch, coverage, filtering, and
  reporter syntax; do not infer raw Vitest defaults.
- Remove obsolete wrappers only after migration and reinstall prove the public
  Vite+ imports resolve.
- Keep direct upstream Vitest packages only for APIs, coverage/UI modules, or
  browser providers the repository uses directly, pinned compatibly with the
  installed toolchain.

Verify the default suite, every configured coverage or browser path, and the
real consumer or runtime surface affected by the migration.
