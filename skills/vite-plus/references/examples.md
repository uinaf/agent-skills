# Maintained Examples

Use while implementing Vite+ config, scripts, packaging, or CI. Run the target
repository's migrator first. Inspect its installed documentation and existing
config before selecting an external example for an unresolved question.

Choose examples that exercise the required package shape:

- Standalone CLI or package: consolidated config, type-aware checks, packing,
  installed-tarball smoke tests, and release verification.
- Monorepo: recursive tests, topological builds, package boundaries, and
  separate application deployment and package publication.
- Library with an example app: initial library build, dependent app startup,
  and parallel development tasks.

Read the example's current code and guidance. Reuse the demonstrated task
relationships, adapting versions, package names, exceptions, and delivery
policy to the target repository. Prefer maintained upstream examples when
available; do not make another owner's repository a setup dependency.
