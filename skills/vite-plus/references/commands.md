# Command Surface

Use before changing CLI invocations, package scripts, or task orchestration.
Confirm every command against `pnpm exec vp --help` for the installed release.

Use `pnpm exec vp ...` interactively in pnpm repositories. Dispatch package
scripts with `vp run <script>` or `vpr <script>`; built-ins do not dispatch
same-named scripts.

## Built-ins and Tasks

Prefer installed built-ins for development, checks, tests, build, preview, and
pack. Use the combined check as the default guardrail and narrower lint, format,
or type-check modes only when the workflow needs them. The combined check
already runs the bundled native type checker when `lint.options.typeCheck` is
enabled; do not add a separate `tsc --noEmit` script or CI step beside it. Keep
a standalone type-check step only for a program the check cannot cover, such as
a framework's own checker, and prefer the native TypeScript compiler to `tsc`
for it.

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

Use the [target-pinned migration procedure](bootstrap.md#existing-repository),
then return to the repository-local CLI.
