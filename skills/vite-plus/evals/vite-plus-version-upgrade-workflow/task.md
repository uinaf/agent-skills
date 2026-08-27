# Vite+ Upgrade for a Production TypeScript Library

## Problem Description

The Nexus UI team maintains a widely-used TypeScript component library that was migrated to Vite+ six months ago. Vite+ has since released several updates with bug fixes and new features the team wants to take advantage of, particularly improvements to the type-aware lint pass and faster test startup times.

The team does not have a documented Vite+ upgrade procedure. A direct `pnpm update vite-plus` changed the manifest but left `vp check` with new errors and `vp test` on the wrong Vitest version. The update missed the Vite+ core alias, Vitest pin, and removal of the 0.1.x test wrapper.

The team has approved `vite-plus@0.2.9` as the exact target. They need a clear,
correct upgrade runbook they can follow now and reuse for future upgrades. Their
workstation policy forbids a global Vite+ installation: the target migration
may use an exact `pnpm --package=vite-plus@0.2.9 dlx vp` invocation, and every
command after reinstall must resolve the repository's pinned `vite-plus`
dependency. The Vite+ migrator and repository package scripts are the
deterministic owners; do not wrap them in a custom upgrade shell script.

## Output Specification

Produce the following files:

- `package.json`: the migrated project manifest
- `pnpm-workspace.yaml`: the migrated toolchain aliases and overrides
- `UPGRADE.md`: a concise runbook explaining the maintained migration path,
  verification sequence, and recovery checkpoints

Document all necessary steps a developer would need to run to fully upgrade
Vite+ without a global CLI. Install the current lockfile, use the exact target
migrator `pnpm --package=vite-plus@0.2.9 dlx vp migrate` instead of asking the
installed 0.1.24 CLI to select a newer release or hand-editing package versions,
reinstall if migration changes dependency metadata, and validate through the
upgraded local CLI. Do not add a second migration implementation, command graph,
or JSON parser in shell.

## Input Files

The following files are provided as inputs. Extract them before beginning.

=============== FILE: package.json ===============
{
  "name": "@nexus/ui",
  "version": "2.1.0",
  "packageManager": "pnpm@11.18.0",
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "types": "./dist/index.d.ts"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "vp pack",
    "dev": "vp pack --watch",
    "test": "vp test run --coverage",
    "test:watch": "vp test watch",
    "check": "vp check",
    "verify": "vp check && vp test run --coverage"
  },
  "devDependencies": {
    "vite-plus": "0.1.24",
    "@voidzero-dev/vite-plus-core": "0.1.24",
    "@voidzero-dev/vite-plus-test": "0.1.24",
    "typescript": "^5.4.0"
  }
}

=============== FILE: pnpm-workspace.yaml ===============
overrides:
  vite: npm:@voidzero-dev/vite-plus-core@0.1.24
  vitest: npm:@voidzero-dev/vite-plus-test@0.1.24

=============== FILE: vite.config.ts ===============
import { defineConfig } from 'vite-plus'

export default defineConfig({
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
    },
  },
  staged: {
    '*.{ts,tsx}': 'vp check --fix',
  },
})
