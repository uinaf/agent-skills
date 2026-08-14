# CI/CD

Use before changing GitHub Actions, GitLab CI, release, publish, or deploy jobs.

## Verify Jobs

Prefer the official Vite+ setup integration when it supports the runner. Read
its current inputs from the pinned action/template release rather than copying
a static table.

- Let the action read the repository's Vite+, Node, package-manager, and
  lockfile owners when supported.
- Disable its runtime manager only when another declared surface owns Node.
- Use its default install behavior unless custom install arguments or sequencing
  are required.
- Run bare `vp` only after the setup integration provides it; otherwise use the
  repository-local CLI through the package manager.
- Keep one repository verification entrypoint when project-specific checks
  extend Vite+. Prefer a package task, Vite+ task graph, or typed project CLI;
  do not add a shell wrapper merely to concatenate `vp` commands.

Pin GitHub Actions according to repository policy and keep a Dependabot update
path. Pin GitLab remote templates and their setup target to the same immutable
release. Provide Node through the GitLab image or runner when the template does
not own it.

## Privileged Jobs

Vite+ does not replace release or deploy orchestration. Preserve repository
packaging, signing, publishing, and provider steps.

- Disable dependency caches in secret-bearing release, publish, signing, or
  deploy jobs unless the cache is isolated to the same trusted event class.
- Install fresh and verify the exact payload before credentials are used.
- Keep CI-only release plugins in the workflow when the repository does not
  intentionally expose a local release command.
- Use the official Vite+ toolchain container only for build tooling, never as a
  production runtime image.

## Verification

Confirm the workflow uses the intended pinned Vite+ and runtime owners, installs
the final lockfile, and runs the same checks, tests, and build or pack surface as
local verification. Preserve release/deploy proof beyond those local gates.
