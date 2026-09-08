# Standalone Packages

Use for one publishable library, CLI, executable, or application package.

- Prefer `vp pack` for libraries and executables; `vp build` for applications.
- For tsup migrations, inspect the generated config before consolidating it.
  [Vite+ 0.3.0](https://github.com/voidzero-dev/vite-plus/releases/tag/v0.3.0)
  converts `tsup.config.ts` to `tsdown.config.ts` importing `vite-plus/pack`.
  The [pack guide](https://viteplus.dev/guide/pack) still recommends the `pack`
  block in `vite.config.ts`: move supported settings there, prove output parity,
  then remove the intermediate config. Retain it only for a concrete unsupported
  configuration shape.
- Keep direct Vitest ecosystem packages only when the repository imports their
  APIs or needs coverage, UI, or browser providers directly.

Verify the packed artifact as a downstream consumer would, not only through
source-level tests.
