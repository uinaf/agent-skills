# Standalone Packages

Use for one publishable library, CLI, executable, or application package.

- Prefer `vp pack` for libraries and executables; `vp build` for applications.
- For tsup migrations, inspect the migrator's output before consolidating it.
  On a project already using Vite+, conversion needs `vp migrate --full`. It
  writes an intermediate `tsdown.config.ts` that `vite.config.ts` imports,
  plus a direct `tsdown` dependency and script (observed on 1.0.0-rc.0). The
  [pack guide](https://viteplus.dev/guide/pack) recommends the `pack` block in
  `vite.config.ts`: move supported settings there, switch the script to
  `vp pack`, drop the direct `tsdown` dependency, prove output parity, then
  remove the intermediate config. Retain it only for a concrete unsupported
  configuration shape.
- Keep direct Vitest ecosystem packages only when the repository imports their
  APIs or needs coverage, UI, or browser providers directly.

Verify the packed artifact as a downstream consumer would, not only through
source-level tests.
