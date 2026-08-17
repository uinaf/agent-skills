# Skill Fleet

Inventory and credit-safe cadence for every first-party Tessl skill uinaf
publishes. This repo is the reusable catalog; product repos may ship one skill
beside the product.

## Inventory

| Owner repo | Skill path | Publish path |
| --- | --- | --- |
| `uinaf/agent-skills` | `skills/*` | `.github/workflows/publish-skills.yml` (lint gate, then publish) |
| `uinaf/attach` | `skills/attach-cli` | `.github/workflows/publish-skill.yml` via `tessl-publish-action` (`review-mode: lint`) |
| `uinaf/autoreview` | `skills/autoreview` | same pattern |
| `uinaf/slopshipper` | `skills/slopshipper` | same pattern |
| `uinaf/intake` | `skills/uinaf-intake` | PR lint via `lint-skill.yml`; publish via `publish-skill.yml` + `tessl-publish-action` (`review-mode: lint`) |

Do not treat harness-local copies under `~/.agents` or consumer
`.agents/skills/` as sources of truth. Edit and publish from the owner repo.

## Cadence

| Lane | Credits | When |
| --- | --- | --- |
| Plugin lint / `pnpm run verify` | no | every PR, every publish, and the monthly fleet lint below |
| Cloud `tessl review run` at 100 | yes | only for publish readiness or an explicit score ask on **changed** skills |
| Full-portfolio cloud review | yes | human-triggered only (`TESSL_REVIEW_ALL=true`); never on a schedule |

### Monthly (free)

A scheduled workflow in this repo runs `pnpm run verify` once a month. That is
structure/lint only. It does not call cloud review and does not need
`TESSL_TOKEN`.

For distributed skill shippers, rely on their existing publish lint gates. The
monthly operator pass is:

1. Confirm last `Publish skill` / `Publish Skills` runs are green.
2. Optionally lint each present checkout locally (`pnpm run verify` or
   `tessl plugin lint` on the skill dir).
3. Open follow-ups for failures. Do **not** burn a fleet-wide cloud review to
   “catch up.”

### When credits return

Re-score only skills that still need a numeric 100 after substantive edits
(currently tracked candidates in the catalog: anything below 100 from the last
intentional review). Prefer one skill at a time. Skip optimizer unless
explicitly requested.

## Anti-patterns

- Scheduling cloud Tessl review across the fleet
- Running `TESSL_REVIEW_ALL=true` because a monthly reminder fired
- Publishing through CI with `review-mode: review` while the org is credit-limited
- Hand-copying skill trees between repos instead of publishing/syncing
