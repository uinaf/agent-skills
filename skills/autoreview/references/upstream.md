# Upstream

This skill tracks OpenClaw's shared agent-skills repo as its canonical upstream.

- Source: https://github.com/openclaw/agent-skills/tree/main/skills/autoreview
- Reviewed and applied upstream commit: `66cf3df`.

This repo's version keeps `uinaf/agents` packaging files such as
`.tessl-plugin/plugin.json`, `agents/openai.yaml`, and this provenance note
around the upstream skill core.
It prunes engine/platform branches Altay does not use: the local helper is
Codex + Claude Code only, with no Droid, Copilot, Pi, OpenCode, Cursor,
PowerShell harness, or PowerShell parallel-test shell.

The `66cf3df` refresh keeps the portable upstream hardening: bundle-only
reviewer workspaces, named Codex permissions, Claude tool confinement, source
mutation detection, sanitized parallel tests, binary/gitlink/link/input guards,
TruffleHog preflight over exact review snapshots, deleted-file redaction,
path-traversal defenses, and the corrected TypeScript secret scanner. It also
keeps safe Codex model/response tuning and service-tier controls.

OpenClaw-specific Testbox/Blacksmith credential staging, `behavior-validator`
coupling, extra review engines, the Sol-to-Terra fallback surface, and
independent multi-pass clean verdicts remain excluded. The helper refuses a
bundle above the single-pass aggregate limit because separate chunks cannot
prove cross-chunk contracts. Local preferred model lists remain
`gpt-5.6-sol` and `claude-opus-5`; both engines default to `high`
reasoning effort. The upstream P0-only default is intentionally excluded so
the local helper continues to return every validated finding.

When borrowing future updates, start from OpenClaw's current helper and tests,
then reapply this repo's packaging, Codex + Claude boundary, model policy, and
platform pruning. Update this pin only after the adapted hardening suite passes.
