# Monorepos

Use for workspace repositories adopting Vite+.

## Ownership

- Run creation and migration from the workspace root unless a leaf is truly
  independent.
- Keep one root editor, agent, hook, and consolidated tooling policy.
- Preserve the package manager's workspace declaration and dependency graph.
- Move scripts, test imports, config, and CI as one coherent migration.

## Task Selection

Use the installed `vp run` surface for:

- one package and task
- a package plus its transitive workspace dependencies
- every package defining a task
- filtered or parallel execution

Confirm the exact flags with installed help. Dependency order comes from
workspace manifests; do not introduce a second project graph.

For a consumer app that imports a publishable sibling package, choose
deliberately:

- **Built-artifact consumption:** slower, but proves the package exports and
  shipped artifact that external consumers receive.
- **Source alias:** faster local iteration, but does not prove packaging.

Prefer built-artifact consumption when the demo or app doubles as consumer
verification. Seed required one-shot builds before starting parallel watch
tasks; a never-ending dependency watcher cannot precede another dev task in a
sequential chain.

## Caching

Start with simple package scripts. Enable Vite+ caching or root
`vite.config.ts` task definitions only after the workflow is correct and a hot
path is measured.

Automatic file tracking is preferred when supported. Add explicit inputs,
outputs, environment, or dependency rules only for behavior the installed
toolchain cannot infer. Verify cached tasks invalidate on source, config,
lockfile, and relevant environment changes.

## Completion

- important leaf packages check, test, and build or pack independently
- transitive consumer builds execute in dependency order
- workspace-wide tasks cover every intended package exactly once
- hook and editor policy is root-owned
- release, deploy, SDK, or native packaging tasks Vite+ does not own remain intact
