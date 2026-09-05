# Skill Fleet

Inventory and lint cadence for every first-party skill uinaf ships. This repo
is the reusable catalog; other repos ship their own skills beside the product
they serve.

## Inventory

| Owner repo | Skill path |
| --- | --- |
| `uinaf/agent-skills` | `skills/*` |
| `uinaf/attach` | `skills/attach-cli` |
| `uinaf/design` | `skills/uinaf-design` |
| `uinaf/ffss` | `skills/*` |
| `uinaf/healthd` | `skills/healthd-operator` |
| `uinaf/intake` | `skills/uinaf-intake` |

Do not treat harness-local copies under `~/.agents` or consumer
`.agents/skills/` as sources of truth. Edit skills in the owner repo.

## Cadence

- Every pull request runs `skillcheck lint` (keyless, structural).
- Distributed skill shippers rely on their own lint gates; the operator
  pass confirms those gates are green and opens follow-ups for failures.

Eval sweeps (`skillcheck sweep`) need model credentials and stay operator-run;
never schedule them in consumer CI.
