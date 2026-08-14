# Standalone Packages

Use for one publishable library, CLI, executable, or application package.

- Prefer the installed Vite+ pack surface for libraries and executables and the
  build surface for applications.
- Keep pack, test, lint, and format configuration in `vite.config.ts` when the
  selected release supports it.
- Let the exact migrator own the required Vite core alias and bundled Vitest
  pin. Verify them in the manifest and lockfile instead of copying a versioned
  example from this reference.
- Keep direct Vitest ecosystem packages only when the repository imports their
  APIs or needs coverage, UI, or browser providers directly.
- Preserve SDK generation, native packaging, release preparation, and consumer
  checks Vite+ does not replace.

Verify the packed artifact as a downstream consumer would, not only through
source-level tests.
