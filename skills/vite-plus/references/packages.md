# Standalone Packages

Use for one publishable library, CLI, executable, or application package.

- Prefer the installed Vite+ pack surface for libraries and executables and the
  build surface for applications.
- Keep pack, test, lint, and format configuration in `vite.config.ts` when the
  selected release supports it.
- For tsup migrations, inspect the generated config before consolidating it.
  [Vite+ 0.3.0](https://github.com/voidzero-dev/vite-plus/releases/tag/v0.3.0)
  converts `tsup.config.ts` to `tsdown.config.ts` importing `vite-plus/pack`.
  The [pack guide](https://viteplus.dev/guide/pack) still recommends the `pack`
  block in `vite.config.ts`: move supported settings there, prove output parity,
  then remove the intermediate config. Retain it only for a concrete unsupported
  configuration shape.
- Let the exact migrator own the required Vite core alias and bundled Vitest
  pin. Verify them in the manifest and lockfile instead of copying a versioned
  example from this reference.
- Keep direct Vitest ecosystem packages only when the repository imports their
  APIs or needs coverage, UI, or browser providers directly.
- Preserve SDK generation, native packaging, release preparation, and consumer
  checks Vite+ does not replace.

Verify the packed artifact as a downstream consumer would, not only through
source-level tests.
