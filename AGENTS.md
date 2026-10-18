# Agent Guide

`uinaf/agent-skills` holds repository-local stack skills; workflow skills live
in [uinaf/ffss](https://github.com/uinaf/ffss). Each skill is a package under
`skills/<name>/`; eval scenarios, when a skill has them, live in its `evals/`.

## Commands

| Change | Gate |
|---|---|
| `skills/` | `npm ci && npm run lint && npm run audit` in `tools/skill-evals` |

[Verify](.github/workflows/verify.yml) runs that gate on every pull request.
Merging to `main` publishes; installs pin the commit SHA.

Add a skill to the README table and to the catalog in ffss
`skills/slopskills/references/catalog.md` in the same change.
