# Maintained Examples

Use only while implementing Vite+ config, scripts, packaging, or CI. Inspect the
current public code and its repository guidance; reuse the demonstrated shape,
not literal versions, task names, exceptions, or delivery policy.

| Shape | Code to inspect |
| --- | --- |
| Standalone TypeScript CLI/package with consolidated config, type-aware checks, packing, installed-tarball smoke, CI, and npm release | [`uinaf/workspace-kit` config](https://github.com/uinaf/workspace-kit/blob/main/vite.config.ts), [scripts](https://github.com/uinaf/workspace-kit/blob/main/package.json), [smoke](https://github.com/uinaf/workspace-kit/blob/main/scripts/smoke-package.mjs), and [verify workflow](https://github.com/uinaf/workspace-kit/blob/main/.github/workflows/verify.yml) |
| TypeScript monorepo with recursive tests, topological builds, multiple packages, app deploy, and separate CLI publication | [`uinaf/attach` task graph](https://github.com/uinaf/attach/blob/main/package.json), [root config](https://github.com/uinaf/attach/blob/main/vite.config.ts), and [main workflow](https://github.com/uinaf/attach/blob/main/.github/workflows/main.yml) |
| Library plus example-app workspace with seeded build then parallel development | [`uinaf/react-json-logic` scripts](https://github.com/uinaf/react-json-logic/blob/main/package.json), [library config](https://github.com/uinaf/react-json-logic/blob/main/packages/react-json-logic/vite.config.ts), and [CI](https://github.com/uinaf/react-json-logic/blob/main/.github/workflows/ci.yml) |
| Bundled JavaScript GitHub Action with Vite+ checks, tests, and pack output | [`uinaf/tessl-publish-action` config](https://github.com/uinaf/tessl-publish-action/blob/main/vite.config.ts), [action contract](https://github.com/uinaf/tessl-publish-action/blob/main/action.yml), and [CI](https://github.com/uinaf/tessl-publish-action/blob/main/.github/workflows/ci.yml) |

Run the target repository's migrator first. Use an example only to resolve a
concrete implementation question the installed documentation does not answer.
