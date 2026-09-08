# Migrate a tsup Library on pnpm 12

Migrate this library to the approved `vite-plus@0.3.0` target. Keep pnpm
12.0.0, use the repository-local CLI after migration, and preserve the package's
ESM, CJS, and declaration outputs. The team wants packaging config consolidated
with its Vite+ configuration. A previous update replaced a `catalog:` reference
with a literal alias; restore catalog ownership.

The files below are the complete configuration inputs. Source exports one
function, `greet(name: string): string`, from `src/index.ts`. Produce the
updated configs and manifest plus a short verification report. Run the target
migrator before reconciling its output. Do not install a global Vite+ CLI or
change machine configuration. Resolve install failures without relaxing pnpm's
validation or silently discarding the team's metadata.

## package.json

```json
{
  "name": "@example/greeting",
  "version": "1.0.0",
  "type": "module",
  "packageManager": "pnpm@12.0.0",
  "files": ["dist"],
  "exports": {
    ".": {
      "import": { "types": "./dist/index.d.ts", "default": "./dist/index.js" },
      "require": { "types": "./dist/index.d.cts", "default": "./dist/index.cjs" }
    }
  },
  "scripts": { "build": "tsup" },
  "devDependencies": {
    "tsup": "8.5.0",
    "typescript": "^5.9.3",
    "vite": "npm:@voidzero-dev/vite-plus-core@0.2.9",
    "vite-plus": "0.2.9"
  }
}
```

## pnpm-workspace.yaml

```yaml
catalog:
  vite: npm:@voidzero-dev/vite-plus-core@0.2.9
teamMetadata:
  owner: library-team
```

## tsup.config.ts

```ts
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
})
```
