# Engine Details

This vendored skill exposes Codex, Claude, and Cursor review engines.

## Models And Thinking

The helper accepts `--model` globally or per engine (`engine=model`) and `--thinking` globally or per engine (`engine=level`). Repeat either flag for multiple reviewers.

Recommended model defaults:

| Engine | Default model behavior | Source note |
|--------|---------------|-------------|
| **codex** (default) | Uses `gpt-5.6-sol` with `high` reasoning | Local preferred review model |
| **claude** | Uses `claude-opus-5` with `high` effort | Local preferred review model |
| **cursor** | Uses `cursor-grok-4.5-high-fast` | Current Cursor model ID for the fast Grok 4.5 High variant |

CLI flags and environment variables override these defaults.

| Engine | Model flag | Example model IDs | Thinking flag | Accepted levels |
|--------|------------|-------------------|---------------|-----------------|
| **codex** (default) | `codex --model X exec ...` | `gpt-5.6-sol` | `-c model_reasoning_effort=Y` | `none`, `minimal`, `low`, `medium`, `high`, `xhigh`, `max` |
| **claude** | `claude --model X` | `claude-opus-5`, `claude-fable-5` | `--effort Y` | `low`, `medium`, `high`, `xhigh`, `max` |
| **cursor** | `cursor-agent --model X` | `cursor-grok-4.5-high-fast` | encoded in model ID | n/a |

## Environment Defaults

CLI flags take precedence over environment variables.

| Variable | Purpose |
|----------|---------|
| `AUTOREVIEW_MODEL` | Override the built-in default `--model` for all engines |
| `AUTOREVIEW_THINKING` | Default `--thinking` for all engines |
| `AUTOREVIEW_<ENGINE>_MODEL` | Per-engine model override, for example `AUTOREVIEW_CODEX_MODEL=gpt-5.6-sol` |
| `AUTOREVIEW_<ENGINE>_THINKING` | Per-engine thinking override |
| `AUTOREVIEW_<ENGINE>_PREFERRED_MODELS` | Comma-separated preferred list used when no explicit model override is set, for example `AUTOREVIEW_CLAUDE_PREFERRED_MODELS=claude-opus-5` |
| `AUTOREVIEW_CODEX_CONFIG` | Semicolon-separated safe model/response tuning overrides; capability-, command-, and path-bearing keys are refused |
| `AUTOREVIEW_CODEX_SPEED` | Codex service tier: `fast`, `flex`, or `default` |

Codex maps thinking to `model_reasoning_effort`. Claude maps thinking to `--effort`. Cursor encodes effort in model IDs and rejects `--thinking`. Preferred lists apply only when no explicit `--model`, inline reviewer model, `AUTOREVIEW_MODEL`, or `AUTOREVIEW_<ENGINE>_MODEL` is set. Codex tries the next preferred model only when the Codex CLI reports the selected model is unavailable. Claude maps the remaining preferred models onto Claude Code's native model-availability mechanism.

## Review Engine Isolation

When autoreview runs inside the repository under review, external reviewer CLIs must not load project-local trust or configuration that the branch controls.

| Engine | Isolation flags | Reference |
|--------|-----------------|-----------|
| **codex** | Empty temporary workspace, named read-only permission profile, auth-only config reconstruction, `project_doc_max_bytes=0`, `trust_level="untrusted"`, and `exec --ignore-user-config --ignore-rules --skip-git-repo-check` | Codex CLI `exec --help` |
| **claude** | Empty temporary workspace, `--safe-mode --setting-sources user --strict-mcp-config --disallowedTools mcp__*`, explicit web-only tools, and disabled auto-memory (`--safe-mode` requires Claude Code `v2.1.169+`) | Claude Code [CLI reference](https://code.claude.com/docs/en/cli-reference) |
| **cursor** | Empty temporary workspace, isolated Cursor/Claude config, Ask mode, enabled sandbox, and explicit deny rules for shell plus all file reads/writes | Cursor Agent `--help` and [permissions](https://docs.cursor.com/cli/reference/permissions) |

Codex `--ignore-user-config` skips config loading for the exec run. Autoreview reconstructs only the documented `cli_auth_credentials_store`, `forced_login_method`, and `forced_chatgpt_workspace_id` settings from `CODEX_HOME/config.toml`, keeping authentication and workspace restrictions usable without forwarding unrelated user configuration. The reviewer runs in an empty workspace with a named permission profile that can read that workspace but not the source repository or broader host. The validated bundle is therefore its only repository input; ignored credentials, linked-worktree metadata, and project instructions remain outside the readable boundary.

Claude `--safe-mode` disables project hooks, skills, plugins, MCP servers, and CLAUDE.md while preserving normal authentication and model selection; managed settings policy can still apply. Claude also runs outside the source repository, auto-memory is disabled, and its allowed tool inventory is limited to WebSearch plus explicitly domain-constrained WebFetch rules. Filesystem and shell tools are not exposed.

Cursor runs with `--mode ask --sandbox enabled --trust` in an empty external workspace.
Temporary Cursor and Claude config directories prevent user or project rules,
hooks, plugins, and MCP config from entering the run. The external home is
retained only for native login; `CURSOR_API_KEY` runs keep the temporary home.
Temporary `cli-config.json` deny rules block shell and all file reads/writes.
The prompt arrives over stdin and contains the scanned bundle, so Cursor does not
receive the repository path or source tree. The temporary config reconstructs
only `authInfo` from the user's external Cursor config; automation can instead
provide `CURSOR_API_KEY`. `--cursor-agent-bin`
and `CURSOR_AGENT_BIN` remain aliases for
`--cursor-bin` and `CURSOR_BIN`.

## Bundle And Process Boundaries

Before starting a reviewer, the helper requires TruffleHog and scans temporary
snapshots of the exact added, modified, and deleted content under review with
the scanner's `verified,unknown` policy. Sensitive paths are omitted from the
bundle; binary and gitlink changes, unsafe links, non-UTF-8 input, unsafe
secret-bearing content, incomplete evidence, and bundles above the aggregate
prompt limit fail closed. Oversized changes must be split into coherent targets
so cross-file contracts stay in one review pass. Parallel tests run with a
temporary home and a small environment allowlist, and a source-tree fingerprint
invalidates review output when the checkout changes during the run.
