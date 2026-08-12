# CI/CD

Use this reference before changing GitHub Actions, GitLab CI/CD, or release automation.

## GitHub Actions

Prefer the documented Vite+ action:

```yaml
- uses: voidzero-dev/setup-vp@<full-sha> # v1.x.y
  with:
    node-version-file: ".node-version"
    cache: true
- run: vp env current
- run: vp check
- run: vp test
- run: vp build
```

## Action Inputs

`voidzero-dev/setup-vp` exposes:

| Input | Purpose |
| ----- | ------- |
| `version` | Pin a specific Vite+ release. Defaults to latest; pin when CI must stay aligned with a chosen release. |
| `version-file` | Resolve the Vite+ release from `package.json`, `pnpm-workspace.yaml`, or `.yarnrc.yml`; default auto-detection reads the local `vite-plus` dependency/lockfile when possible. |
| `node-version` | Node.js version to install via `vp env use`. |
| `node-version-file` | Read the Node.js version from `.node-version`, `.nvmrc`, `.tool-versions`, or `package.json`. Preserve the repo's existing owner. |
| `node-manager` | Set `false` when Node is already owned by another setup action, tool manager, or runner image; leave unset to let the Vite+ installer decide. It cannot be `false` with `node-version` or `node-version-file`. |
| `working-directory` | Project root for path resolution and lockfile detection. |
| `run-install` | Run `vp install` after setup. Boolean or YAML config; defaults to `true`. |
| `sfw` | Opt in to wrapping `vp install` with Socket Firewall Free. Leave disabled unless the repo intentionally adopts that supply-chain gate. |
| `cache` | Cache project dependencies. Auto-detects pnpm/npm/yarn/bun lockfiles. |
| `cache-dependency-path` | Override the lockfile path used for cache key generation. |
| `registry-url` / `scope` | Configure scoped npm registry authentication. |

## Defaults

- Prefer `voidzero-dev/setup-vp` over hand-rolled Node/Corepack bootstrapping unless the repo has a proven exception. In repos that pin Actions, use a full commit SHA with a same-line exact version comment and a `github-actions` Dependabot entry so updates stay reviewable.
- Treat `setup-vp` as the CI `vp` provider. Do not add `GITHUB_PATH`, `node_modules/.bin`, `pnpm exec vp`, or similar PATH workarounds to prefer the project binary; if plain `vp` fails under the official action, verify against `setup-vp` or the official installer before changing workflow shape.
- Prefer `setup-vp`'s built-in Node and package-manager bootstrap over adding separate CI-time `vp env` setup steps unless the repo has a specific environment need the action does not cover.
- When another action, tool manager, or runner image already owns Node, set `node-manager: false` so Vite+ skips its Node shims and uses that runtime. Do not combine it with `node-version` or `node-version-file`.
- Prefer `setup-vp`'s default install step over a separate `vp install` when Vite+ is the tool owner. Set `run-install: false` only when the workflow needs to pass custom install arguments or control install as a separate step.
- Preserve an existing Node declaration instead of creating `.node-version` only for CI. Pass the repo-owned `.node-version`, `.nvmrc`, `.tool-versions`, or `package.json` path through `node-version-file`.
- When neither `version` nor `version-file` is set, current `setup-vp` tries to resolve the Vite+ version from the checked-out project's `vite-plus` dependency and lockfile before falling back to `latest`; watch warnings because an unresolved range or alias means CI may not be using the intended project version.
- On Vite+ 0.2.9+, prefer `vp hooks` for dispatcher lifecycle and `vp config` for broader project setup or agent integration instead of hand-rolled hook setup.
- Prefer one repo-local verify entrypoint if CI needs extra repo-specific commands.
- Keep release orchestration in GitHub Actions when the repo has npm, GitHub Release, binary, or Homebrew automation that goes beyond stock Vite+.
- Vite+ can run repo scripts, but it does not make runtime-installed release plugins reproducible by itself. For semantic-release jobs, keep CI/CD-only plugins in the workflow's `extra_plugins` input with exact versions instead of adding release-only packages to repo `devDependencies`.
- The `cache: true` setup shown here is for verify jobs. In secret-bearing release, publish, signing, or deploy jobs, disable or omit dependency caches and run a fresh `vp install`.
- When CI behavior must stay aligned with a repo's chosen Vite+ release, pin the `setup-vp` action's `version` input explicitly. Treat the local `vite-plus` dependency version in `package.json` as separate from the action's runtime version.
- For private registries, prefer the action's `NODE_AUTH_TOKEN` handling with repo `.npmrc` registry declarations. Use `registry-url` / `scope` when bypassing repo-level registry detection is intentional.

## GitLab CI/CD

Use the reusable `setup-vp` template instead of rebuilding its bootstrap in each job:

```yaml
include:
  - remote: "https://raw.githubusercontent.com/voidzero-dev/setup-vp/v1.17.0/gitlab/setup-vp.yml"
    inputs:
      setup-ref: "v1.17.0"
      node-manager: "false"

test:
  extends: .setup-vp
  image: node:24
  script:
    - vp check
    - vp test
    - vp build
```

- The template installs Vite+ and, by default, runs `vp install`; it does not install Node.js or configure GitLab caches. Provide Node through the job image or runner, set `node-manager: "false"` so Vite+ uses that runtime, and configure cache policy in the job. Its `sfw` input is the same explicit opt-in as the GitHub Action.
- The runner must be Unix-like with Bash and either `curl` or `wget`.
- The moving `v1` template ref is frozen at `v1.15.0`. For reproducible and current CI, pin the remote template and its `setup-ref` input to the same exact release or commit instead of using `v1` or mixing refs.
- Keep registry authentication and secret-bearing release behavior scoped to the job. The GitLab template supports the same `registry-url`, `scope`, and `run-install` responsibilities, but it does not replace project-specific publish or deploy steps.

## Guardrails

- Prefer `vp run <script>` (or `vpr <script>`) when CI needs a repo-specific script that Vite+ does not replace.
- Preserve release-only steps while making the surrounding workflow more stock.
- Keep packaging and publish steps that Vite+ does not own.
- For container CI without a native `setup-vp` integration, the official `ghcr.io/voidzero-dev/vite-plus` image is the stock toolchain image. Pin an exact tag or digest when reproducibility matters, and keep production runtime images separate.
