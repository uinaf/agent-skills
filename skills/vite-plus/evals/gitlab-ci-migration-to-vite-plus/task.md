# Standardize GitLab CI for a Vite+ Library

## Problem/Feature Description

The `@acme/config` team uses GitLab CI/CD for a TypeScript library that has already adopted Vite+. Its verify job still installs Corepack and pnpm by hand, installs dependencies directly, and invokes the old standalone tools. The job also has a working GitLab cache that must remain in place because Vite+'s GitLab integration does not configure runner caches.

The team wants the job moved to the official reusable `setup-vp` GitLab template. The runner should continue using Node 24, retain its existing cache policy, rely on the template's default dependency install, and run the stock Vite+ verification commands.

## Output Specification

Produce:

- a complete updated `.gitlab-ci.yml`
- `migration-notes.md` explaining which responsibilities belong to the template and which remain job-owned

Keep the remote template ref and its `setup-ref` aligned. Do not add an explicit `vp install` while the template's default `run-install` remains enabled.

## Input Files

The following files are provided as inputs. Extract them before beginning.

=============== FILE: .gitlab-ci.yml ===============
stages:
  - verify

verify:
  image: node:24
  cache:
    key:
      files:
        - pnpm-lock.yaml
    paths:
      - .pnpm-store/
  before_script:
    - corepack enable
    - corepack prepare pnpm@11.15.0 --activate
    - pnpm install --frozen-lockfile
  script:
    - pnpm run lint
    - pnpm run typecheck
    - pnpm exec vitest run
    - pnpm run build

=============== FILE: package.json ===============
{
  "name": "@acme/config",
  "private": true,
  "packageManager": "pnpm@11.15.0",
  "scripts": {
    "lint": "vp lint",
    "typecheck": "vp check --no-lint",
    "test": "vp test",
    "build": "vp pack"
  },
  "devDependencies": {
    "vite-plus": "0.2.7"
  }
}

=============== FILE: .node-version ===============
24
