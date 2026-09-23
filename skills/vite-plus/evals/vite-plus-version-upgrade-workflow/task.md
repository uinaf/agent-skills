# Upgrade a Published Library to Vite+ 1.0

## Problem Description

The Nexus UI team maintains a published TypeScript library on Vite+ 0.3.3. The
team has approved `vite-plus@1.0.0-rc.0` as the exact target. A teammate's
branch ran `pnpm update vite-plus@1.0.0-rc.0` first and then `vp migrate`; the
migrator could no longer tell which Vitest version the tests were written for.
That branch has been discarded, and the checkout below is clean with its 0.3.3
lockfile installed.

Workstation policy forbids a global Vite+ installation. The target migration
may use an exact `pnpm --package=vite-plus@1.0.0-rc.0 dlx vp` invocation, and
every command after reinstall must resolve the repository's pinned `vite-plus`.
Do not wrap the migrator or package scripts in a custom upgrade shell script.

The package still promises Node 20.19+ to its consumers. The team has not
decided whether to drop Node 20 from that public contract.

## Output Specification

Produce:

- every changed repository file, in full
- `UPGRADE.md`: a concise runbook covering the migration path, how to handle
  migrator findings, verification, and when to hold the upgrade

## Input Files

=============== FILE: package.json ===============
{
  "name": "@nexus/ui",
  "version": "2.1.0",
  "packageManager": "pnpm@12.4.2",
  "type": "module",
  "engines": { "node": ">=20.19.0" },
  "exports": { ".": { "import": "./dist/index.mjs", "types": "./dist/index.d.mts" } },
  "files": ["dist"],
  "scripts": {
    "build": "vp pack",
    "test": "vp test run --coverage",
    "check": "vp check"
  },
  "devDependencies": {
    "@vitest/coverage-v8": "4.1.11",
    "typescript": "^5.9.3",
    "vite": "npm:@voidzero-dev/vite-plus-core@0.3.3",
    "vite-plus": "0.3.3"
  }
}

=============== FILE: .nvmrc ===============
20.19.0

=============== FILE: vite.config.ts ===============
import { defineConfig } from 'vite-plus'

export default defineConfig({
  pack: { entry: ['src/index.ts'], dts: true },
  test: {
    include: ['src/**/*.test.ts'],
    coverage: { provider: 'v8', reporter: ['text', 'lcov'] },
  },
  staged: { '*.{ts,tsx}': 'vp check --fix' },
})

=============== FILE: .vscode/settings.json ===============
{
  "oxc.path.oxlint": "node_modules/.bin/oxlint",
  "oxc.path.oxfmt": "node_modules/.bin/oxfmt",
  "editor.defaultFormatter": "oxc.oxc-vscode"
}

=============== FILE: .github/workflows/ci.yml ===============
name: CI
on: [push, pull_request]
jobs:
  verify:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node: ['20.19.0', '24']
    steps:
      - uses: actions/checkout@v5
      - uses: voidzero-dev/setup-vp@v1.19.0
        with:
          node-version: ${{ matrix.node }}
      - run: vp check
      - run: vp test run --coverage
      - run: vp pack

## Migrator Output

Running `pnpm --package=vite-plus@1.0.0-rc.0 dlx vp migrate --no-interactive`
on this checkout printed:

```text
◇ Updated . to Vite+ 1.0.0-rc.0
• Dependencies:
    vite-plus            0.3.3  → 1.0.0-rc.0
    @vitest/coverage-v8  4.1.11 → 5.0.1
✓ Dependencies installed
! Warnings:
  - Vitest v5: 1 review item

package.json
  1:1 REVIEW [node-runtime] engines.node (>=20.19.0) includes unsupported test runtimes. Pin the test/CI runtime to Node ^22.18.0 || ^24.11.0 || >=26.0.0; keep the library's public engine contract separate.
```

It changed `.nvmrc` to `22.18.0`, moved the toolchain pins into a
`pnpm-workspace.yaml` catalog, and added `test.clearMocks: false` and
`pack.deps.resolveDepSubpath: true` with removal comments. It did not touch
`.vscode/settings.json` or the workflow.
