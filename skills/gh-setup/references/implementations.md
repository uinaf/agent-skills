# Maintained Implementations

Use only when creating or materially rewriting GitHub workflow code. These are
working public examples, not universal templates. Read each repository's guide,
manifest, scripts, and live GitHub settings; reuse the named contract while
adapting triggers, gates, identities, targets, and current dependency pins.

| Contract | Code to inspect |
| --- | --- |
| Pull-request verification plus npm trusted publishing, App-signed version writeback, and immutable release readback | [`uinaf/workspace-kit` verify](https://github.com/uinaf/workspace-kit/blob/main/.github/workflows/verify.yml), [release](https://github.com/uinaf/workspace-kit/blob/main/.github/workflows/release.yml), and [semantic-release config](https://github.com/uinaf/workspace-kit/blob/main/.releaserc.json) |
| Monorepo verification and a non-cancellable Environment-scoped Cloudflare deploy, separate from package release | [`uinaf/attach` main](https://github.com/uinaf/attach/blob/main/.github/workflows/main.yml), [release](https://github.com/uinaf/attach/blob/main/.github/workflows/release.yml), and [task graph](https://github.com/uinaf/attach/blob/main/package.json) |
| Draft-first binary release, checksums, provenance attestations, immutable publication, and downstream Homebrew update | [`uinaf/tccutil-rs` CI/release](https://github.com/uinaf/tccutil-rs/blob/main/.github/workflows/ci.yml) and [semantic-release config](https://github.com/uinaf/tccutil-rs/blob/main/.releaserc.json) |
| Organization-level collaboration defaults | [`uinaf/.github`](https://github.com/uinaf/.github) |

Before reuse, confirm the linked repository is still public and active, open the
current source rather than relying on this summary, and preserve the target
repository's own lifecycle and policy. If no example matches, implement the
smallest tested module or local action in the repository's primary language
instead of growing inline workflow or shell logic.
