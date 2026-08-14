# Command Surface

Use before changing CLI invocations, package scripts, or task orchestration.
Confirm every command against `pnpm exec vp --help` for the installed release.

## Invocation

- Install dependencies with the repository's declared package manager.
- Use `pnpm exec vp ...` interactively in pnpm repositories; do not require a
  machine-global CLI.
- Keep bare `vp` inside package scripts and after an official CI setup action
  provides it.
- Use `vp run <script>` or `vpr <script>` for repository-defined scripts.
  Built-in commands do not dispatch same-named package scripts.

## Built-ins and Tasks

Prefer installed built-ins for development, checks, tests, build, preview, and
pack. Use the combined check as the default guardrail and narrower lint, format,
or type-check modes only when the workflow needs them.

Use `vp run` when Vite+ owns dependency ordering, filtering, or caching. Keep a
package-manager runner only for a proven task Vite+ does not cover. Define
cacheable or dependency-aware tasks in `vite.config.ts` only after the simple
script path works and measurement justifies extra configuration.

Keep validation composition in Vite+ config and package scripts. Do not add a
`verify.sh` that merely replays `vp check`, `vp test`, `vp build`, or `vp pack`.
Use typed repository code for consumer or protocol checks Vite+ cannot express;
reserve shell for a tiny linear adapter around existing commands.

## Toolchain Inspection

When supported, use `vp toolchain` and its JSON form to inspect bundled tools
and relationships. Redact absolute local source paths before saving output.
Use package-manager dependency inspection for external package graphs; do not
maintain a static version table in docs.

## Upgrade

Run the exact target Vite+ package's migrator from the workspace root. Reinstall
the resulting lockfile, then return to the repository-local CLI. Verify the
migrator-managed Vite/Vitest aliases or overrides through the manifest,
toolchain report, and lockfile importer.

After toolchain upgrades, run formatting before the final check and review the
diff. Preserve no legacy invocation without a reproduction on the installed
version and a removal condition.
