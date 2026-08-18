# Actions Security

Use when a workflow executes project code or loads publish, signing, deploy, or
other privileged credentials.

## Trust Boundary

- Never use `pull_request_target` to check out, install, build, test, package,
  or otherwise execute pull-request code.
- Fork and pull-request jobs use `pull_request`, read-only permissions, and no
  delivery secrets.
- Secret-bearing work runs only on trusted branches, protected tags, or a
  validated manual dispatch.
- Manual inputs are validated in a secretless job, refs resolve to one immutable
  SHA, and downstream jobs consume only sanitized outputs.

## Permissions and Credentials

Default workflow permissions to `contents: read` or `{}`. Grant write, OIDC,
attestation, or pull-request permissions only to the job that needs them.
Monitoring and notification jobs stay read-only.

Use `persist-credentials: false` through checkout, install, build, pack, and
test in privileged workflows. Add write credentials only at the narrow delivery
boundary. Fetch full history only when tags, history, or affected detection
requires it.

## Dependencies, Caches, and Logic

- Pin high-trust remote Actions to reviewed full SHAs and keep an automated
  update path. Repository-level SHA enforcement is useful only after the
  current allowlist and updater contract are understood.
- Run `actionlint`, `zizmor`, and appropriate secret scanners. Use supported
  configuration instead of shell glue that merely silences them.
- When the owner maintains many repositories, define the scan baseline once as
  a reusable workflow in the owner's `.github` repository
  (`on: workflow_call`, every image and Action digest-pinned there) and give
  each repository a thin caller job
  (`uses: <owner>/.github/.github/workflows/<name>.yml@main`) that owns its
  triggers. Version and digest bumps then land in one place for every adopter.
  A repository with bespoke scanner needs keeps its own copy deliberately.
  `zizmor`'s blanket pin policy flags the caller's branch ref; adopters allow
  first-party refs while keeping hash pins for everything else
  (`.github/zizmor.yml`: `unpinned-uses` policies `"<owner>/*": ref-pin`,
  `"*": hash-pin`).
- Never share package caches from untrusted pull requests with privileged
  publish, signing, release, or deploy jobs.
- Keep workflow YAML orchestration-thin. Prefer maintained Actions and the
  repository's existing typed validation/task surfaces. When custom parsing,
  ref policy, summaries, provider branching, or security-sensitive logic is
  unavoidable, use a tested typed module or local action with explicit inputs
  and outputs. Do not grow inline shell or move the same spaghetti into a new
  `.sh` file; shell may only dispatch a few already-defined commands.

## Payloads and Artifacts

Actions artifacts are temporary same-run storage, not a durable release or
recovery boundary. A later run or recoverable deploy should consume an
immutable GitHub Release asset, registry version, image digest, provider-native
package, or signed archive with checksum/provenance.

Do not rebuild after verification unless the provider is intentionally the
builder and records equivalent provenance. Keep secret-bearing delivery jobs
non-cancellable and make retries reconcile durable state.
