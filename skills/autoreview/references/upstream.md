# Upstream

This skill tracks OpenClaw's shared agent-skills repo as its canonical upstream.

- Source: https://github.com/openclaw/agent-skills/tree/main/skills/autoreview
- Reviewed and applied upstream commit: `66cf3df`.

This repo's version keeps `uinaf/agents` packaging files such as
`.tessl-plugin/plugin.json`, `agents/openai.yaml`, and this provenance note
around the upstream skill core.
It prunes engine/platform branches Altay does not use: the local helper keeps
Codex, Claude Code, and Cursor Agent, with no Droid, Copilot, Pi, OpenCode,
PowerShell harness, or PowerShell parallel-test shell.

The `66cf3df` refresh keeps the portable upstream hardening: bundle-only
reviewer workspaces, named Codex permissions, Claude tool confinement, source
mutation detection, sanitized parallel tests, binary/gitlink/link/input guards,
TruffleHog preflight over exact review snapshots, deleted-file redaction,
path-traversal defenses, and the corrected TypeScript secret scanner. It also
keeps safe Codex model/response tuning and service-tier controls.

OpenClaw-specific Testbox/Blacksmith credential staging, `behavior-validator`
coupling, other review engines, the Sol-to-Terra fallback surface, and
independent multi-pass clean verdicts remain excluded. The helper refuses a
bundle above the single-pass aggregate limit because separate chunks cannot
prove cross-chunk contracts. Local preferred model lists remain
`gpt-5.6-sol`, `claude-opus-5`, and `cursor-grok-4.5-high-fast`; Codex and Claude
default to `high` reasoning effort, while Cursor encodes effort in the model
ID. Cursor support restores the upstream `cursor-agent` integration but uses
the current CLI's Ask mode, sandbox, empty workspace, isolated config, and
deny-all filesystem/shell permissions. The upstream P0-only default is intentionally excluded so
the local helper continues to return every validated finding.

When borrowing future updates, start from OpenClaw's current helper and tests,
then reapply this repo's packaging, three-engine boundary, model policy, and
platform pruning. Update this pin only after the adapted hardening suite passes.
