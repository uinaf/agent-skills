# Maintained Implementations

Use when creating or materially rewriting workflow code. Inspect the target
repository's existing workflows first, then maintained examples selected by
its owner. Read their manifests, scripts, live settings, and current pins
before reuse.

Match the example to the delivery contract:

- Package releases: verification, registry authentication, version writeback,
  and immutable release readback.
- Application deployment: Environment-scoped concurrency, verified artifact
  promotion, and deployment health checks.
- Binary releases: draft publication, checksums, attestations, immutable
  artifacts, and downstream package updates.
- Organization defaults: the target owner's collaboration and scan policies.

Adapt triggers, gates, identities, targets, and dependencies to the target
repository. An example does not authorize adopting its owner's policy or
credentials. If none fits, implement the smallest tested module or local
action in the repository's primary language instead of growing inline workflow
or shell logic.
